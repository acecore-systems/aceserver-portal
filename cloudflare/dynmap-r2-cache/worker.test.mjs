import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'

import worker from './worker.ts'
import { INITIAL_VIEW_PATH, INITIAL_VIEW_SCRIPT } from './initial-view.ts'

test('edge cache reduces tile reads without caching live data or losing revisions', async (t) => {
  const entries = new Map()
  const writes = []
  let reads = 0
  const cache = {
    async match(request) {
      return entries.get(request.url)?.clone()
    },
    async put(request, response) {
      entries.set(request.url, response.clone())
    },
  }
  const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches')
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: { default: cache },
  })
  t.after(() => {
    if (originalCaches)
      Object.defineProperty(globalThis, 'caches', originalCaches)
    else delete globalThis.caches
  })
  const context = {
    waitUntil(promise) {
      writes.push(promise)
    },
  }
  const bindings = {
    SIGEN_BUCKET: {
      async get(key) {
        reads++
        return key.includes('missing')
          ? null
          : { body: 'tile', httpEtag: '"v1"' }
      },
    },
  }
  const base = 'https://mc-map-sigen.acecore.net/'
  const url = base + 'tiles/world/t_512/0_0/0_0.png?123'
  const first = await worker.fetch(new Request(url), bindings, context)
  await Promise.all(writes)
  assert.equal(first.headers.get('x-dynmap-edge-cache'), 'MISS')
  assert.equal(
    entries.get(url).headers.get('cache-control'),
    'public, max-age=300',
  )
  const second = await worker.fetch(new Request(url), bindings, context)
  assert.equal(second.headers.get('x-dynmap-edge-cache'), 'HIT')
  assert.equal(await second.text(), 'tile')
  assert.equal(reads, 1)
  await worker.fetch(
    new Request(url.replace('?123', '?124')),
    bindings,
    context,
  )
  assert.equal(reads, 2)
  for (const path of [
    'standalone/dynmap_world.json',
    'tiles/_markers_/marker_world.json',
    'tiles/_markers/icon.png',
  ]) {
    const before = reads
    await worker.fetch(new Request(base + path), bindings, context)
    await worker.fetch(new Request(base + path), bindings, context)
    assert.equal(reads, before + 2)
  }
  const before = reads
  await worker.fetch(
    new Request(url, { headers: { 'If-None-Match': '"v1"' } }),
    bindings,
    context,
  )
  assert.equal(reads, before + 1)
  const missing = base + 'tiles/world/missing.png'
  assert.equal(
    (await worker.fetch(new Request(missing), bindings, context)).status,
    404,
  )
  assert.equal(entries.has(missing), false)
  cache.match = async () => {
    throw new Error('cache unavailable')
  }
  assert.equal(
    (await worker.fetch(new Request(url), bindings, context)).status,
    200,
  )
  await Promise.all(writes)
})

const env = {
  SIGEN_BUCKET: {
    async get() {
      return null
    },
    async head() {
      return null
    },
  },
}

test('map responses prevent indexing while allowing link discovery', async () => {
  const response = await worker.fetch(
    new Request('https://mc-map-sigen.acecore.net/'),
    env,
  )

  assert.equal(response.status, 302)
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow')
})

test('robots.txt allows crawlers to render map assets', async () => {
  const response = await worker.fetch(
    new Request('https://mc-map-sigen.acecore.net/robots.txt'),
    env,
  )

  assert.equal(response.status, 200)
  assert.equal(
    response.headers.get('content-type'),
    'text/plain; charset=utf-8',
  )
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow')
  assert.equal(await response.text(), 'User-agent: *\nAllow: /\n')
})

test('missing map assets also carry the indexing directive', async () => {
  const response = await worker.fetch(
    new Request('https://mc-map-sigen.acecore.net/missing.js?worldname=world'),
    env,
  )

  assert.equal(response.status, 404)
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow')
})

test('initial-view script is served without accessing a map bucket', async () => {
  const response = await worker.fetch(
    new Request(`https://mc-map-sigen.acecore.net${INITIAL_VIEW_PATH}`),
    env,
  )
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /javascript/u)
  assert.equal(await response.text(), INITIAL_VIEW_SCRIPT)
})

test('only non-main index HTML is rewritten, including conditional requests', async () => {
  const html = '<html><head></head><body>map</body></html>'
  const bucket = {
    async get() {
      return { body: html, httpEtag: '"original"' }
    },
    async head() {
      return { httpEtag: '"original"' }
    },
  }
  const mapEnv = { MAIN_BUCKET: bucket, LOBBY_BUCKET: { ...bucket } }
  globalThis.HTMLRewriter = class {
    on(selector, handler) {
      assert.equal(selector, 'head')
      handler.element({ append: (value) => (this.script = value) })
      return this
    }
    async transform(response) {
      return new Response(
        (await response.text()).replace('</head>', this.script + '</head>'),
        response,
      )
    }
  }
  try {
    const main = await worker.fetch(
      new Request('https://mc-map-main.acecore.net/'),
      mapEnv,
    )
    assert.equal(await main.text(), html)
    for (const method of ['GET', 'HEAD']) {
      const lobby = await worker.fetch(
        new Request('https://mc-map-lobby.acecore.net/', {
          method,
          headers: { 'if-none-match': '"original"' },
        }),
        mapEnv,
      )
      assert.equal(lobby.status, 200)
      assert.equal(lobby.headers.get('etag'), null)
      const body = await lobby.text()
      if (method === 'GET') assert.ok(body.includes(INITIAL_VIEW_PATH))
      else assert.equal(body, '')
    }
  } finally {
    delete globalThis.HTMLRewriter
  }
})

function initialViewHarness(options = {}) {
  let now = 0
  let zoom = 0
  let center = { lat: 0, lng: 0 }
  let pending = options.pending ?? false
  const timers = new Map()
  const listeners = new Map()
  const zooms = []
  const bounds = {
    left: 0,
    top: 0,
    right: 1280,
    bottom: 720,
    width: 1280,
    height: 720,
  }
  const tile = {
    get complete() {
      return !pending
    },
    naturalWidth: 512,
    src: options.src ?? 'https://mc-map-lobby.acecore.net/tiles/world/map.jpg',
    getBoundingClientRect: () => options.tileBounds ?? bounds,
  }
  const map = {
    getZoom: () => zoom,
    getMaxZoom: () => options.maxZoom ?? 8,
    getCenter: () => center,
    getContainer: () => ({
      getBoundingClientRect: () => bounds,
      querySelectorAll: () => (options.noTiles ? [] : [tile]),
    }),
    setZoom(value) {
      zoom = value
      // Leaflet may round a center when changing the pixel origin.
      center = { lat: center.lat + 0.001, lng: center.lng }
      zooms.push(value)
    },
  }
  const dynmap = { map, maptype: {}, followingPlayer: '' }
  const context = {
    location: new URL(
      'https://mc-map-lobby.acecore.net/' + (options.search ?? ''),
    ),
    window: { dynmap },
    URL,
    URLSearchParams,
    Date: { now: () => now },
    setTimeout(fn) {
      const id = Symbol()
      timers.set(id, fn)
      return id
    },
    clearTimeout(id) {
      timers.delete(id)
    },
    document: {
      addEventListener(type, fn) {
        listeners.set(type, fn)
      },
      removeEventListener(type) {
        listeners.delete(type)
      },
      createElement() {
        return {
          getContext: () => ({
            fillRect() {},
            drawImage() {},
            getImageData() {
              if (options.tainted) throw Error('SecurityError')
              const data = new Uint8ClampedArray(96 * 72 * 4)
              const occupied = Math.floor(
                (options.occupancy?.(zoom) ?? 0.01) * 96 * 72,
              )
              for (let i = 0; i < occupied * 4; i += 4)
                data.set([70, 90, 50, 255], i)
              return { data }
            },
          }),
        }
      },
    },
  }
  vm.runInNewContext(INITIAL_VIEW_SCRIPT, context)
  return {
    zooms,
    step(count = 1) {
      for (let i = 0; i < count; i++) {
        now += 200
        const callbacks = [...timers.values()]
        timers.clear()
        callbacks.forEach((fn) => fn())
      }
    },
    input(type) {
      listeners.get(type)?.()
    },
    ready() {
      pending = false
    },
    pan() {
      center = { lat: 1, lng: 1 }
    },
    changeLayer() {
      dynmap.maptype = {}
    },
    timers,
  }
}

test('sparse maps zoom at most four steps and tolerate own center rounding', () => {
  const h = initialViewHarness()
  h.step(80)
  assert.deepEqual(h.zooms, [1, 2, 3, 4])
  assert.equal(h.timers.size, 0)
})

test('the first useful terrain size and the map max zoom stop adjustment', () => {
  const filled = initialViewHarness({
    occupancy: (z) => (z === 2 ? 0.4 : 0.01),
  })
  filled.step(80)
  assert.deepEqual(filled.zooms, [1, 2])
  const limited = initialViewHarness({ maxZoom: 1 })
  limited.step(80)
  assert.deepEqual(limited.zooms, [1])
})

test('explicit locations and tracking links always preserve their requested view', () => {
  for (const search of [
    '?zoom=0',
    '?x=0',
    '?y=64',
    '?z=-1',
    '?playername=test',
    '#location',
  ]) {
    const h = initialViewHarness({ search })
    h.step(80)
    assert.deepEqual(h.zooms, [])
  }
})

test('manual input, external panning and map switches cancel pending adjustment', () => {
  for (const type of [
    'pointerdown',
    'wheel',
    'touchstart',
    'keydown',
    'pan',
    'layer',
  ]) {
    const h = initialViewHarness()
    if (type === 'pan') h.pan()
    else if (type === 'layer') h.changeLayer()
    else h.input(type)
    h.step(80)
    assert.deepEqual(h.zooms, [])
  }
})

test('pending tiles wait, and permanent failures, absent terrain or tainted canvas never zoom', () => {
  const waiting = initialViewHarness({ pending: true })
  waiting.step(4)
  assert.deepEqual(waiting.zooms, [])
  waiting.ready()
  waiting.step(30)
  assert.deepEqual(waiting.zooms, [1, 2, 3, 4])
  for (const options of [
    { pending: true },
    { noTiles: true },
    { occupancy: () => 0 },
    { src: 'https://mc-map-lobby.acecore.net/images/blank.png' },
    { src: 'https://example.net/tiles/world/map.jpg' },
    { tainted: true },
  ]) {
    const h = initialViewHarness(options)
    h.step(80)
    assert.deepEqual(h.zooms, [])
    assert.equal(h.timers.size, 0)
  }
})

test('a missing peripheral quadrant is allowed only with a healthy center and enough coverage', () => {
  const healthy = initialViewHarness({
    tileBounds: {
      left: 480,
      right: 1280,
      top: 0,
      bottom: 720,
      width: 800,
      height: 720,
    },
  })
  healthy.step(80)
  assert.deepEqual(healthy.zooms, [1, 2, 3, 4])
  for (const left of [550, 650]) {
    const missing = initialViewHarness({
      tileBounds: {
        left,
        right: 1280,
        top: 0,
        bottom: 720,
        width: 1280 - left,
        height: 720,
      },
    })
    missing.step(80)
    assert.deepEqual(missing.zooms, [])
  }
})
