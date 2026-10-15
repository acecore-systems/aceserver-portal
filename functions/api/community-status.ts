import { collectCommunityStatus } from '../_lib/community-status.ts'

export async function onRequestGet(context) {
  // No caller-supplied URL, hostname, path or token is accepted.
  const cacheKey = new Request(
    new URL('/api/community-status', context.request.url),
  )
  const cache = typeof caches !== 'undefined' ? caches.default : undefined
  const cached = await cache?.match(cacheKey)
  if (cached) return cached
  const payload = await collectCommunityStatus()
  const response = Response.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=60',
      'X-Content-Type-Options': 'nosniff',
    },
  })
  if (cache) context.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
