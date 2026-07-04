const DEFAULT_CLOUDFLARE_AI_MODEL = '@cf/zai-org/glm-5.2'
const DEFAULT_CLOUDFLARE_AI_REASONING_EFFORT = 'low'
const MAX_QUESTION_LENGTH = 600
const MAX_HISTORY_MESSAGES = 8
const MAX_CONVERSATION_LENGTH = 2800
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 10
const RATE_LIMIT_MAX_BUCKETS = 2000

const DISCORD_URL = 'https://discord.gg/vKTdU4k8ur'
const WIKI_URL = 'https://asv-wiki.acecore.net'
const ACECORE_URL = 'https://acecore.net/'

const rateLimitBuckets = new Map()

const GUIDE_MESSAGES = {
  invalidRequest: 'リクエスト形式が正しくないみたい。もう一度送ってね。',
  required: '質問を入力してくれたら、アルファくんが案内するよ。',
  questionTooLong: '質問が長いみたい。少し短く分けて聞いてね。',
  conversationTooLong:
    '会話が長くなってきたよ。聞きたいことを短くまとめてもう一度送ってね。',
  rateLimited:
    '短い時間にたくさん話しかけられているよ。少し待ってからまた聞いてね。',
  unconfigured:
    'いまはアルファくんのAI応答が準備中だよ。参加方法はディスコード、ルールはWIKI、ワールドはマップを見てね。',
  failed:
    'いまはアルファくんのAI応答につながらなかったよ。参加方法はディスコード、詳しい案内はWIKIを見てね。',
  emptyAnswer:
    'その内容はまだうまく案内できなかったよ。参加方法、ワールド、ルールのどれかを短く聞いてみてね。',
}

export async function onRequestPost({ request, env }) {
  let payload
  try {
    payload = await request.json()
  } catch {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.invalidRequest },
      400,
    )
  }

  if (!isAllowedRequestOrigin(request)) {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.invalidRequest },
      403,
    )
  }

  const rateLimit = checkRateLimit(request)
  if (!rateLimit.allowed) {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.rateLimited },
      429,
      { 'Retry-After': String(rateLimit.retryAfterSeconds || 60) },
    )
  }

  const question = String(payload?.question || '').trim()
  const conversationInput = buildConversationInput(payload)

  if (!conversationInput) {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.required },
      400,
    )
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.questionTooLong },
      400,
    )
  }

  if (conversationInput.length > MAX_CONVERSATION_LENGTH) {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.conversationTooLong },
      400,
    )
  }

  if (!env?.AI) {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.unconfigured },
      503,
    )
  }

  let result
  try {
    result = await env.AI.run(
      env.CLOUDFLARE_AI_MODEL || DEFAULT_CLOUDFLARE_AI_MODEL,
      {
        messages: [
          {
            role: 'system',
            content: [
              'You are Alpha-kun, the official character guide for Aceserver.',
              'Answer in Japanese. Speak as Alpha-kun, not as an AI assistant.',
              'Keep replies warm, concise, and practical. Usually use 2 to 4 short sentences.',
              'Guide first-time visitors to the next action. Use only the public Aceserver context below.',
              'Do not invent server IPs, whitelists, live status, incidents, moderation decisions, private data, pricing, or schedules.',
              'If the visitor needs live status, latest rules, ban/admin help, or private support, guide them to the official Discord or WIKI.',
              'When a link is useful, use only the exact allowed URLs in the context. Do not use raw HTML or tables.',
              buildAceserverContext(),
            ].join('\n'),
          },
          {
            role: 'user',
            content: `Conversation:\n${conversationInput}`,
          },
        ],
        max_completion_tokens: 320,
        reasoning_effort: normalizeReasoningEffort(
          env.CLOUDFLARE_AI_REASONING_EFFORT,
        ),
        temperature: 0.25,
      },
    )
  } catch {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.failed },
      502,
    )
  }

  if (typeof result !== 'string' && result?.error) {
    return jsonResponse(
      request,
      { ok: false, answer: GUIDE_MESSAGES.failed },
      502,
    )
  }

  const answer = extractWorkersAiText(result).trim()
  return jsonResponse(request, {
    ok: true,
    answer: answer || GUIDE_MESSAGES.emptyAnswer,
  })
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

function buildAceserverContext() {
  return `
Aceserver public site context:
- Aceserver is a free public Minecraft server community operated around Acecore.
- The site introduces participation, videos, world maps, Acecore, and the Aceserver WIKI.
- Java Edition and Bedrock Edition are both described as playable on the public site.
- First-time visitors should start with the official Discord, then confirm announcements and rules.
- The WIKI is the best place for rules, participation notes, and detailed guidance.
- The world map is useful when visitors want to see the world before playing.
- Alpha-kun is the character guide who helps visitors find where to go next.
- Allowed URLs:
  - Official Discord: ${DISCORD_URL}
  - Aceserver WIKI: ${WIKI_URL}
  - World map: /world-map/
  - Main world map: /world-map-main/
  - Resource world map: /world-map-sigen/
  - RPG world map: /world-map-rpg/
  - Lobby world map: /world-map-lobby/
  - Videos: /youtube-search-aceserver/
  - Acecore: ${ACECORE_URL}
`
}

function isAllowedRequestOrigin(request) {
  const origin = request.headers.get('Origin')
  if (!origin) return true

  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

function checkRateLimit(request) {
  const now = Date.now()
  const key = getClientKey(request)
  const current = rateLimitBuckets.get(key)

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    pruneRateLimitBuckets(now)
    return { allowed: true }
  }

  current.count += 1

  if (current.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  return { allowed: true }
}

function getClientKey(request) {
  const forwardedFor = request.headers
    .get('X-Forwarded-For')
    ?.split(',')[0]
    ?.trim()
  return (
    request.headers.get('CF-Connecting-IP')?.trim() ||
    forwardedFor ||
    request.headers.get('CF-Ray')?.trim() ||
    'unknown'
  )
}

function pruneRateLimitBuckets(now) {
  if (rateLimitBuckets.size <= RATE_LIMIT_MAX_BUCKETS) return

  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key)
    }

    if (rateLimitBuckets.size <= RATE_LIMIT_MAX_BUCKETS) return
  }
}

function normalizeReasoningEffort(value) {
  const effort = String(value || DEFAULT_CLOUDFLARE_AI_REASONING_EFFORT)
    .trim()
    .toLowerCase()

  return effort === 'medium' || effort === 'high'
    ? effort
    : DEFAULT_CLOUDFLARE_AI_REASONING_EFFORT
}

function extractWorkersAiText(result) {
  if (!result) return ''
  if (typeof result === 'string') return result
  if (typeof result.response === 'string') return result.response
  if (typeof result.output_text === 'string') return result.output_text
  if (result.result) return extractWorkersAiText(result.result)

  const choicesText = (result.choices || [])
    .map(extractChoiceText)
    .filter(Boolean)
    .join('\n')
  if (choicesText) return choicesText

  return (result.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || '')
    .filter(Boolean)
    .join('\n')
}

function extractChoiceText(choice) {
  if (typeof choice.text === 'string') return choice.text
  if (typeof choice.delta?.content === 'string') return choice.delta.content

  const content = choice.message?.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) => part.text || '')
      .filter(Boolean)
      .join('\n')
  }

  return ''
}

function buildConversationInput(payload) {
  const messages = Array.isArray(payload?.messages) ? payload.messages : []
  const lines = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => {
      const role = message?.role === 'assistant' ? 'Alpha-kun' : 'Visitor'
      const content = String(message?.content || '').trim()
      if (!content) return ''
      return `${role}: ${content.slice(0, MAX_QUESTION_LENGTH)}`
    })
    .filter(Boolean)

  if (lines.length > 0) return lines.join('\n')

  const question = String(payload?.question || '').trim()
  return question ? `Visitor: ${question.slice(0, MAX_QUESTION_LENGTH)}` : ''
}

function jsonResponse(request, body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...corsHeaders(request),
      ...headers,
    },
  })
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin')
  if (!origin || !isAllowedRequestOrigin(request)) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  }
}
