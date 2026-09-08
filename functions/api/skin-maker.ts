import { encode } from 'fast-png'
import {
  applyDesign,
  buildPrompt,
  decodePixels,
  encodePixels,
  MODEL,
  requestSchema,
  type SkinRequest,
} from '../../src/lib/skin-maker.ts'

// Optional secrets are configured only when enabling this feature. Existing CMS
// deployments must not require a new secret while the feature is disabled.
type SkinEnv = Env & {
  SKIN_TURNSTILE_SECRET?: string
  SKIN_QUOTA_SALT?: string
}
const MAX_BODY = 450_000
export const MAX_TOKENS = 12_000
function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
  })
}
function available(env: SkinEnv) {
  return (
    String(env.SKIN_MAKER_ENABLED) === 'true' &&
    !!env.SKIN_TURNSTILE_SECRET &&
    !!env.SKIN_QUOTA_SALT &&
    !!env.AI &&
    !!env.SEARCH_RATE_LIMIT_DB &&
    !!env.SKIN_TURNSTILE_SITE_KEY
  )
}
const onRequestGet: PagesFunction<SkinEnv> = async ({ env }) =>
  json({
    enabled: available(env),
    siteKey: available(env) ? env.SKIN_TURNSTILE_SITE_KEY : null,
  })

export async function readBody(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('content_type')
  if (Number(request.headers.get('content-length')) > MAX_BODY || !request.body)
    throw new Error('body')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > MAX_BODY) {
        await reader.cancel()
        throw new Error('body')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

export function pngUrl(pixels: Uint8Array, width = 64, height = 64) {
  return (
    'data:image/png;base64,' +
    encodePixels(encode({ width, height, data: pixels, channels: 4, depth: 8 }))
  )
}
export function modelInput(request: SkinRequest) {
  const content: (
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  )[] = [{ type: 'text', text: buildPrompt(request) }]
  if (request.reference) {
    const r = request.reference
    content.push(
      { type: 'text', text: 'Appearance reference:' },
      {
        type: 'image_url',
        image_url: {
          url: pngUrl(
            decodePixels(r.pixels, r.width, r.height),
            r.width,
            r.height,
          ),
        },
      },
    )
  }
  return {
    messages: [
      {
        role: 'user' as const,
        content:
          content.length === 1
            ? content[0].type === 'text'
              ? content[0].text
              : content
            : content,
      },
    ],
    max_completion_tokens: MAX_TOKENS,
    reasoning_effort: 'low' as const,
    temperature: 0.4,
    store: false,
    stream: false as const,
  }
}
export function parseCompletion(raw: unknown): unknown {
  const output = raw as {
    choices?: { finish_reason?: string; message?: { content?: string } }[]
    response?: string
  }
  const choice = output?.choices?.[0]
  if (choice?.finish_reason && choice.finish_reason !== 'stop')
    throw new Error('incomplete')
  const value = choice?.message?.content ?? output?.response
  if (typeof value !== 'string' || value.length > 100_000)
    throw new Error('completion')
  const trimmed = value.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return JSON.parse(fenced ? fenced[1] : trimmed)
}

export const RESERVE_SQL = `INSERT INTO skin_maker_usage (id, day, client, created)
SELECT ?, ?, ?, ? WHERE
(SELECT count(*) FROM skin_maker_usage WHERE day = ?) < 100 AND
(SELECT count(*) FROM skin_maker_usage WHERE day = ? AND client = ?) < 5 AND
(SELECT count(*) FROM skin_maker_usage WHERE client = ? AND created > ?) = 0
RETURNING id`

const onRequestPost: PagesFunction<SkinEnv> = async ({ request, env }) => {
  const origin = new URL(request.url).origin
  if (
    request.headers.get('origin') !== origin ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return json({ error: 'forbidden' }, 403)
  if (!available(env)) return json({ error: 'unavailable' }, 503)
  let input: SkinRequest
  try {
    input = requestSchema.parse(await readBody(request))
    if (input.reference)
      decodePixels(
        input.reference.pixels,
        input.reference.width,
        input.reference.height,
      )
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }
  const ip = request.headers.get('cf-connecting-ip')
  if (!ip) return json({ error: 'unavailable' }, 503)
  try {
    const verification = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({
          secret: env.SKIN_TURNSTILE_SECRET!,
          response: input.token,
          remoteip: ip,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    )
    if (!verification.ok) return json({ error: 'verification' }, 403)
    const result = (await verification.json()) as {
      success?: boolean
      hostname?: string
      action?: string
    }
    if (
      !result.success ||
      result.hostname !== new URL(origin).hostname ||
      result.action !== 'skin-maker'
    )
      return json({ error: 'verification' }, 403)
    const day = new Date().toISOString().slice(0, 10)
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(env.SKIN_QUOTA_SALT!),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(ip),
    )
    const client = encodePixels(new Uint8Array(signature))
    const now = Math.floor(Date.now() / 1000)
    // One SQLite statement makes all quota checks and reservation atomic across PoPs.
    const reservation = await env.SEARCH_RATE_LIMIT_DB.prepare(RESERVE_SQL)
      .bind(
        crypto.randomUUID(),
        day,
        client,
        now,
        day,
        day,
        client,
        client,
        now - 60,
      )
      .first()
    if (!reservation) return json({ error: 'rate_limit' }, 429)
    await env.SEARCH_RATE_LIMIT_DB.prepare(
      'DELETE FROM skin_maker_usage WHERE created < ?',
    )
      .bind(now - 172800)
      .run()
    // No automatic retries: failed/refused/incomplete requests consume a reservation.
    const raw = await env.AI.run(MODEL, modelInput(input), {
      signal: AbortSignal.timeout(240_000),
    })
    const design = parseCompletion(raw)
    if (
      design &&
      typeof design === 'object' &&
      'refused' in design &&
      design.refused === true
    )
      return json({ error: 'refused' }, 422)
    const output = applyDesign(design, input)
    return json({
      pixels: encodePixels(output.pixels),
      changed: output.changed,
      model: input.model,
    })
  } catch {
    return json({ error: 'generation_failed' }, 502)
  }
}

export const onRequest: PagesFunction<SkinEnv> = async (context) => {
  if (context.request.method === 'GET') return onRequestGet(context)
  if (context.request.method === 'POST') return onRequestPost(context)
  return json({ error: 'method' }, 405)
}
