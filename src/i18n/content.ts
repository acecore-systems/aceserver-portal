import {
  announcements,
  getHomePage,
  navigation,
  pages,
  settings,
} from '../data/content'
import type {
  AnnouncementItem,
  NavItem,
  PortalPage,
  PortalSection,
  SiteSettings,
} from '../types'
import type { Locale } from './config'
import { localizePath } from './config'
import { getTranslation } from './translations'

function clone<T>(value: T): T {
  return structuredClone(value)
}

function localizeInternalHref(locale: Locale, href: string): string {
  return href.startsWith('/') ? localizePath(locale, href) : href
}

export function getLocalizedSettings(locale: Locale): SiteSettings {
  if (locale === 'ja') return settings

  const translation = getTranslation(locale)
  const localized = clone(settings)

  localized.title = translation.settings.title
  localized.shortTitle = translation.settings.shortTitle
  localized.description = translation.settings.description
  localized.logoAlt = translation.settings.logoAlt
  localized.worlds = localized.worlds.map((world) => {
    const translatedWorld = translation.settings.worlds[world.slug]

    if (!translatedWorld) {
      throw new Error(`Missing ${locale} world translation: ${world.slug}`)
    }

    return {
      ...world,
      title: translatedWorld.title,
      imageAlt: translatedWorld.imageAlt,
      statusLabel: translatedWorld.statusLabel,
      description: translatedWorld.description ?? world.description,
      href: localizeInternalHref(locale, world.href),
    }
  })

  return localized
}

export function getLocalizedNavigation(locale: Locale): NavItem[] {
  if (locale === 'ja') return navigation

  const translation = getTranslation(locale)
  return navigation.map((item) => {
    const text = translation.navigation[item.href]

    if (!text) {
      throw new Error(`Missing ${locale} navigation translation: ${item.href}`)
    }

    return {
      ...item,
      text,
      href: localizeInternalHref(locale, item.href),
    }
  })
}

export function getLocalizedAnnouncements(locale: Locale): AnnouncementItem[] {
  if (locale === 'ja') return announcements

  const translation = getTranslation(locale)
  return announcements.map((announcement) => {
    const translatedAnnouncement = translation.announcements[announcement.id]

    if (!translatedAnnouncement) {
      throw new Error(
        `Missing ${locale} announcement translation: ${announcement.id}`,
      )
    }

    return {
      ...announcement,
      ...translatedAnnouncement,
      href: announcement.href
        ? localizeInternalHref(locale, announcement.href)
        : undefined,
    }
  })
}

function overlaySection(
  locale: Locale,
  section: PortalSection,
  translatedSection: Record<string, string | undefined>,
): PortalSection {
  const localized = clone(section) as PortalSection &
    Record<string, string | object | undefined>

  for (const [key, value] of Object.entries(translatedSection)) {
    if (value !== undefined) localized[key] = value
  }

  if ('ctaButton' in localized && localized.ctaButton) {
    const ctaButton = localized.ctaButton as {
      label: string
      href: string
      external?: boolean
    }
    const translatedLabel = translatedSection.ctaLabel
    localized.ctaButton = {
      ...ctaButton,
      label: translatedLabel ?? ctaButton.label,
      href: localizeInternalHref(locale, ctaButton.href),
    }
  }

  return localized
}

export function getLocalizedPage(page: PortalPage, locale: Locale): PortalPage {
  if (locale === 'ja') return page

  const translation = getTranslation(locale)
  const translatedPage = translation.pages[page.slug]

  if (!translatedPage) {
    throw new Error(`Missing ${locale} page translation: ${page.slug}`)
  }

  if (translatedPage.sections.length !== page.sections.length) {
    throw new Error(
      `Section count mismatch for ${locale}/${page.slug}: expected ${page.sections.length}, received ${translatedPage.sections.length}`,
    )
  }

  return {
    ...clone(page),
    pageName: translatedPage.pageName,
    meta: {
      ...page.meta,
      title: translatedPage.meta.title,
      description: translatedPage.meta.description,
    },
    sections: page.sections.map((section, index) =>
      overlaySection(
        locale,
        section,
        translatedPage.sections[index] as Record<string, string | undefined>,
      ),
    ),
  }
}

export function getLocalizedPages(locale: Locale): PortalPage[] {
  return pages.map((page) => getLocalizedPage(page, locale))
}

export function getLocalizedPageBySlug(
  slug: string,
  locale: Locale,
): PortalPage | undefined {
  const page = pages.find((candidate) => candidate.slug === slug)
  return page ? getLocalizedPage(page, locale) : undefined
}

export function getLocalizedHomePage(locale: Locale): PortalPage {
  return getLocalizedPage(getHomePage(), locale)
}
