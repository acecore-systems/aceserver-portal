export const OPENAI_API_BASE_URL = 'https://api.openai.com/v1'
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-large'
export const OPENAI_EMBEDDING_DIMENSIONS = 1536

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000
const MAX_RESPONSE_BYTES = 4_000_000

export async function createOpenAiEmbeddings({
  apiKey,
  input,
  model = OPENAI_EMBEDDING_MODEL,
  dimensions = OPENAI_EMBEDDING_DIMENSIONS,
  fetchImpl = globalThis.fetch,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  if (
    model !== OPENAI_EMBEDDING_MODEL ||
    dimensions !== OPENAI_EMBEDDING_DIMENSIONS
  ) {
    throw namedError('OpenAIEmbeddingConfigurationError')
  }

  const inputs = Array.isArray(input) ? input : [input]
  if (
    inputs.length === 0 ||
    inputs.some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw namedError('OpenAIEmbeddingInputError')
  }

  const payload = await requestOpenAiJson({
    apiKey,
    endpoint: '/embeddings',
    body: {
      model,
      input,
      dimensions,
      encoding_format: 'float',
    },
    fetchImpl,
    requestTimeoutMs,
  })

  if (payload?.model !== model) {
    throw namedError('OpenAIEmbeddingModelError')
  }
  return extractOpenAiEmbeddingData(payload, inputs.length, dimensions)
}

export function extractOpenAiEmbeddingData(
  payload,
  expectedCount,
  dimensions = OPENAI_EMBEDDING_DIMENSIONS,
) {
  if (!Array.isArray(payload?.data) || payload.data.length !== expectedCount) {
    throw namedError('OpenAIEmbeddingCountError')
  }

  const ordered = Array(expectedCount)
  for (const entry of payload.data) {
    if (
      !Number.isInteger(entry?.index) ||
      entry.index < 0 ||
      entry.index >= expectedCount ||
      ordered[entry.index]
    ) {
      throw namedError('OpenAIEmbeddingIndexError')
    }

    const embedding = entry.embedding
    if (
      !Array.isArray(embedding) ||
      embedding.length !== dimensions ||
      embedding.some((value) => !Number.isFinite(value))
    ) {
      throw namedError('OpenAIEmbeddingDimensionsError')
    }
    ordered[entry.index] = embedding
  }

  if (ordered.some((embedding) => !embedding)) {
    throw namedError('OpenAIEmbeddingIndexError')
  }
  return ordered
}

async function requestOpenAiJson({
  apiKey,
  endpoint,
  body,
  fetchImpl,
  requestTimeoutMs,
}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    throw namedError('OpenAIConfigurationError')
  }
  if (typeof fetchImpl !== 'function') {
    throw namedError('OpenAIFetchConfigurationError')
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(namedError('OpenAIRequestTimeoutError')),
    requestTimeoutMs,
  )

  try {
    const response = await fetchImpl(`${OPENAI_API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      await response.body?.cancel().catch(() => {})
      throw namedError('OpenAIHttpError', response.status)
    }

    const contentLength = response.headers.get('Content-Length')
    if (contentLength !== null) {
      const normalizedLength = contentLength.trim()
      const parsedLength = Number(normalizedLength)
      if (
        !/^\d+$/u.test(normalizedLength) ||
        !Number.isSafeInteger(parsedLength) ||
        parsedLength > MAX_RESPONSE_BYTES
      ) {
        await response.body?.cancel().catch(() => {})
        throw namedError('OpenAIResponseSizeError')
      }
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw namedError('OpenAIResponseSizeError')
    }

    const decoder = new TextDecoder()
    let byteLength = 0
    let text = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        byteLength += value.byteLength
        if (byteLength > MAX_RESPONSE_BYTES) {
          await reader.cancel().catch(() => {})
          throw namedError('OpenAIResponseSizeError')
        }
        text += decoder.decode(value, { stream: true })
      }
      text += decoder.decode()
    } finally {
      reader.releaseLock()
    }

    if (!text) throw namedError('OpenAIResponseSizeError')

    try {
      return JSON.parse(text)
    } catch {
      throw namedError('OpenAIResponseJsonError')
    }
  } finally {
    clearTimeout(timeout)
  }
}

function namedError(
  name: string,
  status?: number,
): Error & { status?: number } {
  const error = new Error(name) as Error & { status?: number }
  error.name = name
  if (Number.isInteger(status)) error.status = status
  return error
}
