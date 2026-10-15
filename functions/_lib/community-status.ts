// Fixed public sources only. Never forward Dynmap players, updates, chat or profiles.
export const COMMUNITY_WORLDS = [
  'main',
  'resource',
  'rpg',
  'lobby',
  'rpg-sub',
  'season-a',
  'season-a-c',
  'event',
] as const
export type CommunityWorld = (typeof COMMUNITY_WORLDS)[number]
export const DISCORD_INVITE_API =
  'https://discord.com/api/v10/invites/acsv?with_counts=true&with_expiration=false'
export const DISCORD_WIDGET_API =
  'https://discord.com/api/v10/guilds/737538781024092170/widget.json'
export const COMMUNITY_SERVICE_URL = 'https://community.internal/v1/community'
export const MAP_FRESHNESS_MS = 5 * 60 * 1000
export const LAST_GOOD_MAX_AGE_MS = 6 * 60 * 60 * 1000
export const SOURCE_TIMEOUT_MS = 6000
export const SERVICE_TIMEOUT_MS = 8000
const MAX_SOURCE_BYTES = 1024 * 1024
const GUILD_ID = '737538781024092170'
const ANNOUNCEMENT_CHANNEL_ID = '774152638450237460'

export type DiscordStatus = {
  members: number | null
  online: number | null
  checkedAt: string
  state: 'available' | 'partial' | 'stale' | 'unavailable'
}
export type FeedSection<T> = {
  state: 'available' | 'unavailable' | 'unconfigured'
  checkedAt: string
  items: T[]
}
export type DiscordAnnouncement = {
  id: string
  text: string
  publishedAt: string
  url: string
}
export type DiscordEvent = {
  id: string
  name: string
  description: string
  startsAt: string
  endsAt: string | null
  url: string
}

export type WorldStatus = {
  id: CommunityWorld
  count: number | null
  sourceUpdatedAt: string | null
  checkedAt: string
  state: 'fresh' | 'stale' | 'unavailable'
}
export type CommunityStatus = {
  version: 1
  checkedAt: string
  discord: DiscordStatus
  worlds: WorldStatus[]
  announcements: FeedSection<DiscordAnnouncement>
  events: FeedSection<DiscordEvent>
}

export function worldSourceUrl(world: CommunityWorld): string {
  if (!COMMUNITY_WORLDS.includes(world)) throw new Error('Unknown world')
  const host = world === 'resource' ? 'sigen' : world
  return `https://mc-map-${host}.acecore.net/standalone/dynmap_world.json`
}

function isCount(value: unknown): value is number {
  return (
    Number.isSafeInteger(value) &&
    Number(value) >= 0 &&
    Number(value) <= 1_000_000
  )
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

async function readPublicJson(
  url: string,
  fetcher: typeof fetch,
  timeoutMs = SOURCE_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController()
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  let timeout: ReturnType<typeof setTimeout>
  const deadline = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort()
      void reader?.cancel().catch(() => {})
      reject(new Error('Source timeout'))
    }, timeoutMs)
  })
  const read = async () => {
    try {
      const response = await fetcher(url, {
        headers: { Accept: 'application/json' },
        // Workers supports manual/follow only. Non-2xx (including redirects) is rejected below.
        redirect: 'manual',
        signal: controller.signal,
      })
      if (controller.signal.aborted) {
        await response.body?.cancel()
        throw new Error('Source timeout')
      }
      if (!response.ok || !response.body) {
        await response.body?.cancel()
        // Only public transport metadata is retained; never log a response body.
        throw new SourceError(
          response.status,
          response.headers.get('Retry-After'),
        )
      }
      if (
        !response.headers
          .get('Content-Type')
          ?.toLowerCase()
          .includes('application/json')
      ) {
        await response.body.cancel()
        throw new Error('Source content type')
      }
      if (Number(response.headers.get('Content-Length')) > MAX_SOURCE_BYTES) {
        await response.body.cancel()
        throw new Error('Source too large')
      }
      reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let size = 0
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > MAX_SOURCE_BYTES) {
          await reader.cancel()
          throw new Error('Source too large')
        }
        chunks.push(value)
      }
      const bytes = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) {
        bytes.set(chunk, offset)
        offset += chunk.byteLength
      }
      return JSON.parse(new TextDecoder().decode(bytes))
    } finally {
      reader?.releaseLock()
    }
  }
  try {
    return await Promise.race([read(), deadline])
  } finally {
    clearTimeout(timeout!)
  }
}

class SourceError extends Error {
  status: number
  retryAfter: string | null
  constructor(status: number, retryAfter: string | null) {
    super('Source unavailable')
    this.status = status
    this.retryAfter = retryAfter
  }
}

function unavailableDiscord(checkedAt: string): DiscordStatus {
  return { members: null, online: null, checkedAt, state: 'unavailable' }
}

function validTime(value: unknown, checkedAt: string): value is string {
  if (typeof value !== 'string') return false
  const age = Date.parse(checkedAt) - Date.parse(value)
  return Number.isFinite(age) && age >= -60_000 && age <= LAST_GOOD_MAX_AGE_MS
}

function safeText(
  value: unknown,
  max: number,
  allowEmpty = false,
): value is string {
  return (
    typeof value === 'string' &&
    value.length <= max &&
    (allowEmpty || value.trim().length > 0) &&
    !/<(?:@!?\d+|@&\d+|#\d+)>|@everyone|@here/iu.test(value)
  )
}

function isoTime(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /T.*(?:Z|[+-]\d\d:\d\d)$/u.test(value) &&
    Number.isFinite(Date.parse(value))
  )
}

function feedSection<T extends { id: string }>(
  value: unknown,
  checkedAt: string,
  max: number,
  sanitize: (item: unknown) => T | null,
): FeedSection<T> {
  const unavailable: FeedSection<T> = {
    state: 'unavailable',
    checkedAt,
    items: [],
  }
  if (
    !record(value) ||
    value.state !== 'available' ||
    !Array.isArray(value.items) ||
    value.items.length > max
  )
    return unavailable
  const items = value.items.map(sanitize)
  if (
    items.some((item) => item === null) ||
    new Set(items.map((item) => item?.id)).size !== items.length
  )
    return unavailable
  return { state: 'available', checkedAt, items: items as T[] }
}

export function sanitizeCommunityFeed(value: unknown, checkedAt: string) {
  const empty = {
    discord: unavailableDiscord(checkedAt),
    announcements: {
      state: 'unavailable',
      checkedAt,
      items: [],
    } as FeedSection<DiscordAnnouncement>,
    events: {
      state: 'unavailable',
      checkedAt,
      items: [],
    } as FeedSection<DiscordEvent>,
  }
  if (
    !record(value) ||
    value.version !== 1 ||
    !validTime(value.checkedAt, checkedAt)
  )
    return empty
  const sourceTime = value.checkedAt
  const discord = value.discord
  if (
    record(discord) &&
    discord.state === 'available' &&
    validTime(discord.checkedAt, checkedAt) &&
    isCount(discord.members) &&
    isCount(discord.online) &&
    discord.online <= discord.members
  ) {
    empty.discord = {
      members: discord.members,
      online: discord.online,
      checkedAt: discord.checkedAt,
      state: 'available',
    }
  }
  empty.announcements = feedSection(
    value.announcements,
    sourceTime,
    5,
    (item) => {
      if (
        !record(item) ||
        typeof item.id !== 'string' ||
        !/^\d{16,22}$/u.test(item.id) ||
        !safeText(item.text, 2000) ||
        !isoTime(item.publishedAt) ||
        item.url !==
          `https://discord.com/channels/${GUILD_ID}/${ANNOUNCEMENT_CHANNEL_ID}/${item.id}`
      )
        return null
      return {
        id: item.id,
        text: item.text,
        publishedAt: item.publishedAt,
        url: item.url,
      }
    },
  )
  empty.events = feedSection(value.events, sourceTime, 8, (item) => {
    if (
      !record(item) ||
      typeof item.id !== 'string' ||
      !/^\d{16,22}$/u.test(item.id) ||
      !safeText(item.name, 100) ||
      !safeText(item.description, 1000, true) ||
      !isoTime(item.startsAt) ||
      !(
        item.endsAt === null ||
        (isoTime(item.endsAt) &&
          Date.parse(item.endsAt) > Date.parse(item.startsAt))
      ) ||
      item.url !== `https://discord.com/events/${GUILD_ID}/${item.id}`
    )
      return null
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      url: item.url,
    }
  })
  return empty
}

async function collectPublicDiscord(
  fetcher: typeof fetch,
  checkedAt: string,
): Promise<DiscordStatus> {
  try {
    const value = await readPublicJson(DISCORD_INVITE_API, fetcher, 2500)
    if (
      record(value) &&
      record(value.guild) &&
      value.guild.id === GUILD_ID &&
      isCount(value.approximate_member_count) &&
      isCount(value.approximate_presence_count) &&
      value.approximate_presence_count <= value.approximate_member_count
    ) {
      return {
        members: value.approximate_member_count,
        online: value.approximate_presence_count,
        checkedAt,
        state: 'available',
      }
    }
  } catch (error) {
    // Do not follow a rate-limit response with another request to Discord.
    if (error instanceof SourceError && error.status === 429)
      return unavailableDiscord(checkedAt)
  }
  try {
    const value = await readPublicJson(DISCORD_WIDGET_API, fetcher, 2500)
    if (
      record(value) &&
      value.id === GUILD_ID &&
      isCount(value.presence_count)
    ) {
      return {
        members: null,
        online: value.presence_count,
        checkedAt,
        state: 'partial',
      }
    }
  } catch {
    /* The independent widget fallback is attempted once only. */
  }
  return unavailableDiscord(checkedAt)
}

export function retainLastGoodDiscord(
  current: DiscordStatus,
  previous: unknown,
  checkedAt: string,
): DiscordStatus {
  if (current.state !== 'unavailable') return current
  if (
    !record(previous) ||
    !['available', 'partial', 'stale'].includes(String(previous.state)) ||
    !validTime(previous.checkedAt, checkedAt) ||
    !(isCount(previous.members) || previous.members === null) ||
    !isCount(previous.online) ||
    (isCount(previous.members) && previous.online > previous.members)
  )
    return current
  return {
    members: previous.members as number | null,
    online: previous.online,
    checkedAt: previous.checkedAt,
    state: 'stale',
  }
}

export function sanitizeWorld(
  id: CommunityWorld,
  value: unknown,
  checkedAt: string,
): WorldStatus {
  const unavailable: WorldStatus = {
    id,
    count: null,
    sourceUpdatedAt: null,
    checkedAt,
    state: 'unavailable',
  }
  if (
    !record(value) ||
    !isCount(value.currentcount) ||
    typeof value.timestamp !== 'number'
  ) {
    return unavailable
  }
  const age = Date.parse(checkedAt) - value.timestamp
  if (
    !Number.isFinite(age) ||
    age < -60_000 ||
    value.timestamp < 946684800000
  ) {
    return unavailable
  }
  return {
    id,
    count: value.currentcount,
    sourceUpdatedAt: new Date(value.timestamp).toISOString(),
    checkedAt,
    state: age <= MAP_FRESHNESS_MS ? 'fresh' : 'stale',
  }
}

export async function collectCommunityStatus({
  fetcher = fetch,
  now = () => new Date().toISOString(),
  discordService,
}: {
  fetcher?: typeof fetch
  now?: () => string
  discordService?: { fetch: typeof fetch }
} = {}): Promise<CommunityStatus> {
  const checkedAt = now()
  const discordTask = (async () => {
    if (!discordService) {
      return {
        discord: await collectPublicDiscord(fetcher, checkedAt),
        announcements: {
          state: 'unconfigured',
          checkedAt,
          items: [],
        } as FeedSection<DiscordAnnouncement>,
        events: {
          state: 'unconfigured',
          checkedAt,
          items: [],
        } as FeedSection<DiscordEvent>,
      }
    }
    try {
      return sanitizeCommunityFeed(
        await readPublicJson(
          COMMUNITY_SERVICE_URL,
          discordService.fetch.bind(discordService),
          SERVICE_TIMEOUT_MS,
        ),
        checkedAt,
      )
    } catch {
      return sanitizeCommunityFeed(null, checkedAt)
    }
  })()
  const worlds = await Promise.all(
    COMMUNITY_WORLDS.map(async (id) => {
      try {
        return sanitizeWorld(
          id,
          await readPublicJson(worldSourceUrl(id), fetcher),
          checkedAt,
        )
      } catch {
        return sanitizeWorld(id, null, checkedAt)
      }
    }),
  )
  return { version: 1, checkedAt, ...(await discordTask), worlds }
}
