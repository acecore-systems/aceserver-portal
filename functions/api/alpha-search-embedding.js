export const ALPHA_SEARCH_EMBEDDING_MODEL = '@cf/baai/bge-m3'
export const ALPHA_SEARCH_EMBEDDING_DIMENSIONS = 1024

export async function createAlphaSearchEmbedding(query, env) {
  if (!query || !env?.AI) return null

  let result
  try {
    result = await env.AI.run(ALPHA_SEARCH_EMBEDDING_MODEL, {
      text: [query],
      truncate_inputs: true,
    })
  } catch (error) {
    logEmbeddingError(getErrorCode(error, 'provider_error'))
    return null
  }

  const embedding = result?.data?.[0]
  if (!isAlphaSearchEmbedding(embedding)) {
    logEmbeddingError('invalid_embedding')
    return null
  }

  return embedding
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
