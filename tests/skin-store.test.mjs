import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { decode } from 'fast-png'
import { onRequest } from '../functions/api/skin-store.ts'
import { onRequest as generate } from '../functions/api/skin-maker.ts'
import {
  issueStoreTicket,
  readStoreTicket,
  signStoreTicket,
  pixelHash,
} from '../functions/_lib/skin-store.ts'
import { applyDesign, regions, encodePixels } from '../src/lib/skin-maker.ts'
import { skinPngUrl, readSkinPng } from '../src/lib/skin-png.ts'
import { skinPortrait, STORE_PAGE_SIZE } from '../src/lib/skin-store.ts'
import { getSkinStoreUi } from '../src/data/skin-store-ui.ts'
import { LOCALES } from '../src/i18n/config.ts'

const origin = 'https://asv.acecore.net'
const salt = 'synthetic-store-test-salt'
const design = (model = 'classic') => ({
  palette: { 1: '#ddbbaa', 2: '#338855', 3: '#334466', 4: '#ee7733' },
  faces: Object.fromEntries(
    regions(model)
      .filter((r) => r.layer === 'base')
      .map((r) => [
        `${r.part}.${r.layer}.${r.face}`,
        Array(r.h).fill(
          (r.part === 'head'
            ? '1'
            : r.part === 'rightArm'
              ? '4'
              : r.part.includes('Leg')
                ? '3'
                : '2'
          ).repeat(r.w),
        ),
      ]),
  ),
})
const skin = (model = 'classic') => applyDesign(design(model), { model }).pixels
function database() {
  const db = new DatabaseSync(':memory:')
  for (const file of [
    '0001_usage.sql',
    '0002_diagnostics.sql',
    '0003_store.sql',
  ])
    db.exec(
      readFileSync(
        new URL(`../migrations/skin-maker/${file}`, import.meta.url),
        'utf8',
      ),
    )
  const env = {
    SKIN_STORE_ENABLED: 'true',
    SKIN_QUOTA_SALT: salt,
    SEARCH_RATE_LIMIT_DB: {
      prepare(sql) {
        const bound = (args) => ({
          first: async () => db.prepare(sql).get(...args) ?? null,
          all: async () => ({
            results: db.prepare(sql).all(...args),
            success: true,
          }),
          run: async () => db.prepare(sql).run(...args),
        })
        return { ...bound([]), bind: (...args) => bound(args) }
      },
    },
  }
  const send = (
    method = 'GET',
    input,
    query = '',
    headers = {},
    overrides = {},
  ) =>
    onRequest({
      env: { ...env, ...overrides },
      request: new Request(`${origin}/api/skin-store${query}`, {
        method,
        headers: {
          origin,
          'content-type': 'application/json',
          'cf-connecting-ip': '192.0.2.1',
          ...headers,
        },
        ...(input === undefined ? {} : { body: JSON.stringify(input) }),
      }),
    })
  return { db, env, send }
}
async function publication(model = 'classic', name = '緑の冒険家') {
  const id = crypto.randomUUID(),
    pixels = skin(model)
  return {
    id,
    input: {
      name,
      model,
      pixels: encodePixels(pixels),
      ticket: await issueStoreTicket(id, model, pixels, origin, salt),
      consent: true,
    },
  }
}

test('generated-only tickets bind pixels, model, origin, purpose and expiry', async () => {
  const { input } = await publication()
  const ticket = await readStoreTicket(input.ticket, salt, origin, 'publish')
  assert.equal(ticket.hash, await pixelHash(skin()))
  await assert.rejects(
    readStoreTicket(input.ticket, 'other-salt', origin, 'publish'),
  )
  await assert.rejects(
    readStoreTicket(input.ticket, salt, 'https://preview.invalid', 'publish'),
  )
  await assert.rejects(readStoreTicket(input.ticket, salt, origin, 'remove'))
  await assert.rejects(
    readStoreTicket(input.ticket, salt, origin, 'publish', ticket.expires),
  )
  await assert.rejects(
    readStoreTicket(input.ticket.replace(/.$/, '!'), salt, origin, 'publish'),
  )
  const expired = await signStoreTicket({ ...ticket, expires: 1 }, salt)
  await assert.rejects(readStoreTicket(expired, salt, origin, 'publish'))
})

test('publication requires explicit consent and the unmodified generated skin', async () => {
  const { db, send } = database()
  try {
    const { input } = await publication()
    assert.equal((await send('POST', { ...input, consent: false })).status, 400)
    assert.equal(
      (await send('POST', { ...input, prompt: 'private' })).status,
      400,
    )
    assert.equal((await send('POST', { ...input, name: ' ' })).status, 400)
    assert.equal(
      (await send('POST', { ...input, name: 'x'.repeat(41) })).status,
      400,
    )
    assert.equal(
      (await send('POST', { ...input, name: 'bad\u202ename' })).status,
      400,
    )
    assert.equal(
      (await send('POST', { ...input, ticket: 'invalid' })).status,
      403,
    )
    assert.equal(
      (await send('POST', input, '', { origin: 'https://elsewhere.invalid' }))
        .status,
      403,
    )
    assert.equal(
      (await send('POST', input, '', { 'sec-fetch-site': 'cross-site' }))
        .status,
      403,
    )
    const changed = skin()
    changed[(8 * 64 + 8) * 4] ^= 1
    assert.equal(
      (await send('POST', { ...input, pixels: encodePixels(changed) })).status,
      403,
    )
    assert.equal(
      (
        await send('POST', {
          ...input,
          model: 'slim',
          pixels: encodePixels(skin('slim')),
        })
      ).status,
      403,
    )
    assert.equal(db.prepare('SELECT count(*) AS n FROM skin_store').get().n, 0)
  } finally {
    db.close()
  }
})

test('publish -> catalogue -> detail -> actual 64x64 PNG -> withdraw; retries cannot revive tombstones', async () => {
  const { db, send } = database()
  try {
    const { id, input } = await publication('slim', '雪の旅人')
    const response = await send('POST', input)
    assert.equal(response.status, 201)
    const receipt = await response.json()
    const retry = await send('POST', input)
    assert.equal(retry.status, 200)
    assert.deepEqual(await retry.json(), receipt)
    assert.equal(db.prepare('SELECT count(*) AS n FROM skin_store').get().n, 1)
    const list = await (await send()).json()
    assert.equal(list.items[0].name, input.name)
    assert.equal(list.items[0].model, 'slim')
    assert.equal(list.items[0].id, id)
    assert.equal('png' in list.items[0], false)
    assert.equal('ticket' in list.items[0], false)
    const detail = await (await send('GET', undefined, `?id=${id}`)).json()
    assert.equal(detail.png, skinPngUrl(skin('slim')))
    const download = await send('GET', undefined, `?id=${id}&download=1`)
    assert.equal(download.headers.get('content-type'), 'image/png')
    assert.match(download.headers.get('content-disposition'), /minecraft-slim/)
    assert.equal(download.headers.get('cache-control'), 'no-store')
    assert.deepEqual(
      readSkinPng(new Uint8Array(await download.arrayBuffer()), 'slim'),
      skin('slim'),
    )
    assert.equal((await send('DELETE', { ticket: input.ticket })).status, 403)
    assert.equal(
      (await send('DELETE', { ticket: receipt.removeTicket })).status,
      200,
    )
    assert.equal((await send()).headers.get('cache-control'), 'no-store')
    assert.equal((await (await send()).json()).items.length, 0)
    assert.equal((await send('GET', undefined, `?id=${id}`)).status, 404)
    assert.equal(
      (await send('GET', undefined, `?id=${id}&download=1`)).status,
      404,
    )
    assert.equal((await send('POST', input)).status, 409)
    assert.equal(
      db.prepare('SELECT png FROM skin_store WHERE id = ?').get(id).png,
      '',
    )
    // The owner's withdrawal must also prevent a moderator from restoring a blocked skin.
    const blocked = await publication()
    const blockedReceipt = await (await send('POST', blocked.input)).json()
    db.prepare("UPDATE skin_store SET state='blocked' WHERE id=?").run(
      blocked.id,
    )
    assert.equal((await send('POST', blocked.input)).status, 409)
    assert.equal(
      (await send('DELETE', { ticket: blockedReceipt.removeTicket })).status,
      200,
    )
    db.prepare(
      "UPDATE skin_store SET state='published' WHERE id=? AND state='blocked'",
    ).run(blocked.id)
    const withdrawn = db
      .prepare('SELECT state, png FROM skin_store WHERE id=?')
      .get(blocked.id)
    assert.equal(withdrawn.state, 'withdrawn')
    assert.equal(withdrawn.png, '')
  } finally {
    db.close()
  }
})

test('stable pagination handles tied timestamps, model filters, literal search and moderation', async () => {
  const { db, send } = database()
  try {
    const insert = db.prepare(
      'INSERT INTO skin_store (id,name,model,created,png,preview) VALUES (?,?,?,?,?,?)',
    )
    const ids = []
    for (let i = 0; i < STORE_PAGE_SIZE + 4; i++) {
      const id = crypto.randomUUID()
      ids.push(id)
      insert.run(
        id,
        i === 0 ? '100%_green' : `Traveller ${i}`,
        i % 2 ? 'slim' : 'classic',
        100,
        'png',
        'preview',
      )
    }
    const first = await (await send()).json()
    assert.equal(first.items.length, STORE_PAGE_SIZE)
    assert.ok(first.cursor)
    const second = await (
      await send(
        'GET',
        undefined,
        `?cursor=${encodeURIComponent(first.cursor)}`,
      )
    ).json()
    assert.equal(second.items.length, 4)
    assert.equal(second.cursor, null)
    assert.equal(
      new Set([...first.items, ...second.items].map((i) => i.id)).size,
      28,
    )
    const slim = await (await send('GET', undefined, '?model=slim')).json()
    assert.equal(slim.items.length, 14)
    assert.ok(slim.items.every((item) => item.model === 'slim'))
    const literal = await (await send('GET', undefined, '?q=%25_')).json()
    assert.equal(literal.items.length, 1)
    assert.equal(literal.items[0].name, '100%_green')
    assert.equal(
      (await (await send('GET', undefined, '?q=%27%20OR%201%3D1%20--')).json())
        .items.length,
      0,
    )
    db.prepare("UPDATE skin_store SET state='blocked' WHERE id=?").run(ids[0])
    assert.equal(
      (await send('GET', undefined, `?id=${ids[0]}&download=1`)).status,
      404,
    )
    assert.equal(
      (await (await send('GET', undefined, '?q=%25_')).json()).items.length,
      0,
    )
    assert.equal((await send('GET', undefined, '?cursor=broken')).status, 400)
    assert.equal((await send('GET', undefined, '?model=invalid')).status, 400)
    assert.equal((await send('GET', undefined, '?id=../bad')).status, 400)
  } finally {
    db.close()
  }
})

test('reports use fixed reasons and atomic daily quotas, never hide skins automatically or store raw IP', async () => {
  const { db, send } = database()
  try {
    const ids = []
    for (let i = 0; i < 6; i++) {
      const { id, input } = await publication()
      await send('POST', input)
      ids.push(id)
    }
    assert.equal(
      (
        await send(
          'POST',
          { id: ids[0], reason: 'free text' },
          '?action=report',
        )
      ).status,
      400,
    )
    assert.equal(
      (
        await send(
          'POST',
          { id: crypto.randomUUID(), reason: 'other' },
          '?action=report',
        )
      ).status,
      429,
    )
    for (let i = 0; i < 5; i++)
      assert.equal(
        (await send('POST', { id: ids[i], reason: 'rights' }, '?action=report'))
          .status,
        200,
      )
    assert.equal(
      (await send('POST', { id: ids[0], reason: 'rights' }, '?action=report'))
        .status,
      429,
    )
    assert.equal(
      (await send('POST', { id: ids[5], reason: 'rights' }, '?action=report'))
        .status,
      429,
    )
    assert.equal(
      db.prepare('SELECT count(*) AS n FROM skin_store_reports').get().n,
      5,
    )
    assert.equal((await (await send()).json()).items.length, 6)
    assert.ok(
      db.prepare('SELECT client FROM skin_store_reports').get().client !==
        '192.0.2.1',
    )
    db.prepare('UPDATE skin_store_reports SET created=1').run()
    assert.equal(
      (
        await send('POST', { id: ids[5], reason: 'other' }, '?action=report', {
          'cf-connecting-ip': '192.0.2.2',
        })
      ).status,
      200,
    )
    assert.equal(
      db.prepare('SELECT count(*) AS n FROM skin_store_reports').get().n,
      1,
    )
  } finally {
    db.close()
  }
})

test('oversized streamed bodies, unsupported methods, disabled store and missing migrations fail closed', async () => {
  const { db, env, send } = database()
  try {
    assert.equal((await send('PUT', {})).status, 405)
    assert.equal(
      (await send('GET', undefined, '', {}, { SKIN_STORE_ENABLED: 'false' }))
        .status,
      503,
    )
    assert.equal(
      (await send('GET', undefined, '', {}, { SKIN_QUOTA_SALT: undefined }))
        .status,
      503,
    )
    const request = new Request(`${origin}/api/skin-store`, {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json' },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('x'.repeat(28001)))
          controller.close()
        },
      }),
      duplex: 'half',
    })
    assert.equal((await onRequest({ request, env })).status, 400)
    db.exec('DROP TABLE skin_store_reports; DROP TABLE skin_store')
    const missing = await send()
    assert.equal(missing.status, 503)
    assert.deepEqual(await missing.json(), { error: 'unavailable' })
  } finally {
    db.close()
  }
})

test('front portraits preserve asymmetric limbs, slim arm widths and outer-layer pixels', () => {
  for (const model of ['classic', 'slim']) {
    const pixels = skin(model)
    const head = regions(model).find(
      (r) => r.part === 'head' && r.layer === 'outer' && r.face === 'front',
    )
    pixels.set([255, 0, 255, 255], (head.y * 64 + head.x) * 4)
    const portrait = decode(Buffer.from(skinPortrait(pixels, model), 'base64'))
    assert.equal(portrait.width, 32)
    assert.equal(portrait.height, 36)
    const at = (x, y) =>
      Array.from(portrait.data.subarray((y * 32 + x) * 4, (y * 32 + x + 1) * 4))
    assert.deepEqual(at(12, 2), [255, 0, 255, 255])
    assert.deepEqual(at(model === 'slim' ? 9 : 8, 10), [238, 119, 51, 255])
    assert.deepEqual(at(20, 10), [51, 136, 85, 255])
    assert.equal(at(model === 'slim' ? 8 : 7, 10)[3], 0)
  }
})

test('generation issues a publish ticket without persisting skin/prompt/reference or publishing automatically', async () => {
  const { db, env } = database()
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    Response.json({
      success: true,
      hostname: 'asv.acecore.net',
      action: 'skin-maker',
    })
  try {
    const response = await generate({
      env: {
        ...env,
        SKIN_MAKER_ENABLED: 'true',
        SKIN_AI_MODEL: '@cf/example/chat-model',
        SKIN_TURNSTILE_SECRET: 'synthetic',
        SKIN_TURNSTILE_SITE_KEY: 'synthetic',
        AI: { run: async () => ({ response: JSON.stringify(design()) }) },
      },
      request: new Request(`${origin}/api/skin-maker`, {
        method: 'POST',
        headers: {
          origin,
          'content-type': 'application/json',
          'cf-connecting-ip': '192.0.2.1',
        },
        body: JSON.stringify({
          mode: 'create',
          model: 'classic',
          prompt: 'private prompt',
          token: 'synthetic',
          consent: true,
        }),
      }),
    })
    assert.equal(response.status, 200)
    const output = await response.json()
    const ticket = await readStoreTicket(
      output.storeTicket,
      salt,
      origin,
      'publish',
    )
    assert.equal(ticket.id, output.requestId)
    assert.equal(ticket.hash, await pixelHash(skin()))
    assert.equal(db.prepare('SELECT count(*) AS n FROM skin_store').get().n, 0)
    assert.equal(
      JSON.stringify(
        db.prepare('SELECT * FROM skin_maker_diagnostics').all(),
      ).includes('private prompt'),
      false,
    )
  } finally {
    globalThis.fetch = originalFetch
    db.close()
  }
})

test('store controls are complete in every supported locale', () => {
  const keys = Object.keys(getSkinStoreUi('ja')).sort()
  for (const locale of LOCALES) {
    const copy = getSkinStoreUi(locale)
    assert.deepEqual(Object.keys(copy).sort(), keys)
    assert.ok(
      Object.values(copy).every(
        (value) => typeof value === 'string' && value.trim().length,
      ),
    )
  }
})
