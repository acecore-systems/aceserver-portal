import type { CollectionEntry } from 'astro:content'

export type PortalPage = CollectionEntry<'pages'>['data']
export type PortalSection = PortalPage['sections'][number]

export type VideoItem = NonNullable<
  Extract<PortalSection, { type: 'iframe' }>['videos']
>[number]

export type LinkItem = Extract<PortalSection, { type: 'cta' }>['ctaButton']

export type AnnouncementSettings = CollectionEntry<'announcements'>['data']
export type AnnouncementItem = AnnouncementSettings['items'][number]
export type AnnouncementTone = NonNullable<AnnouncementItem['tone']>

export type NavigationSettings = CollectionEntry<'navigation'>['data']
export type NavItem = NavigationSettings['items'][number]

export type SiteSettings = CollectionEntry<'settings'>['data']
export type WorldEntry = SiteSettings['worlds'][number]
