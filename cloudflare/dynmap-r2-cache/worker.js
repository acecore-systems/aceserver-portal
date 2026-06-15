const TARGETS = {
  'mc-map-main.acecore.net': { bucket: 'MAIN_BUCKET' },
  'mc-map-sigen.acecore.net': {
    bucket: 'SIGEN_BUCKET',
    defaultQuery: 'worldname=world&mapname=flat',
  },
  'mc-map-rpg.acecore.net': { bucket: 'RPG_BUCKET' },
  'mc-map-season-a.acecore.net': { bucket: 'SEASON_A_BUCKET' },
}

const TILE_PREFIX = 'tiles/'
const UPDATE_PREFIX = 'standalone/'
const TILE_CACHE_CONTROL = 'public, max-age=31536000, immutable'
const STATIC_CACHE_CONTROL = 'public, max-age=86400'
const DYNAMIC_CACHE_CONTROL = 'no-cache'

function targetForRequest(request, env) {
  const url = new URL(request.url)
  const target = TARGETS[url.hostname.toLowerCase()]

  if (!target) {
    return null
  }

  return {
    ...target,
    bucket: env[target.bucket],
  }
}

function defaultRedirect(request, target) {
  const url = new URL(request.url)

  if (!target.defaultQuery || url.search) {
    return null
  }

  const path = url.pathname || '/'

  if (path !== '/' && path !== '/index.html') {
    return null
  }

  url.search = target.defaultQuery

  return new Response(null, {
    status: 302,
    headers: {
      location: url.toString(),
      'cache-control': DYNAMIC_CACHE_CONTROL,
      'x-dynmap-r2-cache': 'REDIRECT',
    },
  })
}

function decodePathSegment(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function objectKeyForRequest(request) {
  const url = new URL(request.url)
  let key = decodePathSegment(
    url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname,
  )

  if (!key || key.endsWith('/')) {
    key += 'index.html'
  }

  return key
}

function cacheControlForKey(key) {
  if (key.startsWith(TILE_PREFIX)) {
    return TILE_CACHE_CONTROL
  }

  if (key.startsWith(UPDATE_PREFIX) || key === 'index.html') {
    return DYNAMIC_CACHE_CONTROL
  }

  return STATIC_CACHE_CONTROL
}

function contentTypeForKey(key) {
  if (key.endsWith('.html')) return 'text/html; charset=utf-8'
  if (key.endsWith('.js')) return 'application/javascript; charset=utf-8'
  if (key.endsWith('.css')) return 'text/css; charset=utf-8'
  if (key.endsWith('.json')) return 'application/json; charset=utf-8'
  if (key.endsWith('.png')) return 'image/png'
  if (key.endsWith('.webp')) return 'image/webp'
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg'

  return 'application/octet-stream'
}

function responseHeaders(object, key, state) {
  const headers = new Headers()
  object.writeHttpMetadata?.(headers)

  if (object.httpEtag) {
    headers.set('etag', object.httpEtag)
  }

  if (!headers.has('content-type')) {
    headers.set('content-type', contentTypeForKey(key))
  }

  headers.set('cache-control', cacheControlForKey(key))
  headers.set('x-dynmap-r2-cache', state)

  return headers
}

function isNotModified(request, object) {
  const ifNoneMatch = request.headers.get('if-none-match')

  if (ifNoneMatch && object.httpEtag) {
    const tags = ifNoneMatch.split(',').map((tag) => tag.trim())

    if (
      tags.includes('*') ||
      tags.includes(object.httpEtag) ||
      tags.includes(object.etag)
    ) {
      return true
    }
  }

  const ifModifiedSince = request.headers.get('if-modified-since')

  if (ifModifiedSince && object.uploaded) {
    const since = Date.parse(ifModifiedSince)

    if (!Number.isNaN(since) && object.uploaded.getTime() <= since) {
      return true
    }
  }

  return false
}

function missingResponse() {
  return new Response(null, {
    status: 404,
    headers: {
      'cache-control': DYNAMIC_CACHE_CONTROL,
      'content-type': 'text/plain; charset=utf-8',
      'x-dynmap-r2-cache': 'MISS',
    },
  })
}

export default {
  async fetch(request, env) {
    const target = targetForRequest(request, env)

    if (!target || !target.bucket) {
      return new Response('Dynmap R2 target is not configured for this host.', {
        status: 404,
        headers: { 'cache-control': DYNAMIC_CACHE_CONTROL },
      })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          allow: 'GET, HEAD',
          'cache-control': DYNAMIC_CACHE_CONTROL,
        },
      })
    }

    const redirect = defaultRedirect(request, target)

    if (redirect) {
      return redirect
    }

    const key = objectKeyForRequest(request)

    if (request.method === 'HEAD') {
      const object = await target.bucket.head(key)

      if (!object) {
        return missingResponse()
      }

      return new Response(null, {
        status: isNotModified(request, object) ? 304 : 200,
        headers: responseHeaders(object, key, 'HIT'),
      })
    }

    const object = await target.bucket.get(key)

    if (!object) {
      return missingResponse()
    }

    const headers = responseHeaders(object, key, 'HIT')

    if (isNotModified(request, object)) {
      return new Response(null, { status: 304, headers })
    }

    return new Response(object.body, { status: 200, headers })
  },
}
