import { resolveGuideLocale } from './alpha-locales.ts'
import { isAllowedRequestOrigin } from './alpha-chat.ts'

const CONTRACT_VERSION = 1
const MAX_REQUEST_BODY_BYTES = 16 * 1024
const MAX_RESPONSE_BODY_BYTES = 128 * 1024
const CONSENT_VERSION = 1
const BIRTH_BOUNDARY = '2020-10-01'
const CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu

export async function onRequestPost(context) {
  const { env, request } = context
  if (!isAllowedRequestOrigin(request)) {
    return jsonResponse(request, failure('invalid_origin'), 403)
  }
  const parsed = await readJsonPayload(request, MAX_REQUEST_BODY_BYTES)
  if (!parsed.ok || !isRecord(parsed.value)) {
    return jsonResponse(
      request,
      failure(parsed.tooLarge ? 'request_too_large' : 'invalid_request'),
      parsed.tooLarge ? 413 : 400,
    )
  }
  const input = normalizeRequest(parsed.value)
  if (!input) {
    return jsonResponse(request, failure('invalid_request'), 400)
  }

  const serverToday = getJstDate()
  if (input.entryDate && input.entryDate > serverToday) {
    return jsonResponse(
      request,
      {
        errorCode: 'future_date',
        messageKey: 'tomorrow',
        ok: false,
        serverToday,
        status: 'future',
      },
      422,
    )
  }
  if (
    input.entryDate &&
    input.entryDate < BIRTH_BOUNDARY &&
    input.adultConsentVersion !== CONSENT_VERSION
  ) {
    return jsonResponse(
      request,
      {
        consentVersion: CONSENT_VERSION,
        errorCode: 'content_gate_required',
        ok: false,
        serverToday,
        status: 'consent_required',
      },
      403,
    )
  }

  const service = getAlphaDiaryService(env)
  if (!service) {
    return jsonResponse(request, failure('unconfigured'), 503)
  }
  const clientKey = await createClientKey(request)
  try {
    const serviceResponse = await service.fetch(
      new Request('https://aceserver-alpha-chat.internal/v1/diary', {
        body: JSON.stringify({
          ...input,
          clientKey,
          version: CONTRACT_VERSION,
        }),
        headers: {
          'Accept-Language': input.locale,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    )
    const bodyResult = await readJsonPayload(
      serviceResponse,
      MAX_RESPONSE_BODY_BYTES,
    )
    if (!bodyResult.ok || !isValidDiaryResponse(bodyResult.value)) {
      throw new Error('AlphaDiaryServicePayloadError')
    }
    const headers: Record<string, string> = {}
    const retryAfter = serviceResponse.headers.get('Retry-After')
    if (retryAfter && /^\d{1,6}$/u.test(retryAfter)) {
      headers['Retry-After'] = retryAfter
    }
    return jsonResponse(
      request,
      bodyResult.value,
      normalizeServiceStatus(serviceResponse.status),
      headers,
    )
  } catch (error) {
    console.error(
      JSON.stringify({
        errorCode:
          error instanceof Error && error.name ? error.name : 'service_error',
        event: 'alpha_diary_service_error',
      }),
    )
    return jsonResponse(request, failure('generation_unavailable'), 503)
  }
}

export function onRequestOptions({ request }) {
  return new Response(null, {
    headers: {
      ...corsHeaders(request),
      'Access-Control-Allow-Headers':
        'Content-Type, X-Acecore-Alpha-Diary-Client',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
    status: 204,
  })
}

function normalizeRequest(value) {
  const action = value.action === undefined ? 'entry' : value.action
  const locale = resolveGuideLocale(value.locale)
  if (
    value.version !== CONTRACT_VERSION ||
    (action !== 'entry' && action !== 'finale') ||
    (value.locale !== undefined && locale !== value.locale) ||
    (value.entryDate !== undefined && !isValidDate(value.entryDate)) ||
    (value.journeyToken !== undefined &&
      (typeof value.journeyToken !== 'string' ||
        value.journeyToken.length > 4096)) ||
    (value.followLatest !== undefined &&
      typeof value.followLatest !== 'boolean') ||
    (value.adultConsentVersion !== undefined &&
      value.adultConsentVersion !== CONSENT_VERSION) ||
    (action === 'finale' && value.entryDate !== undefined)
  ) {
    return null
  }
  return {
    action,
    locale,
    ...(value.entryDate === undefined ? {} : { entryDate: value.entryDate }),
    ...(value.journeyToken === undefined
      ? {}
      : { journeyToken: value.journeyToken }),
    ...(value.followLatest === true ? { followLatest: true } : {}),
    ...(value.adultConsentVersion === CONSENT_VERSION
      ? { adultConsentVersion: CONSENT_VERSION }
      : {}),
  }
}

function isValidDiaryResponse(value) {
  if (!isRecord(value) || typeof value.ok !== 'boolean') return false
  if (
    typeof value.status !== 'string' ||
    ![
      'consent_required',
      'failed',
      'future',
      'pending',
      'rate_limited',
      'ready',
    ].includes(value.status)
  ) {
    return false
  }
  if (value.serverToday !== undefined && !isValidDate(value.serverToday)) {
    return false
  }
  if (value.status === 'pending') {
    return (
      Number.isInteger(value.retryAfter) &&
      value.retryAfter >= 1 &&
      value.retryAfter <= 3600
    )
  }
  if (value.status !== 'ready') return true
  if (value.entry !== undefined) {
    return isValidReadyEntry(value.entry) && isValidJourney(value.journey)
  }
  return (
    isValidReadyFinale(value.finale) && boundedString(value.journeyToken, 4096)
  )
}

function isValidReadyEntry(value) {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    /^entry_[a-z0-9]{24,64}$/u.test(value.id) &&
    isValidDate(value.date) &&
    (value.kind === 'diary' || value.kind === 'observation') &&
    boundedString(value.title, 120) &&
    boundedString(value.text, 1800) &&
    Array.isArray(value.questions) &&
    value.questions.length === 3 &&
    value.questions.every((question) => boundedString(question, 220)) &&
    isValidImage(value.image)
  )
}

function isValidReadyFinale(value) {
  return (
    isRecord(value) &&
    boundedString(value.message, 1800) &&
    isValidImage(value.landscape) &&
    isValidImage(value.portrait)
  )
}

function isValidJourney(value) {
  return (
    isRecord(value) &&
    Number.isInteger(value.confirmedCount) &&
    value.confirmedCount >= 0 &&
    Number.isInteger(value.viewedCount) &&
    value.viewedCount >= 0 &&
    Number.isInteger(value.totalCount) &&
    value.totalCount >= 1 &&
    value.confirmedCount <= value.totalCount &&
    value.viewedCount <= value.totalCount &&
    Number.isInteger(value.goalVersion) &&
    value.goalVersion >= 1 &&
    Number.isInteger(value.latestGoalVersion) &&
    value.latestGoalVersion >= value.goalVersion &&
    typeof value.latestRecordsAvailable === 'boolean' &&
    typeof value.unlocked === 'boolean' &&
    boundedString(value.token, 4096) &&
    Array.isArray(value.suggestedRecordDates) &&
    value.suggestedRecordDates.length >= 1 &&
    value.suggestedRecordDates.length <= 64 &&
    value.suggestedRecordDates.every(isValidDate)
  )
}

function isValidImage(value) {
  return (
    isRecord(value) &&
    typeof value.assetId === 'string' &&
    /^asset_[a-z0-9]{24,64}$/u.test(value.assetId) &&
    boundedString(value.alt, 240) &&
    Number.isInteger(value.width) &&
    value.width >= 256 &&
    value.width <= 1920 &&
    Number.isInteger(value.height) &&
    value.height >= 256 &&
    value.height <= 1920
  )
}

function boundedString(value, maximumLength) {
  return (
    typeof value === 'string' &&
    value.length >= 1 &&
    value.length <= maximumLength
  )
}

function isValidDate(value) {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value)
  if (!match || value < '0001-01-01') return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const days = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]
  return (
    year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
  )
}

function getJstDate(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

async function createClientKey(request) {
  const connectingIp = String(
    request.headers.get('CF-Connecting-IP') || '',
  ).trim()
  const clientId = String(
    request.headers.get('X-Acecore-Alpha-Diary-Client') || '',
  ).trim()
  const source = CLIENT_ID_PATTERN.test(clientId)
    ? `session:${clientId}`
    : connectingIp && connectingIp.length <= 64
      ? `ip:${connectingIp}`
      : 'anonymous'
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`alpha-diary:${source}`),
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

function getAlphaDiaryService(env) {
  const service = env?.ALPHA_CHAT_SERVICE
  return service && typeof service.fetch === 'function' ? service : null
}

function normalizeServiceStatus(value) {
  return Number.isInteger(value) && value >= 200 && value <= 599 ? value : 502
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
  request,
  body,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...corsHeaders(request),
      ...headers,
    },
    status,
  })
}

function corsHeaders(request): Record<string, string> {
  const origin = request.headers.get('Origin')
  if (!origin || !isAllowedRequestOrigin(request)) return {}
  return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
}

function failure(errorCode) {
  return { errorCode, ok: false, status: 'failed' }
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
