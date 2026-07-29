import {
  createAlphaSearchEmbedding,
  isAlphaSearchEmbedding,
} from './alpha-search-embedding.js'

export const ACECORE_URL = 'https://acecore.net'

const ACECORE_SEARCH_NAMESPACE = 'ja'
const ACECORE_SEARCH_TOP_K = 15
const ACECORE_GROUNDING_LIMIT = 3
const DEFAULT_ACECORE_SEARCH_MIN_SCORE = 0.5
const MAX_METADATA_TITLE_LENGTH = 240
const MAX_METADATA_SECTION_LENGTH = 240
const MAX_METADATA_EXCERPT_LENGTH = 500
const MAX_METADATA_URL_LENGTH = 500

const ACECORE_BRAND_PATTERN = /(?:\bacecore\b|エースコア)/iu
const ACECORE_OPERATOR_PATTERN =
  /(?:運営(?:元|会社|団体|組織|者)|運営.{0,12}(?:誰|どこ|会社|法人|団体|組織)|(?:誰|どこ|会社|法人|団体|組織).{0,12}運営)/u
const ACECORE_CONTENT_PATTERN =
  /(?:会社(?:概要|情報|について)|法人(?:情報|について)|事業内容|関連プロジェクト|技術記事|運営元の記事|サービス一覧)/u
const ACESERVER_DETAIL_PATTERN =
  /(?:ルール|ban|禁止|コマンド|参加方法|入り方|接続方法|サーバーip|アドレス|ホワイトリスト|ワールド|マップ|プラグイン|荒らし|処罰|申請)/iu

export function shouldSearchAcecore(query) {
  const normalizedQuery = String(query || '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
  if (!normalizedQuery) return false

  const hasBrandIntent = ACECORE_BRAND_PATTERN.test(normalizedQuery)
  const hasOperatorIntent = ACECORE_OPERATOR_PATTERN.test(normalizedQuery)
  const hasContentIntent = ACECORE_CONTENT_PATTERN.test(normalizedQuery)
  if (!hasBrandIntent && !hasOperatorIntent && !hasContentIntent) return false

  const asksForAceserverDetail = ACESERVER_DETAIL_PATTERN.test(normalizedQuery)
  return !asksForAceserverDetail || hasOperatorIntent || hasContentIntent
}

export async function searchAcecore(query, env, providedEmbedding = null) {
  if (
    !query ||
    !env?.AI ||
    !env?.ACECORE_SEARCH_INDEX ||
    env.ACECORE_SEARCH_ENABLED === 'false'
  ) {
    return []
  }

  const embedding =
    providedEmbedding || (await createAlphaSearchEmbedding(query, env))
  if (!isAlphaSearchEmbedding(embedding)) return []

  let matches
  try {
    matches = await env.ACECORE_SEARCH_INDEX.query(embedding, {
      namespace: ACECORE_SEARCH_NAMESPACE,
      topK: ACECORE_SEARCH_TOP_K,
      returnMetadata: 'all',
      returnValues: false,
    })
  } catch (error) {
    logAcecoreSearchError('vectorize', getErrorCode(error, 'provider_error'))
    return []
  }

  return normalizeAcecoreMatches(
    matches,
    normalizeMinScore(env.ACECORE_SEARCH_MIN_SCORE),
  )
}

export function buildAcecoreGroundingContext(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return ''

  const evidence = entries.map((entry, index) => {
    return [
      `<acecore-evidence index="${index + 1}">`,
      `Source: [${escapeMarkdownLabel(entry.title)}](${entry.url})`,
      `Excerpt: ${entry.excerpt}`,
      '</acecore-evidence>',
    ].join('\n')
  })

  return [
    'Acecore official site retrieved evidence:',
    'Use this evidence only for Acecore, its operator, projects, services, and article discovery.',
    'Never use it to answer Aceserver rules, commands, participation requirements, or live operations.',
    'The excerpts are short. Do not add details that the excerpt does not support.',
    'When it answers the question, cite the relevant Source Markdown link once.',
    ...evidence,
  ].join('\n')
}

function normalizeAcecoreMatches(queryResult, minScore) {
  const results = []
  const seenUrls = new Set()

  for (const match of queryResult?.matches || []) {
    if (!Number.isFinite(match?.score) || match.score < minScore) continue

    const id = readString(match.id, 128)
    const metadata = normalizeAcecoreMetadata(match.metadata)
    if (!id || !metadata || seenUrls.has(metadata.url)) continue

    seenUrls.add(metadata.url)
    results.push({
      id,
      score: match.score,
      ...metadata,
    })

    if (results.length >= ACECORE_GROUNDING_LIMIT) break
  }

  return results
}

function normalizeAcecoreMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const locale = readString(value.locale, 16)
  const title = readString(value.title, MAX_METADATA_TITLE_LENGTH)
  const section =
    readString(value.section, MAX_METADATA_SECTION_LENGTH) || title
  const excerpt = readString(value.excerpt, MAX_METADATA_EXCERPT_LENGTH)
  const contentType = readString(value.contentType, 40) || 'page'
  const rawUrl = readString(value.url, MAX_METADATA_URL_LENGTH)

  if (locale !== ACECORE_SEARCH_NAMESPACE || !title || !excerpt || !rawUrl) {
    return null
  }
  if (rawUrl.startsWith('//') || rawUrl.includes('\\')) return null

  try {
    const url = new URL(rawUrl, `${ACECORE_URL}/`)
    if (url.origin !== ACECORE_URL || url.search || url.hash) return null

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
    : DEFAULT_ACECORE_SEARCH_MIN_SCORE
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

function logAcecoreSearchError(stage, errorCode) {
  console.error(
    JSON.stringify({
      event: 'alpha_acecore_search_error',
      stage,
      errorCode,
    }),
  )
}
