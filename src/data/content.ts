import announcementsData from '../content/site/announcements.json'
import navigationData from '../content/site/navigation.json'
import settingsData from '../content/site/settings.json'
import type {
  AnnouncementItem,
  AnnouncementSettings,
  NavItem,
  PortalPage,
  SiteSettings,
} from '../types'

const pageModules = import.meta.glob('../content/pages/*.json', {
  eager: true,
  import: 'default',
})

export const settings = settingsData as SiteSettings
export const navigation = navigationData.items as NavItem[]
export const pages = Object.values(pageModules) as PortalPage[]

const announcementSettings = announcementsData as AnnouncementSettings
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const LOCAL_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined

  const raw = value.trim()
  const normalized = DATE_ONLY_PATTERN.test(raw)
    ? `${raw}T00:00:00+09:00`
    : LOCAL_DATETIME_PATTERN.test(raw)
      ? `${raw}+09:00`
      : raw
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function isAnnouncementActive(
  announcement: AnnouncementItem,
  now = new Date(),
): boolean {
  if (announcement.enabled === false) return false

  const startsAt = parseDate(announcement.startsAt)
  const endsAt = parseDate(announcement.endsAt)

  if (startsAt && now < startsAt) return false
  if (endsAt && now > endsAt) return false

  return true
}

export const announcements = announcementSettings.items
  .filter((announcement) => isAnnouncementActive(announcement))
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
