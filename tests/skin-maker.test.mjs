import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { encode, decode } from 'fast-png'
import {
  PARTS,
  FACES,
  LAYERS,
  regions,
  applyDesign,
  decodePixels,
  encodePixels,
  requestSchema,
  validateSkin,
} from '../src/lib/skin-maker.ts'
import { readSkinPng, skinPngUrl } from '../src/lib/skin-png.ts'
import {
  onRequest,
  modelInput,
  parseCompletion,
  readBody,
  RESERVE_SQL,
  MAX_TOKENS,
} from '../functions/api/skin-maker.ts'
import { getSkinMakerUi } from '../src/data/skin-maker-ui.ts'
import { LOCALES } from '../src/i18n/config.ts'

const create = (model = 'classic') => ({
  mode: 'create',
  model,
  parts: [...PARTS],
  layers: [...LAYERS],
  faces: [...FACES],
  prompt: 'Original green explorer',
  token: 'token',
  consent: true,
})
const design = (model = 'classic') => ({
  palette: { 1: '#cc9966', 2: '#223344' },
  faces: Object.fromEntries(
    regions(model)
      .filter((r) => r.layer === 'base')
      .map((r) => [
        `${r.part}.${r.layer}.${r.face}`,
        Array(r.h).fill((r.face === 'back' ? '2' : '1').repeat(r.w)),
      ]),
  ),
})
const skin = (model = 'classic') =>
  applyDesign(design(model), create(model)).pixels
const edit = () => ({
  ...create(),
  mode: 'edit',
  parts: ['head'],
  layers: ['base'],
  faces: ['front'],
})
const patch = () => ({
  palette: { 1: '#00bb22' },
  patches: [
    { part: 'head', layer: 'base', face: 'front', x: 2, y: 3, rows: ['1'] },
  ],
})

for (const model of ['classic', 'slim'])
  test(`${model}: atlas coverage, bounds, no overlapping parts/layers, PNG roundtrip`, () => {
    const atlas = regions(model),
      used = new Set()
    assert.equal(atlas.length, 72)
    for (const r of atlas)
      for (let y = r.y; y < r.y + r.h; y++)
        for (let x = r.x; x < r.x + r.w; x++) {
          assert.ok(x >= 0 && x < 64 && y >= 0 && y < 64)
          assert.ok(!used.has(y * 64 + x), JSON.stringify(r))
          used.add(y * 64 + x)
        }
    assert.equal(used.size, model === 'classic' ? 3264 : 3136)
    const pixels = skin(model)
    const png = Buffer.from(skinPngUrl(pixels).split(',')[1], 'base64')
    assert.deepEqual(readSkinPng(png, model), pixels)
    const image = decode(png)
    assert.equal(image.width, 64)
    assert.equal(image.height, 64)
    assert.equal(image.channels, 4)
    for (let i = 0; i < 4096; i++)
      if (!used.has(i)) assert.equal(pixels[i * 4 + 3], 0)
  })
test('known UV fixtures include asymmetric limbs and Slim padding', () => {
  const get = (model, part, layer, face) =>
    regions(model).find(
      (r) => r.part === part && r.layer === layer && r.face === face,
    )
  assert.deepEqual(get('classic', 'head', 'base', 'front'), {
    part: 'head',
    layer: 'base',
    face: 'front',
    x: 8,
    y: 8,
    w: 8,
    h: 8,
  })
  assert.deepEqual(get('slim', 'leftArm', 'outer', 'back'), {
    part: 'leftArm',
    layer: 'outer',
    face: 'back',
    x: 59,
    y: 52,
    w: 3,
    h: 12,
  })
  assert.deepEqual(get('classic', 'leftLeg', 'base', 'front'), {
    part: 'leftLeg',
    layer: 'base',
    face: 'front',
    x: 20,
    y: 52,
    w: 4,
    h: 12,
  })
  assert.deepEqual(get('slim', 'rightArm', 'base', 'bottom'), {
    part: 'rightArm',
    layer: 'base',
    face: 'bottom',
    x: 47,
    y: 16,
    w: 3,
    h: 4,
  })
})

test('live synthetic reference face grids render deterministically into valid Slim UVs', () => {
  const source = JSON.parse(
    readFileSync(
      new URL('./fixtures/skin-maker/reference-design.json', import.meta.url),
      'utf8',
    ),
  )
  const expected = readSkinPng(
    readFileSync(
      new URL('./fixtures/skin-maker/reference-slim.png', import.meta.url),
    ),
    'slim',
  )
  assert.deepEqual(applyDesign(source, create('slim')).pixels, expected)
  assert.equal(source.faces['head.base.right'].length, 12)
  assert.equal(
    regions('slim').find((r) => r.part === 'head' && r.face === 'right').h,
    8,
  )
  const malformed = structuredClone(source)
  malformed.faces['head.base.right'][0] = '1'
  assert.throws(() => applyDesign(malformed, create('slim')))
  const invalid = structuredClone(source)
  invalid.faces['head.base.right'][0] = 'zzzzzzzz'
  assert.throws(() => applyDesign(invalid, create('slim')))
})
test('one-pixel edit preserves every other byte, unused pixels and translucent outer pixels', () => {
  const original = skin()
  original.set([3, 5, 7, 121], (32 * 64 + 32) * 4)
  original.set([4, 6, 8, 0], 0)
  const snapshot = new Uint8Array(original)
  const { pixels, changed } = applyDesign(patch(), edit(), original)
  const offset = ((8 + 3) * 64 + 8 + 2) * 4
  assert.equal(changed, 1)
  for (let i = 0; i < 16384; i++)
    assert.equal(
      pixels[i],
      i >= offset && i < offset + 4
        ? [0, 187, 34, 255][i - offset]
        : original[i],
    )
  assert.deepEqual(original, snapshot)
  assert.deepEqual(
    readSkinPng(
      Buffer.from(skinPngUrl(pixels).split(',')[1], 'base64'),
      'classic',
    ),
    pixels,
  )
})
test('invalid or out-of-selection output never mutates original', () => {
  const original = skin(),
    snapshot = new Uint8Array(original)
  for (const mutate of [
    (p) => (p.patches[0].part = 'body'),
    (p) => (p.patches[0].face = 'back'),
    (p) => (p.patches[0].layer = 'outer'),
    (p) => (p.patches[0].x = 8),
    (p) => (p.patches[0].rows = ['0']),
    (p) => (p.patches[0].rows = ['z']),
    (p) => (p.patches[0].rows = ['11', '1']),
    (p) => p.patches.push({ ...p.patches[0] }),
    (p) => (p.script = 'alert(1)'),
  ]) {
    const value = patch()
    mutate(value)
    assert.throws(() => applyDesign(value, edit(), original))
    assert.deepEqual(original, snapshot)
  }
  const missing = design()
  delete missing.faces['head.base.front']
  assert.throws(() => applyDesign(missing, create()))
  assert.throws(() => applyDesign(patch(), edit()))
})
test('outer layer may clear pixels; transparent base and 64x32/HD are rejected', () => {
  const original = skin()
  original[(8 * 64 + 40) * 4 + 3] = 255
  const p = patch()
  Object.assign(p.patches[0], { layer: 'outer', x: 0, y: 0, rows: ['0'] })
  const result = applyDesign(p, { ...edit(), layers: ['outer'] }, original)
  assert.equal(result.pixels[(8 * 64 + 40) * 4 + 3], 0)
  for (const [width, height] of [
    [64, 32],
    [128, 128],
  ])
    assert.throws(() =>
      readSkinPng(
        encode({
          width,
          height,
          data: new Uint8Array(width * height * 4),
          channels: 4,
        }),
        'classic',
      ),
    )
  original[(8 * 64 + 8) * 4 + 3] = 0
  assert.throws(() => validateSkin(original, 'classic'))
})
test('palette PNG skin imports correctly', () => {
  const image = encode({
    width: 64,
    height: 64,
    depth: 8,
    channels: 1,
    data: new Uint8Array(4096),
    palette: [[27, 31, 43, 255]],
  })
  assert.deepEqual(
    readSkinPng(image, 'classic').slice(0, 4),
    new Uint8Array([27, 31, 43, 255]),
  )
})

test('packed 4-bit palette is unpacked without swapping adjacent pixels', () => {
  const image = encode({
    width: 64,
    height: 64,
    depth: 4,
    channels: 1,
    data: new Uint8Array(2048).fill(0x10),
    palette: [
      [12, 13, 14, 255],
      [91, 92, 93, 255],
    ],
  })
  assert.deepEqual(
    Array.from(readSkinPng(image, 'classic').slice(0, 8)),
    [91, 92, 93, 255, 12, 13, 14, 255],
  )
})
test('input schema is bounded and requires consent; RGBA length exact', () => {
  assert.ok(requestSchema.safeParse(create()).success)
  for (const value of [
    { ...create(), consent: false },
    { ...create(), mode: 'edit' },
    { ...create(), prompt: 'x'.repeat(1201) },
    { ...create(), model: 'unknown' },
    { ...create(), reference: { width: 257, height: 1, pixels: 'AAAA' } },
    { ...create(), url: 'https://bad.invalid' },
  ])
    assert.equal(requestSchema.safeParse(value).success, false)
  assert.throws(() => decodePixels('AAAA', 64, 64))
  assert.deepEqual(decodePixels(encodePixels(skin()), 64, 64), skin())
})
test('incomplete JSON and truncated completions fail; model receives true atlas and exact editable pixels', () => {
  assert.throws(() =>
    parseCompletion({
      choices: [{ finish_reason: 'length', message: { content: '{}' } }],
    }),
  )
  assert.deepEqual(parseCompletion({ response: '```json\n{}\n```' }), {})
  assert.throws(() =>
    parseCompletion({ response: 'explanation ```json\n{}\n```' }),
  )
  const input = modelInput(edit(), skin())
  assert.equal(input.max_completion_tokens, MAX_TOKENS)
  assert.equal(input.store, false)
  assert.ok(
    input.messages[0].content.some(
      (v) => v.type === 'image_url' && v.image_url.url === skinPngUrl(skin()),
    ),
  )
  assert.ok(
    input.messages[0].content.some(
      (v) => v.type === 'text' && v.text.includes('cc9966ff'),
    ),
  )
})
test('streamed request bound works without Content-Length', async () => {
  const request = new Request('https://test.invalid', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: new ReadableStream({
      start(c) {
        c.enqueue(new Uint8Array(450001))
        c.close()
      },
    }),
    duplex: 'half',
  })
  await assert.rejects(readBody(request))
})

function database() {
  const db = new DatabaseSync(':memory:')
  db.exec(
    readFileSync(
      new URL('../migrations/skin-maker/0001_usage.sql', import.meta.url),
      'utf8',
    ),
  )
  return db
}
test('SQL atomically caps per-minute, daily client and global reservations', () => {
  const db = database(),
    statement = db.prepare(RESERVE_SQL)
  let id = 0
  const reserve = (client, time = 1000, day = '2026-09-07') =>
    statement.get(
      String(++id),
      day,
      client,
      time,
      day,
      day,
      client,
      client,
      time - 60,
    )
  assert.ok(reserve('a'))
  assert.equal(reserve('a'), undefined)
  for (let i = 1; i < 5; i++) assert.ok(reserve('a', 1000 + i * 60))
  assert.equal(reserve('a', 1500), undefined)
  for (let i = 0; i < 95; i++) assert.ok(reserve('b' + i))
  assert.equal(reserve('last'), undefined)
  assert.equal(
    db.prepare('SELECT count(*) AS n FROM skin_maker_usage').get().n,
    100,
  )
  assert.ok(reserve('next', 90000, '2026-09-08'))
  db.close()
})

test('API fails closed, verifies hostname/action and does not spend on invalid or over-quota requests', async () => {
  const db = database()
  let calls = 0,
    verification = {
      success: true,
      hostname: 'asv.acecore.net',
      action: 'skin-maker',
    }
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => Response.json(verification)
  const env = {
    SKIN_MAKER_ENABLED: 'true',
    SKIN_TURNSTILE_SECRET: 'synthetic',
    SKIN_QUOTA_SALT: 'synthetic-salt',
    SKIN_TURNSTILE_SITE_KEY: 'test',
    AI: {
      run: async () => {
        calls++
        return {
          choices: [
            {
              finish_reason: 'stop',
              message: { content: JSON.stringify(design()) },
            },
          ],
        }
      },
    },
    SEARCH_RATE_LIMIT_DB: {
      prepare(sql) {
        return {
          bind(...args) {
            return {
              first: async () => db.prepare(sql).get(...args),
              run: async () => db.prepare(sql).run(...args),
            }
          },
        }
      },
    },
  }
  const send = (input = create(), overrides = {}, headers = {}) =>
    onRequest({
      env: { ...env, ...overrides },
      request: new Request('https://asv.acecore.net/api/skin-maker', {
        method: 'POST',
        headers: {
          origin: 'https://asv.acecore.net',
          'content-type': 'application/json',
          'cf-connecting-ip': '192.0.2.1',
          ...headers,
        },
        body: JSON.stringify(input),
      }),
    })
  try {
    assert.equal(
      (await send(create(), { SKIN_MAKER_ENABLED: 'false' })).status,
      503,
    )
    assert.equal(
      (await send(create(), { SKIN_QUOTA_SALT: undefined })).status,
      503,
    )
    assert.equal(
      (await send(create(), {}, { origin: 'https://elsewhere.invalid' }))
        .status,
      403,
    )
    assert.equal((await send({ ...create(), consent: false })).status, 400)
    verification = { ...verification, hostname: 'elsewhere.invalid' }
    assert.equal((await send()).status, 403)
    verification = {
      ...verification,
      hostname: 'asv.acecore.net',
      action: 'other',
    }
    assert.equal((await send()).status, 403)
    assert.equal(calls, 0)
    verification = { ...verification, action: 'skin-maker' }
    const response = await send()
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(
      decodePixels((await response.json()).pixels, 64, 64),
      skin(),
    )
    assert.equal((await send()).status, 429)
    assert.equal(calls, 1)
    const failed = await send(
      create(),
      {
        AI: {
          run: async () => {
            calls++
            throw new Error('upstream private detail')
          },
        },
      },
      { 'cf-connecting-ip': '192.0.2.2' },
    )
    assert.equal(failed.status, 502)
    assert.equal((await failed.text()).includes('private'), false)
    assert.equal(
      (await send(create(), {}, { 'cf-connecting-ip': '192.0.2.2' })).status,
      429,
    )
  } finally {
    globalThis.fetch = originalFetch
    db.close()
  }
})
test('all supported locales have complete nonempty controls', () => {
  for (const locale of LOCALES) {
    const c = getSkinMakerUi(locale)
    assert.ok(
      Object.values(c).every((v) =>
        Array.isArray(v) ? v.every(Boolean) : !!v,
      ),
    )
    assert.equal(c.partNames.length, 6)
    assert.equal(c.faceNames.length, 6)
    assert.equal(c.layerNames.length, 2)
  }
})

test('live text generation and both-eye edit retain all unrelated RGBA bytes', () => {
  const fixture = (name) =>
    readFileSync(new URL(`./fixtures/skin-maker/${name}`, import.meta.url))
  const original = readSkinPng(fixture('text-classic.png'), 'classic')
  assert.deepEqual(
    applyDesign(JSON.parse(fixture('text-design.json')), create()).pixels,
    original,
  )
  const output = applyDesign(
    JSON.parse(fixture('eyes-edit.json')),
    edit(),
    original,
  )
  const eyeOffsets = [((8 + 4) * 64 + 8 + 3) * 4, ((8 + 4) * 64 + 8 + 7) * 4]
  assert.equal(output.changed, 2)
  for (let i = 0; i < original.length; i += 4) {
    if (eyeOffsets.includes(i)) {
      assert.deepEqual([...original.subarray(i, i + 4)], [58, 111, 216, 255])
      assert.deepEqual(
        [...output.pixels.subarray(i, i + 4)],
        [63, 174, 74, 255],
      )
    } else
      assert.deepEqual(
        output.pixels.subarray(i, i + 4),
        original.subarray(i, i + 4),
      )
  }
})

test('exact recolor changes separated pixels only and rejects missing, conflicting or disallowed sources', () => {
  const current = skin()
  const a = (12 * 64 + 9) * 4,
    b = (12 * 64 + 14) * 4
  current.set([58, 111, 216, 255], a)
  current.set([58, 111, 216, 255], b)
  current.set([58, 111, 216, 128], (4 * 64 + 40) * 4)
  const operation = {
    part: 'head',
    layer: 'base',
    face: 'front',
    from: '#3a6fd8',
    to: '#3fae4a',
  }
  const value = { palette: {}, recolors: [operation] }
  const result = applyDesign(value, edit(), current)
  assert.equal(result.changed, 2)
  for (let i = 0; i < current.length; i += 4)
    if (i !== a && i !== b)
      assert.deepEqual(
        result.pixels.subarray(i, i + 4),
        current.subarray(i, i + 4),
      )
  const original = current.slice()
  assert.throws(
    () =>
      applyDesign(
        { palette: {}, recolors: [operation, operation] },
        edit(),
        current,
      ),
    /overlap/,
  )
  assert.throws(
    () =>
      applyDesign(
        { palette: {}, recolors: [{ ...operation, from: '#123456' }] },
        edit(),
        current,
      ),
    /recolor_source_missing/,
  )
  assert.throws(
    () =>
      applyDesign(
        { palette: {}, recolors: [{ ...operation, face: 'back' }] },
        edit(),
        current,
      ),
    /outside_selection/,
  )
  assert.deepEqual(current, original)
})

test('live recolor fixes both two-pixel eyes without touching intervening skin', () => {
  const fixture = (name) =>
    JSON.parse(
      readFileSync(new URL(`./fixtures/skin-maker/${name}`, import.meta.url)),
    )
  const source = applyDesign(
    fixture('text-recolor-design.json'),
    create(),
  ).pixels
  const output = applyDesign(fixture('recolor-edit.json'), edit(), source)
  const targets = [9, 10, 13, 14].map((x) => (12 * 64 + x) * 4)
  assert.equal(output.changed, 4)
  for (let i = 0; i < source.length; i += 4) {
    if (targets.includes(i)) {
      assert.equal(output.pixels[i + 1] > output.pixels[i], true)
      assert.equal(output.pixels[i + 1] > output.pixels[i + 2], true)
    } else
      assert.deepEqual(
        output.pixels.subarray(i, i + 4),
        source.subarray(i, i + 4),
      )
  }
})
