import { ACESERVER_WIKI_CONTEXT_ENTRIES } from './alpha-wiki-context.js'

const DEFAULT_CLOUDFLARE_AI_MODEL = '@cf/zai-org/glm-5.2'
const DEFAULT_CLOUDFLARE_AI_REASONING_EFFORT = 'low'
const MAX_QUESTION_LENGTH = 600
const MAX_HISTORY_MESSAGES = 8
const MAX_CONVERSATION_LENGTH = 2800
const MAX_WIKI_CONTEXT_ENTRIES = 3
const MAX_WIKI_CONTEXT_CHARS = 4200
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 10
const RATE_LIMIT_MAX_BUCKETS = 2000

const DISCORD_URL = 'https://discord.gg/vKTdU4k8ur'
const WIKI_URL = 'https://asv-wiki.acecore.net'
const WORLD_MAP_URL = '/world-map/'
const ACECORE_URL = 'https://acecore.net/'

const GUIDE_LINK_RESOURCES = [
  {
    href: DISCORD_URL,
    label: '公式Discord',
    terms: ['公式Discord', '公式ディスコード', 'Discord', 'ディスコード'],
  },
  {
    href: WIKI_URL,
    label: 'Aceserver WIKI',
    terms: [
      'Aceserver WIKI',
      'エースサーバーWIKI',
      'Aceserver Wiki',
      'エースサーバーWiki',
      'WIKI',
      'Wiki',
      'ウィキ',
    ],
  },
  {
    href: `${WIKI_URL}/article/rule`,
    label: 'ルール・BAN条件',
    terms: ['ルール・BAN条件', 'BAN条件'],
  },
  {
    href: `${WIKI_URL}/article/in`,
    label: '参加方法',
    terms: ['参加方法'],
  },
  {
    href: `${WIKI_URL}/article/howto`,
    label: '遊び方',
    terms: ['遊び方'],
  },
  {
    href: `${WIKI_URL}/article/SurvivalCommand`,
    label: 'コマンドについて',
    terms: ['コマンドについて'],
  },
  {
    href: `${WIKI_URL}/article/Reset`,
    label: '資源サーバー',
    terms: ['資源サーバー', '資源鯖'],
  },
  {
    href: WORLD_MAP_URL,
    label: 'ワールドマップ',
    terms: ['ワールドマップ'],
  },
]

const rateLimitBuckets = new Map()

const GUIDE_MESSAGES = {
  invalidRequest: 'リクエスト形式が正しくないみたい。もう一度送ってね。',
  required: '質問を入力してくれたら、アルファくんが案内するよ。',
  questionTooLong: '質問が長いみたい。少し短く分けて聞いてね。',
  conversationTooLong:
    '会話が長くなってきたよ。聞きたいことを短くまとめてもう一度送ってね。',
  rateLimited:
    '短い時間にたくさん話しかけられているよ。少し待ってからまた聞いてね。',
  unconfigured: `いまはアルファくんのAI応答が準備中だよ。参加方法は[公式Discord](${DISCORD_URL})、ルールは[Aceserver WIKI](${WIKI_URL})、ワールドは[ワールドマップ](${WORLD_MAP_URL})を見てね。`,
  failed: `いまはアルファくんのAI応答につながらなかったよ。参加方法は[公式Discord](${DISCORD_URL})、詳しい案内は[Aceserver WIKI](${WIKI_URL})を見てね。`,
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

  const wikiContext = buildSelectedWikiContext(conversationInput)

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
              'Keep replies warm, concise, and practical. Usually use 2 to 4 short sentences; for rule or command details, use up to 5 short bullet points when clearer.',
              'Guide first-time visitors to the next action. Use only the public Aceserver context and selected Aceserver WIKI excerpts below.',
              'When selected WIKI context contains relevant facts, answer concretely from it. Do not say Alpha-kun cannot provide rule details if the excerpt covers them.',
              'Do not invent server IPs, whitelists, live status, incidents, moderation decisions, private data, pricing, or schedules.',
              'If the visitor needs live status, unpublished changes, ban/admin help, or private support, guide them to the official Discord or the most relevant WIKI page.',
              'Use simple Markdown when it improves readability: short paragraphs, bullet lists, and **bold** for important names.',
              'When a relevant Aceserver or WIKI destination exists, make the first useful mention a Markdown link using the URLs in the context. Include links in answers about participation, rules, world maps, story, commands or next steps.',
              'For participation guidance, include [公式Discord](https://discord.gg/vKTdU4k8ur) and [Aceserver WIKI](https://asv-wiki.acecore.net) unless the answer is only a short clarification.',
              'Do not link every repeated mention. Do not paste bare URLs, raw HTML, or tables.',
              buildAceserverContext(),
              wikiContext,
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

  const answer = addGuideResourceLinks(extractWorkersAiText(result).trim())
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

function buildSelectedWikiContext(conversationInput) {
  const normalizedInput = normalizeSearchText(conversationInput)
  if (!normalizedInput) return ''

  const selectedEntries = ACESERVER_WIKI_CONTEXT_ENTRIES.map((entry) => ({
    entry,
    score: scoreWikiContextEntry(entry, normalizedInput),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.priority - b.entry.priority)
    .slice(0, MAX_WIKI_CONTEXT_ENTRIES)
    .map(({ entry }) => entry)

  if (selectedEntries.length === 0) return ''

  let remainingChars = MAX_WIKI_CONTEXT_CHARS
  const sections = []

  for (const entry of selectedEntries) {
    const header = `[${entry.title}] ${entry.url}`
    const availableTextChars = remainingChars - header.length - 8
    if (availableTextChars <= 120) break

    const text = entry.text.slice(0, availableTextChars).trim()
    if (!text) continue

    sections.push(`${header}\n${text}`)
    remainingChars -= header.length + text.length + 8
  }

  if (sections.length === 0) return ''

  return `
Selected Aceserver WIKI excerpts for this conversation:
- Treat these excerpts as factual public WIKI context.
- When answering from an excerpt, include the source page as a Markdown link once, for example [${selectedEntries[0].title}](${selectedEntries[0].url}).
- If the visitor asks for exhaustive or latest details, summarize the key points and guide them to the source page.

${sections.join('\n\n')}
`
}

function scoreWikiContextEntry(entry, normalizedInput) {
  let score = 0
  const normalizedTitle = normalizeSearchText(entry.title)

  if (normalizedTitle && normalizedInput.includes(normalizedTitle)) {
    score += 10
  }

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalizeSearchText(keyword)
    if (!normalizedKeyword) continue
    if (normalizedInput.includes(normalizedKeyword)) {
      score += Math.min(Math.max(normalizedKeyword.length, 2), 10)
    }
  }

  return score
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
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
  - World map: ${WORLD_MAP_URL}
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

function addGuideResourceLinks(answer) {
  let linkedAnswer = String(answer || '').trim()

  for (const resource of GUIDE_LINK_RESOURCES) {
    linkedAnswer = linkGuideResource(linkedAnswer, resource)
  }

  return linkedAnswer
}

function linkGuideResource(answer, resource) {
  if (!answer || hasMarkdownLinkTo(answer, resource.href)) return answer

  const markdownRanges = getMarkdownLinkRanges(answer)
  const bareHrefIndex = findPlainTextIndex(
    answer,
    resource.href,
    markdownRanges,
  )

  if (bareHrefIndex >= 0) {
    return replaceAnswerRange(
      answer,
      bareHrefIndex,
      bareHrefIndex + resource.href.length,
      `[${resource.label}](${resource.href})`,
    )
  }

  const protectedRanges = getProtectedTextRanges(answer)
  for (const term of resource.terms) {
    const termIndex = findPlainTextIndex(answer, term, protectedRanges)
    if (termIndex < 0) continue

    return replaceAnswerRange(
      answer,
      termIndex,
      termIndex + term.length,
      `[${term}](${resource.href})`,
    )
  }

  return answer
}

function hasMarkdownLinkTo(answer, href) {
  const escapedHref = escapeRegExp(href)
  return new RegExp(`\\[[^\\]\\n]+\\]\\(\\s*${escapedHref}\\s*\\)`).test(answer)
}

function getMarkdownLinkRanges(answer) {
  const ranges = []
  const pattern = /\[[^\]\n]+\]\(\s*[^)]+?\s*\)/g
  let match

  while ((match = pattern.exec(answer))) {
    ranges.push({
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return ranges
}

function getProtectedTextRanges(answer) {
  const markdownRanges = getMarkdownLinkRanges(answer)
  const rawUrlRanges = []
  const pattern = /https?:\/\/[A-Za-z0-9._~:/?#@!$&*+,;=%-]+/g
  let match

  while ((match = pattern.exec(answer))) {
    const range = {
      start: match.index,
      end: match.index + match[0].length,
    }
    if (
      !markdownRanges.some(
        (markdownRange) =>
          range.start < markdownRange.end && range.end > markdownRange.start,
      )
    ) {
      rawUrlRanges.push(range)
    }
  }

  return [...markdownRanges, ...rawUrlRanges]
}

function findPlainTextIndex(answer, needle, ranges) {
  let searchFrom = 0

  while (searchFrom < answer.length) {
    const index = answer.indexOf(needle, searchFrom)
    if (index < 0) return -1

    const end = index + needle.length
    if (!ranges.some((range) => index < range.end && end > range.start)) {
      return index
    }

    searchFrom = end
  }

  return -1
}

function replaceAnswerRange(answer, start, end, replacement) {
  return `${answer.slice(0, start)}${replacement}${answer.slice(end)}`
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
