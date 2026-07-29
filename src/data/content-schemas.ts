import { z } from 'zod'

const linkItemSchema = z
  .object({
    label: z.string(),
    href: z.string(),
    external: z.boolean().optional(),
  })
  .strict()

const videoItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    href: z.string().optional(),
    thumbnail: z.string().optional(),
    publishedAt: z.string().optional(),
  })
  .strict()

export const portalSectionSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('hero'),
      shoulderCopy: z.string().optional(),
      titleCopy: z.string(),
      text: z.string().optional(),
      ctaButton: linkItemSchema.optional(),
      backgroundImage: z.string().optional(),
    })
    .strict(),
  z
    .object({
      type: z.enum([
        'featureImageFull',
        'featureImageRight',
        'featureImageLeft',
      ]),
      titleCopy: z.string(),
      text: z.string().optional(),
      image: z.string(),
      imageAlt: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal('cta'),
      titleCopy: z.string(),
      text: z.string().optional(),
      ctaButton: linkItemSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal('iframe'),
      src: z.string(),
      externalUrl: z.string().optional(),
      channelUrl: z.string().optional(),
      feedApiPath: z.string().optional(),
      title: z.string().optional(),
      fallbackImage: z.string().optional(),
      variant: z.enum(['map', 'video']).optional(),
      videos: z.array(videoItemSchema).optional(),
    })
    .strict(),
])

export const portalPageSchema = z
  .object({
    slug: z.string(),
    pageName: z.string(),
    kind: z.enum(['home', 'worldMap', 'embed']),
    hideFooter: z.boolean().optional(),
    meta: z
      .object({
        title: z.string(),
        description: z.string(),
        ogImage: z.string().optional(),
      })
      .strict(),
    sections: z.array(portalSectionSchema).min(1),
  })
  .strict()

const worldEntrySchema = z
  .object({
    slug: z.string(),
    title: z.string(),
    href: z.string().optional(),
    image: z.string(),
    imageAlt: z.string(),
    icon: z.string(),
    tone: z.enum([
      'main',
      'resource',
      'rpg',
      'lobby',
      'season',
      'creative',
      'event',
    ]),
    statusLabel: z.string().optional(),
    description: z.string().optional(),
  })
  .strict()

export const portalSettingsSchema = z
  .object({
    title: z.string(),
    shortTitle: z.string(),
    description: z.string(),
    siteUrl: z.string(),
    logo: z.string(),
    logoAlt: z.string().min(1),
    discordUrl: z.string(),
    wikiUrl: z.string(),
    worlds: z.array(worldEntrySchema),
  })
  .strict()

export const portalNavigationSchema = z
  .object({
    items: z.array(
      z
        .object({
          text: z.string(),
          href: z.string(),
          external: z.boolean().optional(),
          icon: z.string(),
        })
        .strict(),
    ),
  })
  .strict()

export const portalAnnouncementsSchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z.string(),
          enabled: z.boolean().optional(),
          order: z.number().optional(),
          tone: z.enum(['brand', 'amber', 'emerald', 'slate']).optional(),
          icon: z.string().optional(),
          title: z.string(),
          text: z.string().optional(),
          href: z.string().optional(),
          linkLabel: z.string().optional(),
          external: z.boolean().optional(),
          startsAt: z.string().optional(),
          endsAt: z.string().optional(),
        })
        .strict(),
    ),
  })
  .strict()

const PAGE_PATHS = new Set([
  'src/content/pages/top.json',
  'src/content/pages/world-map.json',
  'src/content/pages/world-map-main.json',
  'src/content/pages/world-map-sigen.json',
  'src/content/pages/world-map-rpg.json',
  'src/content/pages/world-map-lobby.json',
  'src/content/pages/world-map-rpg-sub.json',
  'src/content/pages/world-map-season-a.json',
  'src/content/pages/world-map-season-a-c.json',
  'src/content/pages/world-map-event.json',
  'src/content/pages/youtube-search-aceserver.json',
])

const KNOWN_ROUTES = new Set(
  Array.from(PAGE_PATHS, (path) => {
    const slug = path.slice('src/content/pages/'.length, -'.json'.length)

    return slug === 'top' ? '/' : `/${slug}/`
  }),
)

type PortalContentResult =
  | { ok: true }
  | {
      ok: false
      message: string
    }

export function validatePortalContentFile(
  path: string,
  value: unknown,
): PortalContentResult {
  const schema = getSchema(path)

  if (!schema) {
    return { ok: false, message: 'CMS schemaが登録されていません。' }
  }

  const parsed = schema.safeParse(value)

  if (!parsed.success) {
    return { ok: false, message: 'CMS content schemaと一致しません。' }
  }

  if (PAGE_PATHS.has(path)) {
    return validatePage(path, parsed.data as z.infer<typeof portalPageSchema>)
  }

  if (path === 'src/content/site/settings.json') {
    return validateSettings(parsed.data as z.infer<typeof portalSettingsSchema>)
  }

  if (path === 'src/content/site/navigation.json') {
    return validateNavigation(
      parsed.data as z.infer<typeof portalNavigationSchema>,
    )
  }

  return validateAnnouncements(
    parsed.data as z.infer<typeof portalAnnouncementsSchema>,
  )
}

function getSchema(path: string): z.ZodType | null {
  if (PAGE_PATHS.has(path)) return portalPageSchema
  if (path === 'src/content/site/settings.json') return portalSettingsSchema
  if (path === 'src/content/site/navigation.json') return portalNavigationSchema
  if (path === 'src/content/site/announcements.json')
    return portalAnnouncementsSchema

  return null
}

function validatePage(
  path: string,
  page: z.infer<typeof portalPageSchema>,
): PortalContentResult {
  const expectedSlug = path.slice('src/content/pages/'.length, -'.json'.length)

  if (page.slug !== expectedSlug) {
    return { ok: false, message: 'slugはJSON filenameと一致させてください。' }
  }

  if (
    page.kind === 'embed' &&
    !page.sections.some(({ type }) => type === 'iframe')
  ) {
    return { ok: false, message: 'embed pageにはiframe sectionが必要です。' }
  }

  if (
    page.kind === 'worldMap' &&
    !page.sections.some(({ type }) => type === 'featureImageFull')
  ) {
    return {
      ok: false,
      message: 'worldMap pageにはfeatureImageFull sectionが必要です。',
    }
  }

  for (const section of page.sections) {
    if (
      (section.type === 'featureImageFull' ||
        section.type === 'featureImageRight' ||
        section.type === 'featureImageLeft') &&
      (!isNonEmptyString(section.image) || !isNonEmptyString(section.imageAlt))
    ) {
      return {
        ok: false,
        message: '画像sectionには空でないimageとimageAltが必要です。',
      }
    }
  }

  return { ok: true }
}

function validateSettings(
  settings: z.infer<typeof portalSettingsSchema>,
): PortalContentResult {
  if (!isNonEmptyString(settings.logoAlt)) {
    return { ok: false, message: 'logoAltは空にできません。' }
  }

  for (const world of settings.worlds) {
    if (
      !isNonEmptyString(world.slug) ||
      !isNonEmptyString(world.title) ||
      !isNonEmptyString(world.image) ||
      !isNonEmptyString(world.imageAlt)
    ) {
      return {
        ok: false,
        message: 'worldのslug、title、image、imageAltは空にできません。',
      }
    }

    const hrefError =
      world.href === undefined ? null : validateInternalHref(world.href)

    if (hrefError) return { ok: false, message: hrefError }
  }

  return { ok: true }
}

function validateNavigation(
  navigation: z.infer<typeof portalNavigationSchema>,
): PortalContentResult {
  for (const item of navigation.items) {
    if (!isNonEmptyString(item.text) || !isNonEmptyString(item.href)) {
      return {
        ok: false,
        message: 'navigationのtextとhrefは空にできません。',
      }
    }

    const hrefError = validateInternalHref(item.href)

    if (hrefError) return { ok: false, message: hrefError }
  }

  return { ok: true }
}

function validateAnnouncements(
  announcements: z.infer<typeof portalAnnouncementsSchema>,
): PortalContentResult {
  for (const item of announcements.items) {
    if (item.href === undefined) continue
    const hrefError = validateInternalHref(item.href)

    if (hrefError) return { ok: false, message: hrefError }
  }

  return { ok: true }
}

function validateInternalHref(value: string) {
  if (!isNonEmptyString(value)) return 'hrefは空にできません。'
  if (/^[a-z][a-z\d+.-]*:/iu.test(value) || value.startsWith('#')) return null

  if (!value.startsWith('/')) {
    return '内部hrefは/から始めてください。'
  }

  return KNOWN_ROUTES.has(value)
    ? null
    : '内部hrefは公開済みpage routeを指定してください。'
}

function isNonEmptyString(value: string) {
  return value.trim().length > 0
}
