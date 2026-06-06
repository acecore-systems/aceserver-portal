export function isExternalUrl(href: string): boolean {
  return /^https?:\/\//.test(href)
}

export function externalLinkAttrs(href: string, explicitExternal = false) {
  const external = explicitExternal || isExternalUrl(href)

  return external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {}
}
