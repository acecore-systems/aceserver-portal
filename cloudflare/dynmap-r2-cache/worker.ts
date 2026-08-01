type BucketBinding =
  | 'MAIN_BUCKET'
  | 'SIGEN_BUCKET'
  | 'RPG_BUCKET'
  | 'LOBBY_BUCKET'
  | 'RPG_SUB_BUCKET'
  | 'SEASON_A_BUCKET'
  | 'SEASON_A_C_BUCKET'
  | 'EVENT_BUCKET'

type Target = {
  bucket: BucketBinding
  canonicalWorldName?: string
  defaultQuery?: string
  legacyWorldName?: string
}

type ResolvedTarget = Omit<Target, 'bucket'> & { bucket: R2Bucket }

const TARGETS: Record<string, Target> = {
  'mc-map-main.acecore.net': { bucket: 'MAIN_BUCKET' },
  'mc-map-sigen.acecore.net': {
    bucket: 'SIGEN_BUCKET',
    defaultQuery: 'worldname=world&mapname=flat',
    legacyWorldName: 'sigen',
    canonicalWorldName: 'world',
  },
  'mc-map-rpg.acecore.net': { bucket: 'RPG_BUCKET' },
  'mc-map-lobby.acecore.net': { bucket: 'LOBBY_BUCKET' },
  'mc-map-rpg-sub.acecore.net': { bucket: 'RPG_SUB_BUCKET' },
  'mc-map-season-a.acecore.net': { bucket: 'SEASON_A_BUCKET' },
  'mc-map-season-a-c.acecore.net': { bucket: 'SEASON_A_C_BUCKET' },
  'mc-map-event.acecore.net': { bucket: 'EVENT_BUCKET' },
}

const TILE_PREFIX = 'tiles/'
const UPDATE_PREFIX = 'standalone/'
const TILE_CACHE_CONTROL = 'public, max-age=31536000, immutable'
const STATIC_CACHE_CONTROL = 'public, max-age=86400'
const DYNAMIC_CACHE_CONTROL = 'no-cache'
const SEARCH_ROBOTS_DIRECTIVE = 'noindex, follow'
const ROBOTS_TXT = `User-agent: *
Allow: /
`

function targetForRequest(request: Request, env: Env): ResolvedTarget | null {
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

function canonicalRedirect(
  request: Request,
  target: Pick<
    Target,
    'canonicalWorldName' | 'defaultQuery' | 'legacyWorldName'
  >,
): Response | null {
  const url = new URL(request.url)
  const path = url.pathname || '/'

  if (target.legacyWorldName && target.canonicalWorldName) {
    const worldName = url.searchParams.get('worldname')

    if (worldName === target.legacyWorldName) {
      url.searchParams.set('worldname', target.canonicalWorldName)

      return new Response(null, {
        status: 302,
        headers: {
          location: url.toString(),
          'cache-control': DYNAMIC_CACHE_CONTROL,
          'x-dynmap-r2-cache': 'REDIRECT',
        },
      })
    }
  }

  if (!target.defaultQuery || url.search) {
    return null
  }

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

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function objectKeyForRequest(request: Request): string {
  const url = new URL(request.url)
  let key = decodePathSegment(
    url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname,
  )

  if (!key || key.endsWith('/')) {
    key += 'index.html'
  }

  return key
}

function cacheControlForKey(key: string): string {
  if (key.startsWith(TILE_PREFIX)) {
    return TILE_CACHE_CONTROL
  }

  if (key.startsWith(UPDATE_PREFIX) || key === 'index.html') {
    return DYNAMIC_CACHE_CONTROL
  }

  return STATIC_CACHE_CONTROL
}

function contentTypeForKey(key: string): string {
  if (key.endsWith('.html')) return 'text/html; charset=utf-8'
  if (key.endsWith('.js')) return 'application/javascript; charset=utf-8'
  if (key.endsWith('.css')) return 'text/css; charset=utf-8'
  if (key.endsWith('.json')) return 'application/json; charset=utf-8'
  if (key.endsWith('.png')) return 'image/png'
  if (key.endsWith('.webp')) return 'image/webp'
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg'

  return 'application/octet-stream'
}

function responseHeaders(object: R2Object, key: string, state: 'HIT'): Headers {
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

function isNotModified(request: Request, object: R2Object): boolean {
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

function missingResponse(): Response {
  return new Response(null, {
    status: 404,
    headers: {
      'cache-control': DYNAMIC_CACHE_CONTROL,
      'content-type': 'text/plain; charset=utf-8',
      'x-dynmap-r2-cache': 'MISS',
    },
  })
}

function robotsResponse(request: Request): Response | null {
  const url = new URL(request.url)

  if (url.pathname !== '/robots.txt') {
    return null
  }

  return new Response(request.method === 'HEAD' ? null : ROBOTS_TXT, {
    status: 200,
    headers: {
      'cache-control': STATIC_CACHE_CONTROL,
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}

function withSearchRobotsDirective(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('x-robots-tag', SEARCH_ROBOTS_DIRECTIVE)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
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

  const robots = robotsResponse(request)

  if (robots) {
    return robots
  }

  const redirect = canonicalRedirect(request, target)

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
}

const worker: ExportedHandler<Env> = {
  async fetch(request, env): Promise<Response> {
    const response = await handleRequest(request, env)
    return withSearchRobotsDirective(response)
  },
}

export default worker
