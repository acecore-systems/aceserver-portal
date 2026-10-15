import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import {
  collectCommunityStatus,
  COMMUNITY_WORLDS,
  DISCORD_INVITE_API,
  SOURCE_TIMEOUT_MS,
  sanitizeWorld,
  worldSourceUrl,
} from '../functions/_lib/community-status.ts'
import {
  appendActivity,
  normalizeHistory,
} from '../scripts/collect-community-activity.mjs'
import { validatePortalContentFile } from '../src/data/content-schemas.ts'
import { activityDay } from '../src/lib/community-history.ts'

const checkedAt = '2026-10-15T03:17:00.000Z'
const now = () => checkedAt
const json = (value) => Response.json(value)
const worldPayload = {
  currentcount: 0,
  timestamp: Date.parse(checkedAt),
  players: [{ name: 'private-name' }],
  updates: [{ message: 'private-chat' }],
}
const fetcher = async (url, options) => {
  assert.equal(options.redirect, 'manual')
  assert.ok(options.signal instanceof AbortSignal)
  return url === DISCORD_INVITE_API
    ? json({
        guild: { id: '737538781024092170' },
        approximate_member_count: 100,
        approximate_presence_count: 0,
        inviter: { username: 'private-name' },
      })
    : json(worldPayload)
}

test('fixed public sources yield only aggregate data and preserve a genuine zero', async () => {
  const seen = []
  const status = await collectCommunityStatus({
    now,
    fetcher: async (...args) => {
      seen.push(args[0])
      return fetcher(...args)
    },
  })
  assert.deepEqual(
    new Set(seen),
    new Set([DISCORD_INVITE_API, ...COMMUNITY_WORLDS.map(worldSourceUrl)]),
  )
  assert.equal(status.worlds.length, 8)
  assert.ok(
    status.worlds.every(
      (world) => world.count === 0 && world.state === 'fresh',
    ),
  )
  assert.equal(status.discord.online, 0)
  assert.doesNotMatch(
    JSON.stringify(status),
    /private-name|private-chat|players|updates|inviter/u,
  )
  assert.throws(() => worldSourceUrl('https://localhost/'), /Unknown world/u)
})

test('stale, missing and future map timestamps are not reported as live', () => {
  assert.equal(
    sanitizeWorld(
      'main',
      { ...worldPayload, timestamp: Date.parse(checkedAt) - 600_000 },
      checkedAt,
    ).state,
    'stale',
  )
  for (const payload of [
    null,
    {},
    { currentcount: -1, timestamp: Date.parse(checkedAt) },
    { ...worldPayload, timestamp: Date.parse(checkedAt) + 120_000 },
    { ...worldPayload, timestamp: Infinity },
  ]) {
    const result = sanitizeWorld('main', payload, checkedAt)
    assert.equal(result.state, 'unavailable')
    assert.equal(result.count, null)
  }
})

test('one failed source does not hide the other sources or become zero', async () => {
  const status = await collectCommunityStatus({
    now,
    fetcher: async (url, options) =>
      url === worldSourceUrl('main')
        ? new Response('down', { status: 503 })
        : fetcher(url, options),
  })
  assert.equal(status.worlds[0].count, null)
  assert.equal(status.worlds[0].state, 'unavailable')
  assert.ok(status.worlds.slice(1).every((world) => world.count === 0))
  assert.equal(status.discord.state, 'available')
})

test('wrong guild, invalid counts, wrong content types and oversized bodies fail closed', async () => {
  const payloads = [
    () =>
      json({
        guild: { id: 'other' },
        approximate_member_count: 1,
        approximate_presence_count: 1,
      }),
    () =>
      json({
        guild: { id: '737538781024092170' },
        approximate_member_count: 1,
        approximate_presence_count: 2,
      }),
    () => new Response('{}', { headers: { 'Content-Type': 'text/html' } }),
    () =>
      new Response(null, {
        status: 302,
        headers: { Location: 'https://attacker.example/' },
      }),
    () =>
      new Response('x'.repeat(1024 * 1024 + 1), {
        headers: { 'Content-Type': 'application/json' },
      }),
    () =>
      new Response('{}', {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(1024 * 1024 + 1),
        },
      }),
  ]
  for (const payload of payloads) {
    const status = await collectCommunityStatus({
      now,
      fetcher: async () => payload(),
    })
    assert.equal(status.discord.state, 'unavailable')
    assert.ok(status.worlds.every((world) => world.count === null))
  }
})

test('every source is bounded by the fetch timeout', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const pending = collectCommunityStatus({
    now,
    fetcher: async (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), {
          once: true,
        })
      }),
  })
  context.mock.timers.tick(SOURCE_TIMEOUT_MS)
  const status = await pending
  assert.equal(status.discord.state, 'unavailable')
  assert.ok(status.worlds.every((world) => world.state === 'unavailable'))
})

test('manual observations deduplicate by the same JST day shown in the UI', async () => {
  const status = await collectCommunityStatus({
    now: () => '2026-10-15T14:00:00.000Z',
    fetcher,
  })
  const early = appendActivity([], {
    ...status,
    checkedAt: '2026-10-14T23:00:00.000Z',
  })
  const history = appendActivity([early], status)
  assert.equal(history.samples.length, 1)
  assert.equal(
    activityDay('2026-10-14T23:00:00.000Z'),
    activityDay(status.checkedAt),
  )
  // A missing calendar day remains a gap even when elapsed time is under 36 hours.
  assert.equal(
    activityDay('2026-10-16T15:01:00.000Z') - activityDay(status.checkedAt),
    2,
  )
})

test('Cloudflare Pages header lines remain valid and contain one public CSP', async () => {
  const headers = await readFile(
    new URL('../public/_headers', import.meta.url),
    'utf8',
  )
  for (const line of headers.split(/\r?\n/u))
    assert.ok(
      line.length <= 2000,
      'Pages ignores header lines over 2000 characters',
    )
  const publicHeaders = headers.split('/admin/*')[0]
  assert.equal(
    [...publicHeaders.matchAll(/Content-Security-Policy:/gu)].length,
    1,
  )
  const policy = publicHeaders.split('Content-Security-Policy:')[1].trim()
  const frames = policy
    .split(';')
    .find((directive) => directive.trim().startsWith('frame-src'))
  for (const id of COMMUNITY_WORLDS)
    assert.ok(frames.includes(new URL(worldSourceUrl(id)).origin))
  assert.ok(frames.includes('https://platform.twitter.com'))
  assert.ok(policy.includes("object-src 'none'"))
})

test('daily history merges pending PR observations, deduplicates a day, retains 31 days and never keeps private fields', async () => {
  const status = await collectCommunityStatus({ now, fetcher })
  const old = {
    version: 1,
    samples: Array.from({ length: 40 }, (_, index) => ({
      observedAt: new Date(
        Date.parse(checkedAt) - (index + 1) * 86400000,
      ).toISOString(),
      discord: { members: 10, online: null },
      worlds: Object.fromEntries(COMMUNITY_WORLDS.map((id) => [id, 0])),
      players: ['private-name'],
    })),
  }
  const previous = {
    version: 1,
    samples: [{ ...old.samples[0], observedAt: '2026-10-15T01:00:00.000Z' }],
  }
  const history = appendActivity([old, previous], status)
  assert.equal(history.samples.length, 31)
  assert.equal(history.samples.at(-1).observedAt, checkedAt)
  assert.equal(
    new Set(history.samples.map((item) => item.observedAt.slice(0, 10))).size,
    31,
  )
  assert.doesNotMatch(JSON.stringify(history), /private-name|players/u)
  assert.equal(history.samples.at(-1).worlds.main, 0)
  assert.equal(history.samples.at(-1).discord.online, 0)
})

test('missing and stale sources are null in history; malformed pending data stops collection', async () => {
  const status = await collectCommunityStatus({
    now,
    fetcher: async () => {
      throw new Error('offline')
    },
  })
  const history = appendActivity([], status)
  assert.equal(history.samples[0].worlds.main, null)
  assert.equal(history.samples[0].discord.online, null)
  const corrupt = structuredClone(history)
  corrupt.samples[0].worlds.main = 'private-name'
  assert.throws(
    () => normalizeHistory(corrupt, new Date(checkedAt)),
    /Invalid activity sample/u,
  )
})

test('CMS community accepts undated notices separately and rejects unsafe or ambiguous gallery, posts and dates', async () => {
  const top = JSON.parse(
    await readFile(
      new URL('../src/content/pages/top.json', import.meta.url),
      'utf8',
    ),
  )
  assert.equal(
    validatePortalContentFile('src/content/pages/top.json', top).ok,
    true,
  )
  for (const mutate of [
    (page) => (page.community.gallery[0].image = '/uploads/../secret.png'),
    (page) => (page.community.gallery[0].href = 'https://attacker.example/'),
    (page) => (page.community.xPosts[0].url = 'https://x.com/other/status/123'),
    (page) =>
      page.community.events.push({
        id: 'wrong',
        title: 'Event',
        text: 'Event',
        startsAt: checkedAt,
        endsAt: '2026-10-14T00:00:00Z',
        href: 'https://discord.gg/acsv',
      }),
    (page) => page.community.gallery.push(page.community.gallery[0]),
  ]) {
    const changed = structuredClone(top)
    mutate(changed)
    assert.equal(
      validatePortalContentFile('src/content/pages/top.json', changed).ok,
      false,
    )
  }
  assert.equal(
    validatePortalContentFile('src/content/site/announcements.json', {
      items: [
        {
          id: 'notice',
          title: 'Undated notice',
          text: 'No event date required',
        },
      ],
    }).ok,
    true,
  )
})
