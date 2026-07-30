import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  HTML_LANG_BY_LOCALE,
  LOCALES,
  OGP_LOCALE_BY_LOCALE,
} from '../src/i18n/config.ts'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = path.join(root, 'dist')
const site = new URL(process.env.PUBLIC_SITE_URL || 'https://asv.acecore.net')
const errors = []
const pageFiles = (await readdir(path.join(root, 'src/content/pages')))
  .filter((file) => file.endsWith('.json'))
  .sort()
const pageSlugs = await Promise.all(
  pageFiles.map(async (file) => {
    const value = JSON.parse(
      await readFile(path.join(root, 'src/content/pages', file), 'utf8'),
    )
    return value.slug
  }),
)
const storySlugs = [
  'aceserver-hijacked',
  'aceserver-portal-launch',
  'metaverse-is-close',
]

function fail(scope, message) {
  errors.push(`${scope}: ${message}`)
}

function localePath(locale, pathname) {
  return locale === 'ja' ? pathname : `/${locale}${pathname}`
}

function htmlPath(pathname) {
  const relative = pathname.replace(/^\/+|\/+$/gu, '')
  return relative
    ? path.join(distDir, relative, 'index.html')
    : path.join(distDir, 'index.html')
}

function attributeValue(tag, name) {
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      'iu',
    ),
  )
  return match ? (match[1] ?? match[2] ?? match[3]) : null
}

function metaContent(html, attributeName, attributeValueExpected) {
  for (const match of html.matchAll(/<meta\b[^>]*>/giu)) {
    if (attributeValue(match[0], attributeName) === attributeValueExpected) {
      return attributeValue(match[0], 'content')
    }
  }
  return null
}

function links(html) {
  return [...html.matchAll(/<(?:a|link)\b[^>]*>/giu)].map((match) => ({
    tag: match[0],
    href: attributeValue(match[0], 'href'),
    rel: attributeValue(match[0], 'rel'),
    hreflang: attributeValue(match[0], 'hreflang'),
  }))
}

function localAssetCandidates(html) {
  const candidates = new Set()
  for (const match of html.matchAll(/<[^>]+>/gu)) {
    for (const name of ['src', 'href', 'poster', 'content']) {
      const value = attributeValue(match[0], name)
      if (value) candidates.add(value)
    }
    const srcset = attributeValue(match[0], 'srcset')
    if (srcset) {
      for (const item of srcset.split(',')) {
        const value = item.trim().split(/\s+/u)[0]
        if (value) candidates.add(value)
      }
    }
  }
  for (const match of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/giu)) {
    candidates.add(match[1])
  }
  return candidates
}

async function inspectLocalAssets(html, scope) {
  for (const candidate of localAssetCandidates(html)) {
    let url
    try {
      url = new URL(candidate, site)
    } catch {
      continue
    }
    if (url.origin !== site.origin || !/\.[a-z\d]{2,8}$/iu.test(url.pathname)) {
      continue
    }

    let relativePath
    try {
      relativePath = decodeURIComponent(url.pathname).replace(/^\/+/u, '')
    } catch {
      fail(scope, `local asset has invalid encoding (${candidate})`)
      continue
    }
    const assetPath = path.resolve(distDir, relativePath)
    const distPrefix = `${path.resolve(distDir)}${path.sep}`
    if (!assetPath.startsWith(distPrefix)) {
      fail(scope, `local asset escapes dist (${candidate})`)
      continue
    }
    try {
      await access(assetPath)
    } catch {
      fail(scope, `local asset is missing (${url.pathname})`)
    }
  }
}

function jsonLdNodes(html, scope) {
  const nodes = []
  for (const match of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/giu,
  )) {
    if (attributeValue(match[1], 'type') !== 'application/ld+json') continue
    try {
      const value = JSON.parse(match[2])
      nodes.push(...(Array.isArray(value) ? value : [value]))
    } catch (error) {
      fail(scope, `invalid JSON-LD (${error.message})`)
    }
  }
  return nodes
}

function nodeByType(nodes, type) {
  return nodes.find((node) => {
    const types = Array.isArray(node?.['@type'])
      ? node['@type']
      : [node?.['@type']]
    return types.includes(type)
  })
}

async function readHtml(pathname, scope) {
  try {
    return await readFile(htmlPath(pathname), 'utf8')
  } catch {
    fail(scope, `generated HTML is missing (${pathname})`)
    return null
  }
}

function inspectLanguageMetadata(html, locale, pathname, scope) {
  const expectedUrl = new URL(pathname, site).toString()
  const htmlTag = html.match(/<html\b[^>]*>/iu)?.[0] ?? ''
  if (attributeValue(htmlTag, 'lang') !== HTML_LANG_BY_LOCALE[locale]) {
    fail(scope, 'html lang is missing or invalid')
  }

  const pageLinks = links(html)
  const canonical = pageLinks.find((link) =>
    link.rel?.split(/\s+/u).includes('canonical'),
  )?.href
  if (canonical !== expectedUrl) {
    fail(scope, `canonical mismatch (expected ${expectedUrl})`)
  }

  const alternates = pageLinks.filter((link) => link.hreflang)
  const expectedAlternates = [
    ...LOCALES.map((alternateLocale) => ({
      hreflang: HTML_LANG_BY_LOCALE[alternateLocale],
      href: new URL(
        localePath(
          alternateLocale,
          pathname.replace(/^\/(?:en|zh-cn|es|pt|fr|ko|de|ru)(?=\/)/u, ''),
        ),
        site,
      ).toString(),
    })),
    {
      hreflang: 'x-default',
      href: new URL(
        pathname.replace(/^\/(?:en|zh-cn|es|pt|fr|ko|de|ru)(?=\/)/u, ''),
        site,
      ).toString(),
    },
  ]
  for (const expected of expectedAlternates) {
    if (
      !alternates.some(
        (alternate) =>
          alternate.hreflang === expected.hreflang &&
          alternate.href === expected.href,
      )
    ) {
      fail(scope, `hreflang ${expected.hreflang} is missing (${expected.href})`)
    }
  }

  if (
    metaContent(html, 'property', 'og:locale') !== OGP_LOCALE_BY_LOCALE[locale]
  ) {
    fail(scope, 'og:locale is missing or invalid')
  }
  for (const alternateLocale of LOCALES.filter(
    (candidate) => candidate !== locale,
  )) {
    const expected = OGP_LOCALE_BY_LOCALE[alternateLocale]
    if (
      ![...html.matchAll(/<meta\b[^>]*>/giu)].some(
        (match) =>
          attributeValue(match[0], 'property') === 'og:locale:alternate' &&
          attributeValue(match[0], 'content') === expected,
      )
    ) {
      fail(scope, `og:locale:alternate is missing (${expected})`)
    }
  }

  if (!html.includes(`data-alpha-locale="${locale}"`)) {
    fail(scope, 'Alpha locale data is missing')
  }
  if (!html.includes('https://asv-wiki.acecore.net')) {
    fail(scope, 'Aceserver WIKI authority link is missing')
  }
}

function inspectInternalLinks(html, locale, scope, knownRoutes) {
  const pageLinks = links(html)
  const expectedHomeHref = localePath(locale, '/')
  for (const className of ['brand', 'footer-brand']) {
    const homeLink = pageLinks.find(({ tag }) =>
      (attributeValue(tag, 'class') ?? '').split(/\s+/u).includes(className),
    )
    if (className === 'brand' && !homeLink) {
      fail(scope, 'brand home link is missing')
    } else if (homeLink && homeLink.href !== expectedHomeHref) {
      fail(scope, `${className} must link to locale home (${expectedHomeHref})`)
    }
  }

  for (const { tag, href } of pageLinks) {
    if (!tag.startsWith('<a') || !href || href.startsWith('#')) continue
    let url
    try {
      url = new URL(href, site)
    } catch {
      fail(scope, `invalid link (${href})`)
      continue
    }
    if (
      url.origin === 'https://acecore.net' ||
      url.origin === 'https://systems.acecore.net'
    ) {
      if (
        locale !== 'ja' &&
        url.pathname !== `/${locale}/` &&
        !url.pathname.startsWith(`/${locale}/`)
      ) {
        fail(scope, `cross-locale external link (${href})`)
      }
      if (
        locale === 'ja' &&
        LOCALES.some(
          (candidate) =>
            candidate !== 'ja' &&
            (url.pathname === `/${candidate}/` ||
              url.pathname.startsWith(`/${candidate}/`)),
        )
      ) {
        fail(scope, `Japanese page links to localized external route (${href})`)
      }
      continue
    }
    if (url.origin !== site.origin) continue

    const pathname = url.pathname
    if (
      locale !== 'ja' &&
      !pathname.startsWith(`/${locale}/`) &&
      !pathname.startsWith('/admin/') &&
      !pathname.startsWith('/uploads/')
    ) {
      fail(scope, `cross-locale internal link (${href})`)
    }

    if (
      !pathname.startsWith('/uploads/') &&
      !pathname.startsWith('/api/') &&
      !knownRoutes.has(pathname)
    ) {
      fail(scope, `internal link has no generated route (${href})`)
    }
  }
}

function inspectStorySeo(html, locale, pathname, scope) {
  if (metaContent(html, 'property', 'og:type') !== 'article') {
    fail(scope, 'Article OGP type is missing')
  }
  const nodes = jsonLdNodes(html, scope)
  const article = nodeByType(nodes, 'Article')
  const breadcrumb = nodeByType(nodes, 'BreadcrumbList')
  const expectedUrl = new URL(pathname, site).toString()
  if (
    article?.url !== expectedUrl ||
    article?.inLanguage !== HTML_LANG_BY_LOCALE[locale] ||
    article?.mainEntityOfPage?.['@id'] !== `${expectedUrl}#webpage`
  ) {
    fail(scope, 'Article JSON-LD URL or language is invalid')
  }
  const items = breadcrumb?.itemListElement
  const expectedBreadcrumbUrls = [
    new URL(localePath(locale, '/'), site).toString(),
    new URL(localePath(locale, '/stories/'), site).toString(),
    expectedUrl,
  ]
  if (
    !Array.isArray(items) ||
    items.length !== 3 ||
    items.some(
      (item, index) =>
        item?.position !== index + 1 ||
        item?.item !== expectedBreadcrumbUrls[index] ||
        !item?.name,
    )
  ) {
    fail(scope, 'Breadcrumb JSON-LD is invalid')
  }
}

const knownRoutes = new Set(['/admin/'])
for (const locale of LOCALES) {
  for (const slug of pageSlugs) {
    knownRoutes.add(localePath(locale, slug === 'top' ? '/' : `/${slug}/`))
  }
  knownRoutes.add(localePath(locale, '/stories/'))
  knownRoutes.add(localePath(locale, '/404/'))
  for (const slug of storySlugs) {
    knownRoutes.add(localePath(locale, `/stories/${slug}/`))
  }
}

for (const locale of LOCALES) {
  const publicPaths = [
    ...pageSlugs.map((slug) =>
      localePath(locale, slug === 'top' ? '/' : `/${slug}/`),
    ),
    localePath(locale, '/stories/'),
    ...storySlugs.map((slug) => localePath(locale, `/stories/${slug}/`)),
  ]

  for (const pathname of publicPaths) {
    const scope = `${locale}:${pathname}`
    const html = await readHtml(pathname, scope)
    if (!html) continue
    inspectLanguageMetadata(html, locale, pathname, scope)
    inspectInternalLinks(html, locale, scope, knownRoutes)
    await inspectLocalAssets(html, scope)
    if (/\/stories\/[^/]+\/$/u.test(pathname)) {
      inspectStorySeo(html, locale, pathname, scope)
    }
  }

  const rssPath = path.join(distDir, locale === 'ja' ? '' : locale, 'rss.xml')
  try {
    const rss = await readFile(rssPath, 'utf8')
    if (!rss.includes(`<language>${HTML_LANG_BY_LOCALE[locale]}</language>`)) {
      fail(`${locale}:rss`, 'RSS language is invalid')
    }
    const itemCount = [...rss.matchAll(/<item>/gu)].length
    if (itemCount !== storySlugs.length) {
      fail(
        `${locale}:rss`,
        `expected ${storySlugs.length} items, found ${itemCount}`,
      )
    }
    for (const slug of storySlugs) {
      const expected = new URL(
        localePath(locale, `/stories/${slug}/`),
        site,
      ).toString()
      if (!rss.includes(`<link>${expected}</link>`)) {
        fail(`${locale}:rss`, `Story link is missing (${expected})`)
      }
    }
  } catch {
    fail(`${locale}:rss`, 'generated RSS is missing')
  }
}

const sitemapFiles = (await readdir(distDir, { recursive: true }))
  .filter((file) => /^sitemap.*\.xml$/iu.test(path.basename(file)))
  .map((file) => path.join(distDir, file))
const sitemapXml = (
  await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))
).join('\n')
for (const route of knownRoutes) {
  if (route === '/admin/' || /\/404\/$/u.test(route)) continue
  const expectedUrl = new URL(route, site).toString()
  if (!sitemapXml.includes(`<loc>${expectedUrl}</loc>`)) {
    fail('sitemap', `public route is missing (${expectedUrl})`)
  }
}
if (!sitemapXml.includes('hreflang="x-default"')) {
  fail('sitemap', 'x-default alternates are missing')
}
for (const locale of LOCALES) {
  if (!sitemapXml.includes(`hreflang="${HTML_LANG_BY_LOCALE[locale]}"`)) {
    fail('sitemap', `locale alternate is missing (${locale})`)
  }
}

if (errors.length > 0) {
  console.error('Generated i18n output validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `Generated i18n output validation passed for ${LOCALES.length} locales, ${knownRoutes.size - 1} public routes, ${LOCALES.length} RSS feeds, and sitemap alternates.`,
)
