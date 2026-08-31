export const ALPHA_SEARCH_EMBEDDING_MODEL = '@cf/baai/bge-m3'
export const ALPHA_SEARCH_EMBEDDING_DIMENSIONS = 1024

export async function createAlphaSearchEmbedding(query, env, ai = env?.AI) {
  if (!query || !ai) return null
  const configuredModel =
    env.SEARCH_EMBEDDING_MODEL || ALPHA_SEARCH_EMBEDDING_MODEL
  const configuredDimensions = Number(
    env.SEARCH_EMBEDDING_DIMENSIONS || ALPHA_SEARCH_EMBEDDING_DIMENSIONS,
  )
  if (
    configuredModel !== ALPHA_SEARCH_EMBEDDING_MODEL ||
    configuredDimensions !== ALPHA_SEARCH_EMBEDDING_DIMENSIONS
  ) {
    logEmbeddingError('invalid_configuration')
    return null
  }

  try {
    const payload = await ai.run(ALPHA_SEARCH_EMBEDDING_MODEL, {
      text: [query],
      truncate_inputs: false,
    })
    return extractWorkersAiEmbeddingData(payload, 1)[0]
  } catch (error) {
    logEmbeddingError(getErrorCode(error, 'provider_error'))
    return null
  }
}

export function extractWorkersAiEmbeddingData(
  payload,
  expectedCount,
  dimensions = ALPHA_SEARCH_EMBEDDING_DIMENSIONS,
) {
  const data = payload?.data
  if (!Array.isArray(data) || data.length !== expectedCount) {
    throw namedError('WorkersAiEmbeddingCountError')
  }
  if (payload.pooling !== undefined && payload.pooling !== 'cls') {
    throw namedError('WorkersAiEmbeddingPoolingError')
  }
  if (
    payload.shape !== undefined &&
    (!Array.isArray(payload.shape) ||
      payload.shape.length !== 2 ||
      payload.shape[0] !== expectedCount ||
      payload.shape[1] !== dimensions)
  ) {
    throw namedError('WorkersAiEmbeddingShapeError')
  }

  return data.map((embedding) => {
    if (
      !Array.isArray(embedding) ||
      embedding.length !== dimensions ||
      embedding.some(
        (value) => typeof value !== 'number' || !Number.isFinite(value),
      )
    ) {
      throw namedError('WorkersAiEmbeddingDimensionsError')
    }
    return embedding
  })
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

function namedError(name) {
  const error = new Error(name)
  error.name = name
  return error
}

function logEmbeddingError(errorCode) {
  console.error(
    JSON.stringify({
      event: 'alpha_search_embedding_error',
      errorCode,
    }),
  )
}
