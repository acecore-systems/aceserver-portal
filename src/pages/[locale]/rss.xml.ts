import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { TRANSLATED_LOCALES, type TranslatedLocale } from '../../i18n/config'
import { renderStoriesRss } from '../../utils/stories-rss'

export function getStaticPaths() {
  return TRANSLATED_LOCALES.map((locale) => ({
    params: { locale },
    props: { locale },
  }))
}

export const GET: APIRoute = async ({ props, site }) => {
  const locale = props.locale as TranslatedLocale
  const stories = (await getCollection('stories')).filter((story) =>
    story.id.startsWith(`${locale}/`),
  )
  const body = renderStoriesRss(
    locale,
    stories,
    site ?? new URL('https://asv.acecore.net'),
  )

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
