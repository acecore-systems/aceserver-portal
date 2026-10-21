import assert from 'node:assert/strict'
import test from 'node:test'
import { renderCommunityMarkdown } from '../src/lib/community-markdown.ts'
import { renderCommunityFeedItems } from '../src/lib/community-feed.ts'

// A DOM double which rejects HTML parsing and supports the renderer's DOM API.
function createDocument() {
  const document = {
    createElement: (tag) => node(tag),
    createTextNode: (text) => node('#text', text),
    createDocumentFragment: () => node('#fragment'),
  }
  function node(tag, text = '') {
    return {
      tagName: tag,
      ownerDocument: document,
      dataset: {},
      childNodes: [],
      attributes: {},
      get textContent() {
        return text + this.childNodes.map((child) => child.textContent).join('')
      },
      set textContent(value) {
        text = value
        this.childNodes = []
      },
      set innerHTML(_value) {
        throw new Error('HTML parsing is forbidden')
      },
      append(...children) {
        for (const child of children)
          this.childNodes.push(
            ...(child.tagName === '#fragment' ? child.childNodes : [child]),
          )
      },
      replaceChildren(...children) {
        this.childNodes = []
        this.append(...children)
      },
      setAttribute(name, value) {
        this.attributes[name] = value
      },
      querySelectorAll(selector) {
        assert.equal(selector, 'details[open]')
        return descendants(this, 'details').filter((child) => child.open)
      },
    }
  }
  return document
}
function descendants(root, tag) {
  return root.childNodes.flatMap((child) => [
    ...(child.tagName === tag ? [child] : []),
    ...descendants(child, tag),
  ])
}

test('Discord headings, quotes, lists and inline formatting become readable DOM elements', () => {
  const result = renderCommunityMarkdown(
    createDocument(),
    '## 開催内容\n\n> 引用\n> ・参加案内\n\n- **強調**と*斜体*と`/spawn`\n\n3. 順序あり\n\n[公式](https://asv.acecore.net/)',
  )
  for (const tag of ['h6', 'blockquote', 'ul', 'ol', 'strong', 'em', 'code'])
    assert.equal(descendants(result, tag).length, 1, tag)
  assert.equal(descendants(result, 'h6')[0].textContent, '開催内容')
  assert.equal(
    descendants(result, 'blockquote')[0].textContent,
    '引用\n・参加案内',
  )
  assert.equal(descendants(result, 'ol')[0].attributes.start, '3')
  const link = descendants(result, 'a')[0]
  assert.equal(link.href, 'https://asv.acecore.net/')
  assert.equal(link.target, '_blank')
  assert.equal(link.rel, 'noopener noreferrer')
  assert.doesNotMatch(result.textContent, /##|\*\*|^>/u)
})

test('raw HTML, executable URLs and external images never create active content', () => {
  const document = createDocument()
  for (const url of [
    'javascript:alert%281%29',
    'data:text/html,attack',
    'file:///private',
    '//attacker.example/',
    'https://user:password@example.com/',
  ]) {
    const result = renderCommunityMarkdown(document, `[案内](${url})`)
    assert.equal(descendants(result, 'a').length, 0, url)
    assert.equal(result.textContent, '案内')
  }
  const html = '<img src="https://attacker.example/pixel" onerror="attack()">'
  const result = renderCommunityMarkdown(
    document,
    `${html}\n\n![画像の説明](https://attacker.example/image.png)\n\n<script>attack()</script>`,
  )
  assert.equal(descendants(result, 'img').length, 0)
  assert.equal(descendants(result, 'script').length, 0)
  assert.ok(result.textContent.includes(html))
  assert.ok(result.textContent.includes('画像の説明'))
})

const date = new Intl.DateTimeFormat('ja', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Tokyo',
})
const event = (id, startsAt) => ({
  id,
  name: `イベント${id}`,
  description: '## 詳細\n\n> 参加できます',
  startsAt,
  endsAt: null,
  url: `https://discord.com/events/737538781024092170/${id}`,
})
const first = event('1557348128615833610', '2026-11-07T12:00:00Z')
const second = event('1557348128615833611', '2026-11-14T12:00:00Z')
const third = event('1557348128615833612', '2026-11-21T12:00:00Z')

test('the earliest valid event is always visible and cannot collapse, while later open states survive refresh', () => {
  const list = createDocument().createElement('div')
  const render = () =>
    renderCommunityFeedItems(
      list,
      'events',
      [{ ...first, url: 'https://attacker.example/' }, third, first, second],
      date,
      'Discordで確認',
    )
  render()
  assert.deepEqual(
    list.childNodes.map((item) => item.dataset.feedId),
    [first.id, second.id, third.id],
  )
  const featured = list.childNodes[0]
  assert.equal(featured.tagName, 'article')
  assert.equal(descendants(featured, 'summary').length, 0)
  assert.equal(descendants(featured, 'h5')[0].textContent, first.name)
  assert.equal(descendants(featured, 'blockquote').length, 1)
  assert.equal(list.childNodes[1].tagName, 'details')
  assert.equal(list.childNodes[1].open, false)
  list.childNodes[1].open = true
  render()
  assert.equal(list.childNodes[0].tagName, 'article')
  assert.equal(list.childNodes[1].open, true)
  assert.equal(list.childNodes[2].open, false)
})

test('announcements retain collapsed defaults and their chosen open state with rich text bodies', () => {
  const list = createDocument().createElement('div')
  const notice = {
    id: first.id,
    text: '## お知らせ\n\n**重要**です',
    publishedAt: first.startsAt,
    url: `https://discord.com/channels/737538781024092170/774152638450237460/${first.id}`,
  }
  const render = () =>
    renderCommunityFeedItems(list, 'announcements', [notice], date, '原文')
  render()
  assert.equal(list.childNodes[0].tagName, 'details')
  assert.equal(list.childNodes[0].open, false)
  assert.equal(descendants(list, 'strong').length, 1)
  list.childNodes[0].open = true
  render()
  assert.equal(list.childNodes[0].open, true)
})
