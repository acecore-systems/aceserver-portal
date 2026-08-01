import {
  createOpenAiEmbeddings,
  OPENAI_EMBEDDING_DIMENSIONS,
  OPENAI_EMBEDDING_MODEL,
} from './openai-api.ts'

export const ALPHA_SEARCH_EMBEDDING_MODEL = OPENAI_EMBEDDING_MODEL
export const ALPHA_SEARCH_EMBEDDING_DIMENSIONS = OPENAI_EMBEDDING_DIMENSIONS

export async function createAlphaSearchEmbedding(
  query,
  env,
  fetchImpl = globalThis.fetch,
) {
  if (!query || !env?.OPENAI_API_KEY) return null
  const configuredModel =
    env.OPENAI_EMBEDDING_MODEL || ALPHA_SEARCH_EMBEDDING_MODEL
  const configuredDimensions = Number(
    env.OPENAI_EMBEDDING_DIMENSIONS || ALPHA_SEARCH_EMBEDDING_DIMENSIONS,
  )
  if (
    configuredModel !== ALPHA_SEARCH_EMBEDDING_MODEL ||
    configuredDimensions !== ALPHA_SEARCH_EMBEDDING_DIMENSIONS
  ) {
    logEmbeddingError('invalid_configuration')
    return null
  }

  try {
    const [embedding] = await createOpenAiEmbeddings({
      apiKey: env.OPENAI_API_KEY,
      input: query,
      model: configuredModel,
      dimensions: configuredDimensions,
      fetchImpl,
    })
    return embedding
  } catch (error) {
    logEmbeddingError(getErrorCode(error, 'provider_error'))
    return null
  }
}

export function isAlphaSearchEmbedding(value) {
  return Boolean(
    Array.isArray(value) &&
    value.length === ALPHA_SEARCH_EMBEDDING_DIMENSIONS &&
    value.every((entry) => Number.isFinite(entry)),
  )
}

function getErrorCode(error, fallback) {
  return error instanceof Error && error.name ? error.name : fallback
}

function logEmbeddingError(errorCode) {
  console.error(
    JSON.stringify({
      event: 'alpha_search_embedding_error',
      errorCode,
    }),
  )
}
