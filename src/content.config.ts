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

const stories = defineCollection({
  loader: glob({
    base: './src/content/stories',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = {
  announcements,
  navigation,
  pages,
  settings,
  stories,
}
