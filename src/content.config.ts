import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'

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

export const collections = {
  announcements,
  navigation,
  pages,
  settings,
}
