import {
  collectCommunityStatus,
  retainLastGoodDiscord,
  LAST_GOOD_MAX_AGE_MS,
} from '../_lib/community-status.ts'

export async function onRequestGet(context) {
  // No caller-supplied URL, hostname, path or token is accepted.
  const cacheKey = new Request(
    new URL('/api/community-status', context.request.url),
  )
  const cache = typeof caches !== 'undefined' ? caches.default : undefined
  const cached = await cache?.match(cacheKey)
  if (cached) return cached
  const previousKey = new Request(
    new URL('/api/community-status/last-discord', context.request.url),
  )
  const [payload, previous] = await Promise.all([
    collectCommunityStatus({
      discordService: context.env?.DISCORD_COMMUNITY_SERVICE,
    }),
    cache?.match(previousKey).then(async (response) => {
      try {
        return response ? await response.json() : null
      } catch {
        return null
      }
    }),
  ])
  const current = payload.discord
  payload.discord = retainLastGoodDiscord(current, previous, payload.checkedAt)
  const response = Response.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=60',
      'X-Content-Type-Options': 'nosniff',
    },
  })
  if (cache) {
    context.waitUntil(cache.put(cacheKey, response.clone()))
    // The original observation time never advances during an unsuccessful refresh.
    if (current.state === 'available' || current.state === 'partial')
      context.waitUntil(
        cache.put(
          previousKey,
          Response.json(current, {
            headers: {
              'Cache-Control': `public, max-age=${LAST_GOOD_MAX_AGE_MS / 1000}`,
            },
          }),
        ),
      )
  }
  return response
}
