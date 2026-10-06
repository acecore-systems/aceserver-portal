import { z } from 'zod'
import {
  encodePixels,
  decodePixels,
  validateSkin,
} from '../../src/lib/skin-maker.ts'
import { skinPngUrl } from '../../src/lib/skin-png.ts'
import {
  skinPortrait,
  STORE_ID,
  STORE_PAGE_SIZE,
} from '../../src/lib/skin-store.ts'
import {
  storeAvailable,
  pixelHash,
  readStoreTicket,
  signStoreTicket,
  reportClient,
  type SkinStoreEnv,
} from '../_lib/skin-store.ts'

const publishSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(40)
      .regex(/^[^\p{Cc}\p{Cf}]+$/u),
    model: z.enum(['classic', 'slim']),
    pixels: z
      .string()
      .length(21848)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
    ticket: z.string().min(1).max(2048),
    consent: z.literal(true),
  })
  .strict()
const cursorSchema = z
  .object({
    created: z.number().int().nonnegative(),
    id: z.string().regex(STORE_ID),
  })
  .strict()
const reportSchema = z
  .object({
    id: z.string().regex(STORE_ID),
    reason: z.enum(['inappropriate', 'rights', 'other']),
  })
  .strict()

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
  })
}
// Bound the actual stream, including chunked requests with no Content-Length.
async function body(request: Request): Promise<unknown> {
  if (
    !request.headers.get('content-type')?.startsWith('application/json') ||
    !request.body
  )
    throw new Error('body')
  const reader = request.body.getReader()
  const parts: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const next = await reader.read()
      if (next.done) break
      length += next.value.length
      if (length > 28000) {
        await reader.cancel()
        throw new Error('body')
      }
      parts.push(next.value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const part of parts) {
    bytes.set(part, offset)
    offset += part.length
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

export const REPORT_SQL = `INSERT OR IGNORE INTO skin_store_reports (skin_id, client, day, created, reason)
SELECT ?, ?, ?, ?, ? WHERE
EXISTS (SELECT 1 FROM skin_store WHERE id = ? AND state = 'published') AND
(SELECT count(*) FROM skin_store_reports WHERE day = ?) < 500 AND
(SELECT count(*) FROM skin_store_reports WHERE day = ? AND client = ?) < 5
RETURNING skin_id`

export const onRequest: PagesFunction<SkinStoreEnv> = async ({
  request,
  env,
}) => {
  const method = request.method
  if (!['GET', 'POST', 'DELETE'].includes(method))
    return json({ error: 'method' }, 405)
  if (!storeAvailable(env)) return json({ error: 'unavailable' }, 503)
  const url = new URL(request.url)
  if (
    method !== 'GET' &&
    (request.headers.get('origin') !== url.origin ||
      request.headers.get('sec-fetch-site') === 'cross-site')
  )
    return json({ error: 'forbidden' }, 403)
  const db = env.SEARCH_RATE_LIMIT_DB
  try {
    if (method === 'GET') {
      const id = url.searchParams.get('id')
      if (id !== null) {
        if (!STORE_ID.test(id)) return json({ error: 'invalid_request' }, 400)
        const row = await db
          .prepare(
            "SELECT id, name, model, created, png FROM skin_store WHERE id = ? AND state = 'published'",
          )
          .bind(id)
          .first<{
            id: string
            name: string
            model: string
            created: number
            png: string
          }>()
        if (!row) return json({ error: 'not_found' }, 404)
        if (url.searchParams.get('download') === '1') {
          const png = Uint8Array.from(atob(row.png), (c) => c.charCodeAt(0))
          return new Response(png, {
            headers: {
              'Content-Type': 'image/png',
              'Content-Disposition': `attachment; filename="minecraft-${row.model}-${row.id}.png"`,
              'Cache-Control': 'no-store',
              'X-Content-Type-Options': 'nosniff',
            },
          })
        }
        return json({ ...row, png: `data:image/png;base64,${row.png}` })
      }
      const model = url.searchParams.get('model') ?? 'all'
      const query = (url.searchParams.get('q') ?? '').trim()
      if (!['all', 'classic', 'slim'].includes(model) || query.length > 40)
        return json({ error: 'invalid_request' }, 400)
      let cursor: z.infer<typeof cursorSchema> | null = null
      try {
        const value = url.searchParams.get('cursor')
        if (value) {
          if (value.length > 256) throw new Error('cursor')
          cursor = cursorSchema.parse(JSON.parse(atob(value)))
        }
      } catch {
        return json({ error: 'invalid_request' }, 400)
      }
      const clauses = ["state = 'published'"]
      const args: (string | number)[] = []
      if (model !== 'all') {
        clauses.push('model = ?')
        args.push(model)
      }
      if (query) {
        clauses.push("name LIKE ? ESCAPE '\\'")
        args.push(`%${query.replace(/[\\%_]/g, '\\$&')}%`)
      }
      if (cursor) {
        clauses.push('(created < ? OR (created = ? AND id < ?))')
        args.push(cursor.created, cursor.created, cursor.id)
      }
      const result = await db
        .prepare(
          `SELECT id, name, model, created, preview FROM skin_store WHERE ${clauses.join(' AND ')} ORDER BY created DESC, id DESC LIMIT ?`,
        )
        .bind(...args, STORE_PAGE_SIZE + 1)
        .all<{
          id: string
          name: string
          model: string
          created: number
          preview: string
        }>()
      const items = result.results.slice(0, STORE_PAGE_SIZE)
      const last = items.at(-1)
      return json({
        items: items.map((item) => ({
          ...item,
          preview: `data:image/png;base64,${item.preview}`,
        })),
        cursor:
          result.results.length > STORE_PAGE_SIZE && last
            ? btoa(JSON.stringify({ created: last.created, id: last.id }))
            : null,
      })
    }
    let input: unknown
    try {
      input = await body(request)
    } catch {
      return json({ error: 'invalid_request' }, 400)
    }
    if (method === 'DELETE') {
      const parsed = z
        .object({ ticket: z.string().min(1).max(2048) })
        .strict()
        .safeParse(input)
      if (!parsed.success) return json({ error: 'invalid_request' }, 400)
      let ticket
      try {
        ticket = await readStoreTicket(
          parsed.data.ticket,
          env.SKIN_QUOTA_SALT!,
          url.origin,
          'remove',
        )
      } catch {
        return json({ error: 'forbidden' }, 403)
      }
      await db
        .prepare(
          "UPDATE skin_store SET state = 'withdrawn', png = '', preview = '' WHERE id = ? AND state IN ('published', 'blocked')",
        )
        .bind(ticket.id)
        .run()
      return json({ removed: true })
    }
    if (url.searchParams.get('action') === 'report') {
      const parsed = reportSchema.safeParse(input)
      if (!parsed.success) return json({ error: 'invalid_request' }, 400)
      const ip = request.headers.get('cf-connecting-ip')
      if (!ip) return json({ error: 'unavailable' }, 503)
      const client = await reportClient(ip, env.SKIN_QUOTA_SALT!)
      const day = new Date().toISOString().slice(0, 10)
      const now = Math.floor(Date.now() / 1000)
      const saved = await db
        .prepare(REPORT_SQL)
        .bind(
          parsed.data.id,
          client,
          day,
          now,
          parsed.data.reason,
          parsed.data.id,
          day,
          day,
          client,
        )
        .first()
      if (!saved) return json({ error: 'rate_limit' }, 429)
      await db
        .prepare('DELETE FROM skin_store_reports WHERE created < ?')
        .bind(now - 604800)
        .run()
      return json({ reported: true })
    }
    const parsed = publishSchema.safeParse(input)
    if (!parsed.success) return json({ error: 'invalid_request' }, 400)
    const data = parsed.data
    let pixels: Uint8Array
    try {
      pixels = decodePixels(data.pixels, 64, 64)
      validateSkin(pixels, data.model)
    } catch {
      return json({ error: 'invalid_request' }, 400)
    }
    let ticket
    try {
      ticket = await readStoreTicket(
        data.ticket,
        env.SKIN_QUOTA_SALT!,
        url.origin,
        'publish',
      )
      if (
        ticket.model !== data.model ||
        ticket.hash !== (await pixelHash(pixels))
      )
        throw new Error('ticket')
    } catch {
      return json({ error: 'forbidden' }, 403)
    }
    const inserted = await db
      .prepare(
        'INSERT OR IGNORE INTO skin_store (id, name, model, created, png, preview) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      )
      .bind(
        ticket.id,
        data.name,
        data.model,
        Math.floor(Date.now() / 1000),
        skinPngUrl(pixels).split(',')[1],
        skinPortrait(pixels, data.model),
      )
      .first()
    // Retry after a lost response returns the same receipt. Tombstones cannot be republished.
    if (!inserted) {
      const existing = await db
        .prepare('SELECT state FROM skin_store WHERE id = ?')
        .bind(ticket.id)
        .first<{ state: string }>()
      if (existing?.state !== 'published')
        return json({ error: 'already_published' }, 409)
    }
    const removeTicket = await signStoreTicket(
      { ...ticket, purpose: 'remove' },
      env.SKIN_QUOTA_SALT!,
    )
    return json({ id: ticket.id, removeTicket }, inserted ? 201 : 200)
  } catch {
    // Missing migrations/storage failures do not disclose database/provider errors.
    return json({ error: 'unavailable' }, 503)
  }
}
