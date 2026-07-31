export type NetworkSource =
  'acecore' | 'systems' | 'schools' | 'wiki' | 'portal' | 'world-foundation'

export type NetworkSearchResult = {
  excerpt: string
  rank: number
  section: string
  sourceLabel: string
  title: string
  url: string
}

export const NETWORK_SOURCES: Readonly<
  Record<NetworkSource, { label: string; origin: string }>
>

export function getSafePublicPathname(value: unknown): string | null

export function normalizeNetworkSearchResults(
  payload: unknown,
  ownSource: NetworkSource,
): NetworkSearchResult[]
