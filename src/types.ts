export type PortalSection =
  | {
      type: 'hero'
      shoulderCopy?: string
      titleCopy: string
      text?: string
      ctaButton?: LinkItem
      backgroundImage?: string
    }
  | {
      type: 'featureImageFull' | 'featureImageRight' | 'featureImageLeft'
      titleCopy: string
      text?: string
      image?: string
      imageAlt?: string
    }
  | {
      type: 'cta'
      titleCopy: string
      text?: string
      ctaButton: LinkItem
    }
  | {
      type: 'iframe'
      src: string
      externalUrl?: string
      title?: string
      fallbackImage?: string
      variant?: 'map' | 'video'
    }

export type LinkItem = {
  label: string
  href: string
  external?: boolean
}

export type AnnouncementTone = 'brand' | 'amber' | 'emerald' | 'slate'

export type AnnouncementItem = {
  id: string
  enabled?: boolean
  order?: number
  tone?: AnnouncementTone
  icon?: string
  title: string
  text?: string
  href?: string
  linkLabel?: string
  external?: boolean
  startsAt?: string
  endsAt?: string
}

export type AnnouncementSettings = {
  items: AnnouncementItem[]
}

export type NavItem = {
  text: string
  href: string
  external?: boolean
  icon: string
}

export type PortalPage = {
  slug: string
  path: string
  pageName: string
  kind: 'home' | 'worldMap' | 'embed'
  hideFooter?: boolean
  meta: {
    title: string
    description: string
    ogImage?: string
  }
  sections: PortalSection[]
}

export type WorldEntry = {
  slug: string
  title: string
  href: string
  image: string
  imageAlt: string
  icon: string
  tone: 'main' | 'resource' | 'rpg' | 'sakana'
}

export type SiteSettings = {
  title: string
  shortTitle: string
  description: string
  siteUrl: string
  logo: string
  discordUrl: string
  wikiUrl: string
  worlds: WorldEntry[]
}
