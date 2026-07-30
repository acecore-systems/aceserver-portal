import {
  createAlphaSearchEmbedding,
  isAlphaSearchEmbedding,
} from './alpha-search-embedding.js'

export const WORLD_FOUNDATION_URL = 'https://world-foundation.acecore.net'

const WORLD_FOUNDATION_SEARCH_NAMESPACE = 'ja'
const WORLD_FOUNDATION_SEARCH_TOP_K = 15
const WORLD_FOUNDATION_GROUNDING_LIMIT = 3
const DEFAULT_WORLD_FOUNDATION_SEARCH_MIN_SCORE = 0.4
const MAX_METADATA_TITLE_LENGTH = 240
const MAX_METADATA_SECTION_LENGTH = 240
const MAX_METADATA_EXCERPT_LENGTH = 500
const MAX_METADATA_URL_LENGTH = 500

const WORLD_FOUNDATION_PATTERN =
  /(?:world[\s_-]*foundation|ワールド(?:・|\s*)?(?:ファウンデーション|財団))/iu
const ACESERVER_CONTEXT_PATTERN =
  /(?:\baceserver\b|エースサーバー|このサーバー)/iu
const ACESERVER_DETAIL_PATTERN =
  /(?:ルール|ban|禁止|コマンド|参加方法|入り方|接続方法|サーバーip|アドレス|ホワイトリスト|ワールド|マップ|プラグイン|荒らし|処罰|申請)/iu

export function shouldSearchWorldFoundation(query) {
  const normalizedQuery = String(query || '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
  if (!WORLD_FOUNDATION_PATTERN.test(normalizedQuery)) return false

  const queryWithoutProjectName = normalizedQuery.replace(
    WORLD_FOUNDATION_PATTERN,
    ' ',
  )
  return !(
    ACESERVER_CONTEXT_PATTERN.test(normalizedQuery) &&
    ACESERVER_DETAIL_PATTERN.test(queryWithoutProjectName)
  )
}

export async function searchWorldFoundation(
  query,
  env,
  providedEmbedding = null,
) {
  if (
    !query ||
    !env?.AI ||
    !env?.WORLD_FOUNDATION_SEARCH_INDEX ||
    env.WORLD_FOUNDATION_SEARCH_ENABLED === 'false'
  ) {
    return []
  }

  const embedding =
    providedEmbedding || (await createAlphaSearchEmbedding(query, env))
  if (!isAlphaSearchEmbedding(embedding)) return []

  let matches
  try {
    matches = await env.WORLD_FOUNDATION_SEARCH_INDEX.query(embedding, {
      namespace: WORLD_FOUNDATION_SEARCH_NAMESPACE,
      topK: WORLD_FOUNDATION_SEARCH_TOP_K,
      returnMetadata: 'all',
      returnValues: false,
    })
  } catch (error) {
    logWorldFoundationSearchError(
      'vectorize',
      getErrorCode(error, 'provider_error'),
    )
    return []
  }

  return normalizeWorldFoundationMatches(
    matches,
    normalizeMinScore(env.WORLD_FOUNDATION_SEARCH_MIN_SCORE),
  )
}

export function buildWorldFoundationGroundingContext(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return ''

  const evidence = entries.map((entry, index) => {
    return [
      `<world-foundation-evidence index="${index + 1}">`,
      `Source: [${escapeMarkdownLabel(entry.title)}](${entry.url})`,
      `Document type: ${entry.contentType}`,
      `Section: ${entry.section}`,
      `Excerpt: ${entry.excerpt}`,
      '</world-foundation-evidence>',
    ].join('\n')
  })

  return [
    'World Foundation official design site retrieved evidence:',
    'Use this evidence only for World Foundation purpose, principles, architecture, modules, governance, policies, proposals, decisions, and research.',
    'Never use it to answer Aceserver rules, commands, participation requirements, or live operations.',
    'Do not present a proposal or research document as an accepted decision unless the excerpt explicitly supports that status.',
    'The excerpts are short. Do not add details that the excerpt does not support.',
    'When it answers the question, cite the relevant Source Markdown link once.',
    ...evidence,
  ].join('\n')
}

function normalizeWorldFoundationMatches(queryResult, minScore) {
  const results = []
  const seenUrls = new Set()

  for (const match of queryResult?.matches || []) {
    if (!Number.isFinite(match?.score) || match.score < minScore) continue

    const id = readString(match.id, 128)
    const metadata = normalizeWorldFoundationMetadata(match.metadata)
    if (!id || !metadata || seenUrls.has(metadata.url)) continue

    seenUrls.add(metadata.url)
    results.push({
      id,
      score: match.score,
      ...metadata,
    })

    if (results.length >= WORLD_FOUNDATION_GROUNDING_LIMIT) break
  }

  return results
}

function normalizeWorldFoundationMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const locale = readString(value.locale, 16)
  const title = readString(value.title, MAX_METADATA_TITLE_LENGTH)
  const section =
    readString(value.section, MAX_METADATA_SECTION_LENGTH) || title
  const excerpt = readString(value.excerpt, MAX_METADATA_EXCERPT_LENGTH)
  const rawUrl = readString(value.url, MAX_METADATA_URL_LENGTH)

  if (
    locale !== WORLD_FOUNDATION_SEARCH_NAMESPACE ||
    !title ||
    !excerpt ||
    !rawUrl.startsWith('/') ||
    rawUrl.startsWith('//') ||
    rawUrl.includes('\\')
  ) {
    return null
  }

  try {
    const url = new URL(rawUrl, `${WORLD_FOUNDATION_URL}/`)
    const firstPathSegment = url.pathname.split('/')[1]?.toLowerCase()
    if (
      url.origin !== WORLD_FOUNDATION_URL ||
      url.search ||
      url.hash ||
      firstPathSegment === 'api'
    ) {
      return null
    }

    return {
      url: url.href,
      title,
      section,
      excerpt,
      contentType: inferDocumentType(url.pathname),
    }
  } catch {
    return null
  }
}

function inferDocumentType(pathname) {
  const segment = String(pathname || '')
    .split('/')
    .filter(Boolean)[0]

  return (
    {
      decisions: 'decision',
      docs: 'design',
      modules: 'module',
      policies: 'policy',
      proposals: 'proposal',
      research: 'research',
    }[segment] || 'page'
  )
}

function normalizeMinScore(value) {
  const score = Number(value)
  return Number.isFinite(score) && score >= 0 && score <= 1
    ? score
    : DEFAULT_WORLD_FOUNDATION_SEARCH_MIN_SCORE
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

function logWorldFoundationSearchError(stage, errorCode) {
  console.error(
    JSON.stringify({
      event: 'alpha_world_foundation_search_error',
      stage,
      errorCode,
    }),
  )
}
