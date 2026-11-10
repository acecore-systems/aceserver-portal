import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/discord-cta-metrics.ts'
import { recordDiscordCtaClick } from '../src/scripts/discord-cta-metrics.ts'

const origin = 'https://asv.acecore.net'
function request(value, overrides = {}) {
  return new Request(`${origin}/api/discord-cta-metrics`, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: typeof value === 'string' ? value : JSON.stringify(value),
    ...overrides,
  })
}
test('only fixed placement and locale values reach the analytics binding', async () => {
  const points = []
  const env = {
    DISCORD_CTA_METRICS: { writeDataPoint: (point) => points.push(point) },
  }
  const result = await onRequestPost({
    request: request({ placement: 'home', locale: 'en' }),
    env,
  })
  assert.equal(result.status, 204)
  assert.deepEqual(points, [
    { indexes: ['en'], blobs: ['home', 'en'], doubles: [1] },
  ])
  for (const body of [
    { placement: 'home', locale: 'en', ip: 'x' },
    { placement: 'other', locale: 'en' },
    { placement: 'story', locale: 'xx' },
    '{',
    'x'.repeat(129),
  ]) {
    assert.equal(
      (await onRequestPost({ request: request(body), env })).status,
      400,
    )
  }
  assert.equal(points.length, 1)
  assert.equal(
    (
      await onRequestPost({
        request: request(
          { placement: 'home', locale: 'en' },
          {
            headers: {
              Origin: 'https://other.example',
              'Content-Type': 'application/json',
            },
          },
        ),
        env,
      })
    ).status,
    403,
  )
})
test('null Origin is accepted only with same-origin fetch metadata', async () => {
  const env = { DISCORD_CTA_METRICS: { writeDataPoint() {} } }
  const payload = { placement: 'home', locale: 'en' }
  const send = async (origin, site) => {
    const headers = { 'Content-Type': 'application/json' }
    if (origin !== undefined) headers.Origin = origin
    if (site !== undefined) headers['Sec-Fetch-Site'] = site
    return (
      await onRequestPost({ request: request(payload, { headers }), env })
    ).status
  }
  assert.equal(await send('null', 'same-origin'), 204)
  for (const [origin, site] of [
    ['null', 'cross-site'],
    ['null', 'same-site'],
    ['null', undefined],
    [undefined, 'same-origin'],
    ['https://other.example', 'same-origin'],
  ]) {
    assert.equal(await send(origin, site), 403)
  }
})
test('missing or failing storage reports failure without collecting extra fields', async () => {
  assert.equal(
    (
      await onRequestPost({
        request: request({ placement: 'alpha', locale: 'ja' }),
        env: {},
      })
    ).status,
    503,
  )
  assert.equal(
    (
      await onRequestPost({
        request: request({ placement: 'alpha', locale: 'ja' }),
        env: {
          DISCORD_CTA_METRICS: {
            writeDataPoint() {
              throw Error('offline')
            },
          },
        },
      })
    ).status,
    503,
  )
})
test('clicks keep navigation untouched and submit only bounded values without credentials or referrer', async () => {
  const calls = []
  const prior = {
    Element: globalThis.Element,
    document: globalThis.document,
    fetch: globalThis.fetch,
  }
  class FakeElement {
    constructor(href, placement) {
      this.href = href
      this.placement = placement
    }
    closest(selector) {
      if (selector === 'a') return this
      if (selector === '[data-discord-cta]')
        return { dataset: { discordCta: this.placement } }
      return null
    }
  }
  globalThis.Element = FakeElement
  globalThis.document = { body: { dataset: { discordLocale: 'en' } } }
  globalThis.fetch = (...args) => {
    calls.push(args)
    return Promise.reject(Error('offline'))
  }
  try {
    const e = {
      type: 'click',
      button: 0,
      target: new FakeElement('https://discord.gg/KtEjYbPQ35', 'story'),
      preventDefault() {
        throw Error('navigation interrupted')
      },
    }
    recordDiscordCtaClick(e)
    recordDiscordCtaClick({
      ...e,
      target: new FakeElement('https://discord.gg/acsv', 'story'),
    })
    recordDiscordCtaClick({ ...e, type: 'auxclick', button: 2 })
    assert.equal(calls.length, 1)
    assert.equal(calls[0][0], '/api/discord-cta-metrics')
    assert.deepEqual(JSON.parse(calls[0][1].body), {
      placement: 'story',
      locale: 'en',
    })
    assert.equal(calls[0][1].credentials, 'omit')
    assert.equal(calls[0][1].referrerPolicy, 'no-referrer')
    assert.equal(calls[0][1].keepalive, true)
    globalThis.document.body.dataset.discordLocale = 'ja'
    recordDiscordCtaClick({
      ...e,
      target: new FakeElement('https://discord.gg/KtEjYbPQ35', 'home'),
    })
    recordDiscordCtaClick({
      ...e,
      type: 'auxclick',
      button: 1,
      target: new FakeElement('https://discord.gg/KtEjYbPQ35', 'alpha'),
    })
    assert.deepEqual(
      calls.slice(1).map((call) => JSON.parse(call[1].body)),
      [
        { placement: 'home', locale: 'ja' },
        { placement: 'alpha', locale: 'ja' },
      ],
    )
    globalThis.fetch = () => {
      throw Error('unavailable')
    }
    assert.doesNotThrow(() => recordDiscordCtaClick(e))
  } finally {
    Object.assign(globalThis, prior)
  }
})
