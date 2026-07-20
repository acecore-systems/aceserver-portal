import assert from 'node:assert/strict'
import test from 'node:test'

import worker from './worker.js'

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
