import { renderCommunityMarkdown } from './community-markdown.ts'

type Kind = 'announcements' | 'events'
type FeedItem = {
  id: string
  url: string
  label: string
  body: string
  published: string
  endsAt?: string
}

export function renderCommunityFeedItems(
  list: Element,
  kind: Kind,
  items: unknown[],
  date: Intl.DateTimeFormat,
  openOriginal: string,
) {
  const document = list.ownerDocument
  const open = new Set(
    [...list.querySelectorAll<HTMLDetailsElement>('details[open]')].map(
      (item) => item.dataset.feedId,
    ),
  )
  const valid = items.flatMap((raw): FeedItem[] => {
    if (!raw || typeof raw !== 'object') return []
    const item = raw as Record<string, unknown>
    const label = kind === 'events' ? item.name : item.text
    const body = kind === 'events' ? item.description : item.text
    const published = kind === 'events' ? item.startsAt : item.publishedAt
    const url = item.url
    if (
      typeof item.id !== 'string' ||
      typeof label !== 'string' ||
      typeof body !== 'string' ||
      typeof published !== 'string' ||
      !Number.isFinite(Date.parse(published)) ||
      typeof url !== 'string' ||
      !(
        kind === 'events'
          ? /^https:\/\/discord\.com\/events\/737538781024092170\/\d{16,22}$/u
          : /^https:\/\/discord\.com\/channels\/737538781024092170\/774152638450237460\/\d{16,22}$/u
      ).test(url) ||
      (kind === 'events' &&
        item.endsAt != null &&
        (typeof item.endsAt !== 'string' ||
          !Number.isFinite(Date.parse(item.endsAt))))
    )
      return []
    return [
      {
        id: item.id,
        url,
        label,
        body,
        published,
        endsAt:
          kind === 'events' ? (item.endsAt as string | undefined) : undefined,
      },
    ]
  })
  if (kind === 'events')
    valid.sort((a, b) => Date.parse(a.published) - Date.parse(b.published))
  list.replaceChildren()
  valid.forEach((item, index) => {
    const featured = kind === 'events' && index === 0
    const article = document.createElement(featured ? 'article' : 'details')
    article.className = featured ? 'feed-item feed-item--featured' : 'feed-item'
    article.dataset.feedId = item.id
    if (!featured) (article as HTMLDetailsElement).open = open.has(item.id)
    const heading = document.createElement(featured ? 'header' : 'summary')
    heading.className = 'feed-heading'
    const time = document.createElement('time')
    time.dateTime = item.published
    time.textContent =
      date.format(new Date(item.published)) +
      (item.endsAt ? ' – ' + date.format(new Date(item.endsAt)) : '') +
      ' (JST)'
    const title = document.createElement(featured ? 'h5' : 'span')
    title.className = 'feed-title'
    title.textContent =
      kind === 'announcements' && item.label.length > 110
        ? item.label.slice(0, 110) + '…'
        : item.label
    heading.append(time, title)
    const body = document.createElement('div')
    body.className = 'feed-body'
    body.append(renderCommunityMarkdown(document, item.body))
    const source = document.createElement('a')
    source.href = item.url
    source.target = '_blank'
    source.rel = 'noopener noreferrer'
    source.textContent = openOriginal
    article.append(heading, body, source)
    list.append(article)
  })
}
