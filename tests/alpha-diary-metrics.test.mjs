import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequestPost } from '../functions/api/alpha-diary-metrics.ts'
import { reportDiaryLoadMeasurement } from '../src/scripts/alpha-diary-wait.ts'
const metric = {
  version: 1,
  eventId: '00000000-0000-4000-8000-000000000001',
  release: 'diary-wait-v2',
  outcome: 'ready',
  elapsedMs: 42000,
  hiddenMs: 0,
  requestCount: 11,
  pendingCount: 10,
  manualCheckCount: 0,
}

test('completed browser measurement reaches the private storage contract without private fields', async () => {
  let delivery
  let stored
  reportDiaryLoadMeasurement(
    {
      elapsedMs: 142874,
      hiddenMs: 0,
      requestCount: 36,
      pendingCount: 35,
      manualCheckCount: 0,
      outcome: 'ready',
      startedAtWallClockMs: 123,
    },
    {
      eventId: () => metric.eventId,
      fetch: (_url, init) => {
        delivery = onRequestPost({
          request: request(JSON.parse(init.body)),
          env: {
            ALPHA_CHAT_SERVICE: {
              async fetch(r) {
                stored = await r.json()
                return new Response(null, { status: 204 })
              },
            },
          },
        })
        return delivery
      },
    },
  )
  assert.equal((await delivery).status, 204)
  assert.equal(stored.elapsedMs, 142874)
  assert.equal(stored.startedAtWallClockMs, undefined)
  assert.deepEqual(Object.keys(stored).sort(), Object.keys(metric).sort())
})
function request(value = metric, origin = 'https://asv.acecore.net') {
  return new Request('https://asv.acecore.net/api/alpha-diary-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(value),
  })
}
test('metrics proxy forwards only the bounded metric contract through the private binding', async () => {
  let forwarded
  const response = await onRequestPost({
    request: request(),
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(r) {
          forwarded = r
          return new Response(null, { status: 204 })
        },
      },
    },
  })
  assert.equal(response.status, 204)
  assert.equal(new URL(forwarded.url).pathname, '/v1/diary/metrics')
  assert.deepEqual(await forwarded.json(), metric)
})
test('metrics proxy refuses foreign origins, private fields, and oversized bodies', async () => {
  for (const [r, status] of [
    [request(metric, 'https://evil.example'), 403],
    [request({ ...metric, entryDate: '2016-12-07' }), 400],
    [request({ ...metric, padding: 'x'.repeat(3000) }), 400],
  ])
    assert.equal((await onRequestPost({ request: r, env: {} })).status, status)
})
test('missing or failing metrics storage never reports successful persistence', async () => {
  assert.equal(
    (await onRequestPost({ request: request(), env: {} })).status,
    503,
  )
  assert.equal(
    (
      await onRequestPost({
        request: request(),
        env: {
          ALPHA_CHAT_SERVICE: {
            async fetch() {
              return new Response(null, { status: 503 })
            },
          },
        },
      })
    ).status,
    503,
  )
})
