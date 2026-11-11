import { parseCtaMetric } from '../../src/data/discord-cta-contract.ts'

export async function onRequestPost({
  request,
  env,
}: {
  request: Request
  env: { DISCORD_CTA_METRICS?: AnalyticsEngineDataset }
}) {
  const headers = { 'Cache-Control': 'no-store' }
  const origin = request.headers.get('Origin')
  const sameOrigin = origin === new URL(request.url).origin
  const nullOriginFromSameSite =
    origin === 'null' && request.headers.get('Sec-Fetch-Site') === 'same-origin'
  if (!sameOrigin && !nullOriginFromSameSite)
    return new Response(null, { status: 403, headers })
  if (
    request.headers.get('Content-Type')?.split(';')[0].trim() !==
      'application/json' ||
    !request.body
  )
    return new Response(null, { status: 400, headers })
  const reader = request.body.getReader()
  let text = ''
  let size = 0
  try {
    const decoder = new TextDecoder()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 128) {
        await reader.cancel()
        return new Response(null, { status: 400, headers })
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
    let input: unknown
    try {
      input = JSON.parse(text)
    } catch {
      return new Response(null, { status: 400, headers })
    }
    const metric = parseCtaMetric(input)
    if (!metric) return new Response(null, { status: 400, headers })
    if (!env.DISCORD_CTA_METRICS)
      return new Response(null, { status: 503, headers })
    env.DISCORD_CTA_METRICS.writeDataPoint({
      indexes: [metric.locale],
      blobs: [metric.placement, metric.locale],
      doubles: [1],
    })
    return new Response(null, { status: 204, headers })
  } catch {
    return new Response(null, { status: 503, headers })
  }
}
