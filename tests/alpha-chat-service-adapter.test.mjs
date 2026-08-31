import assert from 'node:assert/strict'
import test from 'node:test'

import { onRequestPost } from '../functions/api/alpha-chat.ts'

function createRequest(payload, headers = {}) {
  return new Request('https://asv.acecore.net/api/alpha-chat', {
    body: JSON.stringify(payload),
    headers: {
      'CF-Connecting-IP': '203.0.113.10',
      'Content-Type': 'application/json',
      Origin: 'https://asv.acecore.net',
      'Sec-Fetch-Site': 'same-origin',
      ...headers,
    },
    method: 'POST',
  })
}

function createRateLimitDatabase({
  clientAllowed = true,
  globalAllowed = true,
} = {}) {
  return {
    prepare(query) {
      return {
        bind(...bindings) {
          return {
            async first() {
              assert.match(query, /INSERT INTO semantic_search_rate_limits/u)
              const limiterKey = String(bindings[0] || '')
              const allowed = limiterKey.endsWith(':global')
                ? globalAllowed
                : clientAllowed
              return allowed ? { request_count: 1 } : null
            },
            async run() {
              return { success: true }
            },
          }
        },
      }
    },
  }
}

test('the Portal adapter forwards the envelope to the private service', async () => {
  let forwarded
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(request) {
          forwarded = {
            body: await request.json(),
            locale: request.headers.get('Accept-Language'),
            url: request.url,
          }
          return Response.json({
            answer: 'ぼくの小さな記憶だよ。',
            loreRevisionId: 'revision-1',
            ok: true,
          })
        },
      },
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest({
      locale: 'ja',
      messages: [
        {
          content: '前の記憶',
          loreRevisionId: 'previous-revision',
          role: 'assistant',
        },
      ],
      question: 'そのあとどうなった？',
    }),
  })

  assert.equal(response.status, 200)
  assert.equal(forwarded.url, 'https://aceserver-alpha-chat.internal/v1/chat')
  assert.equal(forwarded.locale, 'ja')
  assert.deepEqual(forwarded.body, {
    payload: {
      locale: 'ja',
      messages: [
        {
          content: '前の記憶',
          loreRevisionId: 'previous-revision',
          role: 'assistant',
        },
      ],
      question: 'そのあとどうなった？',
    },
    surface: 'portal',
    version: 1,
  })
  assert.deepEqual(await response.json(), {
    answer: 'ぼくの小さな記憶だよ。',
    loreRevisionId: 'revision-1',
    ok: true,
  })
})

test('the Portal adapter forwards SSE without buffering the private service body', async () => {
  const source = [
    'event: delta\ndata: {"text":"やあ、"}\n\n',
    'event: complete\ndata: {"ok":true,"answer":"やあ、案内するよ。","sources":[]}\n\n',
  ].join('')
  let forwardedAccept
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(request) {
          forwardedAccept = request.headers.get('Accept')
          return new Response(source, {
            headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
          })
        },
      },
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest(
      { locale: 'ja', question: 'こんにちは' },
      { Accept: 'text/event-stream' },
    ),
  })

  assert.equal(forwardedAccept, 'text/event-stream')
  assert.equal(response.status, 200)
  assert.equal(
    response.headers.get('Content-Type'),
    'text/event-stream; charset=utf-8',
  )
  assert.match(response.headers.get('Cache-Control'), /no-transform/u)
  assert.equal(await response.text(), source)
})

test('the Portal adapter preserves opaque conversation context without selecting transcript messages', async () => {
  const conversationContext = {
    items: [
      {
        encrypted_content: 'opaque-state',
        id: 'cmp_1',
        type: 'compaction',
      },
    ],
    scope: {
      locale: 'ja',
      personaVersion: '2026-08-14.1',
      surface: 'portal',
    },
  }
  let forwarded
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(request) {
          forwarded = await request.json()
          return Response.json({
            answer: '続きの案内だよ。',
            conversationContextReset: false,
            nextConversationContext: conversationContext,
            ok: true,
            sources: [],
          })
        },
      },
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest({
      conversationContext,
      loreRevisionId: 'revision-1',
      question: '続きは？',
    }),
  })

  assert.equal(response.status, 200)
  assert.deepEqual(forwarded, {
    payload: {
      conversationContext,
      loreRevisionId: 'revision-1',
      question: '続きは？',
    },
    surface: 'portal',
    version: 1,
  })
  assert.deepEqual(await response.json(), {
    answer: '続きの案内だよ。',
    conversationContextReset: false,
    nextConversationContext: conversationContext,
    ok: true,
    sources: [],
  })
})

test('the Portal adapter fails closed when the shared service errors', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          throw new Error('ServiceUnavailable')
        },
      },
      OPENAI_API_KEY: 'must-not-be-used',
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest({ question: 'こんにちは' }),
  })

  assert.equal(response.status, 503)
  assert.equal((await response.json()).ok, false)
})

test('the Portal adapter keeps same-origin validation at its entry point', async () => {
  let calls = 0
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return Response.json({ ok: true, answer: 'unexpected' })
        },
      },
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest(
      { question: 'こんにちは' },
      { Origin: 'https://example.invalid', 'Sec-Fetch-Site': 'cross-site' },
    ),
  })

  assert.equal(response.status, 403)
  assert.equal(calls, 0)
})

test('the Portal adapter rate limits before invoking the private service', async () => {
  let calls = 0
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return Response.json({ ok: true, answer: 'unexpected' })
        },
      },
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase({
        clientAllowed: false,
      }),
    },
    request: createRequest({ question: 'こんにちは' }),
  })

  assert.equal(response.status, 429)
  assert.equal(response.headers.get('Retry-After'), '60')
  assert.equal(calls, 0)
})

test('the Portal adapter localizes a missing binding without attempting local generation', async () => {
  const response = await onRequestPost({
    env: {
      OPENAI_API_KEY: 'must-not-be-used',
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest({ locale: 'fr', question: 'Bonjour' }),
  })

  assert.equal(response.status, 503)
  assert.match((await response.json()).answer, /Je n’arrive pas/u)
})

test('the Portal adapter rejects a malformed shared response', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          return Response.json({ ok: true, answer: 42 })
        },
      },
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest({ locale: 'en', question: 'Hello' }),
  })

  assert.equal(response.status, 503)
  assert.match((await response.json()).answer, /I couldn't deliver/u)
})

test('the Portal adapter rejects an oversized shared response', async () => {
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          return new Response('{}', {
            headers: {
              'Content-Length': String(96 * 1024 + 1),
              'Content-Type': 'application/json',
            },
          })
        },
      },
      SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
    },
    request: createRequest({ locale: 'en', question: 'Hello' }),
  })

  assert.equal(response.status, 503)
  assert.match((await response.json()).answer, /I couldn't deliver/u)
})
