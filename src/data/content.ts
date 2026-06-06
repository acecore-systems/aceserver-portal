import navigationData from '../content/site/navigation.json'
import settingsData from '../content/site/settings.json'
import type { NavItem, PortalPage, SiteSettings } from '../types'

const pageModules = import.meta.glob('../content/pages/*.json', {
  eager: true,
  import: 'default',
})

export const settings = settingsData as SiteSettings
export const navigation = navigationData.items as NavItem[]
export const pages = Object.values(pageModules) as PortalPage[]

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
