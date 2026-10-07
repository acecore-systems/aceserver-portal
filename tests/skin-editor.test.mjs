import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  regions,
  encodePixels,
  decodePixels,
  applyDesign,
  validateSkin,
  validateEdit,
  requestSchema,
  selectedRegions,
} from '../src/lib/skin-maker.ts'
import {
  editPixel,
  paintLine,
  pixelColor,
  SkinHistory,
} from '../src/lib/skin-editor.ts'
import { readSkinPng, skinPngUrl } from '../src/lib/skin-png.ts'
import { getSkinEditorUi } from '../src/data/skin-editor-ui.ts'
import { LOCALES } from '../src/i18n/config.ts'
import { onRequest, modelInput } from '../functions/api/skin-maker.ts'
import {
  issueStoreTicket,
  readStoreTicket,
  pixelHash,
} from '../functions/_lib/skin-store.ts'
import openaiWorker from '../cloudflare/skin-openai/worker.ts'
import { SkinObject } from 'skinview3d'
import { Matrix3, Raycaster, Triangle, Vector2, Vector3 } from 'three'
import {
  skinHit,
  faceSurface,
  surfaceOutline,
} from '../src/lib/skin-editor-3d.ts'

for (const model of ['classic', 'slim']) {
  test(`${model}: real 3D raycasts resolve every pixel on all parts, layers and faces after rotation`, () => {
    const object = new SkinObject()
    object.modelType = model === 'slim' ? 'slim' : 'default'
    object.rotation.set(0.23, 0.74, -0.17)
    object.updateMatrixWorld(true)
    const boxFaces = ['left', 'right', 'top', 'bottom', 'front', 'back']
    const ray = new Raycaster()
    for (const r of regions(model)) {
      const mesh =
        object[r.part][r.layer === 'base' ? 'innerLayer' : 'outerLayer']
      const geometry = mesh.geometry,
        index = geometry.index,
        group = geometry.groups[boxFaces.indexOf(r.face)]
      const vertices = [0, 1, 2].map((n) => index.getX(group.start + n))
      const uv = geometry.getAttribute('uv'),
        position = geometry.getAttribute('position')
      const uvTriangle = new Triangle(
        ...vertices.map((i) => new Vector3(uv.getX(i), uv.getY(i), 0)),
      )
      const corners = vertices.map((i) =>
        new Vector3().fromBufferAttribute(position, i),
      )
      const normal = new Triangle(...corners)
        .getNormal(new Vector3())
        .applyNormalMatrix(new Matrix3().getNormalMatrix(mesh.matrixWorld))
      for (let y = 0; y < r.h; y++)
        for (let x = 0; x < r.w; x++) {
          const coordinate = new Vector3(
            (r.x + x + 0.5) / 64,
            1 - (r.y + y + 0.5) / 64,
            0,
          )
          const weights = uvTriangle.getBarycoord(coordinate, new Vector3())
          const target = new Vector3()
            .addScaledVector(corners[0], weights.x)
            .addScaledVector(corners[1], weights.y)
            .addScaledVector(corners[2], weights.z)
            .applyMatrix4(mesh.matrixWorld)
          ray.set(
            target.clone().addScaledVector(normal, 20),
            normal.clone().negate(),
          )
          const result = skinHit(
            model,
            r.part,
            r.layer,
            ray.intersectObject(mesh, false)[0],
          )
          assert.ok(result, `${r.part}.${r.layer}.${r.face} ${x},${y}`)
          assert.deepEqual(result.region, r)
          assert.deepEqual(result.point, { x, y })
        }
      // Exact UV boundaries stay on the hit face, even beside Slim padding.
      const hit = ray.intersectObject(mesh, false)[0]
      for (const [u, v] of [
        [r.x, r.y],
        [r.x + r.w, r.y + r.h],
      ]) {
        const result = skinHit(model, r.part, r.layer, {
          ...hit,
          uv: new Vector2(u / 64, 1 - v / 64),
        })
        assert.ok(result.point.x >= 0 && result.point.x < r.w)
        assert.ok(result.point.y >= 0 && result.point.y < r.h)
      }
      const surface = faceSurface(mesh, r)
      assert.ok(surface)
      const outline = surfaceOutline(surface, { x: 0, y: 0, w: r.w, h: r.h })
      assert.equal(outline.length, 4)
      assert.ok(outline.every((p) => p.toArray().every(Number.isFinite)))
      // The outline lies just outside the face so it does not flicker inside the texture.
      const localNormal = new Triangle(...corners).getNormal(new Vector3())
      assert.ok(
        outline.every(
          (p) =>
            Math.abs(p.clone().sub(corners[0]).dot(localNormal) - 0.02) < 1e-6,
        ),
      )
    }
  })
}

const origin = 'https://asv.acecore.net'
const salt = 'synthetic-edit-test-salt'
const skin = (model) =>
  readSkinPng(
    readFileSync(
      new URL(
        `./fixtures/skin-maker/${model === 'slim' ? 'reference-slim' : 'non-refused-classic'}.png`,
        import.meta.url,
      ),
    ),
    model,
  )
const input = (model = 'classic', extra = {}) => ({
  mode: 'edit',
  model,
  current: encodePixels(skin(model)),
  selection: { part: 'head', layer: 'base', face: 'front' },
  prompt: 'Only change the selected pixels to blue',
  token: 'synthetic',
  consent: true,
  ...extra,
})
const design = (request) => ({
  refused: false,
  palette: { 1: '#1234fe' },
  faces: Object.fromEntries(
    selectedRegions(request.model, request.selection).map((r) => [
      `${r.part}.${r.layer}.${r.face}`,
      Array(r.h).fill('1'.repeat(r.w)),
    ]),
  ),
})
const mask = (request) =>
  new Set(
    selectedRegions(request.model, request.selection).flatMap((r) => {
      const box = request.selection.rectangle ?? { x: 0, y: 0, w: r.w, h: r.h }
      return Array.from({ length: box.h }, (_, y) =>
        Array.from(
          { length: box.w },
          (_, x) => (r.y + box.y + y) * 64 + r.x + box.x + x,
        ),
      ).flat()
    }),
  )

for (const model of ['classic', 'slim']) {
  test(`${model}: all 72 face edits preserve every unselected byte, including padding and the other layer`, () => {
    const original = skin(model)
    for (const r of regions(model)) {
      const request = input(model, {
        selection: { part: r.part, layer: r.layer, face: r.face },
      })
      const output = applyDesign(design(request), request)
      const editable = mask(request)
      for (let p = 0; p < 4096; p++)
        if (!editable.has(p))
          assert.deepEqual(
            output.pixels.subarray(p * 4, p * 4 + 4),
            original.subarray(p * 4, p * 4 + 4),
          )
      validateSkin(output.pixels, model)
      assert.equal(output.changed, editable.size)
      assert.deepEqual(decodePixels(request.current, 64, 64), original)
    }
  })
  test(`${model}: rectangular and whole-part edits keep the rest of a realistic skin intact`, () => {
    for (const selection of [
      {
        part: 'head',
        layer: 'base',
        face: 'front',
        rectangle: { x: 2, y: 3, w: 3, h: 2 },
      },
      { part: 'leftArm', layer: 'outer' },
    ]) {
      const request = input(model, { selection }),
        original = decodePixels(request.current, 64, 64)
      const output = applyDesign(design(request), request),
        editable = mask(request)
      assert.equal(output.changed, editable.size)
      for (let p = 0; p < 4096; p++)
        if (!editable.has(p))
          assert.deepEqual(
            output.pixels.subarray(p * 4, p * 4 + 4),
            original.subarray(p * 4, p * 4 + 4),
          )
      assert.deepEqual(
        readSkinPng(
          Buffer.from(skinPngUrl(output.pixels).split(',')[1], 'base64'),
          model,
        ),
        output.pixels,
      )
    }
  })
}
test('edit validation rejects bad masks, wrong grids, transparent base, undefined colors and out-of-scope model output', () => {
  assert.equal(requestSchema.safeParse(input()).success, true)
  for (const extra of [
    { consent: false },
    { reference: { width: 1, height: 1, pixels: 'AAAAAA==' } },
    { selection: { part: 'all', layer: 'base' } },
    { current: 'x'.repeat(350001) },
  ])
    assert.equal(
      requestSchema.safeParse(input('classic', extra)).success,
      false,
    )
  for (const selection of [
    { part: 'head', layer: 'base', rectangle: { x: 0, y: 0, w: 1, h: 1 } },
    {
      part: 'head',
      layer: 'base',
      face: 'front',
      rectangle: { x: 7, y: 0, w: 2, h: 1 },
    },
    {
      part: 'leftArm',
      layer: 'base',
      face: 'front',
      rectangle: { x: 3, y: 0, w: 1, h: 1 },
    },
  ])
    assert.throws(() => validateEdit(input('slim', { selection })))
  assert.throws(() => validateEdit(input('classic', { current: 'AAAA' })))
  const transparent = skin('classic'),
    r = regions('classic').find((r) => r.layer === 'base')
  transparent[(r.y * 64 + r.x) * 4 + 3] = 0
  assert.throws(() =>
    validateEdit(input('classic', { current: encodePixels(transparent) })),
  )
  const request = input(),
    good = design(request)
  for (const faces of [
    {},
    { 'head.base.front': ['111'] },
    { 'head.base.front': Array(8).fill('00000000') },
    { 'head.base.front': Array(8).fill('zzzzzzzz') },
    { ...good.faces, 'head.base.back': Array(8).fill('11111111') },
  ])
    assert.throws(() => applyDesign({ ...good, faces }, request))
  const outer = input('classic', {
    selection: { part: 'head', layer: 'outer', face: 'front' },
  })
  const output = applyDesign(
    {
      ...design(outer),
      faces: { 'head.outer.front': Array(8).fill('00000000') },
    },
    outer,
  )
  for (const p of mask(outer)) assert.equal(output.pixels[p * 4 + 3], 0)
})

test('manual tools respect face boundaries, fill only connected colors, interpolate strokes and reject base erasure', () => {
  const original = skin('slim'),
    pixels = new Uint8Array(original)
  const r = regions('slim').find(
    (r) => r.part === 'leftArm' && r.layer === 'outer' && r.face === 'front',
  )
  const red = [255, 0, 0, 255],
    blue = [0, 0, 255, 255]
  for (let y = 0; y < r.h; y++)
    for (let x = 0; x < r.w; x++) editPixel(pixels, r, { x, y }, [0, 0, 0, 0])
  const beforeFill = new Uint8Array(pixels)
  for (let y = 0; y < r.h; y++) editPixel(pixels, r, { x: 1, y }, red)
  editPixel(pixels, r, { x: 0, y: 0 }, blue, true)
  for (let y = 0; y < r.h; y++) {
    assert.deepEqual(pixelColor(pixels, r, { x: 0, y }), blue)
    assert.deepEqual(pixelColor(pixels, r, { x: 1, y }), red)
    assert.deepEqual(
      pixelColor(pixels, r, { x: 2, y }),
      pixelColor(beforeFill, r, { x: 2, y }),
    )
  }
  paintLine(pixels, r, { x: 2, y: 0 }, { x: 2, y: 11 }, red)
  for (let y = 0; y < r.h; y++)
    assert.deepEqual(pixelColor(pixels, r, { x: 2, y }), red)
  editPixel(pixels, r, { x: 2, y: 0 }, [0, 0, 0, 0])
  assert.deepEqual(pixelColor(pixels, r, { x: 2, y: 0 }), [0, 0, 0, 0])
  for (let p = 0; p < 4096; p++)
    if (!(
      p % 64 >= r.x &&
      p % 64 < r.x + r.w &&
      Math.floor(p / 64) >= r.y &&
      Math.floor(p / 64) < r.y + r.h
    ))
      assert.deepEqual(
        pixels.subarray(p * 4, p * 4 + 4),
        original.subarray(p * 4, p * 4 + 4),
      )
  const base = regions('slim').find(
    (r) => r.part === 'head' && r.layer === 'base',
  )
  assert.throws(() => editPixel(pixels, base, { x: 0, y: 0 }, [0, 0, 0, 0]))
  validateSkin(pixels, 'slim')
})

test('undo restores pixels and publication eligibility; new edits clear redo and copied bounded history cannot be mutated', () => {
  const history = new SkinHistory(3),
    original = skin('classic'),
    changed = new Uint8Array(original)
  changed[0] = 19
  history.reset({ pixels: original, storeTicket: 'generated-ticket' })
  history.push({ pixels: changed, manuallyEdited: true })
  changed[0] = 20
  const undo = history.move(-1)
  assert.deepEqual(undo.pixels, original)
  assert.equal(undo.storeTicket, 'generated-ticket')
  undo.pixels[0] = 201
  assert.equal(history.move(1).pixels[0], 19)
  history.move(-1)
  history.push({ pixels: changed, manuallyEdited: true })
  assert.equal(history.canRedo, false)
  for (let i = 30; i < 35; i++) {
    changed[0] = i
    history.push({ pixels: changed })
  }
  assert.equal(history.move(-1).pixels[0], 33)
  assert.equal(history.move(-1).pixels[0], 32)
  assert.equal(history.move(-1), undefined)
  history.reset()
  assert.equal(history.canUndo, false)
  assert.equal(history.canRedo, false)
  history.reset({ pixels: original, storeTicket: 'withdrawn-ticket' })
  history.push({ pixels: changed, storeTicket: 'different-valid-ticket' })
  history.invalidateTicket('withdrawn-ticket')
  assert.equal(history.move(-1).storeTicket, undefined)
  assert.equal(history.move(1).storeTicket, 'different-valid-ticket')
})

test('AI edits use the exact current PNG with masked face data and fit the existing private Worker contract', async (t) => {
  for (const model of ['classic', 'slim']) {
    const request = input(model, {
      selection: { part: 'head', layer: 'outer' },
    })
    const body = { model: 'gpt-6-luna', ...modelInput(request) }
    assert.equal(body.messages[0].content.length, 2)
    assert.ok(body.messages[0].content[0].text.length < 30000)
    assert.equal(
      body.messages[0].content[1].image_url.url,
      skinPngUrl(skin(model)),
    )
    assert.match(
      body.messages[0].content[0].text,
      /Current selected face pixels/,
    )
    assert.match(body.messages[0].content[0].text, /No tools, URLs or code/)
    let calls = 0
    t.mock.method(globalThis, 'fetch', async (_url, init) => {
      calls++
      assert.deepEqual(JSON.parse(init.body), body)
      return Response.json({ choices: [] })
    })
    const response = await openaiWorker.fetch(
      new Request('https://skin-openai.internal/v1/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
      { OPENAI_API_KEY_STORE: { get: async () => 'synthetic-test-key' } },
    )
    assert.equal(response.status, 200)
    assert.equal(calls, 1)
    t.mock.restoreAll()
  }
})

test('edit API charges once, chains valid generation tickets, rejects forged provenance before AI, and never signs manually edited inputs', async (t) => {
  let aiCalls = 0,
    reservations = 0,
    verificationCalls = 0,
    completion
  t.mock.method(globalThis, 'fetch', async () => {
    verificationCalls++
    return Response.json({
      success: true,
      hostname: 'asv.acecore.net',
      action: 'skin-maker',
    })
  })
  const env = {
    SKIN_MAKER_ENABLED: 'true',
    SKIN_AI_MODEL: '@cf/example/chat-model',
    SKIN_STORE_ENABLED: 'true',
    SKIN_TURNSTILE_SECRET: 'synthetic',
    SKIN_QUOTA_SALT: salt,
    SKIN_TURNSTILE_SITE_KEY: 'synthetic',
    SEARCH_RATE_LIMIT_DB: {
      prepare: (sql) => ({
        bind: () => ({
          first: async () => {
            reservations++
            return { id: 'reserved' }
          },
          run: async () => ({}),
        }),
      }),
    },
    AI: {
      run: async () => {
        aiCalls++
        return { response: JSON.stringify(completion) }
      },
    },
  }
  const send = (request, overrides = {}) =>
    onRequest({
      env: { ...env, ...overrides },
      request: new Request(origin + '/api/skin-maker', {
        method: 'POST',
        headers: {
          origin,
          'content-type': 'application/json',
          'cf-connecting-ip': '192.0.2.34',
        },
        body: JSON.stringify(request),
      }),
    })
  const original = skin('classic')
  let request = input('classic', {
    storeTicket: await issueStoreTicket(
      crypto.randomUUID(),
      'classic',
      original,
      origin,
      salt,
    ),
  })
  completion = design(request)
  let response = await send(request),
    result = await response.json()
  assert.equal(response.status, 200)
  assert.equal(aiCalls, 1)
  assert.equal(reservations, 1)
  let ticket = await readStoreTicket(
    result.storeTicket,
    salt,
    origin,
    'publish',
  )
  assert.equal(
    ticket.hash,
    await pixelHash(decodePixels(result.pixels, 64, 64)),
  )
  request = {
    ...request,
    current: result.pixels,
    storeTicket: result.storeTicket,
    selection: { part: 'leftArm', layer: 'outer', face: 'front' },
  }
  completion = design(request)
  response = await send(request)
  result = await response.json()
  assert.equal(response.status, 200)
  ticket = await readStoreTicket(result.storeTicket, salt, origin, 'publish')
  assert.equal(ticket.model, 'classic')
  assert.equal(
    ticket.hash,
    await pixelHash(decodePixels(result.pixels, 64, 64)),
  )
  const before = { aiCalls, reservations, verificationCalls }
  for (const bad of [
    { ...request, storeTicket: request.storeTicket + 'x' },
    { ...request, current: encodePixels(original) },
    input('slim', { storeTicket: request.storeTicket }),
    input('classic', { current: 'AAAA' }),
    input('classic', {
      selection: {
        part: 'head',
        layer: 'base',
        rectangle: { x: 0, y: 0, w: 1, h: 1 },
      },
    }),
  ])
    assert.equal((await send(bad)).status, 400)
  assert.deepEqual({ aiCalls, reservations, verificationCalls }, before)
  const manual = input()
  delete manual.storeTicket
  completion = design(manual)
  response = await send(manual)
  result = await response.json()
  assert.equal(response.status, 200)
  assert.equal(result.storeTicket, null)
  completion = { refused: true }
  assert.equal((await send(manual)).status, 422)
  completion = { ...design(manual), faces: { 'head.base.front': ['1'] } }
  assert.equal((await send(manual)).status, 502)
  const aiBeforeLimit = aiCalls
  const blockedDb = {
    prepare: () => ({
      bind: () => ({ first: async () => null, run: async () => ({}) }),
    }),
  }
  assert.equal(
    (await send(manual, { SEARCH_RATE_LIMIT_DB: blockedDb })).status,
    429,
  )
  assert.equal(aiCalls, aiBeforeLimit)
})

test('editor copy covers every supported locale and all tools, parts, and AI scopes', () => {
  const keys = Object.keys(getSkinEditorUi('ja')).sort()
  for (const locale of LOCALES) {
    const copy = getSkinEditorUi(locale)
    assert.deepEqual(Object.keys(copy).sort(), keys)
    assert.ok(
      Object.values(copy).every((v) =>
        Array.isArray(v) ? v.every(Boolean) : !!v,
      ),
    )
    assert.equal(copy.partNames.length, 6)
    assert.equal(copy.toolNames.length, 5)
    assert.equal(copy.scopeNames.length, 3)
    assert.match(copy.consent, /OpenAI/)
    assert.match(copy.consent, /Cloudflare Workers AI/)
  }
})
