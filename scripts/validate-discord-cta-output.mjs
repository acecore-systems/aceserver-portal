import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from 'parse5'

const locales = ['ja', 'en', 'zh-cn', 'es', 'pt', 'fr', 'ko', 'de', 'ru']
const invite = 'https://discord.gg/KtEjYbPQ35'
const wiki = 'https://asv-wiki.acecore.net/article/in/'
function nodes(node) {
  return [node, ...(node.childNodes ?? []).flatMap(nodes)]
}
function attr(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value
}
function text(node) {
  return nodes(node)
    .map((item) => item.value ?? '')
    .join('')
}
for (const locale of locales) {
  const prefix = locale === 'ja' ? '' : `${locale}/`
  const home = nodes(parse(await readFile(`dist/${prefix}index.html`, 'utf8')))
  const story = nodes(
    parse(
      await readFile(
        `dist/${prefix}stories/aceserver-beginners-guide/index.html`,
        'utf8',
      ),
    ),
  )
  assert.ok(
    home.some(
      (n) => n.tagName === 'body' && attr(n, 'data-discord-locale') === locale,
    ),
  )
  assert.ok(
    home.some(
      (n) =>
        n.tagName === 'a' &&
        attr(n, 'data-discord-cta') === 'home' &&
        attr(n, 'href') === invite,
    ),
  )
  assert.ok(home.some((n) => attr(n, 'data-discord-cta') === 'alpha'))
  assert.ok(
    story.some(
      (n) => n.tagName === 'article' && attr(n, 'data-discord-cta') === 'story',
    ),
  )
  assert.ok(story.some((n) => n.tagName === 'a' && attr(n, 'href') === invite))
  const note = home.find((n) =>
    attr(n, 'class')?.split(' ').includes('join-language-note'),
  )
  if (locale === 'en') {
    assert.match(text(note), /Community guidance is mainly in Japanese/)
    const wikiLinks = story.filter(
      (n) => n.tagName === 'a' && attr(n, 'href') === wiki,
    )
    assert.ok(
      wikiLinks.length >= 1 && wikiLinks.every((n) => /Japanese/.test(text(n))),
    )
    assert.match(
      text(story.find((n) => n.tagName === 'article')),
      /Community guidance is mainly in Japanese/,
    )
  } else {
    assert.equal(note, undefined)
  }
}
console.log('Discord CTA output verified for nine locales.')
