import {
  getSafePublicPathname,
  normalizeNetworkSearchResults,
  type NetworkSource,
} from './network-search-contract.js'

const LOCAL_SEARCH_TIMEOUT_MS = 5_000
const NETWORK_SEARCH_TIMEOUT_MS = 3_500
const PAGEFIND_TIMEOUT_MS = 3_500
const MAX_RESULT_COUNT = 5
const PAGEFIND_MODULE_URL = '/pagefind/pagefind.js'
const REQUEST_ID_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu

type SearchResult = {
  excerpt: string
  rank: number
  section: string
  sourceLabel?: string
  title: string
  url: string
}

export function initSiteSearch() {
  document
    .querySelectorAll<HTMLElement>('[data-site-search]')
    .forEach((root) => {
      if (root.dataset.searchBound === 'true') return
      root.dataset.searchBound = 'true'
      void runSearch(root)
    })
}

async function runSearch(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-search-query]')
  const status = root.querySelector<HTMLElement>('[data-search-status]')
  const localSection = root.querySelector<HTMLElement>(
    '[data-local-search-results]',
  )
  const localList = root.querySelector<HTMLOListElement>(
    '[data-local-search-list]',
  )
  const query = normalizeQuery(
    new URLSearchParams(window.location.search).get('q'),
  )
  const locale = root.dataset.locale || 'ja'

  if (input && !input.value) input.value = query
  if (!query || !status || !localSection || !localList) return

  status.textContent = root.dataset.loading || ''

  const semanticResults = await loadSemanticResults(query, locale)
  const localResults =
    semanticResults.length > 0
      ? semanticResults
      : await loadPagefindResults(query)

  appendResults(localList, localResults)
  if (localResults.length > 0) {
    localSection.hidden = false
    status.textContent = ''
  } else {
    status.textContent = root.dataset.noResults || ''
  }

  void loadNetworkResults(root, query)
}

async function loadSemanticResults(
  query: string,
  locale: string,
): Promise<SearchResult[]> {
  const controller = new AbortController()
  const timeout = window.setTimeout(
    () => controller.abort(),
    LOCAL_SEARCH_TIMEOUT_MS,
  )

  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Acecore-Search-Client': getSearchClientId(),
      },
      body: JSON.stringify({ query, locale }),
      signal: controller.signal,
    })
    if (!response.ok) return []

    return normalizeLocalResults(await response.json())
  } catch {
    return []
  } finally {
    window.clearTimeout(timeout)
  }
}

async function loadPagefindResults(query: string): Promise<SearchResult[]> {
  try {
    const pagefind = await withTimeout(
      import(/* @vite-ignore */ PAGEFIND_MODULE_URL),
      PAGEFIND_TIMEOUT_MS,
    )
    const search = await withTimeout(
      pagefind.search(query),
      PAGEFIND_TIMEOUT_MS,
    )
    const entries = await Promise.all(
      search.results
        .slice(0, MAX_RESULT_COUNT)
        .map((result: { data: () => Promise<unknown> }) =>
          withTimeout(result.data(), PAGEFIND_TIMEOUT_MS),
        ),
    )

    return entries
      .map((entry, index) => normalizePagefindResult(entry, index + 1))
      .filter((entry): entry is SearchResult => entry !== null)
  } catch {
    return []
  }
}

async function loadNetworkResults(root: HTMLElement, query: string) {
  const section = root.querySelector<HTMLElement>(
    '[data-network-search-results]',
  )
  const list = root.querySelector<HTMLOListElement>(
    '[data-network-search-list]',
  )
  const ownSource = root.dataset.ownSource as NetworkSource | undefined
  if (!section || !list || !ownSource) return

  const controller = new AbortController()
  const timeout = window.setTimeout(
    () => controller.abort(),
    NETWORK_SEARCH_TIMEOUT_MS,
  )

  try {
    const response = await fetch('https://acecore.net/api/network-search', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, locale: 'ja' }),
      signal: controller.signal,
    })
    if (!response.ok) return

    const results = normalizeNetworkSearchResults(
      await response.json(),
      ownSource,
    )
    if (results.length === 0) return

    appendResults(list, results, true)
    section.hidden = false
  } catch {
    // The related-sites section is intentionally non-blocking.
  } finally {
    window.clearTimeout(timeout)
  }
}

function normalizeLocalResults(payload: unknown): SearchResult[] {
  if (
    !isRecord(payload) ||
    payload.ok !== true ||
    !isStrictRequestId(payload.requestId) ||
    !Array.isArray(payload.results)
  ) {
    return []
  }

  const results: SearchResult[] = []
  const seenUrls = new Set<string>()

  for (const value of payload.results) {
    const result = normalizeLocalResult(value, results.length + 1)
    if (!result || seenUrls.has(result.url)) continue

    seenUrls.add(result.url)
    results.push(result)
    if (results.length >= MAX_RESULT_COUNT) break
  }

  return results
}

function normalizeLocalResult(
  value: unknown,
  fallbackRank: number,
): SearchResult | null {
  if (!isRecord(value)) return null

  const title = readText(value.title, 240)
  const section = readText(value.section, 240) || title
  const excerpt = readText(value.excerpt, 500)
  const url = normalizeLocalUrl(value.url)
  const rank = normalizeRank(value.rank, fallbackRank)
  if (!title || !excerpt || !url || !rank) return null

  return { title, section, excerpt, url, rank }
}

function normalizePagefindResult(
  value: unknown,
  rank: number,
): SearchResult | null {
  if (!isRecord(value) || !isRecord(value.meta)) return null

  const title = readPagefindText(value.meta.title, 240)
  const excerpt = readPagefindText(value.excerpt, 500)
  const url = normalizeLocalUrl(value.url)
  if (!title || !excerpt || !url) return null

  return { title, section: title, excerpt, url, rank }
}

function normalizeLocalUrl(value: unknown): string | null {
  return getSafePublicPathname(value)
}

function normalizeRank(value: unknown, fallbackRank: number): number | null {
  if (value === undefined && fallbackRank > 0) return fallbackRank
  return Number.isSafeInteger(value) && value > 0 && value <= 100 ? value : null
}

function isStrictRequestId(value: unknown): boolean {
  return typeof value === 'string' && REQUEST_ID_PATTERN.test(value)
}

function normalizeQuery(value: string | null): string {
  return readText(value, 160)
}

function readText(value: unknown, maximumLength: number): string {
  return typeof value === 'string'
    ? value
        .normalize('NFKC')
        .replace(/\s+/gu, ' ')
        .trim()
        .slice(0, maximumLength)
    : ''
}

function readPagefindText(value: unknown, maximumLength: number): string {
  return readText(
    typeof value === 'string' ? value.replace(/<[^>]*>/gu, ' ') : value,
    maximumLength,
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getSearchClientId(): string {
  const storageKey = 'acecore-search-client'

  try {
    const current = window.localStorage.getItem(storageKey)
    if (current) return current

    const created = crypto.randomUUID()
    window.localStorage.setItem(storageKey, created)
    return created
  } catch {
    return crypto.randomUUID()
  }
}

function appendResults(
  list: HTMLOListElement,
  results: SearchResult[],
  includeSource = false,
) {
  for (const result of results) {
    const item = document.createElement('li')
    const link = document.createElement('a')
    const excerpt = document.createElement('p')

    link.href = result.url
    link.textContent = result.title
    excerpt.textContent = result.excerpt
    item.append(link)

    if (includeSource && result.sourceLabel) {
      const source = document.createElement('span')
      source.className = 'site-search__source'
      source.textContent = result.sourceLabel
      item.append(source)
    }

    item.append(excerpt)
    list.append(item)
  }
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error('SearchTimeoutError'))
    }, milliseconds)

    promise.then(
      (value) => {
        window.clearTimeout(timeout)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timeout)
        reject(error)
      },
    )
  })
}
