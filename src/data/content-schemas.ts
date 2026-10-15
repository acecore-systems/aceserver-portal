import { z } from 'zod'

const linkItemSchema = z
  .object({
    label: z.string(),
    href: z.string(),
    external: z.boolean().optional(),
  })
  .strict()

const safeHttpsUrl = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  }, 'HTTPS URLを指定してください。')
const communitySchema = z
  .object({
    title: z.string().trim().min(1),
    intro: z.string().trim().min(1),
    mapWorld: z.enum([
      'main',
      'resource',
      'rpg',
      'lobby',
      'rpg-sub',
      'season-a',
      'season-a-c',
      'event',
    ]),
    gallery: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/u),
            title: z.string().trim().min(1),
            text: z.string().trim().min(1),
            image: z
              .string()
              .regex(/^\/uploads\/[a-zA-Z0-9_./-]+$/u)
              .refine((value) => !value.includes('..')),
            imageAlt: z.string().trim().min(1),
            context: z.enum(['archive', 'current']),
            periodLabel: z.string().trim().min(1),
            href: z.string().optional(),
          })
          .strict()
          .refine(
            (item) => item.context !== 'archive' || !item.href,
            '過去の風景には現在の地図へのリンクを設定できません。',
          ),
      )
      .max(8),
    events: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/u),
            title: z.string().trim().min(1),
            text: z.string().trim().min(1),
            startsAt: z.iso.datetime({ offset: true }),
            endsAt: z.iso.datetime({ offset: true }),
            href: safeHttpsUrl,
          })
          .strict()
          .refine(
            (event) => Date.parse(event.endsAt) > Date.parse(event.startsAt),
            '終了は開始より後にしてください。',
          ),
      )
      .max(12),
    xPosts: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/u),
            label: z.string().trim().min(1),
            url: safeHttpsUrl.refine((value) =>
              /^https:\/\/x\.com\/acecores\/status\/[0-9]+$/iu.test(value),
            ),
            publishedAt: z.iso.datetime({ offset: true }),
          })
          .strict(),
      )
      .max(4),
  })
  .strict()
  .superRefine((community, context) => {
    for (const key of ['gallery', 'events', 'xPosts'] as const) {
      if (
        new Set(community[key].map(({ id }) => id)).size !==
        community[key].length
      ) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: 'IDは重複できません。',
        })
      }
    }
  })

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
      title: z.string().optional(),
      fallbackImage: z.string().optional(),
      variant: z.enum(['map', 'video']).optional(),
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
    community: communitySchema.optional(),
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

KNOWN_ROUTES.add('/stories/')
KNOWN_ROUTES.add('/alpha-diary/')
KNOWN_ROUTES.add('/skin-maker/')

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

  if (page.community) {
    if (page.kind !== 'home')
      return { ok: false, message: 'communityはトップページ専用です。' }
    for (const item of page.community.gallery) {
      if (!item.href) continue
      const error = validateInternalHref(item.href)
      if (error || !item.href.startsWith('/'))
        return {
          ok: false,
          message: error ?? 'galleryは内部ページへリンクしてください。',
        }
    }
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
