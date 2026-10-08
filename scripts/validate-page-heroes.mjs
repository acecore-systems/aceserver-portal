import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'parse5'
import { LOCALES } from '../src/i18n/config.ts'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const errors = []

function attribute(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value
}

function descendants(node, predicate) {
  return (node.childNodes ?? []).flatMap((child) => [
    ...(predicate(child) ? [child] : []),
    ...descendants(child, predicate),
  ])
}

function textContent(node) {
  return node.nodeName === '#text'
    ? node.value
    : (node.childNodes ?? []).map(textContent).join('')
}

const entries = await readdir(dist, { recursive: true, withFileTypes: true })
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => path.join(entry.parentPath, entry.name))
  .filter((file) => !path.relative(dist, file).startsWith(`admin${path.sep}`))
  .sort()

if (files.length === 0) errors.push('dist: no public HTML pages found')

for (const file of files) {
  const scope = path.relative(dist, file).replaceAll(path.sep, '/')
  const document = parse(await readFile(file, 'utf8'))
  const main = descendants(document, (node) => node.tagName === 'main')[0]
  const heroes = main
    ? descendants(
        main,
        (node) => attribute(node, 'data-page-hero') !== undefined,
      )
    : []
  if (heroes.length !== 1) {
    errors.push(
      `${scope}: expected one shared PageHero, found ${heroes.length}`,
    )
    continue
  }

  const hero = heroes[0]
  const isHome =
    scope === 'index.html' ||
    LOCALES.some((locale) => scope === `${locale}/index.html`)
  const expectedVariant = isHome ? 'home' : 'page'
  if (attribute(hero, 'data-page-hero-variant') !== expectedVariant) {
    errors.push(`${scope}: expected the shared ${expectedVariant} hero variant`)
  }
  const headings = descendants(main, (node) => node.tagName === 'h1')
  const heroHeadings = descendants(hero, (node) => node.tagName === 'h1')
  if (headings.length !== 1 || heroHeadings.length !== 1) {
    errors.push(`${scope}: the shared hero must own the page's only h1`)
    continue
  }

  const title = heroHeadings[0]
  if (
    !textContent(title).trim() ||
    !attribute(title, 'id') ||
    attribute(hero, 'aria-labelledby') !== attribute(title, 'id') ||
    attribute(title, 'data-page-hero-title') === undefined
  ) {
    errors.push(
      `${scope}: hero title or accessible heading association is missing`,
    )
  }

  for (const image of descendants(hero, (node) => node.tagName === 'img')) {
    if (!attribute(image, 'src') || !attribute(image, 'alt')?.trim()) {
      errors.push(`${scope}: hero image source or alt is missing`)
    }
  }
}

if (errors.length > 0) {
  console.error('Shared page hero validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `Shared page hero validation passed for all ${files.length} public HTML pages.`,
)
