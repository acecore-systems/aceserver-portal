import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const linkItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  external: z.boolean().optional(),
})

const videoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  href: z.string().optional(),
  thumbnail: z.string().optional(),
  publishedAt: z.string().optional(),
})

const portalSectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    shoulderCopy: z.string().optional(),
    titleCopy: z.string(),
    text: z.string().optional(),
    ctaButton: linkItemSchema.optional(),
    backgroundImage: z.string().optional(),
  }),
  z.object({
    type: z.enum(['featureImageFull', 'featureImageRight', 'featureImageLeft']),
    titleCopy: z.string(),
    text: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
  z.object({
    type: z.literal('cta'),
    titleCopy: z.string(),
    text: z.string().optional(),
    ctaButton: linkItemSchema,
  }),
  z.object({
    type: z.literal('iframe'),
    src: z.string(),
    externalUrl: z.string().optional(),
    channelUrl: z.string().optional(),
    feedApiPath: z.string().optional(),
    title: z.string().optional(),
    fallbackImage: z.string().optional(),
    variant: z.enum(['map', 'video']).optional(),
    videos: z.array(videoItemSchema).optional(),
  }),
])

const pages = defineCollection({
  loader: glob({
    base: './src/content/pages',
    pattern: '*.json',
  }),
  schema: z.object({
    slug: z.string(),
    pageName: z.string(),
    kind: z.enum(['home', 'worldMap', 'embed']),
    hideFooter: z.boolean().optional(),
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
    }),
    sections: z.array(portalSectionSchema).min(1),
  }),
})

const worldEntrySchema = z.object({
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

const settings = defineCollection({
  loader: glob({
    base: './src/content/site',
    pattern: 'settings.json',
  }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    description: z.string(),
    siteUrl: z.string(),
    logo: z.string(),
    discordUrl: z.string(),
    wikiUrl: z.string(),
    worlds: z.array(worldEntrySchema),
  }),
})

const navigation = defineCollection({
  loader: glob({
    base: './src/content/site',
    pattern: 'navigation.json',
  }),
  schema: z.object({
    items: z.array(
      z.object({
        text: z.string(),
        href: z.string(),
        external: z.boolean().optional(),
        icon: z.string(),
      }),
    ),
  }),
})

const announcements = defineCollection({
  loader: glob({
    base: './src/content/site',
    pattern: 'announcements.json',
  }),
  schema: z.object({
    items: z.array(
      z.object({
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
      }),
    ),
  }),
})

export const collections = {
  announcements,
  navigation,
  pages,
  settings,
}
