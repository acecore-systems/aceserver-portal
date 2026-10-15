import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import {
  collectCommunityStatus,
  COMMUNITY_WORLDS,
  DISCORD_INVITE_API,
  DISCORD_WIDGET_API,
  COMMUNITY_SERVICE_URL,
  SOURCE_TIMEOUT_MS,
  SERVICE_TIMEOUT_MS,
  LAST_GOOD_MAX_AGE_MS,
  retainLastGoodDiscord,
  sanitizeCommunityFeed,
  sanitizeWorld,
  worldSourceUrl,
} from '../functions/_lib/community-status.ts'
import {
  appendActivity,
  normalizeHistory,
} from '../scripts/collect-community-activity.mjs'
import { validatePortalContentFile } from '../src/data/content-schemas.ts'
import { activityDay } from '../src/lib/community-history.ts'
import { observationState } from '../src/lib/community-freshness.ts'
import {
  isGalleryMapLocation,
  mapEmbedUrl,
  mapLocationLink,
  mapLocationQuery,
} from '../src/lib/map-location.ts'
import { localizePath } from '../src/i18n/config.ts'
import { onRequestGet } from '../functions/api/community-status.ts'

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
  const waiting = async (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), {
        once: true,
      })
    })
  const pending = collectCommunityStatus({
    now,
    fetcher: waiting,
    discordService: { fetch: waiting },
  })
  assert.ok(SERVICE_TIMEOUT_MS <= 10_000 && SOURCE_TIMEOUT_MS <= 10_000)
  context.mock.timers.tick(SERVICE_TIMEOUT_MS)
  const status = await pending
  assert.equal(status.discord.state, 'unavailable')
  assert.ok(status.worlds.every((world) => world.state === 'unavailable'))
})

test('the widget fallback preserves online-only zero, and a rate limit is not retried', async () => {
  const seen = []
  const status = await collectCommunityStatus({
    now,
    fetcher: async (url, options) => {
      seen.push(url)
      if (url === DISCORD_INVITE_API)
        return new Response('down', { status: 503 })
      if (url === DISCORD_WIDGET_API)
        return json({
          id: '737538781024092170',
          presence_count: 0,
          members: [{ username: 'private-name' }],
        })
      return fetcher(url, options)
    },
  })
  assert.equal(seen.filter((url) => url === DISCORD_WIDGET_API).length, 1)
  assert.deepEqual(status.discord, {
    members: null,
    online: 0,
    state: 'partial',
    checkedAt,
  })
  assert.equal(status.events.state, 'unconfigured')
  assert.doesNotMatch(JSON.stringify(status), /private-name|username/u)
  const history = appendActivity([], status)
  assert.deepEqual(history.samples[0].discord, { members: null, online: 0 })
  const limited = []
  const result = await collectCommunityStatus({
    now,
    fetcher: async (url) => {
      limited.push(url)
      return new Response(null, {
        status: 429,
        headers: { 'Retry-After': '60' },
      })
    },
  })
  assert.equal(result.discord.state, 'unavailable')
  assert.equal(limited.includes(DISCORD_WIDGET_API), false)
})

test('the service deadline completes even when a binding ignores AbortSignal', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const pending = collectCommunityStatus({
    now,
    fetcher,
    discordService: { fetch: async () => new Promise(() => {}) },
  })
  await new Promise((resolve) => setImmediate(resolve))
  context.mock.timers.tick(SERVICE_TIMEOUT_MS)
  const result = await pending
  assert.equal(result.discord.state, 'unavailable')
  assert.equal(result.announcements.state, 'unavailable')
  assert.ok(result.worlds.every((world) => world.state === 'fresh'))
})

const messageId = '1428358658123456789'
const eventId = '1428358658987654321'
const servicePayload = () => ({
  version: 1,
  checkedAt,
  discord: {
    state: 'available',
    checkedAt,
    members: 100,
    online: 0,
    membersPrivate: ['private-name'],
  },
  announcements: {
    state: 'available',
    items: [
      {
        id: messageId,
        text: 'Notice <b>kept as plain text</b>',
        publishedAt: checkedAt,
        url: `https://discord.com/channels/737538781024092170/774152638450237460/${messageId}`,
        author: { name: 'private-name' },
        attachments: ['private-file'],
      },
    ],
  },
  events: {
    state: 'available',
    items: [
      {
        id: eventId,
        name: 'Public event',
        description: '',
        startsAt: checkedAt,
        endsAt: null,
        url: `https://discord.com/events/737538781024092170/${eventId}`,
        creator: 'private-name',
      },
    ],
  },
})

test('the private service uses the fixed GET contract and only returns independently sanitized public fields', async () => {
  const seen = []
  const status = await collectCommunityStatus({
    now,
    fetcher,
    discordService: {
      fetch: async (url, options) => {
        seen.push(url)
        assert.equal(options.method ?? 'GET', 'GET')
        assert.equal(options.redirect, 'manual')
        assert.ok(options.signal instanceof AbortSignal)
        return json(servicePayload())
      },
    },
  })
  assert.deepEqual(seen, [COMMUNITY_SERVICE_URL])
  assert.equal(status.discord.online, 0)
  assert.equal(
    status.announcements.items[0].text,
    'Notice <b>kept as plain text</b>',
  )
  assert.equal(status.events.items[0].endsAt, null)
  assert.doesNotMatch(
    JSON.stringify(status),
    /private-name|private-file|author|attachments|creator|membersPrivate/u,
  )
  const partial = servicePayload()
  partial.discord.state = 'unavailable'
  const sanitized = sanitizeCommunityFeed(partial, checkedAt)
  assert.equal(sanitized.discord.state, 'unavailable')
  assert.equal(sanitized.announcements.state, 'available')
  assert.equal(sanitized.events.state, 'available')
  partial.announcements.items = []
  assert.deepEqual(
    sanitizeCommunityFeed(partial, checkedAt).announcements.items,
    [],
  )
  partial.announcements.state = 'unavailable'
  assert.equal(
    sanitizeCommunityFeed(partial, checkedAt).announcements.state,
    'unavailable',
  )
})

test('a malformed service section does not hide independent valid sections or assert an empty success', () => {
  for (const mutate of [
    (value) =>
      (value.announcements.items[0].url =
        'https://discord.com/channels/other/channel/123'),
    (value) => (value.announcements.items[0].text = 'x'.repeat(2001)),
    (value) =>
      (value.announcements.items[0].text =
        '<@123456789012345678> private mention'),
    (value) => (value.announcements.items[0].text = '@everyone ping'),
    (value) => value.announcements.items.push(value.announcements.items[0]),
    (value) => (value.announcements.items[0].publishedAt = 'invalid'),
  ]) {
    const value = servicePayload()
    mutate(value)
    const status = sanitizeCommunityFeed(value, checkedAt)
    assert.equal(status.announcements.state, 'unavailable')
    assert.deepEqual(status.announcements.items, [])
    assert.equal(status.discord.state, 'available')
    assert.equal(status.events.state, 'available')
  }
  for (const mutate of [
    (value) => (value.events.items[0].url = 'https://attacker.example/'),
    (value) => (value.events.items[0].name = 'x'.repeat(101)),
    (value) => (value.events.items[0].description = 'x'.repeat(1001)),
    (value) => (value.events.items[0].endsAt = '2026-10-14T00:00:00Z'),
  ]) {
    const value = servicePayload()
    mutate(value)
    const status = sanitizeCommunityFeed(value, checkedAt)
    assert.equal(status.events.state, 'unavailable')
    assert.equal(status.announcements.state, 'available')
  }
  for (const time of [
    'invalid',
    '2026-10-16T00:00:00Z',
    '2026-10-14T00:00:00Z',
  ]) {
    assert.equal(
      sanitizeCommunityFeed({ ...servicePayload(), checkedAt: time }, checkedAt)
        .discord.state,
      'unavailable',
    )
  }
})

test('last-good counts retain their observation time, expire after six hours and never become a new history sample', () => {
  const current = {
    members: null,
    online: null,
    checkedAt,
    state: 'unavailable',
  }
  const previousTime = new Date(Date.parse(checkedAt) - 3600_000).toISOString()
  const previous = {
    members: 100,
    online: 0,
    checkedAt: previousTime,
    state: 'available',
    private: 'private-name',
  }
  const retained = retainLastGoodDiscord(current, previous, checkedAt)
  assert.deepEqual(retained, {
    members: 100,
    online: 0,
    checkedAt: previousTime,
    state: 'stale',
  })
  for (const time of [
    new Date(Date.parse(checkedAt) - LAST_GOOD_MAX_AGE_MS - 1).toISOString(),
    'invalid',
    '2026-10-16T00:00:00Z',
  ]) {
    assert.deepEqual(
      retainLastGoodDiscord(
        current,
        { ...previous, checkedAt: time },
        checkedAt,
      ),
      current,
    )
  }
  const sample = appendActivity([], {
    checkedAt,
    discord: retained,
    worlds: [],
  })
  assert.deepEqual(sample.samples[0].discord, { members: null, online: null })
  assert.equal(observationState(previousTime, Date.parse(checkedAt)), 'stale')
  assert.equal(
    observationState(checkedAt, Date.parse(checkedAt), true),
    'stale',
  )
  assert.equal(
    observationState(
      checkedAt,
      Date.parse(checkedAt) + LAST_GOOD_MAX_AGE_MS + 1,
    ),
    'unavailable',
  )
  assert.equal(observationState(checkedAt, Date.parse(checkedAt)), 'fresh')
})

test('the API caches only sanitized last-good counts without changing their timestamp on an outage', async (context) => {
  const store = new Map()
  const writes = []
  const cache = {
    match: async (key) => store.get(key.url)?.clone(),
    put: async (key, response) => {
      store.set(key.url, response)
    },
  }
  context.mock.method(globalThis, 'fetch', fetcher)
  const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches')
  Object.defineProperty(globalThis, 'caches', {
    value: { default: cache },
    configurable: true,
  })
  context.after(() =>
    originalCaches
      ? Object.defineProperty(globalThis, 'caches', originalCaches)
      : delete globalThis.caches,
  )
  const observation = new Date().toISOString()
  const value = servicePayload()
  value.checkedAt = observation
  value.discord.checkedAt = observation
  const request = new Request(
    'https://portal.example/api/community-status?url=https://attacker.example',
  )
  const env = { DISCORD_COMMUNITY_SERVICE: { fetch: async () => json(value) } }
  const response = await onRequestGet({
    request,
    env,
    waitUntil: (promise) => writes.push(promise),
  })
  await Promise.all(writes)
  assert.equal((await response.json()).discord.state, 'available')
  assert.ok(store.has('https://portal.example/api/community-status'))
  assert.ok(
    store.has('https://portal.example/api/community-status/last-discord'),
  )
  assert.doesNotMatch(
    await store
      .get('https://portal.example/api/community-status/last-discord')
      .clone()
      .text(),
    /private-name|membersPrivate/u,
  )
  store.delete('https://portal.example/api/community-status')
  value.discord.state = 'unavailable'
  const failed = await onRequestGet({
    request,
    env,
    waitUntil: (promise) => writes.push(promise),
  })
  await Promise.all(writes)
  const status = await failed.json()
  assert.equal(status.discord.state, 'stale')
  assert.equal(status.discord.checkedAt, observation)
  assert.equal(status.announcements.state, 'available')
  assert.equal(status.events.state, 'available')
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

test('verified gallery locations survive locale links and forward only bounded map coordinates', () => {
  const query = 'worldname=world&mapname=surface&zoom=3&x=82&y=64&z=16'
  const href = `/world-map-main/?${query}`
  assert.equal(isGalleryMapLocation(href), true)
  assert.equal(localizePath('en', href), `/en${href}`)
  assert.equal(
    mapLocationLink('/en/world-map-main/', `?${query}`),
    `/en${href}`,
  )
  assert.equal(mapLocationLink('/world-map-main/', `?${query}`), href)
  assert.equal(mapLocationLink('/alpha-diary/', `?${query}`), '/alpha-diary/')
  assert.equal(
    mapLocationLink('/en/world-map-main/', '?x=1&follow=private-name'),
    '/en/world-map-main/',
  )
  assert.equal(
    mapEmbedUrl(
      'https://mc-map-main.acecore.net',
      `?${query}&playername=private-name&follow=private-name&url=https://attacker.example`,
    ),
    `https://mc-map-main.acecore.net/?${query}`,
  )
  assert.equal(
    mapEmbedUrl(
      'https://mc-map-sigen.acecore.net/?worldname=world&mapname=flat',
      '',
    ),
    'https://mc-map-sigen.acecore.net/?worldname=world&mapname=flat',
  )
  assert.equal(
    mapEmbedUrl('https://mc-map-main.acecore.net', '?x=1&z=2'),
    'https://mc-map-main.acecore.net/',
  )
  for (const source of [
    'https://attacker.example/',
    'https://mc-map-main.acecore.net/other',
    'https://mc-map-main.acecore.net/?playername=private-name',
    'https://user:pass@mc-map-main.acecore.net/',
    'https://mc-map-main.acecore.net:444/',
  ])
    assert.equal(mapEmbedUrl(source, `?${query}`), null)
  for (const invalid of [
    `${query}&x=1`,
    query.replace('x=82', 'x=Infinity'),
    query.replace('x=82', 'x=30000001'),
    query.replace('y=64', 'y=9999'),
    query.replace('zoom=3', 'zoom=11'),
    query.replace('zoom=3', 'zoom=1.5'),
    query.replace('mapname=surface', 'mapname=../../secret'),
  ])
    assert.equal(mapLocationQuery(invalid), null)
  for (const invalid of [
    `/world-map-main/?${query}&follow=private-name`,
    `/world-map-main/?${query}?ignored=1`,
    `/world-map-main/?${query}#playername=private-name`,
    `/alpha-diary/?${query}`,
    `/world-map-resource/?${query}`,
    `//attacker.example/?${query}`,
    '/world-map-main/',
  ])
    assert.equal(isGalleryMapLocation(invalid), false)
})

test('all existing map sources retain their configured default view', async () => {
  for (const id of [
    'main',
    'sigen',
    'rpg',
    'lobby',
    'rpg-sub',
    'season-a',
    'season-a-c',
    'event',
  ]) {
    const page = JSON.parse(
      await readFile(
        new URL(`../src/content/pages/world-map-${id}.json`, import.meta.url),
        'utf8',
      ),
    )
    const source = page.sections.find(
      (section) => section.variant === 'map',
    ).src
    assert.equal(mapEmbedUrl(source, ''), new URL(source).href)
  }
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
  const archive = structuredClone(top)
  archive.community.gallery[0].context = 'archive'
  assert.equal(
    validatePortalContentFile('src/content/pages/top.json', archive).ok,
    false,
  )
  delete archive.community.gallery[0].href
  assert.equal(
    validatePortalContentFile('src/content/pages/top.json', archive).ok,
    true,
  )
  for (const mutate of [
    (page) => (page.community.gallery[0].image = '/uploads/../secret.png'),
    (page) => (page.community.gallery[0].href = 'https://attacker.example/'),
    (page) => (page.community.gallery[0].href = '/world-map-main/'),
    (page) => delete page.community.gallery[0].context,
    (page) => delete page.community.gallery[0].periodLabel,
    (page) => delete page.community.gallery[0].href,
    (page) => delete page.community.heroCaption,
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
