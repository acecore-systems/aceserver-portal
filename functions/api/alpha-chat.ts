import {
  GUIDE_MESSAGES_BY_LOCALE,
  resolveGuideLocale,
} from './alpha-locales.ts'

const MAX_SHARED_REQUEST_BODY_BYTES = 96 * 1024
const MAX_SHARED_RESPONSE_BODY_BYTES = 96 * 1024
const ALPHA_CHAT_SERVICE_CONTRACT_VERSION = 1
const ALPHA_RATE_LIMIT_WINDOW_SECONDS = 60
const ALPHA_RATE_LIMIT_RETENTION_SECONDS = 600
const ALPHA_CLIENT_RATE_LIMIT = 5
const ALPHA_GLOBAL_RATE_LIMIT = 60
const ALPHA_CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu

export async function onRequestPost(context) {
  const { request, env } = context
  const streamRequested = acceptsEventStream(request)
  const requestLocale = resolveRequestLocale(
    request.headers.get('Accept-Language'),
  )
  const requestMessages = GUIDE_MESSAGES_BY_LOCALE[requestLocale]

  if (!isAllowedRequestOrigin(request)) {
    return jsonResponse(
      request,
      { ok: false, answer: requestMessages.invalidRequest },
      403,
    )
  }

  const payloadResult = await readJsonPayload(
    request,
    MAX_SHARED_REQUEST_BODY_BYTES,
  )
  if (!payloadResult.ok) {
    return jsonResponse(
      request,
      {
        ok: false,
        answer: payloadResult.tooLarge
          ? requestMessages.requestTooLarge
          : requestMessages.invalidRequest,
      },
      payloadResult.tooLarge ? 413 : 400,
    )
  }

  const locale = resolveRequestLocale(
    payloadResult.value?.locale,
    requestLocale,
  )
  const guideMessages = GUIDE_MESSAGES_BY_LOCALE[locale]
  const service = getAlphaChatService(env)
  const rateLimitDatabase = getAlphaChatRateLimitDatabase(env)
  if (!service || !rateLimitDatabase) {
    return jsonResponse(
      request,
      { ok: false, answer: guideMessages.unconfigured },
      503,
    )
  }

  let globalRateLimit
  try {
    const clientKey = await createAlphaRateLimitKey(request)
    const clientRateLimit = await consumeAlphaRateLimit(
      rateLimitDatabase,
      `portal-alpha:client:${clientKey}`,
      ALPHA_CLIENT_RATE_LIMIT,
    )
    if (!clientRateLimit.allowed) {
      return rateLimitResponse(request, guideMessages.failed)
    }

    globalRateLimit = await consumeAlphaRateLimit(
      rateLimitDatabase,
      'portal-alpha:global',
      ALPHA_GLOBAL_RATE_LIMIT,
    )
    if (!globalRateLimit.allowed) {
      return rateLimitResponse(request, guideMessages.failed)
    }
  } catch (error) {
    logAlphaRateLimitError(error)
    return jsonResponse(
      request,
      { ok: false, answer: guideMessages.failed },
      503,
    )
  }

  if (globalRateLimit.count === 1 && typeof context.waitUntil === 'function') {
    context.waitUntil(
      deleteExpiredAlphaRateLimits(rateLimitDatabase).catch((error) => {
        logAlphaRateLimitError(error)
      }),
    )
  }

  try {
    const serviceResponse = await service.fetch(
      new Request('https://aceserver-alpha-chat.internal/v1/chat', {
        body: JSON.stringify({
          payload: payloadResult.value,
          surface: 'portal',
          version: ALPHA_CHAT_SERVICE_CONTRACT_VERSION,
        }),
        headers: {
          Accept: streamRequested ? 'text/event-stream' : 'application/json',
          'Accept-Language': locale,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    )
    if (streamRequested && isEventStreamResponse(serviceResponse)) {
      return eventStreamResponse(request, serviceResponse)
    }
    const bodyResult = await readJsonPayload(
      serviceResponse,
      MAX_SHARED_RESPONSE_BODY_BYTES,
    )
    if (!bodyResult.ok || !isAlphaChatServiceResponse(bodyResult.value)) {
      throw new Error('AlphaChatServicePayloadError')
    }
    return jsonResponse(
      request,
      bodyResult.value,
      normalizeServiceStatus(serviceResponse.status),
    )
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'alpha_chat_service_error',
        errorCode:
          error instanceof Error && error.name ? error.name : 'service_error',
      }),
    )
    return jsonResponse(
      request,
      { ok: false, answer: guideMessages.failed },
      503,
    )
  }
}

export function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Cache-Control': 'no-store',
    },
  })
}

export function isAllowedRequestOrigin(request) {
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') return false

  const origin = request.headers.get('Origin')
  if (!origin) return true

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

function rateLimitResponse(request, answer) {
  return jsonResponse(request, { ok: false, answer }, 429, {
    'Retry-After': String(ALPHA_RATE_LIMIT_WINDOW_SECONDS),
  })
}

function getAlphaChatRateLimitDatabase(env) {
  const database = env?.SEARCH_RATE_LIMIT_DB
  return database && typeof database.prepare === 'function' ? database : null
}

async function createAlphaRateLimitKey(request) {
  const connectingIp = String(
    request.headers.get('CF-Connecting-IP') || '',
  ).trim()
  const clientId = String(
    request.headers.get('X-Acecore-Alpha-Client') || '',
  ).trim()
  const source =
    connectingIp && connectingIp.length <= 64
      ? `ip:${connectingIp}`
      : `session:${ALPHA_CLIENT_ID_PATTERN.test(clientId) ? clientId : 'anonymous'}`
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(source),
  )
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('')
}

async function consumeAlphaRateLimit(database, limiterKey, limit) {
  const now = Math.floor(Date.now() / 1_000)
  const windowStart =
    Math.floor(now / ALPHA_RATE_LIMIT_WINDOW_SECONDS) *
    ALPHA_RATE_LIMIT_WINDOW_SECONDS
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
    .bind(
      limiterKey,
      windowStart,
      now + ALPHA_RATE_LIMIT_RETENTION_SECONDS,
      limit,
    )
    .first()
  const count = Number(result?.request_count)
  return {
    allowed: Number.isInteger(count) && count >= 1 && count <= limit,
    count: Number.isInteger(count) ? count : 0,
  }
}

async function deleteExpiredAlphaRateLimits(database) {
  const now = Math.floor(Date.now() / 1_000)
  await database
    .prepare('DELETE FROM semantic_search_rate_limits WHERE expires_at < ?')
    .bind(now)
    .run()
}

function logAlphaRateLimitError(error) {
  console.error(
    JSON.stringify({
      event: 'alpha_chat_rate_limit_error',
      errorCode:
        error instanceof Error && error.name ? error.name : 'storage_error',
    }),
  )
}

function getAlphaChatService(env) {
  const service = env?.ALPHA_CHAT_SERVICE
  return service && typeof service.fetch === 'function' ? service : null
}

function normalizeServiceStatus(value) {
  return Number.isInteger(value) && value >= 200 && value <= 599 ? value : 502
}

function acceptsEventStream(request) {
  return String(request.headers.get('Accept') || '')
    .split(',')
    .some((entry) => {
      const [mediaType, ...parameters] = entry.split(';')
      if (mediaType.trim().toLowerCase() !== 'text/event-stream') return false
      return !parameters.some((parameter) =>
        /^\s*q\s*=\s*0(?:\.0*)?\s*$/iu.test(parameter),
      )
    })
}

function isEventStreamResponse(response) {
  return Boolean(
    response.body &&
    response.ok &&
    response.headers
      .get('Content-Type')
      ?.toLowerCase()
      .startsWith('text/event-stream'),
  )
}

function eventStreamResponse(request, serviceResponse) {
  let totalBytes = 0
  const boundedBody = serviceResponse.body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        if (!(chunk instanceof Uint8Array)) {
          controller.error(new Error('AlphaChatServicePayloadError'))
          return
        }
        totalBytes += chunk.byteLength
        if (totalBytes > MAX_SHARED_RESPONSE_BODY_BYTES) {
          controller.error(new Error('AlphaChatServicePayloadError'))
          return
        }
        controller.enqueue(chunk)
      },
    }),
  )

  return new Response(boundedBody, {
    status: normalizeServiceStatus(serviceResponse.status),
    headers: {
      'Cache-Control': 'no-store, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...corsHeaders(request),
    },
  })
}

function isAlphaChatServiceResponse(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (typeof value.ok !== 'boolean') return false
  if (typeof value.answer !== 'string' || value.answer.length > 16_000) {
    return false
  }
  if (
    value.personaVersion !== undefined &&
    (typeof value.personaVersion !== 'string' ||
      value.personaVersion.length > 64)
  ) {
    return false
  }
  if (
    value.conversationContextReset !== undefined &&
    typeof value.conversationContextReset !== 'boolean'
  ) {
    return false
  }
  if (
    value.nextConversationContext !== undefined &&
    (!value.nextConversationContext ||
      typeof value.nextConversationContext !== 'object' ||
      Array.isArray(value.nextConversationContext))
  ) {
    return false
  }
  if (
    value.sources !== undefined &&
    (!Array.isArray(value.sources) ||
      value.sources.length > 12 ||
      value.sources.some(
        (source) =>
          !source ||
          typeof source !== 'object' ||
          typeof source.title !== 'string' ||
          typeof source.url !== 'string',
      ))
  ) {
    return false
  }
  return true
}

function resolveRequestLocale(value, fallback = 'ja') {
  const normalized = String(value || '')
    .split(',', 1)[0]
    .trim()
    .toLowerCase()
    .replace(/_/gu, '-')
  if (normalized === 'zh' || normalized.startsWith('zh-')) return 'zh-cn'
  const base = normalized.split('-', 1)[0]
  const resolved = resolveGuideLocale(base)
  return resolved === 'ja' && base !== 'ja' ? fallback : resolved
}

async function readJsonPayload(request, maximumBytes) {
  const contentType = request.headers
    .get('Content-Type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return { ok: false, tooLarge: false }
  }

  const declaredLength = Number(request.headers.get('Content-Length'))
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    return { ok: false, tooLarge: true }
  }

  if (!request.body) return { ok: false, tooLarge: false }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      totalBytes += value.byteLength
      if (totalBytes > maximumBytes) {
        await reader.cancel()
        return { ok: false, tooLarge: true }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, tooLarge: false }
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

function jsonResponse(
  request: Request,
  body,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...corsHeaders(request),
      ...headers,
    },
  })
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin')
  if (!origin || !isAllowedRequestOrigin(request)) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  }
}
