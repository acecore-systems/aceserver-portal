const CHANNEL_ID = 'UCRd3wlD5zemJ7Q9C1SZoEDw'
const CHANNEL_URL = 'https://www.youtube.com/@aceserver'
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
const MAX_VIDEOS = 12

export async function onRequestGet() {
  try {
    const response = await fetch(FEED_URL, {
      headers: {
        accept: 'application/atom+xml, application/xml;q=0.9, */*;q=0.8',
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 900,
      },
    })

    if (!response.ok) {
      return toJson(
        { error: 'youtube_feed_unavailable' },
        { status: 502, cacheControl: 'public, max-age=60' },
      )
    }

    const feed = await response.text()
    const videos = parseVideos(feed).slice(0, MAX_VIDEOS)

    return toJson(
      {
        channelId: CHANNEL_ID,
        channelTitle: getTag(feed, 'title') || 'Aceserver',
        channelUrl: CHANNEL_URL,
        videos,
      },
      {
        cacheControl:
          'public, max-age=900, s-maxage=1800, stale-while-revalidate=3600',
      },
    )
  } catch {
    return toJson(
      { error: 'youtube_feed_fetch_failed' },
      { status: 502, cacheControl: 'public, max-age=60' },
    )
  }
}

function parseVideos(feed) {
  return [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, entry]) => {
      const id = getTag(entry, 'yt:videoId')
      const href = getAlternateLink(entry)

      if (!id || !href) {
        return null
      }

      return {
        id,
        title: getTag(entry, 'title') || 'YouTube video',
        href,
        thumbnail: getTagAttribute(entry, 'media:thumbnail', 'url'),
        publishedAt: getTag(entry, 'published'),
      }
    })
    .filter(Boolean)
}

function getAlternateLink(xml) {
  const match = xml.match(/<link\b[^>]*rel="alternate"[^>]*href="([^"]+)"/i)
  return match ? decodeXml(match[1]) : ''
}

function getTag(xml, tagName) {
  const escapedTag = escapeRegExp(tagName)
  const match = xml.match(
    new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
      'i',
    ),
  )

  if (!match) {
    return ''
  }

  return decodeXml(match[1].trim())
}

function getTagAttribute(xml, tagName, attrName) {
  const escapedTag = escapeRegExp(tagName)
  const tagMatch = xml.match(new RegExp(`<${escapedTag}\\b([^>]*)>`, 'i'))

  if (!tagMatch) {
    return ''
  }

  const attrMatch = tagMatch[1].match(
    new RegExp(`${escapeRegExp(attrName)}="([^"]*)"`, 'i'),
  )
  return attrMatch ? decodeXml(attrMatch[1]) : ''
}

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code) => {
      if (code[0] === '#') {
        const radix = code[1].toLowerCase() === 'x' ? 16 : 10
        const number = Number.parseInt(code.slice(radix === 16 ? 2 : 1), radix)
        return Number.isFinite(number) && number >= 0 && number <= 0x10ffff
          ? String.fromCodePoint(number)
          : entity
      }

      return (
        {
          amp: '&',
          lt: '<',
          gt: '>',
          quot: '"',
          apos: "'",
        }[code.toLowerCase()] ?? entity
      )
    })
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toJson(data, { status = 200, cacheControl }) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  })
}
