export const SEO_TITLE_LENGTH = { min: 15, max: 70 } as const
export const SEO_DESCRIPTION_LENGTH = { min: 50, max: 160 } as const

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function countCharacters(value: string): number {
  return Array.from(value).length
}

function truncate(value: string, maxLength: number): string {
  const normalized = normalizeWhitespace(value)

  if (countCharacters(normalized) <= maxLength) return normalized

  return `${Array.from(normalized)
    .slice(0, maxLength - 1)
    .join('')
    .trimEnd()}…`
}

function titleCandidate(parts: string[]): string {
  return parts.filter(Boolean).join(' | ')
}

interface BuildSeoTitleOptions {
  title: string
  siteTitle: string
  titleContext: string
  isHome: boolean
}

export function buildSeoTitle({
  title,
  siteTitle,
  titleContext,
  isHome,
}: BuildSeoTitleOptions): string {
  const normalizedTitle = normalizeWhitespace(title)
  const normalizedSiteTitle = normalizeWhitespace(siteTitle)
  const normalizedContext = normalizeWhitespace(titleContext)
  const availableContextLength =
    SEO_TITLE_LENGTH.max -
    countCharacters(normalizedTitle) -
    countCharacters(normalizedSiteTitle) -
    6
  const candidates = isHome
    ? [
        titleCandidate([normalizedSiteTitle, normalizedContext]),
        titleCandidate([
          normalizedSiteTitle,
          truncate(
            normalizedContext,
            SEO_TITLE_LENGTH.max - countCharacters(normalizedSiteTitle) - 3,
          ),
        ]),
        normalizedSiteTitle,
      ]
    : [
        titleCandidate([
          normalizedTitle,
          normalizedSiteTitle,
          normalizedContext,
        ]),
        availableContextLength >= 8
          ? titleCandidate([
              normalizedTitle,
              normalizedSiteTitle,
              truncate(normalizedContext, availableContextLength),
            ])
          : '',
        titleCandidate([normalizedTitle, normalizedContext]),
        titleCandidate([normalizedTitle, normalizedSiteTitle]),
        normalizedTitle,
      ]

  return (
    candidates.find(
      (candidate) =>
        countCharacters(candidate) >= SEO_TITLE_LENGTH.min &&
        countCharacters(candidate) <= SEO_TITLE_LENGTH.max,
    ) ?? truncate(candidates[0], SEO_TITLE_LENGTH.max)
  )
}

interface BuildSeoDescriptionOptions {
  description: string
  shortDescriptionContext: string
}

export function buildSeoDescription({
  description,
  shortDescriptionContext,
}: BuildSeoDescriptionOptions): string {
  const normalizedDescription = normalizeWhitespace(description)
  const normalizedContext = normalizeWhitespace(shortDescriptionContext)
  const withContext =
    countCharacters(normalizedDescription) < SEO_DESCRIPTION_LENGTH.min &&
    normalizedContext &&
    !normalizedDescription.includes(normalizedContext)
      ? `${normalizedDescription} ${normalizedContext}`
      : normalizedDescription

  return truncate(withContext, SEO_DESCRIPTION_LENGTH.max)
}
