import { getCollection } from 'astro:content'
import type { PortalPage } from '../types'

const [settingsEntries, navigationEntries, announcementEntries, pageEntries] =
  await Promise.all([
    getCollection('settings'),
    getCollection('navigation'),
    getCollection('announcements'),
    getCollection('pages'),
  ])

function getSingleEntry<T>(entries: T[], collectionName: string): T {
  if (entries.length !== 1) {
    throw new Error(
      `Expected exactly one ${collectionName} content entry, found ${entries.length}.`,
    )
  }

  return entries[0]
}

export const settings = getSingleEntry(settingsEntries, 'settings').data
export const navigation = getSingleEntry(navigationEntries, 'navigation').data
  .items
export const pages = pageEntries
  .map((entry) => entry.data)
  .sort((a, b) => a.slug.localeCompare(b.slug))

export const announcements = getSingleEntry(
  announcementEntries,
  'announcements',
)
  .data.items.filter((announcement) => announcement.enabled !== false)
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))

export function getPageBySlug(slug: string): PortalPage | undefined {
  return pages.find((page) => page.slug === slug)
}

export function getHomePage(): PortalPage {
  const page = getPageBySlug('top')

  if (!page) {
    throw new Error('Home page content is missing.')
  }

  return page
}
