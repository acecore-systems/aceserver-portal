import { searchAceserverPortal } from './alpha-portal-search.js'

const MAX_REQUEST_BODY_BYTES = 2_048
const MIN_QUERY_LENGTH = 2
const MAX_QUERY_LENGTH = 160
const MAX_PATH_DECODE_PASSES = 4
const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_RETENTION_SECONDS = 600
const CLIENT_RATE_LIMIT = 20
const GLOBAL_RATE_LIMIT = 300
const MAX_URL_LENGTH = 500
const CANONICAL_PATH_ORIGIN = 'https://url-validation.invalid'
const CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
const SEARCH_LOCALES = new Set([
  'ja',
  'en',
  'zh-cn',
  'es',
  'pt',
  'fr',
  'ko',
  'de',
  'ru',
])

export async function onRequestPost(
  { request, env, waitUntil },
  searchPortal = searchAceserverPortal,
) {
  const startedAt = performance.now()
  const requestId = crypto.randomUUID()

  if (!isAllowedRequestOrigin(request)) {
    return errorResponse('forbidden', 403, requestId, startedAt)
  }

  const payloadResult = await readJsonPayload(request)
  if (!payloadResult.ok) {
    return errorResponse(
      payloadResult.tooLarge ? 'payload_too_large' : 'invalid_request',
      payloadResult.tooLarge ? 413 : 400,
      requestId,
      startedAt,
    )
  }

  const query = normalizeQuery(payloadResult.value?.query)
  const locale = normalizeLocale(payloadResult.value?.locale)
  if (!query || !locale) {
    return errorResponse('invalid_request', 400, requestId, startedAt)
  }

  if (!isSearchAvailable(env)) {
    return errorResponse('unavailable', 503, requestId, startedAt)
  }

  let clientKey
  let clientAllowed = false
  let globalAllowed = false
  try {
    clientKey = await createClientRateLimitKey(request)
    clientAllowed = await consumeRateLimit(
      env.SEARCH_RATE_LIMIT_DB,
      `portal-search:client:${clientKey}`,
      CLIENT_RATE_LIMIT,
    )
    if (clientAllowed) {
      globalAllowed = await consumeRateLimit(
        env.SEARCH_RATE_LIMIT_DB,
        'portal-search:global',
        GLOBAL_RATE_LIMIT,
      )
    }
  } catch (error) {
    logSearchError(
      requestId,
      'rate_limit',
      getErrorCode(error, 'storage_error'),
    )
    return errorResponse('unavailable', 503, requestId, startedAt)
  }

  if (!clientAllowed || !globalAllowed) {
    return errorResponse('rate_limited', 429, requestId, startedAt, {
      'Retry-After': '60',
    })
  }

  if (requestId.endsWith('00') && typeof waitUntil === 'function') {
    waitUntil(
      deleteExpiredRateLimits(env.SEARCH_RATE_LIMIT_DB).catch((error) => {
        logSearchError(
          requestId,
          'rate_limit_cleanup',
          getErrorCode(error, 'storage_error'),
        )
      }),
    )
  }

  let entries
  try {
    entries = await searchPortal(
      query,
      env,
      new URL('/vector-corpus.json', request.url).href,
      undefined,
      null,
      locale,
    )
  } catch (error) {
    logSearchError(requestId, 'retrieve', getErrorCode(error, 'provider_error'))
    return errorResponse('provider_error', 502, requestId, startedAt)
  }

  const results = normalizeResults(entries)
  return jsonResponse(
    { ok: true, requestId, results },
    200,
    requestId,
    startedAt,
  )
}

export function isAllowedRequestOrigin(request) {
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') return false

  const origin = request.headers.get('Origin')
  if (!origin) return false

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

function isSearchAvailable(env) {
  return Boolean(
    env?.PORTAL_SEARCH_ENABLED === 'true' &&
    env.OPENAI_API_KEY?.trim() &&
    env.PORTAL_SEARCH_INDEX &&
    env.SEARCH_RATE_LIMIT_DB,
  )
}

async function createClientRateLimitKey(request) {
  const connectingIp = String(
    request.headers.get('CF-Connecting-IP') || '',
  ).trim()
  const source =
    connectingIp && connectingIp.length <= 64
      ? `ip:${connectingIp}`
      : `session:${normalizeClientId(
          request.headers.get('X-Acecore-Search-Client'),
        )}`
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(source),
  )
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('')
}

function normalizeClientId(value) {
  const clientId = String(value || '').trim()
  return CLIENT_ID_PATTERN.test(clientId) ? clientId : 'anonymous'
}

async function consumeRateLimit(database, limiterKey, limit) {
  const now = Math.floor(Date.now() / 1_000)
  const windowStart =
    Math.floor(now / RATE_LIMIT_WINDOW_SECONDS) * RATE_LIMIT_WINDOW_SECONDS
  const result = await database
    .prepare(
      `INSERT INTO semantic_search_rate_limits
        (limiter_key, window_start, request_count, expires_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT (limiter_key, window_start) DO UPDATE SET
         request_count = semantic_search_rate_limits.request_count + 1,
         expires_at = excluded.expires_at
       WHERE semantic_search_rate_limits.request_count < ?
       RETURNING request_count`,
    )
    .bind(limiterKey, windowStart, now + RATE_LIMIT_RETENTION_SECONDS, limit)
    .first()

  return Boolean(
    result &&
    Number.isInteger(result.request_count) &&
    result.request_count <= limit,
  )
}

async function deleteExpiredRateLimits(database) {
  const now = Math.floor(Date.now() / 1_000)
  await database
    .prepare('DELETE FROM semantic_search_rate_limits WHERE expires_at < ?')
    .bind(now)
    .run()
}

function normalizeResults(entries) {
  if (!Array.isArray(entries)) return []

  const results = []
  const seenUrls = new Set()

  for (const entry of entries) {
    const title = readString(entry?.title, 240)
    const section = readString(entry?.section, 240) || title
    const excerpt = readString(entry?.excerpt, 500)
    const contentType = readString(entry?.contentType, 40) || 'page'
    const pathname = getSafePublicPathname(entry?.url)
    if (!title || !excerpt || !pathname || seenUrls.has(pathname)) continue

    seenUrls.add(pathname)
    results.push({
      title,
      section,
      excerpt,
      contentType,
      url: pathname,
      rank: results.length + 1,
    })
    if (results.length >= 5) break
  }

  return results
}

function getSafePublicPathname(value) {
  const rawPathname = getRawUrl(value)
  if (
    !rawPathname ||
    !rawPathname.startsWith('/') ||
    rawPathname.startsWith('//')
  ) {
    return null
  }

  let pathname = rawPathname
  for (let pass = 0; pass < MAX_PATH_DECODE_PASSES; pass += 1) {
    pathname = pathname.normalize('NFKC')
    if (hasUnsafePathSyntax(pathname)) return null
    if (!pathname.includes('%')) break
    if (/%(?:2f|5c)/iu.test(pathname)) return null

    try {
      pathname = decodeURIComponent(pathname)
    } catch {
      return null
    }
  }

  pathname = pathname.normalize('NFKC')
  if (hasUnsafePathSyntax(pathname) || pathname.includes('%')) {
    return null
  }

  try {
    const url = new URL(pathname, CANONICAL_PATH_ORIGIN)
    return url.origin === CANONICAL_PATH_ORIGIN && !url.search && !url.hash
      ? url.pathname
      : null
  } catch {
    return null
  }
}

function getRawUrl(value) {
  if (
    typeof value !== 'string' ||
    !value ||
    [...value].length > MAX_URL_LENGTH
  ) {
    return null
  }

  const rawUrl = value.normalize('NFKC')
  if (
    !rawUrl ||
    [...rawUrl].length > MAX_URL_LENGTH ||
    /[\s\u0000-\u001F\u007F]/u.test(rawUrl) ||
    rawUrl.includes('\\') ||
    rawUrl.includes('?') ||
    rawUrl.includes('#') ||
    /[<>"']/u.test(rawUrl)
  ) {
    return null
  }

  return rawUrl
}

function hasUnsafePathSyntax(pathname) {
  if (
    !pathname.startsWith('/') ||
    pathname.includes('//') ||
    pathname.includes('\\') ||
    pathname.includes('?') ||
    pathname.includes('#') ||
    /[\s\u0000-\u001F\u007F]/u.test(pathname) ||
    pathname.split('/').some((segment) => segment === '.' || segment === '..')
  ) {
    return true
  }

  const firstSegment = pathname.split('/')[1]?.toLowerCase()
  return firstSegment === 'admin' || firstSegment === 'api'
}

function normalizeQuery(value) {
  if (typeof value !== 'string') return null

  const query = value.normalize('NFKC').replace(/\s+/gu, ' ').trim()
  const length = [...query].length
  return length >= MIN_QUERY_LENGTH && length <= MAX_QUERY_LENGTH ? query : null
}

function normalizeLocale(value) {
  const locale = readString(value, 16).toLowerCase()
  return SEARCH_LOCALES.has(locale) ? locale : null
}

async function readJsonPayload(request) {
  const contentType = request.headers
    .get('Content-Type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return { ok: false, tooLarge: false }
  }

  const declaredLength = Number(request.headers.get('Content-Length'))
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_REQUEST_BODY_BYTES
  ) {
    return { ok: false, tooLarge: true }
  }

  if (!request.body) return { ok: false, tooLarge: false }

  const reader = request.body.getReader()
  const chunks = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      totalBytes += value.byteLength
      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel('request body too large').catch(() => undefined)
        return { ok: false, tooLarge: true }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, tooLarge: false }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(body)) }
  } catch {
    return { ok: false, tooLarge: false }
  }
}

function errorResponse(code, status, requestId, startedAt, extraHeaders = {}) {
  return jsonResponse(
    { ok: false, error: { code }, requestId },
    status,
    requestId,
    startedAt,
    extraHeaders,
  )
}

function jsonResponse(body, status, requestId, startedAt, extraHeaders = {}) {
  const duration = Math.max(0, performance.now() - startedAt).toFixed(1)
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Server-Timing': `search;dur=${duration}`,
      'X-Content-Type-Options': 'nosniff',
      'X-Search-Request-Id': requestId,
      ...extraHeaders,
    },
  })
}

function readString(value, maximumLength) {
  return typeof value === 'string'
    ? value
        .normalize('NFKC')
        .replace(/\s+/gu, ' ')
        .trim()
        .slice(0, maximumLength)
    : ''
}

function getErrorCode(error, fallback) {
  return error instanceof Error && error.name ? error.name : fallback
}

function logSearchError(requestId, stage, errorCode) {
  console.error(
    JSON.stringify({
      event: 'portal_semantic_search_error',
      requestId,
      stage,
      errorCode,
    }),
  )
}
