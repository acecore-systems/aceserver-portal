import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { decode } from 'fast-png'
import { onRequest, REMIX_SQL } from '../functions/api/skin-store.ts'
import { onRequest as generate } from '../functions/api/skin-maker.ts'
import {
  issueStoreTicket,
  readStoreTicket,
  signStoreTicket,
  pixelHash,
  remixClient,
} from '../functions/_lib/skin-store.ts'
import {
  applyDesign,
  regions,
  encodePixels,
  decodePixels,
  selectedRegions,
} from '../src/lib/skin-maker.ts'
import { skinPngUrl, readSkinPng } from '../src/lib/skin-png.ts'
import { skinPortrait, STORE_PAGE_SIZE } from '../src/lib/skin-store.ts'
import { getSkinStoreUi } from '../src/data/skin-store-ui.ts'
import { getSkinRemixUi } from '../src/data/skin-remix-ui.ts'
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
function database(withRemixes = true) {
  const db = new DatabaseSync(':memory:')
  for (const file of [
    '0001_usage.sql',
    '0002_diagnostics.sql',
    '0003_store.sql',
    ...(withRemixes ? ['0004_store_remixes.sql'] : []),
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
  const remixKeys = Object.keys(getSkinRemixUi('ja')).sort()
  for (const locale of LOCALES) {
    const copy = getSkinRemixUi(locale)
    assert.deepEqual(Object.keys(copy).sort(), remixKeys)
    assert.ok(Object.values(copy).every((value) => value.trim().length))
  }
})

test('copying a published skin is private, preserves Classic/Slim pixels and grants a separate, bounded-purpose ticket', async () => {
  const { db, send } = database()
  try {
    for (const model of ['classic', 'slim']) {
      const source = await publication(model)
      await send('POST', source.input)
      const before = db.prepare('SELECT * FROM skin_store').all()
      const response = await send('POST', { id: source.id }, '?action=clone')
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('cache-control'), 'no-store')
      const copy = await response.json()
      assert.equal(copy.sourceId, source.id)
      assert.equal(copy.model, model)
      assert.equal(copy.pixels, source.input.pixels)
      assert.equal(copy.name, source.input.name)
      assert.equal('removeTicket' in copy, false)
      const ticket = await readStoreTicket(copy.ticket, salt, origin, 'remix')
      assert.notEqual(ticket.id, source.id)
      assert.equal(ticket.source, source.id)
      assert.equal(ticket.hash, await pixelHash(skin(model)))
      const again = await (
        await send('POST', { id: source.id }, '?action=clone')
      ).json()
      assert.notEqual(
        (await readStoreTicket(again.ticket, salt, origin, 'remix')).id,
        ticket.id,
      )
      await assert.rejects(
        readStoreTicket(copy.ticket, salt, origin, 'publish'),
      )
      await assert.rejects(readStoreTicket(copy.ticket, salt, origin, 'remove'))
      assert.deepEqual(db.prepare('SELECT * FROM skin_store').all(), before)
      assert.equal(
        db.prepare('SELECT count(*) n FROM skin_maker_usage').get().n,
        0,
      )
    }
  } finally {
    db.close()
  }
})

test('an edited copy publishes as its own work; exact retries are idempotent, changed retries never overwrite either work, and removal affects only the copy', async () => {
  const { db, send } = database()
  try {
    const source = await publication('slim')
    await send('POST', source.input)
    const original = db
      .prepare('SELECT * FROM skin_store WHERE id = ?')
      .get(source.id)
    const copy = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const pixels = skin('slim')
    pixels.set([12, 34, 56, 255], (8 * 64 + 8) * 4)
    const input = {
      ...source.input,
      name: '青い目のコピー',
      pixels: encodePixels(pixels),
      ticket: copy.ticket,
    }
    assert.equal((await send('POST', input)).status, 403)
    const published = await send('POST', input, '?action=remix')
    assert.equal(published.status, 201)
    const receipt = await published.json()
    assert.notEqual(receipt.id, source.id)
    const result = db
      .prepare('SELECT * FROM skin_store WHERE id = ?')
      .get(receipt.id)
    assert.equal(result.source_id, source.id)
    assert.equal(result.png, skinPngUrl(pixels).split(',')[1])
    assert.ok(result.remix_client && !result.remix_client.includes('192.0.2.1'))
    assert.deepEqual(
      db.prepare('SELECT * FROM skin_store WHERE id = ?').get(source.id),
      original,
    )
    assert.equal((await (await send()).json()).items.length, 2)
    const retry = await send('POST', input, '?action=remix')
    assert.equal(retry.status, 200)
    assert.deepEqual(await retry.json(), receipt)
    assert.equal(
      (await send('POST', { ...input, name: '違う名前' }, '?action=remix'))
        .status,
      409,
    )
    pixels[(8 * 64 + 9) * 4] ^= 1
    assert.equal(
      (
        await send(
          'POST',
          { ...input, pixels: encodePixels(pixels) },
          '?action=remix',
        )
      ).status,
      409,
    )
    assert.deepEqual(
      db.prepare('SELECT * FROM skin_store WHERE id = ?').get(receipt.id),
      result,
    )
    assert.equal((await send('DELETE', { ticket: copy.ticket })).status, 403)
    const removal = await readStoreTicket(
      receipt.removeTicket,
      salt,
      origin,
      'remove',
    )
    assert.equal(removal.id, receipt.id)
    assert.equal(
      (await send('DELETE', { ticket: receipt.removeTicket })).status,
      200,
    )
    assert.equal((await send('POST', input, '?action=remix')).status, 409)
    assert.equal((await send('GET', undefined, `?id=${source.id}`)).status, 200)
    assert.equal(
      (await send('GET', undefined, `?id=${receipt.id}`)).status,
      404,
    )
    // Republishing another version requires a new copy ID, not reviving a tombstone.
    const next = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const nextResponse = await send(
      'POST',
      { ...input, ticket: next.ticket },
      '?action=remix',
      { 'cf-connecting-ip': '192.0.2.2' },
    )
    assert.equal(nextResponse.status, 201)
    assert.notEqual((await nextResponse.json()).id, receipt.id)
    assert.deepEqual(
      db.prepare('SELECT * FROM skin_store WHERE id = ?').get(source.id),
      original,
    )
  } finally {
    db.close()
  }
})

test('copy publication fails closed on consent, invalid pixels/model, forged/expired/wrong-purpose tickets and cross-origin input', async () => {
  const { db, send } = database()
  try {
    const source = await publication()
    await send('POST', source.input)
    const copy = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const input = { ...source.input, ticket: copy.ticket }
    for (const changes of [
      { consent: false },
      { pixels: 'invalid' },
      { prompt: 'private' },
      { name: '\u202ebad' },
    ])
      assert.equal(
        (await send('POST', { ...input, ...changes }, '?action=remix')).status,
        400,
      )
    const pixels = skin()
    pixels[(8 * 64 + 8) * 4 + 3] = 0
    assert.equal(
      (
        await send(
          'POST',
          { ...input, pixels: encodePixels(pixels) },
          '?action=remix',
        )
      ).status,
      400,
    )
    const ticket = await readStoreTicket(copy.ticket, salt, origin, 'remix')
    for (const invalid of [
      copy.ticket + 'x',
      source.input.ticket,
      await signStoreTicket({ ...ticket, expires: 1 }, salt),
      await signStoreTicket(
        { ...ticket, origin: 'https://preview.invalid' },
        salt,
      ),
      await signStoreTicket({ ...ticket, id: ticket.source }, salt),
      await signStoreTicket({ ...ticket, source: undefined }, salt),
    ])
      assert.equal(
        (await send('POST', { ...input, ticket: invalid }, '?action=remix'))
          .status,
        403,
      )
    assert.equal(
      (
        await send(
          'POST',
          { ...input, model: 'slim', pixels: encodePixels(skin('slim')) },
          '?action=remix',
        )
      ).status,
      403,
    )
    assert.equal(
      (
        await send('POST', input, '?action=remix', {
          origin: 'https://other.invalid',
        })
      ).status,
      403,
    )
    assert.equal(
      (
        await send('POST', input, '?action=remix', {
          'sec-fetch-site': 'cross-site',
        })
      ).status,
      403,
    )
    assert.equal(
      (await send('POST', input, '?action=remix', { 'cf-connecting-ip': '' }))
        .status,
      503,
    )
    assert.equal(db.prepare('SELECT count(*) n FROM skin_store').get().n, 1)
  } finally {
    db.close()
  }
})

test('hidden sources cannot be copied or newly republished; already published derivatives stay independent', async () => {
  const { db, send } = database()
  try {
    const source = await publication()
    const owner = await (await send('POST', source.input)).json()
    const copy = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const waiting = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const input = { ...source.input, ticket: copy.ticket }
    const receipt = await (await send('POST', input, '?action=remix')).json()
    for (const state of ['blocked', 'withdrawn']) {
      db.prepare('UPDATE skin_store SET state = ? WHERE id = ?').run(
        state,
        source.id,
      )
      assert.equal(
        (await send('POST', { id: source.id }, '?action=clone')).status,
        404,
      )
      assert.equal(
        (
          await send(
            'POST',
            { ...input, ticket: waiting.ticket },
            '?action=remix',
          )
        ).status,
        404,
      )
      assert.equal((await send('POST', input, '?action=remix')).status, 200)
      assert.equal(
        (await send('GET', undefined, `?id=${receipt.id}&download=1`)).status,
        200,
      )
    }
    await send('DELETE', { ticket: owner.removeTicket })
    assert.equal(
      (await send('GET', undefined, `?id=${receipt.id}`)).status,
      200,
    )
    assert.equal(
      (await send('POST', { id: receipt.id }, '?action=clone')).status,
      200,
    )
    assert.equal(
      (await send('POST', { id: 'bad' }, '?action=clone')).status,
      400,
    )
    assert.equal(
      (
        await send(
          'POST',
          { id: source.id, pixels: input.pixels },
          '?action=clone',
        )
      ).status,
      400,
    )
    assert.equal(
      (
        await send('POST', { id: source.id }, '?action=clone', {
          origin: 'https://other.invalid',
        })
      ).status,
      403,
    )
  } finally {
    db.close()
  }
})

test('copy publication quotas are atomic: one per minute, five per UTC client day, 100 site-wide, including withdrawn works', async () => {
  const { db, send } = database()
  try {
    const source = await publication()
    await send('POST', source.input)
    const day = '2026-10-07',
      start = Date.parse(`${day}T00:00:00Z`) / 1000
    const client = await remixClient('192.0.2.1', day, salt)
    assert.notEqual(client, await remixClient('192.0.2.1', '2026-10-08', salt))
    const insert = (client, now, model = 'classic') =>
      db
        .prepare(REMIX_SQL)
        .get(
          crypto.randomUUID(),
          'コピー',
          model,
          now,
          'png',
          'preview',
          source.id,
          client,
          source.id,
          model,
          start,
          client,
          start,
          client,
          now - 60,
        )
    const first = insert(client, start)
    assert.ok(first)
    assert.equal(insert(client, start + 59), undefined)
    for (let i = 1; i < 5; i++) assert.ok(insert(client, start + i * 60))
    db.prepare("UPDATE skin_store SET state='withdrawn' WHERE id=?").run(
      first.id,
    )
    assert.equal(insert(client, start + 5 * 60), undefined)
    assert.equal(insert('other-model', start + 360, 'slim'), undefined)
    for (let i = 0; i < 95; i++) assert.ok(insert(`other-${i}`, start + 360))
    assert.equal(insert('site-over-quota', start + 420), undefined)
    assert.equal(
      db
        .prepare(
          'SELECT count(*) n FROM skin_store WHERE source_id IS NOT NULL',
        )
        .get().n,
      100,
    )
  } finally {
    db.close()
  }
})

test('over-quota publication keeps the original and reserves no new work; exact retries remain possible', async () => {
  const { db, send } = database()
  try {
    const source = await publication()
    await send('POST', source.input)
    const copy = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const input = { ...source.input, ticket: copy.ticket }
    assert.equal((await send('POST', input, '?action=remix')).status, 201)
    const next = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const limited = await send(
      'POST',
      { ...input, ticket: next.ticket },
      '?action=remix',
    )
    assert.equal(limited.status, 429)
    assert.deepEqual(await limited.json(), { error: 'rate_limit' })
    assert.equal(db.prepare('SELECT count(*) n FROM skin_store').get().n, 2)
    assert.equal((await send('POST', input, '?action=remix')).status, 200)
    assert.equal(
      db.prepare('SELECT count(*) n FROM skin_maker_usage').get().n,
      0,
    )
  } finally {
    db.close()
  }
})

test('manual -> masked AI edits of a store copy still publish as a separate work without masquerading as a generated-only result', async (t) => {
  const { db, env, send } = database()
  try {
    const source = await publication('slim')
    await send('POST', source.input)
    const copy = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const before = decodePixels(copy.pixels, 64, 64)
    before.set([22, 33, 44, 255], (12 * 64 + 10) * 4)
    const selection = {
      part: 'head',
      layer: 'base',
      face: 'front',
      rectangle: { x: 0, y: 0, w: 2, h: 2 },
    }
    let calls = 0
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json({
        success: true,
        hostname: 'asv.acecore.net',
        action: 'skin-maker',
      }),
    )
    const aiEnv = {
      ...env,
      SKIN_MAKER_ENABLED: 'true',
      SKIN_AI_MODEL: '@cf/local/mocked-design',
      SKIN_TURNSTILE_SITE_KEY: 'synthetic',
      SKIN_TURNSTILE_SECRET: 'synthetic',
      AI: {
        run: async () => {
          calls++
          return {
            response: JSON.stringify({
              palette: { 1: '#3388ee' },
              faces: Object.fromEntries(
                selectedRegions('slim', selection).map((r) => [
                  `${r.part}.${r.layer}.${r.face}`,
                  Array(r.h).fill('1'.repeat(r.w)),
                ]),
              ),
            }),
          }
        },
      },
    }
    const ai = (storeTicket) =>
      generate({
        env: aiEnv,
        request: new Request(origin + '/api/skin-maker', {
          method: 'POST',
          headers: {
            origin,
            'content-type': 'application/json',
            'cf-connecting-ip': '192.0.2.1',
          },
          body: JSON.stringify({
            mode: 'edit',
            model: 'slim',
            current: encodePixels(before),
            prompt: 'blue eyes',
            selection,
            token: 'synthetic',
            consent: true,
            ...(storeTicket ? { storeTicket } : {}),
          }),
        }),
      })
    assert.equal((await ai(copy.ticket)).status, 400)
    assert.equal(calls, 0)
    const response = await ai()
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.storeTicket, null)
    assert.equal(result.changed, 4)
    assert.equal(calls, 1)
    const after = decodePixels(result.pixels, 64, 64)
    for (let i = 0; i < 4096; i++) {
      const x = i % 64,
        y = Math.floor(i / 64)
      if (x >= 8 && x < 10 && y >= 8 && y < 10)
        assert.deepEqual(
          Array.from(after.slice(i * 4, i * 4 + 4)),
          [51, 136, 238, 255],
        )
      else
        assert.deepEqual(
          after.slice(i * 4, i * 4 + 4),
          before.slice(i * 4, i * 4 + 4),
        )
    }
    const published = await send(
      'POST',
      {
        ...source.input,
        name: '手編集とAIのコピー',
        pixels: result.pixels,
        ticket: copy.ticket,
      },
      '?action=remix',
    )
    assert.equal(published.status, 201)
    const receipt = await published.json()
    const png = await send('GET', undefined, `?id=${receipt.id}&download=1`)
    assert.deepEqual(
      readSkinPng(new Uint8Array(await png.arrayBuffer()), 'slim'),
      after,
    )
    assert.equal(
      (await (await send('GET', undefined, `?id=${source.id}`)).json()).png,
      skinPngUrl(skin('slim')),
    )
  } finally {
    db.close()
  }
})

test('the additive remix migration preserves existing works; missing migration blocks only the attempted copy publication', async () => {
  const { db, send } = database(false)
  try {
    const source = await publication()
    assert.equal((await send('POST', source.input)).status, 201)
    const original = db
      .prepare(
        'SELECT id, name, model, created, state, png, preview FROM skin_store WHERE id=?',
      )
      .get(source.id)
    const copy = await (
      await send('POST', { id: source.id }, '?action=clone')
    ).json()
    const input = { ...source.input, ticket: copy.ticket }
    assert.equal((await send('POST', input, '?action=remix')).status, 503)
    db.exec(
      readFileSync(
        new URL(
          '../migrations/skin-maker/0004_store_remixes.sql',
          import.meta.url,
        ),
        'utf8',
      ),
    )
    assert.deepEqual(
      db
        .prepare(
          'SELECT id, name, model, created, state, png, preview FROM skin_store WHERE id=?',
        )
        .get(source.id),
      original,
    )
    assert.equal((await send('POST', source.input)).status, 200)
    assert.equal((await send('POST', input, '?action=remix')).status, 201)
  } finally {
    db.close()
  }
})
