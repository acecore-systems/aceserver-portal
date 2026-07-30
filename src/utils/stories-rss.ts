import type { CollectionEntry } from 'astro:content'
import { getLocalizedSettings } from '../i18n/content'
import { HTML_LANG_BY_LOCALE, localizePath, type Locale } from '../i18n/config'
import { getUi } from '../i18n/translations'

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function renderStoriesRss(
  locale: Locale,
  stories: CollectionEntry<'stories'>[],
  site: URL,
): string {
  const settings = getLocalizedSettings(locale)
  const ui = getUi(locale)
  const channelUrl = new URL(localizePath(locale, '/stories/'), site)
  const feedUrl = new URL(localizePath(locale, '/rss.xml'), site)
  const items = stories
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((story) => {
      const slug = story.id.split('/').at(-1) ?? story.id
      const url = new URL(
        localizePath(locale, `/stories/${slug}/`),
        site,
      ).toString()
      const image = story.data.image
        ? new URL(story.data.image, site).toString()
        : null

      return [
        '<item>',
        `<title>${escapeXml(story.data.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(story.data.description)}</description>`,
        `<pubDate>${story.data.date.toUTCString()}</pubDate>`,
        `<dc:creator>${escapeXml(story.data.author)}</dc:creator>`,
        ...(image
          ? [`<enclosure url="${escapeXml(image)}" type="image/webp" />`]
          : []),
        '</item>',
      ].join('')
    })
    .join('')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '<channel>',
    `<title>${escapeXml(ui.rssTitle)}</title>`,
    `<description>${escapeXml(ui.storiesDescription)}</description>`,
    `<link>${escapeXml(channelUrl.toString())}</link>`,
    `<atom:link href="${escapeXml(feedUrl.toString())}" rel="self" type="application/rss+xml" />`,
    `<language>${escapeXml(HTML_LANG_BY_LOCALE[locale])}</language>`,
    `<generator>${escapeXml(`${settings.shortTitle} / Astro`)}</generator>`,
    items,
    '</channel>',
    '</rss>',
  ].join('')
}
