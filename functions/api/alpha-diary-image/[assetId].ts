const ASSET_ID_PATTERN = /^asset_[a-z0-9]{24,64}$/u
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export async function onRequestGet({ env, params, request }) {
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
  try {
    const serviceResponse = await service.fetch(
      new Request(
        `https://aceserver-alpha-chat.internal/v1/diary/assets/${assetId}`,
        { headers, method: 'GET' },
      ),
    )
    if (serviceResponse.status === 304) {
      return new Response(null, {
        headers: copyAssetHeaders(serviceResponse.headers),
        status: 304,
      })
    }
    const contentType = serviceResponse.headers
      .get('Content-Type')
      ?.split(';', 1)[0]
      ?.trim()
      .toLowerCase()
    const contentLength = Number(serviceResponse.headers.get('Content-Length'))
    if (
      !serviceResponse.ok ||
      !serviceResponse.body ||
      !contentType ||
      !ALLOWED_CONTENT_TYPES.includes(contentType) ||
      !Number.isInteger(contentLength) ||
      contentLength < 1 ||
      contentLength > MAX_IMAGE_BYTES
    ) {
      throw new Error('AlphaDiaryImageServicePayloadError')
    }
    return new Response(serviceResponse.body, {
      headers: copyAssetHeaders(serviceResponse.headers),
      status: 200,
    })
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
