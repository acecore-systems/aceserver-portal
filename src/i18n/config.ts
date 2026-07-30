export const DEFAULT_LOCALE = 'ja'

export const LOCALES = [
  'ja',
  'en',
  'zh-cn',
  'es',
  'pt',
  'fr',
  'ko',
  'de',
  'ru',
] as const

export const TRANSLATED_LOCALES = LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
)

export type Locale = (typeof LOCALES)[number]
export type TranslatedLocale = Exclude<Locale, typeof DEFAULT_LOCALE>

export const HTML_LANG_BY_LOCALE: Record<Locale, string> = {
  ja: 'ja',
  en: 'en',
  'zh-cn': 'zh-CN',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  ko: 'ko',
  de: 'de',
  ru: 'ru',
}

export const OGP_LOCALE_BY_LOCALE: Record<Locale, string> = {
  ja: 'ja_JP',
  en: 'en_US',
  'zh-cn': 'zh_CN',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
  ko: 'ko_KR',
  de: 'de_DE',
  ru: 'ru_RU',
}

export const DATE_LOCALE_BY_LOCALE: Record<Locale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  'zh-cn': 'zh-CN',
  es: 'es-ES',
  pt: 'pt-BR',
  fr: 'fr-FR',
  ko: 'ko-KR',
  de: 'de-DE',
  ru: 'ru-RU',
}

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  'zh-cn': '简体中文',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  ko: '한국어',
  de: 'Deutsch',
  ru: 'Русский',
}

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale)
}

export function isTranslatedLocale(
  value: string | undefined,
): value is TranslatedLocale {
  return isLocale(value) && value !== DEFAULT_LOCALE
}

export function getLocaleFromPathname(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  return isTranslatedLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE
}

export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPathname(pathname)
  if (locale === DEFAULT_LOCALE) return pathname || '/'

  const prefix = `/${locale}`
  const unprefixed = pathname.slice(prefix.length)
  return unprefixed || '/'
}

function isExternalOrSpecialHref(href: string) {
  return (
    href.startsWith('#') ||
    href.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/iu.test(href)
  )
}

export function localizePath(locale: Locale, href: string): string {
  if (!href || isExternalOrSpecialHref(href)) return href

  const [pathnameAndQuery, hash = ''] = href.split('#', 2)
  const [pathname = '/', query = ''] = pathnameAndQuery.split('?', 2)

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/uploads/') ||
    pathname === '/favicon.ico'
  ) {
    return href
  }

  const unprefixed = stripLocalePrefix(pathname)
  const localized =
    locale === DEFAULT_LOCALE
      ? unprefixed
      : `/${locale}${unprefixed === '/' ? '/' : unprefixed}`

  return `${localized}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}

export function getAlternatePaths(pathname: string) {
  const unprefixed = stripLocalePrefix(pathname)
  return LOCALES.map((locale) => ({
    locale,
    href: localizePath(locale, unprefixed),
  }))
}
