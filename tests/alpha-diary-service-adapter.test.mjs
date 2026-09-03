import assert from 'node:assert/strict'
import test from 'node:test'

import { onRequestPost } from '../functions/api/alpha-diary.ts'
import { onRequestGet as onRequestImageGet } from '../functions/api/alpha-diary-image/[assetId].ts'

const ENTRY_ID = `entry_${'a'.repeat(24)}`
const ASSET_ID = `asset_${'b'.repeat(24)}`

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
      finaleKeyword: '  実験台アルファ  ',
      locale: 'ja',
      version: 2,
    }),
  })

  assert.equal(response.status, 200)
  assert.equal(forwarded.action, 'finale')
  assert.equal(forwarded.entryDate, '2014-03-18')
  assert.equal(forwarded.finaleKeyword, '実験台アルファ')
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

test('a clue and the key-date challenge cannot appear on the same entry', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          return Response.json(
            readyEntryPayload({ keywordClue: '実験台アルファ' }),
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
