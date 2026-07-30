export type AlphaLinkPatternResource = {
  terms: string[]
}

export function escapeRegExpLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function createAlphaInlineMarkdownPattern(
  baseSource: string,
  resources: AlphaLinkPatternResource[],
): RegExp {
  const terms = [
    ...new Set(
      resources
        .flatMap((resource) => resource.terms)
        .map((term) => term.trim())
        .filter(Boolean),
    ),
  ].sort((left, right) => right.length - left.length)
  const autoLinkSource =
    terms.length > 0
      ? `|(${terms.map(escapeRegExpLiteral).join('|')})`
      : '|(?!)'

  return new RegExp(`${baseSource}${autoLinkSource}`, 'g')
}
