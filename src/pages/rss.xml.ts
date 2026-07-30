import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { renderStoriesRss } from '../utils/stories-rss'

export const GET: APIRoute = async ({ site }) => {
  const stories = (await getCollection('stories')).filter(
    (story) => !story.id.includes('/'),
  )
  const body = renderStoriesRss(
    'ja',
    stories,
    site ?? new URL('https://asv.acecore.net'),
  )

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
