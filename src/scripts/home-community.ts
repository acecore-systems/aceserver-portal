import type { CommunityUi } from '../data/community-ui'
import { activityDay } from '../lib/community-history'
import { observationState } from '../lib/community-freshness'
import { renderCommunityFeedItems } from '../lib/community-feed'

const count = (value: unknown): value is number =>
  Number.isSafeInteger(value) &&
  Number(value) >= 0 &&
  Number(value) <= 1_000_000
const copyFor = (element: HTMLElement): CommunityUi =>
  JSON.parse(element.dataset.copy ?? '{}')
const dateFormatter = (locale = 'ja') =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  })

function initStatus(root: HTMLElement) {
  const ui = copyFor(root)
  const number = new Intl.NumberFormat(root.dataset.locale)
  const date = dateFormatter(root.dataset.locale)
  const refresh = root.querySelector<HTMLButtonElement>('[data-refresh]')!
  let lastPayload: any
  let refreshFailed = false
  let busy = false
  let lastAttempt = 0
  function text(selector: string, value: string) {
    const item = root.querySelector(selector)
    if (item) item.textContent = value
  }
  function renderFeed(kind: 'announcements' | 'events') {
    const container = root.querySelector<HTMLElement>(
      '[data-feed-' + kind + ']',
    )!
    const feed = lastPayload?.[kind]
    const freshness = observationState(
      feed?.checkedAt,
      Date.now(),
      refreshFailed,
    )
    const available =
      feed?.state === 'available' &&
      freshness !== 'unavailable' &&
      Array.isArray(feed.items)
    const items = available
      ? feed.items.filter(
          (item: any) =>
            kind !== 'events' ||
            !item.endsAt ||
            Date.parse(item.endsAt) >= Date.now(),
        )
      : []
    const state = container.querySelector<HTMLElement>('[data-feed-state]')!
    state.textContent = !available
      ? ui.feedUnavailable
      : freshness === 'stale'
        ? ui.stale
        : items.length
          ? ''
          : kind === 'events'
            ? ui.noEvents
            : ui.noAnnouncements
    state.hidden = state.textContent === ''
    state.dataset.state = !available ? 'unavailable' : freshness
    container.querySelector('[data-feed-time]')!.textContent = available
      ? ui.updated + ': ' + date.format(new Date(feed.checkedAt)) + ' (JST)'
      : ''
    const list = container.querySelector('[data-feed-items]')!
    renderCommunityFeedItems(list, kind, items, date, ui.openOriginal)
  }
  function render() {
    if (!lastPayload) return
    const now = Date.now()
    const discord = lastPayload.discord
    const freshness = observationState(
      discord?.checkedAt,
      now,
      refreshFailed || discord?.state === 'stale',
    )
    const discordAvailable =
      ['available', 'partial', 'stale'].includes(discord?.state) &&
      freshness !== 'unavailable'
    const hasMembers = discordAvailable && count(discord.members)
    const hasOnline = discordAvailable && count(discord.online)
    text(
      '[data-discord-members]',
      hasMembers ? number.format(discord.members) : '—',
    )
    text(
      '[data-discord-online]',
      hasOnline ? number.format(discord.online) : '—',
    )
    const state = root.querySelector<HTMLElement>('[data-discord-state]')!
    state.textContent =
      !hasMembers && !hasOnline
        ? ui.unavailable
        : freshness === 'stale'
          ? refreshFailed || discord?.state === 'stale'
            ? ui.previousValue
            : ui.stale
          : !hasMembers || !hasOnline
            ? ui.partial
            : ''
    state.dataset.state = !hasMembers && !hasOnline ? 'unavailable' : freshness
    state.hidden = state.textContent === ''
    const discordTime = root.querySelector<HTMLTimeElement>(
      '[data-discord-time]',
    )!
    discordTime.textContent =
      hasMembers || hasOnline
        ? ui.sampleTime +
          ': ' +
          date.format(new Date(discord.checkedAt)) +
          ' (JST)'
        : ''
    if (hasMembers || hasOnline) discordTime.dateTime = discord.checkedAt
    else discordTime.removeAttribute('datetime')
    root.querySelectorAll<HTMLElement>('[data-world]').forEach((element) => {
      const source = lastPayload.worlds?.find(
        (item: any) => item.id === element.dataset.world,
      )
      const sourceTime = Date.parse(source?.sourceUpdatedAt)
      const available =
        count(source?.count) &&
        observationState(source?.sourceUpdatedAt, now) !== 'unavailable' &&
        source.state !== 'unavailable'
      const worldState = !available
        ? 'unavailable'
        : refreshFailed ||
            source.state === 'stale' ||
            now - sourceTime > 5 * 60_000
          ? 'stale'
          : 'fresh'
      element.dataset.state = worldState
      element.querySelector('[data-world-count]')!.textContent = available
        ? number.format(source.count)
        : '—'
      element.querySelector('[data-world-state]')!.textContent =
        worldState === 'fresh'
          ? ui.mapFresh
          : worldState === 'stale'
            ? ui.stale
            : ui.unavailable
      const time = element.querySelector<HTMLTimeElement>('[data-world-time]')!
      time.textContent = available ? date.format(new Date(sourceTime)) : ''
      if (available) time.dateTime = source.sourceUpdatedAt
      else time.removeAttribute('datetime')
    })
    const checked = Date.parse(lastPayload.checkedAt)
    text(
      '[data-status-checked]',
      refreshFailed
        ? observationState(lastPayload.checkedAt, now) !== 'unavailable'
          ? ui.previousValue
          : ui.unavailable
        : Number.isFinite(checked)
          ? ui.updated + ': ' + date.format(new Date(checked)) + ' (JST)'
          : ui.unavailable,
    )
    renderFeed('events')
    renderFeed('announcements')
  }
  async function load() {
    if (busy || Date.now() - lastAttempt < 60_000) return
    busy = true
    lastAttempt = Date.now()
    refresh.disabled = true
    try {
      const response = await fetch('/api/community-status', {
        signal: AbortSignal.timeout(10_000),
        credentials: 'omit',
      })
      if (!response.ok) throw new Error('Status unavailable')
      const payload = await response.json()
      if (
        payload.version !== 1 ||
        !Array.isArray(payload.worlds) ||
        typeof payload.checkedAt !== 'string'
      )
        throw new Error('Status contract')
      lastPayload = payload
      refreshFailed = false
    } catch {
      // Keep successful observations with their original times, visibly stale, for at most six hours.
      refreshFailed = true
      lastPayload ??= {
        discord: { state: 'unavailable' },
        worlds: [],
        announcements: { state: 'unavailable' },
        events: { state: 'unavailable' },
      }
    } finally {
      render()
      busy = false
      window.setTimeout(
        () => {
          refresh.disabled = false
        },
        Math.max(0, 60_000 - (Date.now() - lastAttempt)),
      )
    }
  }
  refresh.hidden = false
  refresh.addEventListener('click', load)
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect()
        void load()
      }
    },
    { rootMargin: '200px' },
  )
  observer.observe(root)
  window.setInterval(render, 60_000)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) render()
  })
}

function initEmbeds() {
  document
    .querySelectorAll<HTMLElement>('[data-map-preview]')
    .forEach((root) => {
      const button = root.querySelector<HTMLButtonElement>('[data-load-map]')!
      button.hidden = false
      button.addEventListener(
        'click',
        () => {
          const url = root.dataset.mapUrl ?? ''
          if (
            !/^https:\/\/mc-map-(?:main|sigen|rpg|lobby|rpg-sub|season-a|season-a-c|event)\.acecore\.net\/$/u.test(
              url,
            )
          )
            return
          const frame = document.createElement('iframe')
          frame.src = url
          frame.title = root.dataset.mapTitle ?? 'Dynmap'
          frame.referrerPolicy = 'no-referrer'
          frame.loading = 'lazy'
          root.replaceChildren(frame)
        },
        { once: true },
      )
    })
  document
    .querySelectorAll<HTMLElement>('[data-selected-post]')
    .forEach((root) => {
      const button = root.querySelector<HTMLButtonElement>('[data-load-post]')!
      button.hidden = false
      button.addEventListener(
        'click',
        () => {
          const id = /^https:\/\/x\.com\/acecores\/status\/(\d+)$/iu.exec(
            root.dataset.postUrl ?? '',
          )?.[1]
          if (!id) return
          const frame = document.createElement('iframe')
          frame.src = `https://platform.twitter.com/embed/Tweet.html?id=${id}&dnt=true&lang=${encodeURIComponent(document.documentElement.lang)}`
          frame.title = root.querySelector('h3')?.textContent ?? 'X'
          frame.loading = 'lazy'
          frame.referrerPolicy = 'no-referrer'
          frame.setAttribute(
            'sandbox',
            'allow-scripts allow-same-origin allow-popups',
          )
          root.querySelector('[data-post-embed]')!.replaceChildren(frame)
          button.hidden = true
          root.querySelector<HTMLElement>('[data-embed-help]')!.hidden = false
        },
        { once: true },
      )
    })
}

function initHistory(root: HTMLElement) {
  const ui = copyFor(root)
  const history = JSON.parse(root.dataset.history ?? '{"samples":[]}')
  const samples = Array.isArray(history.samples) ? history.samples : []
  const select = root.querySelector<HTMLSelectElement>('[data-history-series]')!
  const chart = root.querySelector<SVGSVGElement>('[data-history-chart]')!
  const rows = root.querySelector('[data-history-rows]')!
  const date = dateFormatter(root.dataset.locale)
  const numbers = new Intl.NumberFormat(root.dataset.locale)
  const svg = (
    name: string,
    attributes: Record<string, string>,
    text?: string,
  ) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name)
    for (const [key, value] of Object.entries(attributes))
      element.setAttribute(key, value)
    if (text) element.textContent = text
    chart.append(element)
    return element
  }
  function render() {
    const key = select.value
    const values = samples.map((sample: any) =>
      key === 'discord-online'
        ? sample.discord?.online
        : key === 'discord-members'
          ? sample.discord?.members
          : sample.worlds?.[key],
    )
    const valid = values.filter(count)
    const showChart = valid.length >= 2
    chart.toggleAttribute('hidden', !showChart)
    root.querySelector<HTMLElement>('[data-history-empty]')!.hidden = showChart
    root.querySelector<HTMLElement>('[data-history-details]')!.hidden =
      samples.length === 0
    root.querySelector('[data-series-name]')!.textContent =
      select.selectedOptions[0].textContent
    rows.replaceChildren()
    samples.forEach((sample: any, index: number) => {
      const row = document.createElement('tr')
      for (const value of [
        date.format(new Date(sample.observedAt)),
        count(values[index]) ? numbers.format(values[index]) : ui.unavailable,
      ]) {
        const cell = document.createElement('td')
        cell.textContent = value
        row.append(cell)
      }
      rows.append(row)
    })
    chart.replaceChildren()
    if (!showChart) return
    const max = Math.max(1, ...valid)
    for (const [y, label] of [
      [160, '0'],
      [30, numbers.format(max)],
    ] as const) {
      svg('line', {
        x1: '50',
        x2: '540',
        y1: String(y),
        y2: String(y),
        stroke: '#d6d3c6',
      })
      svg(
        'text',
        {
          x: '44',
          y: String(y + 4),
          'text-anchor': 'end',
          'font-size': '12',
          fill: '#665e50',
        },
        label,
      )
    }
    let previous: { x: number; y: number; day: number } | undefined
    const firstDay = activityDay(samples[0].observedAt)
    const daySpan = Math.max(
      1,
      activityDay(samples.at(-1).observedAt) - firstDay,
    )
    values.forEach((value: unknown, index: number) => {
      if (!count(value)) {
        previous = undefined
        return
      }
      const point = {
        x:
          50 +
          ((activityDay(samples[index].observedAt) - firstDay) / daySpan) * 490,
        y: 160 - (value / max) * 130,
        day: activityDay(samples[index].observedAt),
      }
      if (previous && point.day - previous.day === 1)
        svg('line', {
          x1: String(previous.x),
          y1: String(previous.y),
          x2: String(point.x),
          y2: String(point.y),
          stroke: '#397248',
          'stroke-width': '3',
        })
      svg('circle', {
        cx: String(point.x),
        cy: String(point.y),
        r: '4',
        fill: '#397248',
      })
      previous = point
    })
    svg(
      'text',
      { x: '50', y: '190', 'font-size': '12', fill: '#665e50' },
      new Intl.DateTimeFormat(root.dataset.locale, {
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Tokyo',
      }).format(new Date(samples[0].observedAt)),
    )
    svg(
      'text',
      {
        x: '540',
        y: '190',
        'text-anchor': 'end',
        'font-size': '12',
        fill: '#665e50',
      },
      new Intl.DateTimeFormat(root.dataset.locale, {
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Tokyo',
      }).format(new Date(samples.at(-1).observedAt)),
    )
  }
  select.addEventListener('change', render)
  render()
}

document
  .querySelectorAll<HTMLElement>('[data-community-status]')
  .forEach(initStatus)
document
  .querySelectorAll<HTMLElement>('[data-community-history]')
  .forEach(initHistory)
initEmbeds()
