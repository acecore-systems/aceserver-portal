import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  isAllowedRequestOrigin,
  onRequestPost,
} from '../functions/api/search.ts'

const ENDPOINT = 'https://asv.acecore.net/api/search'

function createRequest(payload, headers = {}) {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: {
      Origin: 'https://asv.acecore.net',
      'Content-Type': 'application/json',
      'Sec-Fetch-Site': 'same-origin',
      ...headers,
    },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  })
}

test('uses same-origin requests only', () => {
  assert.equal(
    isAllowedRequestOrigin(
      createRequest(
        { query: 'ワールドマップ', locale: 'ja' },
        { Origin: 'https://example.invalid' },
      ),
    ),
    false,
  )
  assert.equal(
    isAllowedRequestOrigin(
      createRequest(
        { query: 'ワールドマップ', locale: 'ja' },
        { 'Sec-Fetch-Site': 'cross-site' },
      ),
    ),
    false,
  )
  assert.equal(
    isAllowedRequestOrigin(
      new Request(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'ワールドマップ', locale: 'ja' }),
      }),
    ),
    false,
  )
})

test('returns only safe local Portal results from Vectorize retrieval', async () => {
  const response = await onRequestPost(
    {
      request: createRequest({ query: '乗っ取り事件', locale: 'ja' }),
      env: createConfiguredEnv(),
    },
    async () => [
      {
        title: 'エースサーバー、乗っ取られる。',
        section: '事件の記録',
        excerpt: '公開された記録です。',
        contentType: 'story',
        url: '/stories/aceserver-hijacked/',
      },
      {
        title: '外部',
        section: '外部',
        excerpt: '表示してはいけません。',
        url: 'https://example.invalid/private/',
      },
      {
        title: '管理画面',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/admin/',
      },
      {
        title: '符号化された管理画面',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/%61dmin/',
      },
      {
        title: '符号化されたAPI',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/%61pi/search',
      },
      {
        title: '符号化されたトラバーサル',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/%252e%252e/admin/',
      },
      {
        title: '符号化されたスラッシュ',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/%252fadmin/',
      },
      {
        title: '符号化されたバックスラッシュ',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/%255cadmin/',
      },
      {
        title: '符号化された制御文字',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/%2500admin/',
      },
      {
        title: '正規化で現れるエスケープ',
        section: '管理',
        excerpt: '表示してはいけません。',
        url: '/%EF%BC%85%36%31dmin/',
      },
      ...[
        ' /services/',
        '\t/services/',
        '/safe/../services/',
        '/safe\\private/',
        '/safe/' + String.fromCharCode(0) + 'private/',
        '/safe/\tprivate/',
        '/safe%2fprivate/',
        '/safe%252fprivate/',
        '/safe/%252e%252e/services/',
        '/safe/%2509private/',
        '/safe/%EF%BC%8E%EF%BC%8E/services/',
        '/safe/%EF%BC%BCprivate/',
      ].map((url) => ({
        title: '生URLの安全境界',
        section: '管理',
        excerpt: '表示してはいけません。',
        url,
      })),
    ],
  )
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.ok, true)
  assert.equal(body.results.length, 1)
  assert.deepEqual(body.results[0], {
    title: 'エースサーバー、乗っ取られる。',
    section: '事件の記録',
    excerpt: '公開された記録です。',
    contentType: 'story',
    url: '/stories/aceserver-hijacked/',
    rank: 1,
  })
  assert.match(response.headers.get('X-Search-Request-Id'), /^[\da-f-]{36}$/u)
})

test('returns an empty successful result when Vectorize has no effective match', async () => {
  const response = await onRequestPost(
    {
      request: createRequest({ query: '見つからない語', locale: 'ja' }),
      env: createConfiguredEnv(),
    },
    async () => [],
  )

  assert.equal(response.status, 200)
  assert.deepEqual((await response.json()).results, [])
})

test('falls back at the client boundary when search is unavailable or invalid', async () => {
  const unavailable = await onRequestPost({
    request: createRequest({ query: 'ワールド', locale: 'ja' }),
    env: {},
  })
  assert.equal(unavailable.status, 503)
  assert.equal((await unavailable.json()).error.code, 'unavailable')

  const invalid = await onRequestPost({
    request: createRequest({ query: 'a', locale: 'ja' }),
    env: createConfiguredEnv(),
  })
  const tooLong = await onRequestPost({
    request: createRequest({ query: 'あ'.repeat(161), locale: 'ja' }),
    env: createConfiguredEnv(),
  })
  assert.equal(invalid.status, 400)
  assert.equal((await invalid.json()).error.code, 'invalid_request')
  assert.equal(tooLong.status, 400)
  assert.equal((await tooLong.json()).error.code, 'invalid_request')
})

test('consumes namespaced client and global D1 limits only for valid searches', async () => {
  const consumedKeys = []
  const validResponse = await onRequestPost(
    {
      request: createRequest({ query: 'ワールド', locale: 'ja' }),
      env: createConfiguredEnv({
        onRateLimit(key) {
          consumedKeys.push(key)
        },
      }),
    },
    async () => [],
  )
  const invalidResponse = await onRequestPost({
    request: createRequest({ query: 'a', locale: 'ja' }),
    env: createConfiguredEnv({
      onRateLimit(key) {
        consumedKeys.push(`invalid:${key}`)
      },
    }),
  })

  assert.equal(validResponse.status, 200)
  assert.equal(invalidResponse.status, 400)
  assert.match(consumedKeys[0], /^portal-search:client:[0-9a-f]{64}$/u)
  assert.equal(consumedKeys[1], 'portal-search:global')
  assert.equal(consumedKeys.length, 2)
})

test('fails closed without the D1 limiter and never invokes Vectorize retrieval', async () => {
  let retrieved = false
  const response = await onRequestPost(
    {
      request: createRequest({ query: 'ワールド', locale: 'ja' }),
      env: {
        AI: {},
        PORTAL_SEARCH_ENABLED: 'true',
        PORTAL_SEARCH_INDEX: {},
      },
    },
    async () => {
      retrieved = true
      return []
    },
  )

  assert.equal(response.status, 503)
  assert.equal((await response.json()).error.code, 'unavailable')
  assert.equal(retrieved, false)
})

test('does not invoke Vectorize after a D1 rate-limit rejection', async () => {
  let retrieved = false
  const response = await onRequestPost(
    {
      request: createRequest({ query: 'ワールド', locale: 'ja' }),
      env: createConfiguredEnv({ clientRateLimitSuccess: false }),
    },
    async () => {
      retrieved = true
      return []
    },
  )

  assert.equal(response.status, 429)
  assert.equal(response.headers.get('Retry-After'), '60')
  assert.equal(retrieved, false)
})

test('permits the central related-search request and keeps Pagefind files noindex', async () => {
  const headers = await readFile(
    new URL('../public/_headers', import.meta.url),
    'utf8',
  )

  assert.match(headers, /connect-src 'self' https:\/\/acecore\.net/u)
  assert.match(headers, /\/pagefind\/\*\r?\n  X-Robots-Tag: noindex/u)
})

function createConfiguredEnv({
  clientRateLimitSuccess = true,
  globalRateLimitSuccess = true,
  onRateLimit = () => undefined,
} = {}) {
  return {
    AI: {},
    PORTAL_SEARCH_ENABLED: 'true',
    PORTAL_SEARCH_INDEX: {},
    SEARCH_RATE_LIMIT_DB: createRateLimitDatabase({
      clientRateLimitSuccess,
      globalRateLimitSuccess,
      onRateLimit,
    }),
  }
}

function createRateLimitDatabase({
  clientRateLimitSuccess,
  globalRateLimitSuccess,
  onRateLimit,
}) {
  return {
    prepare(query) {
      if (query.startsWith('DELETE')) {
        return {
          bind() {
            return { run: async () => ({ success: true }) }
          },
        }
      }

      assert.match(query, /INSERT INTO semantic_search_rate_limits/u)
      return {
        bind(key) {
          return {
            async first() {
              onRateLimit(key)
              const allowed =
                key === 'portal-search:global'
                  ? globalRateLimitSuccess
                  : clientRateLimitSuccess
              return allowed ? { request_count: 1 } : null
            },
          }
        },
      }
    },
  }
}
