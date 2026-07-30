import {
  createAlphaSearchEmbedding,
  isAlphaSearchEmbedding,
} from './alpha-search-embedding.js'

export const ACECORE_SYSTEMS_URL = 'https://systems.acecore.net'

const SYSTEMS_SEARCH_NAMESPACE = 'ja'
const SYSTEMS_SEARCH_TOP_K = 15
const SYSTEMS_GROUNDING_LIMIT = 3
const DEFAULT_SYSTEMS_SEARCH_MIN_SCORE = 0.5
const MAX_METADATA_TITLE_LENGTH = 240
const MAX_METADATA_SECTION_LENGTH = 240
const MAX_METADATA_EXCERPT_LENGTH = 500
const MAX_METADATA_URL_LENGTH = 500

const SYSTEMS_EXPLICIT_BRAND_PATTERN =
  /(?:\bacecore[\s_-]*systems?\b|エースコア(?:・|\s*)?システムズ?)/iu
const SYSTEMS_SHORT_BRAND_PATTERN = /\bsystems\b/iu
const SYSTEMS_TOPIC_PATTERN =
  /(?:IT顧問|技術顧問|開発顧問|業務システム|システム(?:開発|構築|導入|改修|保守|運用)|Web(?:サイト|アプリ)?(?:制作|開発|運用|改善|相談)|ウェブサイト(?:制作|開発|運用|改善|相談)|ホームページ(?:制作|開発|運用|改善|相談)|アプリ(?:制作|開発)|DX(?:支援|相談)|開発(?:依頼|相談|支援)|制作実績|開発実績|導入事例|技術解説|\b(?:system|web|app|application) development\b|\bit (?:advisor|advisory|consulting)\b|\btechnical consulting\b|\bcase stud(?:y|ies)\b)/iu
const ACESERVER_CONTEXT_PATTERN =
  /(?:\baceserver\b|エースサーバー|このサーバー)/iu
const ACESERVER_DETAIL_PATTERN =
  /(?:ルール|ban|禁止|コマンド|参加方法|入り方|接続方法|サーバーip|アドレス|ホワイトリスト|ワールド|マップ|プラグイン|荒らし|処罰|申請)/iu

export function shouldSearchSystems(query) {
  const normalizedQuery = String(query || '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
  if (!normalizedQuery) return false

  const hasExplicitBrandIntent =
    SYSTEMS_EXPLICIT_BRAND_PATTERN.test(normalizedQuery)
  if (
    ACESERVER_CONTEXT_PATTERN.test(normalizedQuery) &&
    (ACESERVER_DETAIL_PATTERN.test(normalizedQuery) || !hasExplicitBrandIntent)
  ) {
    return false
  }

  return (
    hasExplicitBrandIntent ||
    SYSTEMS_SHORT_BRAND_PATTERN.test(normalizedQuery) ||
    SYSTEMS_TOPIC_PATTERN.test(normalizedQuery)
  )
}

export async function searchSystems(query, env, providedEmbedding = null) {
  if (
    !query ||
    !env?.AI ||
    !env?.SYSTEMS_SEARCH_INDEX ||
    env.SYSTEMS_SEARCH_ENABLED === 'false'
  ) {
    return []
  }

  const embedding =
    providedEmbedding || (await createAlphaSearchEmbedding(query, env))
  if (!isAlphaSearchEmbedding(embedding)) return []

  let matches
  try {
    matches = await env.SYSTEMS_SEARCH_INDEX.query(embedding, {
      namespace: SYSTEMS_SEARCH_NAMESPACE,
      topK: SYSTEMS_SEARCH_TOP_K,
      returnMetadata: 'all',
      returnValues: false,
    })
  } catch (error) {
    logSystemsSearchError('vectorize', getErrorCode(error, 'provider_error'))
    return []
  }

  return normalizeSystemsMatches(
    matches,
    normalizeMinScore(env.SYSTEMS_SEARCH_MIN_SCORE),
  )
}

export function buildSystemsGroundingContext(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return ''

  const evidence = entries.map((entry, index) => {
    return [
      `<systems-evidence index="${index + 1}">`,
      `Source: [${escapeMarkdownLabel(entry.title)}](${entry.url})`,
      `Content type: ${entry.contentType}`,
      `Section: ${entry.section}`,
      `Excerpt: ${entry.excerpt}`,
      '</systems-evidence>',
    ].join('\n')
  })

  return [
    'Acecore Systems official site retrieved evidence:',
    'Use this evidence only for system and web development, IT advisory services, pricing, case studies, and technical explanations.',
    'Never use it to answer Aceserver rules, commands, participation requirements, or live operations.',
    'Do not invent current prices, availability, project scope, delivery dates, or measured outcomes that the excerpts do not support.',
    'When it answers the question, cite the relevant Source Markdown link once.',
    ...evidence,
  ].join('\n')
}

function normalizeSystemsMatches(queryResult, minScore) {
  const results = []
  const seenUrls = new Set()

  for (const match of queryResult?.matches || []) {
    if (!Number.isFinite(match?.score) || match.score < minScore) continue

    const id = readString(match.id, 128)
    const metadata = normalizeSystemsMetadata(match.metadata)
    if (!id || !metadata || seenUrls.has(metadata.url)) continue

    seenUrls.add(metadata.url)
    results.push({
      id,
      score: match.score,
      ...metadata,
    })

    if (results.length >= SYSTEMS_GROUNDING_LIMIT) break
  }

  return results
}

function normalizeSystemsMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const locale = readString(value.locale, 16)
  const title = readString(value.title, MAX_METADATA_TITLE_LENGTH)
  const section =
    readString(value.section, MAX_METADATA_SECTION_LENGTH) || title
  const excerpt = readString(value.excerpt, MAX_METADATA_EXCERPT_LENGTH)
  const contentType = readString(value.contentType, 40) || 'page'
  const rawUrl = readString(value.url, MAX_METADATA_URL_LENGTH)

  if (
    locale !== SYSTEMS_SEARCH_NAMESPACE ||
    !title ||
    !excerpt ||
    !rawUrl.startsWith('/') ||
    rawUrl.startsWith('//') ||
    rawUrl.includes('\\')
  ) {
    return null
  }

  try {
    const url = new URL(rawUrl, `${ACECORE_SYSTEMS_URL}/`)
    const firstPathSegment = url.pathname.split('/')[1]?.toLowerCase()
    if (
      url.origin !== ACECORE_SYSTEMS_URL ||
      url.search ||
      url.hash ||
      ['admin', 'api'].includes(firstPathSegment)
    ) {
      return null
    }

    return {
      url: url.href,
      title,
      section,
      excerpt,
      contentType,
    }
  } catch {
    return null
  }
}

function normalizeMinScore(value) {
  const score = Number(value)
  return Number.isFinite(score) && score >= 0 && score <= 1
    ? score
    : DEFAULT_SYSTEMS_SEARCH_MIN_SCORE
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

function escapeMarkdownLabel(value) {
  return String(value).replace(/([\\[\]])/gu, '\\$1')
}

function getErrorCode(error, fallback) {
  return error instanceof Error && error.name ? error.name : fallback
}

function logSystemsSearchError(stage, errorCode) {
  console.error(
    JSON.stringify({
      event: 'alpha_systems_search_error',
      stage,
      errorCode,
    }),
  )
}
