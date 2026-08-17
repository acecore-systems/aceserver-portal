import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const YOUTUBE_CHANNEL_ID = 'UCRd3wlD5zemJ7Q9C1SZoEDw'
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@aceserver'
export const YOUTUBE_ATOM_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`
const youtubeFeedChannelIds = new Set([
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_CHANNEL_ID.slice(2),
])

const outputPath = path.join(
  process.cwd(),
  'src',
  'data',
  'external',
  'youtube-videos.json',
)
const volatileSnapshotKeys = new Set(['syncedAt'])

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/atom+xml, application/xml;q=0.9, */*;q=0.8',
      'user-agent': 'aceserver-portal youtube atom sync',
    },
  })

  if (!response.ok) {
    throw new Error(`YouTube Atom fetch failed: ${response.status}`)
  }

  return response.text()
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`YouTube Atom ${label} is missing.`)
  }

  return value.trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function decodeXml(value) {
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

function getTag(xml, tagName) {
  const escapedTag = escapeRegExp(tagName)
  const match = xml.match(
    new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
      'i',
    ),
  )

  return match ? decodeXml(match[1].trim()) : ''
}

function getAttribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'),
  )
  return match ? decodeXml(match[1] ?? match[2] ?? '') : ''
}

function getTagAttribute(xml, tagName, attributeName) {
  const escapedTag = escapeRegExp(tagName)
  const tag = xml.match(new RegExp(`<${escapedTag}\\b[^>]*>`, 'i'))?.[0]
  return tag ? getAttribute(tag, attributeName) : ''
}

function getAlternateLink(entry) {
  const links = entry.match(/<link\b[^>]*>/gi) ?? []
  const link = links.find(
    (candidate) => getAttribute(candidate, 'rel').toLowerCase() === 'alternate',
  )
  return link ? getAttribute(link, 'href') : ''
}

export function parseYoutubeAtom(
  raw,
  { now = () => new Date().toISOString() } = {},
) {
  const channelId = requireText(getTag(raw, 'yt:channelId'), 'channel ID')

  if (!youtubeFeedChannelIds.has(channelId)) {
    throw new Error('YouTube Atom returned a different channel.')
  }

  const entries = [...raw.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)]
  if (entries.length === 0) {
    throw new Error(
      'YouTube Atom returned no videos; keeping the current snapshot.',
    )
  }

  const videos = entries
    .map(([, entry], index) => {
      const videoId = requireText(
        getTag(entry, 'yt:videoId'),
        `entry ${index + 1} video ID`,
      )
      const title = requireText(
        getTag(entry, 'title'),
        `entry ${index + 1} title`,
      )
      const publishedAt = requireText(
        getTag(entry, 'published'),
        `entry ${index + 1} publication time`,
      )

      return {
        videoId,
        title,
        url:
          getAlternateLink(entry) ||
          `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        thumbnailUrl:
          getTagAttribute(entry, 'media:thumbnail', 'url') ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        authorName: getTag(entry, 'name') || 'Aceserver',
        authorUrl: YOUTUBE_CHANNEL_URL,
        publishedAt,
        description: getTag(entry, 'media:description'),
      }
    })
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))

  return {
    source: 'youtube-atom',
    schemaVersion: 1,
    channelId: YOUTUBE_CHANNEL_ID,
    channelTitle: getTag(raw, 'title') || 'Aceserver',
    channelUrl: YOUTUBE_CHANNEL_URL,
    feedUrl: YOUTUBE_ATOM_URL,
    syncedAt: now(),
    videos,
  }
}

function comparableContent(value) {
  if (Array.isArray(value)) return value.map(comparableContent)

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !volatileSnapshotKeys.has(key))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, comparableContent(item)]),
    )
  }

  return value
}

export function hasMeaningfulChanges(current, next) {
  return (
    JSON.stringify(comparableContent(current)) !==
    JSON.stringify(comparableContent(next))
  )
}

export async function writeYoutubeSnapshot(
  snapshot,
  { filePath = outputPath } = {},
) {
  let current

  try {
    current = JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  if (current && !hasMeaningfulChanges(current, snapshot)) {
    return false
  }

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(snapshot, null, 2)}\n`)
  return true
}

export async function syncYoutubeAtom({ getText = fetchText, now } = {}) {
  const snapshot = parseYoutubeAtom(await getText(YOUTUBE_ATOM_URL), { now })
  const changed = await writeYoutubeSnapshot(snapshot)

  return { changed, snapshot }
}

const isEntryPoint = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false

if (isEntryPoint) {
  const { changed, snapshot } = await syncYoutubeAtom()
  console.log(
    changed
      ? `Updated YouTube Atom snapshot (${snapshot.videos.length} videos).`
      : `YouTube Atom snapshot is already current (${snapshot.videos.length} videos).`,
  )
}
