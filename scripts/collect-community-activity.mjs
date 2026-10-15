import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { activityDay } from '../src/lib/community-history.ts'
import {
  collectCommunityStatus,
  COMMUNITY_WORLDS,
} from '../functions/_lib/community-status.ts'

export const HISTORY_PATH = 'src/data/external/community-activity.json'
const DAY_MS = 86400000
const isCount = (value) =>
  value === null ||
  (Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000)

// Rebuild the exact aggregate contract rather than copying source objects.
export function normalizeHistory(value, now = new Date()) {
  if (
    value?.version !== 1 ||
    !Array.isArray(value.samples) ||
    value.samples.length > 62
  ) {
    throw new Error('Invalid activity history')
  }
  return value.samples.map((sample) => {
    const date = Date.parse(sample?.observedAt)
    if (
      !Number.isFinite(date) ||
      date > now.getTime() + 60_000 ||
      !isCount(sample?.discord?.members) ||
      !isCount(sample?.discord?.online) ||
      COMMUNITY_WORLDS.some((id) => !isCount(sample?.worlds?.[id]))
    ) {
      throw new Error('Invalid activity sample')
    }
    return {
      observedAt: new Date(date).toISOString(),
      discord: {
        members: sample.discord.members,
        online: sample.discord.online,
      },
      worlds: Object.fromEntries(
        COMMUNITY_WORLDS.map((id) => [id, sample.worlds[id]]),
      ),
    }
  })
}

export function appendActivity(histories, status) {
  const now = new Date(status.checkedAt)
  const byDay = new Map()
  const samples = histories.flatMap((value) => normalizeHistory(value, now))
  samples.push({
    observedAt: status.checkedAt,
    discord: {
      members:
        status.discord.state === 'available' ? status.discord.members : null,
      online:
        status.discord.state === 'available' ? status.discord.online : null,
    },
    worlds: Object.fromEntries(
      status.worlds.map((world) => [
        world.id,
        world.state === 'fresh' ? world.count : null,
      ]),
    ),
  })
  for (const sample of samples.sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt),
  )) {
    if (Date.parse(sample.observedAt) >= now.getTime() - 31 * DAY_MS) {
      byDay.set(activityDay(sample.observedAt), sample)
    }
  }
  return { version: 1, samples: [...byDay.values()].slice(-31) }
}

async function readHistory(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return { version: 1, samples: [] }
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (
    args.some(
      (value, index) =>
        index % 2 === 0 && !['--previous', '--output'].includes(value),
    ) ||
    args.length % 2
  ) {
    throw new Error(
      'Usage: collect-community-activity.mjs [--previous FILE] [--output FILE]',
    )
  }
  const options = Object.fromEntries(
    Array.from({ length: args.length / 2 }, (_, index) => [
      args[index * 2],
      args[index * 2 + 1],
    ]),
  )
  const histories = [await readHistory(HISTORY_PATH)]
  if (options['--previous'])
    histories.push(await readHistory(options['--previous']))
  const status = await collectCommunityStatus()
  const snapshot = appendActivity(histories, status)
  await writeFile(
    options['--output'] ?? HISTORY_PATH,
    `${JSON.stringify(snapshot, null, 2)}\n`,
  )
  console.log(
    `Activity: ${snapshot.samples.length} daily aggregate samples; ${status.worlds.filter((world) => world.state === 'fresh').length}/8 fresh maps; Discord ${status.discord.state}.`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main()
