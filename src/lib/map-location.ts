const MAP_HOST =
  /^https:\/\/mc-map-(?:main|sigen|rpg|lobby|rpg-sub|season-a|season-a-c|event)\.acecore\.net$/u
const MAP_ROUTE =
  /^\/world-map-(?:main|sigen|rpg|lobby|rpg-sub|season-a|season-a-c|event)\/$/u
const LOCATION_KEYS = ['worldname', 'mapname', 'zoom', 'x', 'y', 'z'] as const

// Only the location is forwarded. Player tracking, chat, arbitrary URLs and fragments are excluded.
export function mapLocationQuery(
  search: string,
  strict = false,
): string | null {
  if (!search || search.length > 512) return null
  const params = new URLSearchParams(search)
  if (
    strict &&
    [...params.keys()].some(
      (key) => !LOCATION_KEYS.includes(key as (typeof LOCATION_KEYS)[number]),
    )
  )
    return null
  if (LOCATION_KEYS.some((key) => params.getAll(key).length !== 1)) return null
  for (const key of ['worldname', 'mapname']) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/u.test(params.get(key) ?? '')) return null
  }
  if (!/^(?:[0-9]|10)$/u.test(params.get('zoom') ?? '')) return null
  for (const key of ['x', 'y', 'z']) {
    const value = params.get(key) ?? ''
    if (!/^-?\d{1,8}(?:\.\d{1,3})?$/u.test(value)) return null
    const limit = key === 'y' ? 2048 : 30_000_000
    if (!Number.isFinite(Number(value)) || Math.abs(Number(value)) > limit)
      return null
  }
  return new URLSearchParams(
    LOCATION_KEYS.map((key) => [key, params.get(key)!]),
  ).toString()
}

export function isGalleryMapLocation(href: string): boolean {
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('#'))
    return false
  const separator = href.indexOf('?')
  const pathname = href.slice(0, separator)
  const query = href.slice(separator + 1)
  return MAP_ROUTE.test(pathname) && Boolean(mapLocationQuery(query, true))
}

export function mapEmbedUrl(source: string, search: string): string | null {
  let url: URL
  try {
    url = new URL(source)
  } catch {
    return null
  }
  if (
    !MAP_HOST.test(url.origin) ||
    url.pathname !== '/' ||
    url.hash ||
    url.username ||
    url.password
  )
    return null
  // Keep the existing resource map's configured world/flat default.
  for (const [key, value] of url.searchParams) {
    if (
      !['worldname', 'mapname'].includes(key) ||
      url.searchParams.getAll(key).length !== 1 ||
      !/^[a-zA-Z0-9_-]{1,64}$/u.test(value)
    )
      return null
  }
  const query = mapLocationQuery(search)
  if (query) url.search = query
  return url.href
}
