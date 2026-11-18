export const ALPHA_SEARCH_EMBEDDING_MODEL = '@cf/baai/bge-m3'
export const ALPHA_SEARCH_EMBEDDING_DIMENSIONS = 1024

export const VOYAGE_SEARCH_EMBEDDING_MODEL = 'voyage-4-lite'

export function canUseAlphaSearchEmbedding(env) {
  const model = env?.SEARCH_EMBEDDING_MODEL || ALPHA_SEARCH_EMBEDDING_MODEL
  return model === VOYAGE_SEARCH_EMBEDDING_MODEL
    ? Boolean(env?.VOYAGE_EMBEDDER)
    : model === ALPHA_SEARCH_EMBEDDING_MODEL && Boolean(env?.AI)
}

export async function createAlphaSearchEmbedding(query, env, ai = env?.AI) {
  if (!query || !env) return null
  const configuredModel =
    env.SEARCH_EMBEDDING_MODEL || ALPHA_SEARCH_EMBEDDING_MODEL
  const configuredDimensions = Number(
    env.SEARCH_EMBEDDING_DIMENSIONS || ALPHA_SEARCH_EMBEDDING_DIMENSIONS,
  )
  if (
    ![ALPHA_SEARCH_EMBEDDING_MODEL, VOYAGE_SEARCH_EMBEDDING_MODEL].includes(
      configuredModel,
    ) ||
    configuredDimensions !== ALPHA_SEARCH_EMBEDDING_DIMENSIONS
  ) {
    logEmbeddingError('invalid_configuration')
    return null
  }
  if (configuredModel === VOYAGE_SEARCH_EMBEDDING_MODEL) {
    if (!env.VOYAGE_EMBEDDER) return null
    try {
      const response = await env.VOYAGE_EMBEDDER.fetch(
        'https://voyage-embeddings.internal/v1/embeddings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: VOYAGE_SEARCH_EMBEDDING_MODEL,
            input: [query],
            input_type: 'query',
            output_dimension: ALPHA_SEARCH_EMBEDDING_DIMENSIONS,
            output_dtype: 'float',
            truncation: false,
          }),
        },
      )
      if (!response.ok) throw new Error('provider_error')
      const payload = await response.json()
      if (
        payload?.model !== VOYAGE_SEARCH_EMBEDDING_MODEL ||
        !Array.isArray(payload.data) ||
        payload.data.length !== 1 ||
        payload.data[0]?.index !== 0 ||
        !isAlphaSearchEmbedding(payload.data[0]?.embedding)
      )
        throw new Error('invalid_embedding')
      return payload.data[0].embedding
    } catch {
      logEmbeddingError('provider_error')
      return null
    }
  }
  if (!ai) return null
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
