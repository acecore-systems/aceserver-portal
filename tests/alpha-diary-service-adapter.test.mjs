import assert from 'node:assert/strict'
import test from 'node:test'

import { onRequestPost } from '../functions/api/alpha-diary.ts'
import { onRequestGet as onRequestImageGet } from '../functions/api/alpha-diary-image/[assetId].ts'

const ENTRY_ID = `entry_${'a'.repeat(24)}`
const ASSET_ID = `asset_${'b'.repeat(24)}`

function installImageCache(t, overrides = {}) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'caches')
  const responses = new Map()
  const reads = []
  const writes = []
  const cache = {
    async match(request) {
      reads.push(request)
      const response = responses.get(request.url)
      if (!response) return undefined
      if (
        request.headers.get('If-None-Match') === response.headers.get('ETag')
      ) {
        return new Response(null, { headers: response.headers, status: 304 })
      }
      return response.clone()
    },
    async put(request, response) {
      writes.push({ request, response })
      assert.equal(request.method, 'GET')
      assert.equal(response.status, 200)
      responses.set(request.url, response.clone())
    },
    ...overrides,
  }
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: { default: cache },
  })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'caches', descriptor)
    else delete globalThis.caches
  })
  return { reads, responses, writes }
}

function imageRequestContext(fetch, options = {}) {
  const assetId = options.assetId || ASSET_ID
  return {
    env: { ALPHA_CHAT_SERVICE: { fetch } },
    params: { assetId },
    request: new Request(
      options.url || `https://asv.acecore.net/api/alpha-diary-image/${assetId}`,
      { headers: { 'Sec-Fetch-Site': 'same-origin', ...options.headers } },
    ),
    ...(options.waitUntil ? { waitUntil: options.waitUntil } : {}),
  }
}

function imageServiceResponse(headers = {}, status = 200) {
  return new Response(new Uint8Array([137, 80, 78, 71]), {
    headers: {
      'Content-Length': '4',
      'Content-Type': 'image/png',
      ETag: '"sha256-example"',
      ...headers,
    },
    status,
  })
}

function createRequest(payload, headers = {}) {
  return new Request('https://asv.acecore.net/api/alpha-diary', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://asv.acecore.net',
      'Sec-Fetch-Site': 'same-origin',
      'X-Acecore-Alpha-Diary-Client': '0198e4a1-7a31-7d2c-9b67-6aa6b983e9d2',
      ...headers,
    },
    method: 'POST',
  })
}

function readyEntryPayload(overrides = {}) {
  return {
    entry: {
      date: '2016-12-07',
      id: ENTRY_ID,
      image: {
        alt: '退色した紙面に青いボタンが描かれている。',
        assetId: ASSET_ID,
        height: 768,
        width: 1024,
      },
      kind: 'observation',
      questions: ['鈴を覚えている？', '青いボタンは何？', 'この日をどう思う？'],
      text: '観察記録の投影本文。',
      title: '音のない鈴',
    },
    finaleChallengeAvailable: true,
    ok: true,
    serverToday: '2026-08-31',
    status: 'ready',
    ...overrides,
  }
}

test('Portal diary adapter forwards only the bounded contract and a hashed client key', async () => {
  let forwarded
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(request) {
          forwarded = await request.json()
          return Response.json(readyEntryPayload())
        },
      },
    },
    request: createRequest({
      action: 'entry',
      adultConsentVersion: 1,
      entryDate: '2016-12-07',
      ignored: 'must-not-cross-the-boundary',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 200)
  assert.deepEqual(Object.keys(forwarded).sort(), [
    'action',
    'adultConsentVersion',
    'clientKey',
    'entryDate',
    'locale',
    'version',
  ])
  assert.match(forwarded.clientKey, /^[0-9a-f]{64}$/u)
  assert.equal(forwarded.entryDate, '2016-12-07')
  assert.equal(forwarded.ignored, undefined)
})

test('only an explicit entry retry crosses the Portal service boundary', async () => {
  let forwarded
  const env = {
    ALPHA_CHAT_SERVICE: {
      async fetch(request) {
        forwarded = await request.json()
        return Response.json(
          { errorCode: 'entry_generation_failed', ok: false, status: 'failed' },
          { status: 503 },
        )
      },
    },
  }
  const entry = {
    action: 'entry',
    entryDate: '2026-09-15',
    locale: 'ja',
    version: 2,
  }
  await onRequestPost({ env, request: createRequest(entry) })
  assert.equal(forwarded.retryFailed, undefined)
  await onRequestPost({
    env,
    request: createRequest({ ...entry, retryFailed: true }),
  })
  assert.equal(forwarded.retryFailed, true)
  for (const retryFailed of ['true', 1]) {
    assert.equal(
      (
        await onRequestPost({
          env,
          request: createRequest({ ...entry, retryFailed }),
        })
      ).status,
      400,
    )
  }
})

test('all nine page languages reach diary generation unchanged despite browser language preferences', async () => {
  for (const locale of [
    'ja',
    'en',
    'zh-cn',
    'es',
    'pt',
    'fr',
    'ko',
    'de',
    'ru',
  ]) {
    let forwarded
    let languageHeader
    const response = await onRequestPost({
      env: {
        ALPHA_CHAT_SERVICE: {
          async fetch(request) {
            forwarded = await request.json()
            languageHeader = request.headers.get('Accept-Language')
            return Response.json(readyEntryPayload())
          },
        },
      },
      request: createRequest(
        { action: 'entry', entryDate: '2026-09-11', locale, version: 2 },
        { 'Accept-Language': locale === 'ja' ? 'en' : 'ja' },
      ),
    })
    assert.equal(response.status, 200, locale)
    assert.equal(forwarded.locale, locale)
    assert.equal(languageHeader, locale)
  }
})

test('finale requests forward the bounded passphrase with the key date', async () => {
  let forwarded
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(request) {
          forwarded = await request.json()
          return Response.json({
            errorCode: 'keyword_incorrect',
            ok: false,
            status: 'failed',
          })
        },
      },
    },
    request: createRequest({
      action: 'finale',
      adultConsentVersion: 1,
      entryDate: '2014-03-18',
      finaleKeyword: '  実験体アルファ  ',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 200)
  assert.equal(forwarded.action, 'finale')
  assert.equal(forwarded.entryDate, '2014-03-18')
  assert.equal(forwarded.finaleKeyword, '実験体アルファ')
  assert.equal(forwarded.version, 2)
})

test('future dates are rejected before the private Worker is invoked', async () => {
  let calls = 0
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return Response.json(readyEntryPayload())
        },
      },
    },
    request: createRequest({
      entryDate: '9999-12-31',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 422)
  assert.equal((await response.json()).status, 'future')
  assert.equal(calls, 0)
})

test('unsupported diary contract versions are rejected before forwarding', async () => {
  let calls = 0
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return Response.json(readyEntryPayload())
        },
      },
    },
    request: createRequest({ locale: 'ja', version: 1 }),
  })

  assert.equal(response.status, 400)
  assert.equal((await response.json()).errorCode, 'invalid_request')
  assert.equal(calls, 0)
})

test('pre-birth observation records require versioned adult consent before forwarding', async () => {
  let calls = 0
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return Response.json(readyEntryPayload())
        },
      },
    },
    request: createRequest({
      entryDate: '2014-03-18',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 403)
  assert.equal((await response.json()).status, 'consent_required')
  assert.equal(calls, 0)
})

test('pending generation preserves a bounded Retry-After header', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          return Response.json(
            {
              entryDate: '2026-08-31',
              ok: true,
              retryAfter: 4,
              serverToday: '2026-08-31',
              status: 'pending',
            },
            { headers: { 'Retry-After': '4' }, status: 202 },
          )
        },
      },
    },
    request: createRequest({ locale: 'en', version: 2 }),
  })

  assert.equal(response.status, 202)
  assert.equal(response.headers.get('Retry-After'), '4')
})

test('ready entries fail closed when the key-date challenge flag is missing', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          const payload = readyEntryPayload()
          delete payload.finaleChallengeAvailable
          return Response.json(payload)
        },
      },
    },
    request: createRequest({
      adultConsentVersion: 1,
      entryDate: '2016-12-07',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 503)
  assert.equal((await response.json()).errorCode, 'generation_unavailable')
})

test('a bounded four-step clue passes through on a non-key date', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          return Response.json(
            readyEntryPayload({
              finaleChallengeAvailable: false,
              puzzleClue: {
                step: 2,
                text: '最初の手掛かり。次の紙は「2018 / 04 / 22」。',
                total: 4,
              },
            }),
          )
        },
      },
    },
    request: createRequest({
      adultConsentVersion: 1,
      entryDate: '2019-11-13',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 200)
  assert.equal((await response.json()).puzzleClue.step, 2)
})

test('a clue and the key-date challenge cannot appear on the same entry', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          return Response.json(
            readyEntryPayload({
              puzzleClue: {
                step: 4,
                text: '最後の手掛かり。',
                total: 4,
              },
            }),
          )
        },
      },
    },
    request: createRequest({
      adultConsentVersion: 1,
      entryDate: '2016-12-07',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 503)
  assert.equal((await response.json()).errorCode, 'generation_unavailable')
})

test('the private R2 asset proxy preserves immutable integrity headers', async () => {
  const bytes = new Uint8Array([137, 80, 78, 71])
  let forwarded
  const response = await onRequestImageGet({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(request) {
          forwarded = request.url
          return new Response(bytes, {
            headers: {
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Content-Length': String(bytes.byteLength),
              'Content-Type': 'image/png',
              ETag: '"sha256-example"',
            },
          })
        },
      },
    },
    params: { assetId: ASSET_ID },
    request: new Request(
      `https://asv.acecore.net/api/alpha-diary-image/${ASSET_ID}`,
      { headers: { 'Sec-Fetch-Site': 'same-origin' } },
    ),
  })

  assert.equal(
    forwarded,
    `https://aceserver-alpha-chat.internal/v1/diary/assets/${ASSET_ID}`,
  )
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Content-Type'), 'image/png')
  assert.match(response.headers.get('Cache-Control'), /immutable/u)
  assert.equal(
    response.headers.get('Cross-Origin-Resource-Policy'),
    'same-origin',
  )
})

test('invalid asset identifiers are rejected without invoking the private Worker', async () => {
  let calls = 0
  const response = await onRequestImageGet({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return new Response('unexpected')
        },
      },
    },
    params: { assetId: '../secret' },
    request: new Request(
      'https://asv.acecore.net/api/alpha-diary-image/secret',
    ),
  })

  assert.equal(response.status, 404)
  assert.equal(calls, 0)
})

test('image cache reuses validated bytes across query strings and clients', async (t) => {
  const { reads, writes } = installImageCache(t)
  let calls = 0
  const service = async () => {
    calls += 1
    return imageServiceResponse()
  }
  const first = await onRequestImageGet(
    imageRequestContext(service, {
      url: `https://asv.acecore.net/api/alpha-diary-image/${ASSET_ID}?first=1`,
      headers: { Cookie: 'client=first' },
    }),
  )
  assert.equal(first.headers.get('X-Alpha-Diary-Image-Cache'), 'MISS')
  assert.equal((await first.arrayBuffer()).byteLength, 4)
  const second = await onRequestImageGet(
    imageRequestContext(service, {
      url: `https://asv.acecore.net/api/alpha-diary-image/${ASSET_ID}?second=2`,
      headers: { Cookie: 'client=second', Authorization: 'test-only' },
    }),
  )
  assert.equal(second.status, 200)
  assert.equal(second.headers.get('X-Alpha-Diary-Image-Cache'), 'HIT')
  assert.equal(second.headers.get('ETag'), '"sha256-example"')
  assert.match(second.headers.get('Cache-Control'), /immutable/u)
  assert.equal(
    second.headers.get('Cross-Origin-Resource-Policy'),
    'same-origin',
  )
  assert.equal(second.headers.get('X-Content-Type-Options'), 'nosniff')
  assert.equal((await second.arrayBuffer()).byteLength, 4)
  assert.equal(calls, 1)
  assert.equal(writes.length, 1)
  for (const request of [...reads, writes[0].request]) {
    assert.equal(new URL(request.url).search, '')
    assert.equal(request.headers.has('Cookie'), false)
    assert.equal(request.headers.has('Authorization'), false)
  }
})

test('a cached image handles ETag revalidation without calling the Worker', async (t) => {
  const { writes } = installImageCache(t)
  let calls = 0
  const service = async () => {
    calls += 1
    return imageServiceResponse()
  }
  await onRequestImageGet(imageRequestContext(service))
  const response = await onRequestImageGet(
    imageRequestContext(service, {
      headers: { 'If-None-Match': '"sha256-example"' },
    }),
  )
  assert.equal(response.status, 304)
  assert.equal(response.body, null)
  assert.equal(response.headers.get('X-Alpha-Diary-Image-Cache'), 'HIT')
  assert.equal(response.headers.get('ETag'), '"sha256-example"')
  assert.equal(calls, 1)
  assert.equal(writes.length, 1)
})

test('image cache stays isolated by asset and hostname', async (t) => {
  installImageCache(t)
  let calls = 0
  const service = async () => {
    calls += 1
    return imageServiceResponse()
  }
  await onRequestImageGet(imageRequestContext(service))
  const otherAsset = await onRequestImageGet(
    imageRequestContext(service, { assetId: `asset_${'c'.repeat(24)}` }),
  )
  const otherHost = await onRequestImageGet(
    imageRequestContext(service, {
      url: `https://preview.pages.dev/api/alpha-diary-image/${ASSET_ID}`,
    }),
  )
  assert.equal(otherAsset.headers.get('X-Alpha-Diary-Image-Cache'), 'MISS')
  assert.equal(otherHost.headers.get('X-Alpha-Diary-Image-Cache'), 'MISS')
  assert.equal(calls, 3)
})

test('a warm image cache never bypasses cross-site, identifier, or binding checks', async (t) => {
  const { reads } = installImageCache(t)
  let calls = 0
  const service = async () => {
    calls += 1
    return imageServiceResponse()
  }
  await onRequestImageGet(imageRequestContext(service))
  const crossSite = await onRequestImageGet(
    imageRequestContext(service, {
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    }),
  )
  const invalid = imageRequestContext(service)
  invalid.params.assetId = '../secret'
  const invalidId = await onRequestImageGet(invalid)
  const unconfigured = imageRequestContext(service)
  unconfigured.env = {}
  const missingBinding = await onRequestImageGet(unconfigured)
  assert.equal(crossSite.status, 404)
  assert.equal(invalidId.status, 404)
  assert.equal(missingBinding.status, 404)
  assert.equal(reads.length, 1)
  assert.equal(calls, 1)
})

test('validated image caching is registered with waitUntil', async (t) => {
  const { writes } = installImageCache(t)
  const background = []
  const response = await onRequestImageGet(
    imageRequestContext(async () => imageServiceResponse(), {
      waitUntil: (promise) => background.push(promise),
    }),
  )
  assert.equal(response.status, 200)
  assert.equal(background.length, 1)
  await Promise.all(background)
  assert.equal(writes.length, 1)
})

test('cache read and write failures do not interrupt image delivery', async (t) => {
  const operations = []
  t.mock.method(console, 'warn', (value) => {
    operations.push(JSON.parse(value).operation)
  })
  installImageCache(t, {
    async match() {
      throw new Error('read unavailable')
    },
    async put() {
      throw new Error('write unavailable')
    },
  })
  const response = await onRequestImageGet(
    imageRequestContext(async () => imageServiceResponse()),
  )
  assert.equal(response.status, 200)
  assert.equal((await response.arrayBuffer()).byteLength, 4)
  assert.deepEqual(operations, ['read', 'write'])
})

test('errors, partial images, and invalid image metadata are never cached', async (t) => {
  const { writes } = installImageCache(t)
  t.mock.method(console, 'error', () => {})
  const responses = [
    imageServiceResponse({}, 404),
    imageServiceResponse({}, 429),
    imageServiceResponse({}, 503),
    imageServiceResponse({}, 206),
    imageServiceResponse({ 'Content-Type': 'text/html' }),
    imageServiceResponse({ 'Content-Length': '0' }),
    imageServiceResponse({ 'Content-Length': String(8 * 1024 * 1024 + 1) }),
    new Response('image without length', {
      headers: { 'Content-Type': 'image/png' },
    }),
  ]
  for (const serviceResponse of responses) {
    const response = await onRequestImageGet(
      imageRequestContext(async () => serviceResponse),
    )
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
  }
  assert.equal(writes.length, 0)
})

test('an upstream 304 is forwarded without storing an empty image', async (t) => {
  const { writes } = installImageCache(t)
  let forwarded
  const response = await onRequestImageGet(
    imageRequestContext(
      async (request) => {
        forwarded = request
        return new Response(null, {
          headers: { ETag: '"sha256-example"', 'Content-Type': 'image/png' },
          status: 304,
        })
      },
      { headers: { 'If-None-Match': '"sha256-example"' } },
    ),
  )
  assert.equal(response.status, 304)
  assert.equal(response.headers.get('ETag'), '"sha256-example"')
  assert.equal(forwarded.headers.get('If-None-Match'), '"sha256-example"')
  assert.equal(writes.length, 0)
})
