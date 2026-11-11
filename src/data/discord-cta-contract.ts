export const CTA_PLACEMENTS = ['home', 'story', 'alpha'] as const
export const CTA_LOCALES = [
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
export type CtaPlacement = (typeof CTA_PLACEMENTS)[number]
export type CtaLocale = (typeof CTA_LOCALES)[number]
export type CtaMetric = { placement: CtaPlacement; locale: CtaLocale }

export function parseCtaMetric(value: unknown): CtaMetric | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).length !== 2 ||
    typeof record.placement !== 'string' ||
    typeof record.locale !== 'string' ||
    !CTA_PLACEMENTS.includes(record.placement as CtaPlacement) ||
    !CTA_LOCALES.includes(record.locale as CtaLocale)
  )
    return null
  return {
    placement: record.placement as CtaPlacement,
    locale: record.locale as CtaLocale,
  }
}
