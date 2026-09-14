import { isAllowedRequestOrigin } from './alpha-chat.ts'
import { readDiaryMetric } from './alpha-diary-metric-contract.ts'

export async function onRequestPost({ request, env }) {
  if (
    request.headers.get('Origin') !== new URL(request.url).origin ||
    !isAllowedRequestOrigin(request)
  )
    return new Response(null, { status: 403 })
  const metric = await readDiaryMetric(request)
  if (!metric) return new Response(null, { status: 400 })
  if (!env?.ALPHA_CHAT_SERVICE) return new Response(null, { status: 503 })
  try {
    const response = await env.ALPHA_CHAT_SERVICE.fetch(
      new Request('https://aceserver-alpha-chat.internal/v1/diary/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }),
    )
    if (response.body) await response.body.cancel()
    return new Response(null, {
      status: response.status === 204 ? 204 : 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return new Response(null, { status: 503 })
  }
}
