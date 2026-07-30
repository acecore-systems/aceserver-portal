import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = path.join(root, 'dist')
const siteUrl = new URL('https://asv.acecore.net')
const errors = []
const stories = [
  { slug: 'aceserver-hijacked' },
  {
    slug: 'aceserver-portal-launch',
    image: '/uploads/stories/aceserver-portal-launch.webp',
    imageAlt:
      'Minecraftの街並みを背景にしたエースサーバーポータルのトップページ',
  },
  {
    slug: 'metaverse-is-close',
    image: '/uploads/stories/metaverse-is-close.webp',
    imageAlt: '仮想空間でつながる人々とVRヘッドセットを表したイメージ',
  },
]

function attributeValue(tag, name) {
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      'i',
    ),
  )
  return match ? (match[1] ?? match[2] ?? match[3]) : null
}

function metaContent(html, attributeName, expectedAttributeValue) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (expectedAttributeValue === attributeValue(match[0], attributeName)) {
      return attributeValue(match[0], 'content')
    }
  }
  return null
}

function jsonLdNodes(html, scope) {
  const nodes = []

  for (const match of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    if (
      attributeValue(match[1], 'type')?.toLowerCase() !== 'application/ld+json'
    ) {
      continue
    }

    try {
      const value = JSON.parse(match[2])
      const values = Array.isArray(value) ? value : [value]
      for (const item of values) {
        if (item && typeof item === 'object') {
          nodes.push(item)
          if (Array.isArray(item['@graph'])) nodes.push(...item['@graph'])
        }
      }
    } catch (error) {
      errors.push(`${scope}: invalid JSON-LD (${error.message})`)
    }
  }

  return nodes
}

function findNodeByType(nodes, type) {
  return nodes.find((node) => {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
    return types.includes(type) || types.includes(`https://schema.org/${type}`)
  })
}

function inspectBreadcrumb(html, nodes, storyUrl, scope) {
  const breadcrumb = findNodeByType(nodes, 'BreadcrumbList')
  const expectedItems = [
    siteUrl.toString(),
    new URL('/stories/', siteUrl).toString(),
    storyUrl.toString(),
  ]
  const actualItems = breadcrumb?.itemListElement?.map((item) => item.item)

  if (
    !breadcrumb ||
    !Array.isArray(actualItems) ||
    actualItems.length !== expectedItems.length ||
    expectedItems.some((item, index) => actualItems[index] !== item)
  ) {
    errors.push(`${scope}: BreadcrumbList does not contain the 3 expected URLs`)
  }

  const visibleBreadcrumb = html.match(
    /<nav\b[^>]*class\s*=\s*["'][^"']*\bstory-breadcrumb\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i,
  )?.[1]
  if (
    !visibleBreadcrumb ||
    !visibleBreadcrumb.includes('href="/"') ||
    !visibleBreadcrumb.includes('href="/stories/"')
  ) {
    errors.push(`${scope}: visible story breadcrumb is missing`)
  }
}

function inspectImage(html, article, story, scope) {
  if (!story.image) return

  const expectedImageUrl = new URL(story.image, siteUrl).toString()
  const hero = html.match(
    /<figure\b[^>]*class\s*=\s*["'][^"']*\bstory-hero\b[^"']*["'][^>]*>[\s\S]*?<img\b[^>]*>/i,
  )?.[0]

  if (
    !hero ||
    attributeValue(hero, 'src') !== story.image ||
    attributeValue(hero, 'alt') !== story.imageAlt
  ) {
    errors.push(`${scope}: migrated story hero image or alt is missing`)
  }

  for (const [attributeName, key, expected] of [
    ['property', 'og:image', expectedImageUrl],
    ['property', 'og:image:alt', story.imageAlt],
    ['name', 'twitter:image', expectedImageUrl],
    ['name', 'twitter:image:alt', story.imageAlt],
  ]) {
    if (metaContent(html, attributeName, key) !== expected) {
      errors.push(`${scope}: ${key} does not match the migrated story image`)
    }
  }

  if (article?.image !== expectedImageUrl) {
    errors.push(`${scope}: Article.image does not match the migrated image`)
  }
}

for (const story of stories) {
  const scope = `stories/${story.slug}`
  const storyUrl = new URL(`/stories/${story.slug}/`, siteUrl)
  let html

  try {
    html = await readFile(
      path.join(distDir, 'stories', story.slug, 'index.html'),
      'utf8',
    )
  } catch {
    errors.push(`${scope}: generated HTML is missing`)
    continue
  }

  const nodes = jsonLdNodes(html, scope)
  const article = findNodeByType(nodes, 'Article')
  if (!article || article.url !== storyUrl.toString()) {
    errors.push(`${scope}: Article JSON-LD is missing or has the wrong URL`)
  }

  inspectBreadcrumb(html, nodes, storyUrl, scope)
  inspectImage(html, article, story, scope)
}

if (errors.length > 0) {
  console.error('Generated story output validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `Generated story output validation passed for ${stories.length} story page(s).`,
)
