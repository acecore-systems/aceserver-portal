import {
  createAlphaSearchEmbedding,
  isAlphaSearchEmbedding,
} from './alpha-search-embedding.ts'

export const ACECORE_SCHOOLS_URL = 'https://schools.acecore.net'

const SCHOOLS_SEARCH_NAMESPACE = 'ja'
const SCHOOLS_SEARCH_TOP_K = 15
const SCHOOLS_GROUNDING_LIMIT = 3
const DEFAULT_SCHOOLS_SEARCH_MIN_SCORE = 0.5
const MAX_METADATA_TITLE_LENGTH = 240
const MAX_METADATA_SECTION_LENGTH = 240
const MAX_METADATA_EXCERPT_LENGTH = 500
const MAX_METADATA_URL_LENGTH = 500

type SchoolsEntry = {
  contentType: string
  excerpt: string
  id: string
  score: number
  section: string
  title: string
  url: string
}

const SCHOOLS_BRAND_PATTERN =
  /(?:\bacecore[\s_-]*schools?\b|\bschools\b|エースコア(?:・|\s*)?(?:スクールズ?|学校)|スクールズ)/iu
const SCHOOLS_TOPIC_PATTERN =
  /(?:高卒認定|高認(?:試験|資格|対策)?|学習(?:相談|支援|内容|方法|計画)|パソコン(?:初心者|学習|活用|相談|教室)|\bpc\b.{0,12}(?:初心者|学習|活用|相談)|スマホ.{0,12}(?:活用|学習|相談)|プログラミング.{0,12}(?:学|講座|相談)|ロボット.{0,12}(?:学習|メイキング)|勉強(?:相談|方法))/iu
const ACESERVER_CONTEXT_PATTERN =
  /(?:\baceserver\b|エースサーバー|このサーバー)/iu
const ACESERVER_DETAIL_PATTERN =
  /(?:\bminecraft\b|マインクラフト|マイクラ|サーバー|ルール|ban|禁止|コマンド|参加方法|入り方|接続方法|サーバーip|アドレス|ホワイトリスト|ワールド|マップ|プラグイン|荒らし|処罰|申請)/iu

export function shouldSearchSchools(query) {
  const normalizedQuery = String(query || '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
  if (!normalizedQuery) return false

  const hasBrandIntent = SCHOOLS_BRAND_PATTERN.test(normalizedQuery)
  const hasAceserverIntent =
    ACESERVER_CONTEXT_PATTERN.test(normalizedQuery) ||
    ACESERVER_DETAIL_PATTERN.test(normalizedQuery)
  if (hasAceserverIntent && !hasBrandIntent) {
    return false
  }

  return hasBrandIntent || SCHOOLS_TOPIC_PATTERN.test(normalizedQuery)
}

export async function searchSchools(query, env, providedEmbedding = null) {
  if (
    !query ||
    (!providedEmbedding && !env?.AI) ||
    !env?.SCHOOLS_SEARCH_INDEX ||
    env.SCHOOLS_SEARCH_ENABLED === 'false'
  ) {
    return []
  }

  const embedding =
    providedEmbedding || (await createAlphaSearchEmbedding(query, env))
  if (!isAlphaSearchEmbedding(embedding)) return []

  let matches
  try {
    matches = await env.SCHOOLS_SEARCH_INDEX.query(embedding, {
      namespace: SCHOOLS_SEARCH_NAMESPACE,
      topK: SCHOOLS_SEARCH_TOP_K,
      returnMetadata: 'all',
      returnValues: false,
    })
  } catch (error) {
    logSchoolsSearchError('vectorize', getErrorCode(error, 'provider_error'))
    return []
  }

  return normalizeSchoolsMatches(
    matches,
    normalizeMinScore(env.SCHOOLS_SEARCH_MIN_SCORE),
  )
}

export function buildSchoolsGroundingContext(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return ''

  const evidence = entries.map((entry, index) => {
    return [
      `<schools-evidence index="${index + 1}">`,
      `Source: [${escapeMarkdownLabel(entry.title)}](${entry.url})`,
      `Section: ${entry.section}`,
      `Excerpt: ${entry.excerpt}`,
      '</schools-evidence>',
    ].join('\n')
  })

  return [
    'Acecore Schools official site retrieved evidence:',
    'Use this evidence only for Acecore Schools learning areas, learning methods, support, consultation, pricing, and frequently asked questions.',
    'Never use it to answer Aceserver rules, commands, participation requirements, or live operations.',
    'Do not invent current prices, schedules, availability, eligibility, or promises that the excerpts do not support.',
    'When it answers the question, cite the relevant Source Markdown link once.',
    ...evidence,
  ].join('\n')
}

function normalizeSchoolsMatches(queryResult, minScore) {
  const results: SchoolsEntry[] = []
  const seenUrls = new Set()

  for (const match of queryResult?.matches || []) {
    if (!Number.isFinite(match?.score) || match.score < minScore) continue

    const id = readString(match.id, 128)
    const metadata = normalizeSchoolsMetadata(match.metadata)
    if (!id || !metadata || seenUrls.has(metadata.url)) continue

    seenUrls.add(metadata.url)
    results.push({
      id,
      score: match.score,
      ...metadata,
    })

    if (results.length >= SCHOOLS_GROUNDING_LIMIT) break
  }

  return results
}

function normalizeSchoolsMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const locale = readString(value.locale, 16)
  const title = readString(value.title, MAX_METADATA_TITLE_LENGTH)
  const section =
    readString(value.section, MAX_METADATA_SECTION_LENGTH) || title
  const excerpt = readString(value.excerpt, MAX_METADATA_EXCERPT_LENGTH)
  const contentType = readString(value.contentType, 40) || 'page'
  const rawUrl = readString(value.url, MAX_METADATA_URL_LENGTH)

  if (
    locale !== SCHOOLS_SEARCH_NAMESPACE ||
    !title ||
    !excerpt ||
    !rawUrl.startsWith('/') ||
    rawUrl.startsWith('//') ||
    rawUrl.includes('\\')
  ) {
    return null
  }

  try {
    const url = new URL(rawUrl, `${ACECORE_SCHOOLS_URL}/`)
    const firstPathSegment = url.pathname.split('/')[1]?.toLowerCase()
    if (
      url.origin !== ACECORE_SCHOOLS_URL ||
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
    : DEFAULT_SCHOOLS_SEARCH_MIN_SCORE
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

function logSchoolsSearchError(stage, errorCode) {
  console.error(
    JSON.stringify({
      event: 'alpha_schools_search_error',
      stage,
      errorCode,
    }),
  )
}
