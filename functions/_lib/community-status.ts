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
export const MAP_FRESHNESS_MS = 5 * 60 * 1000
export const SOURCE_TIMEOUT_MS = 6000
const MAX_SOURCE_BYTES = 1024 * 1024
const GUILD_ID = '737538781024092170'

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
  discord: {
    members: number | null
    online: number | null
    checkedAt: string
    state: 'available' | 'unavailable'
  }
  worlds: WorldStatus[]
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
): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS)
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  try {
    const response = await fetcher(url, {
      headers: { Accept: 'application/json' },
      // Workers supports manual/follow only. Non-2xx (including redirects) is rejected below.
      redirect: 'manual',
      signal: controller.signal,
    })
    if (!response.ok || !response.body) {
      await response.body?.cancel()
      throw new Error('Source unavailable')
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
    clearTimeout(timeout)
    reader?.releaseLock()
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
}: {
  fetcher?: typeof fetch
  now?: () => string
} = {}): Promise<CommunityStatus> {
  const checkedAt = now()
  const discordTask = (async (): Promise<CommunityStatus['discord']> => {
    const unavailable: CommunityStatus['discord'] = {
      members: null,
      online: null,
      checkedAt,
      state: 'unavailable',
    }
    try {
      const value = await readPublicJson(DISCORD_INVITE_API, fetcher)
      if (
        !record(value) ||
        !record(value.guild) ||
        value.guild.id !== GUILD_ID ||
        !isCount(value.approximate_member_count) ||
        !isCount(value.approximate_presence_count) ||
        value.approximate_presence_count > value.approximate_member_count
      )
        return unavailable
      return {
        members: value.approximate_member_count,
        online: value.approximate_presence_count,
        checkedAt,
        state: 'available',
      }
    } catch {
      return unavailable
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
  return { version: 1, checkedAt, discord: await discordTask, worlds }
}
