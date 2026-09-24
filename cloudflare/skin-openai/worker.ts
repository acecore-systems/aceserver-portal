type Env = { OPENAI_API_KEY_STORE?: { get(): Promise<string> } }

const MAX_BODY_BYTES = 1_000_000
const MAX_RESPONSE_BYTES = 512_000

function isContent(value: unknown): boolean {
  if (typeof value === 'string') return value.length <= 30_000
  if (!Array.isArray(value) || value.length < 1 || value.length > 3)
    return false
  return value.every((item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false
    const part = item as Record<string, unknown>
    if (part.type === 'text')
      return typeof part.text === 'string' && part.text.length <= 30_000
    if (part.type !== 'image_url') return false
    const image = part.image_url
    return (
      !!image &&
      typeof image === 'object' &&
      !Array.isArray(image) &&
      typeof (image as Record<string, unknown>).url === 'string' &&
      (image as { url: string }).url.startsWith('data:image/png;base64,') &&
      (image as { url: string }).url.length <= 900_000
    )
  })
}

function isSkinRequest(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const body = value as Record<string, unknown>
  const messages = body.messages
  return (
    Object.keys(body).every((key) =>
      [
        'model',
        'messages',
        'max_completion_tokens',
        'reasoning_effort',
        'store',
        'stream',
      ].includes(key),
    ) &&
    body.model === 'gpt-6-luna' &&
    body.max_completion_tokens === 12_000 &&
    body.reasoning_effort === 'low' &&
    body.store === false &&
    body.stream === false &&
    Array.isArray(messages) &&
    messages.length === 1 &&
    messages[0]?.role === 'user' &&
    isContent(messages[0]?.content)
  )
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (
      request.method !== 'POST' ||
      new URL(request.url).pathname !== '/v1/chat'
    )
      return new Response(null, { status: 404 })
    if (
      request.headers.get('content-type') !== 'application/json' ||
      Number(request.headers.get('content-length')) > MAX_BODY_BYTES
    )
      return new Response(null, { status: 400 })
    const body = await request.text()
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES)
      return new Response(null, { status: 413 })
    let parsed: unknown
    try {
      parsed = JSON.parse(body)
    } catch {
      return new Response(null, { status: 400 })
    }
    if (!isSkinRequest(parsed)) return new Response(null, { status: 400 })

    let apiKey: string
    try {
      apiKey = (await env.OPENAI_API_KEY_STORE?.get())?.trim() || ''
    } catch {
      apiKey = ''
    }
    if (!apiKey) return new Response(null, { status: 503 })

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body,
          signal: AbortSignal.timeout(240_000),
        },
      )
      if (!response.ok) {
        await response.body?.cancel()
        return new Response(null, { status: 502 })
      }
      const text = await response.text()
      if (text.length > MAX_RESPONSE_BYTES)
        return new Response(null, { status: 502 })
      return new Response(text, {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      })
    } catch {
      return new Response(null, { status: 502 })
    }
  },
} satisfies ExportedHandler<Env>
