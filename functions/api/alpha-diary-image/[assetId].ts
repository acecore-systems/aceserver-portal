const ASSET_ID_PATTERN = /^asset_[a-z0-9]{24,64}$/u
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export async function onRequestGet(context) {
  const { env, params, request } = context
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    return new Response('Not found.', { status: 404 })
  }
  const assetId = typeof params.assetId === 'string' ? params.assetId : ''
  const service = env?.ALPHA_CHAT_SERVICE
  if (
    !ASSET_ID_PATTERN.test(assetId) ||
    !service ||
    typeof service.fetch !== 'function'
  ) {
    return new Response('Not found.', { status: 404 })
  }

  const headers = new Headers({
    Accept: 'image/avif,image/webp,image/png,image/jpeg',
  })
  const ifNoneMatch = request.headers.get('If-None-Match')
  if (ifNoneMatch && ifNoneMatch.length <= 100) {
    headers.set('If-None-Match', ifNoneMatch)
  }
  const cache = typeof caches === 'undefined' ? undefined : caches.default
  // An asset ID identifies immutable bytes; query strings and client headers
  // must not create separate copies of the same image in the edge cache.
  const cacheKey = new Request(
    new URL(`/api/alpha-diary-image/${assetId}`, request.url),
  )
  if (cache) {
    try {
      const cached = await cache.match(new Request(cacheKey, { headers }))
      if (cached && (cached.status === 200 || cached.status === 304)) {
        return imageResponse(cached, 'HIT')
      }
    } catch (error) {
      logCacheError('read', error)
    }
  }
  try {
    const serviceResponse = await service.fetch(
      new Request(
        `https://aceserver-alpha-chat.internal/v1/diary/assets/${assetId}`,
        { headers, method: 'GET' },
      ),
    )
    if (serviceResponse.status === 304) {
      return imageResponse(serviceResponse, 'BYPASS')
    }
    const contentType = serviceResponse.headers
      .get('Content-Type')
      ?.split(';', 1)[0]
      ?.trim()
      .toLowerCase()
    const contentLength = Number(serviceResponse.headers.get('Content-Length'))
    if (
      serviceResponse.status !== 200 ||
      !serviceResponse.body ||
      !contentType ||
      !ALLOWED_CONTENT_TYPES.includes(contentType) ||
      !Number.isInteger(contentLength) ||
      contentLength < 1 ||
      contentLength > MAX_IMAGE_BYTES
    ) {
      throw new Error('AlphaDiaryImageServicePayloadError')
    }
    const response = imageResponse(serviceResponse, cache ? 'MISS' : 'BYPASS')
    if (cache) {
      const cachedResponse = response.clone()
      const write = Promise.resolve()
        .then(() => cache.put(cacheKey, cachedResponse))
        .catch((error) => logCacheError('write', error))
      if (typeof context.waitUntil === 'function') context.waitUntil(write)
      else await write
    }
    return response
  } catch (error) {
    console.error(
      JSON.stringify({
        errorCode:
          error instanceof Error && error.name ? error.name : 'service_error',
        event: 'alpha_diary_image_service_error',
      }),
    )
    return new Response('Asset unavailable.', {
      headers: { 'Cache-Control': 'no-store' },
      status: 503,
    })
  }
}

function imageResponse(
  source: Response,
  cacheState: 'HIT' | 'MISS' | 'BYPASS',
) {
  const headers = copyAssetHeaders(source.headers)
  headers.set('X-Alpha-Diary-Image-Cache', cacheState)
  return new Response(source.status === 304 ? null : source.body, {
    headers,
    status: source.status,
  })
}

function logCacheError(operation: 'read' | 'write', error: unknown) {
  console.warn(
    JSON.stringify({
      errorCode: error instanceof Error ? error.name : 'cache_error',
      event: 'alpha_diary_image_cache_error',
      operation,
    }),
  )
}

function copyAssetHeaders(source) {
  const headers = new Headers({
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
  })
  for (const name of ['Content-Length', 'Content-Type', 'ETag']) {
    const value = source.get(name)
    if (value) headers.set(name, value)
  }
  return headers
}
