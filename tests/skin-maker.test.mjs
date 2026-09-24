import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { encode, decode } from 'fast-png'
import {
  PARTS,
  FACES,
  LAYERS,
  WORKERS_MODEL,
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
  db.exec(
    readFileSync(
      new URL('../migrations/skin-maker/0002_diagnostics.sql', import.meta.url),
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
  const aiCalls = []
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
      run: async (model, input, options) => {
        aiCalls.push({ model, input, options })
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
    assert.equal(
      (await send({ ...create(), mode: 'edit', current: encodePixels(skin()) }))
        .status,
      400,
    )
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
    assert.equal(aiCalls[0].model, WORKERS_MODEL)
    assert.equal(aiCalls[0].options.gateway, undefined)
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
    const failedBody = await failed.json()
    assert.match(failedBody.requestId, /^[0-9a-f-]{36}$/)
    const saved = db
      .prepare('SELECT * FROM skin_maker_diagnostics WHERE id = ?')
      .get(failedBody.requestId)
    assert.equal(saved.stage, 'ai')
    assert.equal(saved.code, 'ai_failed')
    assert.equal(saved.status, 502)
    assert.equal(JSON.stringify(saved).includes('private'), false)
    assert.equal(JSON.stringify(failedBody).includes('private'), false)
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
    assert.match(c.consent, /OpenAI GPT-6 Luna/)
    assert.match(c.privacy, /OpenAI/)
    assert.ok(
      Object.values(c).every((v) =>
        Array.isArray(v) ? v.every(Boolean) : !!v,
      ),
    )
    assert.equal(c.faceNames.length, 6)
    assert.equal(c.layerNames.length, 2)
  }
})

test('retired edit API requests and edit payloads are rejected', () => {
  assert.equal(requestSchema.safeParse(create()).success, true)
  for (const extra of [
    { mode: 'edit' },
    { current: encodePixels(skin()) },
    { parts: ['head'] },
    { layers: ['base'] },
    { faces: ['front'] },
  ])
    assert.equal(
      requestSchema.safeParse({ ...create(), ...extra }).success,
      false,
    )
  assert.throws(() => applyDesign({ palette: {}, recolors: [] }, create()))
  assert.throws(() => applyDesign({ palette: {}, patches: [] }, create()))
})
test('completion parsing and reference input remain available', () => {
  assert.deepEqual(parseCompletion({ response: '```json\n{}\n```' }), {})
  assert.throws(() =>
    parseCompletion({
      choices: [{ finish_reason: 'length', message: { content: '{}' } }],
    }),
  )
  const input = modelInput({
    ...create(),
    reference: { width: 64, height: 64, pixels: encodePixels(skin()) },
  })
  assert.equal(input.max_completion_tokens, MAX_TOKENS)
  assert.equal(input.store, false)
  assert.equal(input.reasoning_effort, 'low')
  assert.equal('temperature' in input, false)
  assert.ok(
    input.messages[0].content.some(
      (v) => v.type === 'image_url' && v.image_url.url === skinPngUrl(skin()),
    ),
  )
})

test('live text generation retains the exact validated atlas', () => {
  const fixture = (name) =>
    readFileSync(new URL(`./fixtures/skin-maker/${name}`, import.meta.url))
  assert.deepEqual(
    applyDesign(JSON.parse(fixture('text-design.json')), create()).pixels,
    readSkinPng(fixture('text-classic.png'), 'classic'),
  )
})

test('live refused:false completion is a valid skin without changing its pixels', () => {
  const fixture = (name) =>
    readFileSync(new URL(`./fixtures/skin-maker/${name}`, import.meta.url))
  const source = JSON.parse(fixture('non-refused-design.json'))
  assert.equal(source.refused, false)
  assert.deepEqual(
    applyDesign(source, create()).pixels,
    readSkinPng(fixture('non-refused-classic.png'), 'classic'),
  )
})

test('API distinguishes explicit refusal from false and still rejects malformed designs', async () => {
  const source = JSON.parse(
    readFileSync(
      new URL('./fixtures/skin-maker/non-refused-design.json', import.meta.url),
    ),
  )
  const expected = readSkinPng(
    readFileSync(
      new URL('./fixtures/skin-maker/non-refused-classic.png', import.meta.url),
    ),
    'classic',
  )
  const missingFace = structuredClone(source)
  delete missingFace.faces['head.base.front']
  const invalidSymbol = structuredClone(source)
  invalidSymbol.faces['head.base.front'][0] = 'zzzzzzzz'
  const cases = [
    [source, 200],
    [{ palette: source.palette, faces: source.faces }, 200],
    [{ refused: true }, 422],
    [{ ...source, refused: true }, 422],
    ...['false', 'true', 0, null].map((refused) => [
      { ...source, refused },
      502,
    ]),
    [missingFace, 502],
    [invalidSymbol, 502],
  ]
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    Response.json({
      success: true,
      hostname: 'asv.acecore.net',
      action: 'skin-maker',
    })
  try {
    for (const [completion, expectedStatus] of cases) {
      let calls = 0
      const response = await onRequest({
        env: {
          SKIN_MAKER_ENABLED: 'true',
          SKIN_TURNSTILE_SECRET: 'synthetic',
          SKIN_QUOTA_SALT: 'synthetic',
          SKIN_TURNSTILE_SITE_KEY: 'synthetic',
          SEARCH_RATE_LIMIT_DB: {
            prepare: () => ({
              bind: () => ({
                first: async () => ({ id: 'reserved' }),
                run: async () => ({}),
              }),
            }),
          },
          AI: {
            run: async () => {
              calls++
              return {
                choices: [
                  {
                    finish_reason: 'stop',
                    message: { content: JSON.stringify(completion) },
                  },
                ],
              }
            },
          },
        },
        request: new Request('https://asv.acecore.net/api/skin-maker', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            origin: 'https://asv.acecore.net',
            'cf-connecting-ip': '192.0.2.45',
          },
          body: JSON.stringify(create()),
        }),
      })
      assert.equal(calls, 1, 'never retry a model request')
      assert.equal(
        response.status,
        expectedStatus,
        `refused=${completion.refused}`,
      )
      const body = await response.json()
      if (expectedStatus === 200)
        assert.deepEqual(decodePixels(body.pixels, 64, 64), expected)
      else
        assert.deepEqual(body, {
          error: expectedStatus === 422 ? 'refused' : 'generation_failed',
          requestId: body.requestId,
        })
    }
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('diagnostics persist safe classifications and retain the original result on storage failure', async (t) => {
  const { skinDiagnostics, failureCode } =
    await import('../functions/_lib/skin-diagnostics.ts')
  const logs = []
  t.mock.method(console, 'error', (v) => logs.push(v))
  t.mock.method(console, 'info', (v) => logs.push(v))
  const db = database()
  const adapter = {
    prepare: (sql) => ({
      bind: (...args) => ({ run: async () => db.prepare(sql).run(...args) }),
    }),
  }
  const d = skinDiagnostics(adapter, 'synthetic-id')
  await d.record('verification', 'verification', 403)
  assert.equal(
    db.prepare('SELECT count(*) AS n FROM skin_maker_diagnostics').get().n,
    0,
  )
  db.prepare(
    'INSERT INTO skin_maker_diagnostics VALUES (?, ?, ?, ?, ?, ?)',
  ).run('expired', 0, 'ai', 'started', 0, 0)
  d.reserve()
  await d.record('ai', 'started', 0)
  assert.equal(
    db.prepare('SELECT code FROM skin_maker_diagnostics').get().code,
    'started',
  )
  const privateError = new Error('PRIVATE prompt image token ip provider body')
  const cases = [
    ['ai', privateError, 'ai_failed'],
    ['ai', new DOMException('PRIVATE', 'TimeoutError'), 'timeout'],
    ['completion', new SyntaxError('PRIVATE'), 'invalid_json'],
    ['completion', new Error('incomplete'), 'incomplete'],
    [
      'design',
      Object.assign(new Error('PRIVATE'), { name: 'ZodError' }),
      'invalid_schema',
    ],
    ['design', new Error('palette'), 'palette'],
    ['cleanup', privateError, 'cleanup_failed'],
  ]
  for (const [stage, error, expected] of cases) {
    assert.equal(failureCode(stage, error), expected)
    await d.record(stage, failureCode(stage, error), 502)
    const row = db.prepare('SELECT * FROM skin_maker_diagnostics').get()
    assert.equal(row.id, 'synthetic-id')
    assert.equal(row.stage, stage)
    assert.equal(row.code, expected)
    assert.ok(row.elapsed_ms >= 0)
    assert.equal(JSON.stringify(row).includes('PRIVATE'), false)
  }
  const broken = skinDiagnostics(
    {
      prepare() {
        throw privateError
      },
    },
    'broken-id',
  )
  broken.reserve()
  await broken.record('ai', 'ai_failed', 502)
  assert.ok(logs.some((v) => v.includes('persistence_failed')))
  assert.equal(logs.join('').includes('PRIVATE'), false)
  db.close()
})
