import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

import {
  portalAnnouncementsSchema,
  portalNavigationSchema,
  portalPageSchema,
  portalSettingsSchema,
} from './data/content-schemas'

const pages = defineCollection({
  loader: glob({
    base: './src/content/pages',
    pattern: '*.json',
  }),
  schema: portalPageSchema,
})

const settings = defineCollection({
  loader: glob({
    base: './src/content/site',
    pattern: 'settings.json',
  }),
  schema: portalSettingsSchema,
})

const navigation = defineCollection({
  loader: glob({
    base: './src/content/site',
    pattern: 'navigation.json',
  }),
  schema: portalNavigationSchema,
})

const announcements = defineCollection({
  loader: glob({
    base: './src/content/site',
    pattern: 'announcements.json',
  }),
  schema: portalAnnouncementsSchema,
})

const storySchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    translationOf: z.string().trim().min(1).optional(),
    sourceHash: z
      .string()
      .regex(/^sha256:[a-f0-9]{64}$/u)
      .optional(),
    date: z.coerce.date(),
    author: z.string().trim().min(1),
    tags: z.array(z.string().trim().min(1)).default([]),
    image: z.string().trim().min(1).optional(),
    imageAlt: z.string().trim().min(1).optional(),
    relatedStories: z.array(z.string().trim().min(1)).max(4).default([]),
    relatedPages: z.array(z.string().trim().min(1)).max(3).default([]),
  })
  .refine(({ image, imageAlt }) => Boolean(image) === Boolean(imageAlt), {
    message: 'imageとimageAltは両方を指定してください。',
    path: ['imageAlt'],
  })

const stories = defineCollection({
  loader: glob({
    base: './src/content/stories',
    pattern: '**/*.{md,mdx}',
  }),
  schema: storySchema,
})

export const collections = {
  announcements,
  navigation,
  pages,
  settings,
  stories,
}
