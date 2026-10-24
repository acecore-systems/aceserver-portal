import assert from 'node:assert/strict'
import test from 'node:test'

import worker from './worker.ts'

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
