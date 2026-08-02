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

test('shared mode forwards the normalized Portal envelope to the private service', async () => {
  let forwarded
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch(request) {
          forwarded = {
            body: await request.json(),
            url: request.url,
          }
          return Response.json({
            answer: 'ぼくの小さな記憶だよ。',
            loreRevisionId: 'revision-1',
            ok: true,
          })
        },
      },
      ALPHA_CHAT_SHARED_ENABLED: 'true',
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

test('shared mode fails closed instead of using the local LLM when the service errors', async () => {
  const response = await onRequestPost(
    {
      env: {
        ALPHA_CHAT_SERVICE: {
          async fetch() {
            throw new Error('ServiceUnavailable')
          },
        },
        ALPHA_CHAT_SHARED_ENABLED: 'true',
        OPENAI_API_KEY: 'must-not-be-used',
        SEARCH_RATE_LIMIT_DB: createRateLimitDatabase(),
      },
      request: createRequest({ question: 'こんにちは' }),
    },
    async () => {
      throw new Error('The local model must not run in shared mode')
    },
  )

  assert.equal(response.status, 503)
  assert.equal((await response.json()).ok, false)
})

test('shared mode keeps same-origin validation at the Portal entry point', async () => {
  let calls = 0
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return Response.json({ ok: true, answer: 'unexpected' })
        },
      },
      ALPHA_CHAT_SHARED_ENABLED: 'true',
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

test('shared mode rate limits before invoking the private service', async () => {
  let calls = 0
  const response = await onRequestPost({
    env: {
      ALPHA_CHAT_SERVICE: {
        async fetch() {
          calls += 1
          return Response.json({ ok: true, answer: 'unexpected' })
        },
      },
      ALPHA_CHAT_SHARED_ENABLED: 'true',
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
