import {
  createOpenAiEmbeddings,
  OPENAI_EMBEDDING_DIMENSIONS,
  OPENAI_EMBEDDING_MODEL,
} from './openai-api.ts'
import type {
  AlphaLoreStore,
  StoredAlphaLoreRevision,
} from './alpha-lore-store.ts'

export const ALPHA_LORE_VECTOR_NAMESPACE = 'alpha-canon-ja'
export const ALPHA_LORE_VECTOR_MIN_SCORE = 0.78

export type AlphaLoreVectorEnv = {
  ALPHA_LORE_INDEX?: VectorizeIndex
  ALPHA_LORE_VECTOR_SEARCH_ENABLED?: string
  OPENAI_API_KEY?: string
  OPENAI_EMBEDDING_DIMENSIONS?: string
  OPENAI_EMBEDDING_MODEL?: string
}

export function isAlphaLoreVectorEnabled(env: AlphaLoreVectorEnv): boolean {
  return Boolean(
    env?.ALPHA_LORE_INDEX && env.ALPHA_LORE_VECTOR_SEARCH_ENABLED === 'true',
  )
}

export async function retrieveRelevantAlphaLoreRevisions({
  env,
  fetchImpl = globalThis.fetch,
  question,
  store,
}: {
  env: AlphaLoreVectorEnv
  fetchImpl?: typeof globalThis.fetch
  question: string
  store: AlphaLoreStore
}): Promise<StoredAlphaLoreRevision[]> {
  if (isAlphaLoreVectorEnabled(env) && env.OPENAI_API_KEY) {
    try {
      const [embedding] = await createOpenAiEmbeddings({
        apiKey: env.OPENAI_API_KEY,
        dimensions: resolveEmbeddingDimensions(env),
        fetchImpl,
        input: question,
        model: env.OPENAI_EMBEDDING_MODEL || OPENAI_EMBEDDING_MODEL,
      })
      const matches = await env.ALPHA_LORE_INDEX!.query(embedding, {
        namespace: ALPHA_LORE_VECTOR_NAMESPACE,
        returnMetadata: 'none',
        returnValues: false,
        topK: 6,
      })
      const ids = matches.matches
        .filter((match) => match.score >= ALPHA_LORE_VECTOR_MIN_SCORE)
        .map((match) => match.id)
      if (ids.length > 0) {
        const revisions = await store.getRevisionsByIds(ids)
        if (revisions.length > 0) return revisions
      }
    } catch (error) {
      console.error(
        JSON.stringify({
          event: 'alpha_lore_vector_query_error',
          errorCode: getErrorCode(error),
        }),
      )
    }
  }

  const recentRevisions = await store.listRecentRevisions(12)
  return rankRecentRevisions(question, recentRevisions).slice(0, 6)
}

export async function syncAlphaLoreVectorOutbox({
  env,
  fetchImpl = globalThis.fetch,
  revisions,
  store,
}: {
  env: AlphaLoreVectorEnv
  fetchImpl?: typeof globalThis.fetch
  revisions?: StoredAlphaLoreRevision[]
  store: AlphaLoreStore
}): Promise<void> {
  if (!isAlphaLoreVectorEnabled(env) || !env.OPENAI_API_KEY) return

  const pendingRevisions = revisions?.length
    ? revisions.slice(0, 3)
    : await store.listPendingVectorRevisions(3)
  if (pendingRevisions.length === 0) return

  try {
    const embeddings = await createOpenAiEmbeddings({
      apiKey: env.OPENAI_API_KEY,
      dimensions: resolveEmbeddingDimensions(env),
      fetchImpl,
      input: pendingRevisions.map(buildAlphaLoreEmbeddingText),
      model: env.OPENAI_EMBEDDING_MODEL || OPENAI_EMBEDDING_MODEL,
    })
    await env.ALPHA_LORE_INDEX!.upsert(
      pendingRevisions.map((revision, index) => ({
        id: revision.id,
        metadata: {
          coverage_key: revision.coverage_key,
          era: revision.era,
          revision: revision.revision,
        },
        namespace: ALPHA_LORE_VECTOR_NAMESPACE,
        values: embeddings[index],
      })),
    )
    const syncedAt = new Date()
    await Promise.all(
      pendingRevisions.map((revision) =>
        store.markVectorSynced(revision.id, syncedAt),
      ),
    )
  } catch (error) {
    const errorCode = getErrorCode(error)
    const retryAt = new Date(Date.now() + 5 * 60_000)
    await Promise.allSettled(
      pendingRevisions.map((revision) =>
        store.markVectorFailed(revision.id, errorCode, retryAt),
      ),
    )
    console.error(
      JSON.stringify({
        event: 'alpha_lore_vector_sync_error',
        errorCode,
      }),
    )
  }
}

export function buildAlphaLoreEmbeddingText(
  revision: StoredAlphaLoreRevision,
): string {
  const factLines = revision.facts.map(
    (fact) => `${fact.fact_key}: ${fact.value_ja}`,
  )
  return [
    `coverage: ${revision.coverage_key}`,
    `era: ${revision.era}`,
    `title: ${revision.title_ja}`,
    `summary: ${revision.summary_ja}`,
    `body: ${revision.body_ja}`,
    ...factLines,
  ].join('\n')
}

function rankRecentRevisions(
  question: string,
  revisions: StoredAlphaLoreRevision[],
): StoredAlphaLoreRevision[] {
  const queryGrams = createCharacterGrams(normalizeSearchText(question), 2)
  return revisions
    .map((revision) => {
      const document = normalizeSearchText(
        [
          revision.coverage_key,
          revision.title_ja,
          revision.summary_ja,
          revision.body_ja,
          ...revision.facts.map((fact) => fact.value_ja),
        ].join(' '),
      )
      const documentGrams = createCharacterGrams(document, 2)
      let overlap = 0
      for (const gram of queryGrams) {
        if (documentGrams.has(gram)) overlap += 1
      }
      return {
        revision,
        score: queryGrams.size > 0 ? overlap / queryGrams.size : 0,
      }
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.revision.revision - left.revision.revision,
    )
    .map(({ revision }) => revision)
}

function normalizeSearchText(value: string): string {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
}

function createCharacterGrams(value: string, size: number): Set<string> {
  const characters = [...value]
  const grams = new Set<string>()
  for (let index = 0; index <= characters.length - size; index += 1) {
    grams.add(characters.slice(index, index + size).join(''))
  }
  return grams
}

function resolveEmbeddingDimensions(env: AlphaLoreVectorEnv): number {
  const dimensions = Number(
    env.OPENAI_EMBEDDING_DIMENSIONS || OPENAI_EMBEDDING_DIMENSIONS,
  )
  return Number.isInteger(dimensions) ? dimensions : OPENAI_EMBEDDING_DIMENSIONS
}

function getErrorCode(error: unknown): string {
  return error instanceof Error && error.name ? error.name : 'provider_error'
}
