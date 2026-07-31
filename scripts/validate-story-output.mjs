import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = path.join(root, 'dist')
const siteUrl = new URL(
  process.env.PUBLIC_SITE_URL || 'https://asv.acecore.net',
)
const settings = JSON.parse(
  await readFile(path.join(root, 'src', 'content', 'site', 'settings.json')),
)
const errors = []
const stories = [
  {
    slug: 'aceserver-hijacked',
    title: 'エースサーバー、乗っ取られる。',
    description:
      'エースサーバーで起きた「乗っ取り」イベントの記録。メンバーたちの理性が次々と侵食されていく、衝撃のドキュメント。',
    author: 'ハット',
    datePublished: '2022-10-11T15:00:00.000Z',
  },
  {
    slug: 'aceserver-portal-launch',
    title: 'エースサーバーポータルを公開しました',
    description:
      'Discord、Wiki、動画、ワールドマップに分かれていた参加前の情報を、一つの入口へ整理しました。',
    author: 'Gui',
    datePublished: '2026-06-07T01:00:00.000Z',
    image: '/uploads/stories/aceserver-portal-launch.webp',
    imageAlt:
      'Minecraftの街並みを背景にしたエースサーバーポータルのトップページ',
  },
  {
    slug: 'minecraft-server-osusume',
    title: 'おすすめのマイクラサーバーを探す前に。自分に合う選び方',
    description:
      '「おすすめ」をそのまま選ぶ前に、遊び方・参加しやすさ・ルールを確認するための6つのポイントと、エースサーバーが合う人の目安を紹介します。',
    author: 'Gui',
    datePublished: '2026-07-31T01:00:00.000Z',
    image: '/uploads/legacy-multiplayer.jpg',
    imageAlt: '夕焼けの海を岩場から眺めるMinecraftのプレイヤー',
  },
  {
    slug: 'metaverse-is-close',
    title: 'メタバースは案外身近にあるよね',
    description:
      'VRゴーグルだけではなく、人が集まり交流するMinecraftのような仮想空間もメタバースではないか、という話。',
    author: 'Gui',
    datePublished: '2023-03-22T15:00:00.000Z',
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

function canonicalHref(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attributeValue(match[0], 'rel')?.toLowerCase().split(/\s+/)
    if (rel?.includes('canonical')) return attributeValue(match[0], 'href')
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

function inspectBreadcrumb(html, nodes, story, storyUrl, scope) {
  const breadcrumb = findNodeByType(nodes, 'BreadcrumbList')
  const expectedItems = [
    siteUrl.toString(),
    new URL('/stories/', siteUrl).toString(),
    storyUrl.toString(),
  ]
  const actualItems = breadcrumb?.itemListElement
  const actualUrls = actualItems?.map((item) => item.item)

  if (
    !breadcrumb ||
    !Array.isArray(actualUrls) ||
    actualUrls.length !== expectedItems.length ||
    expectedItems.some((item, index) => actualUrls[index] !== item)
  ) {
    errors.push(`${scope}: BreadcrumbList does not contain the 3 expected URLs`)
  }
  if (
    !Array.isArray(actualItems) ||
    actualItems.some(
      (item, index) =>
        item?.['@type'] !== 'ListItem' ||
        item.position !== index + 1 ||
        typeof item.name !== 'string' ||
        item.name.trim() === '',
    ) ||
    actualItems?.[0]?.name !== 'ホーム' ||
    actualItems?.[1]?.name !== '読みもの' ||
    actualItems?.[2]?.name !== story.title
  ) {
    errors.push(`${scope}: BreadcrumbList names or positions are invalid`)
  }

  const visibleBreadcrumb = html.match(
    /<nav\b[^>]*class\s*=\s*["'][^"']*\bstory-breadcrumb\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i,
  )?.[1]
  if (
    !visibleBreadcrumb ||
    !visibleBreadcrumb.includes('href="/"') ||
    !visibleBreadcrumb.includes('href="/stories/"') ||
    !visibleBreadcrumb.includes('aria-current="page"') ||
    !visibleBreadcrumb.includes(story.title)
  ) {
    errors.push(`${scope}: visible story breadcrumb is missing`)
  }
}

function inspectImage(html, article, story, scope) {
  const expectedImage = story.image ?? settings.logo
  const expectedImageAlt = story.imageAlt ?? settings.logoAlt
  const expectedImageUrl = new URL(expectedImage, siteUrl).toString()
  const hero = html.match(
    /<figure\b[^>]*class\s*=\s*["'][^"']*\bstory-hero\b[^"']*["'][^>]*>[\s\S]*?<img\b[^>]*>/i,
  )?.[0]

  if (story.image) {
    if (
      !hero ||
      attributeValue(hero, 'src') !== story.image ||
      attributeValue(hero, 'alt') !== story.imageAlt
    ) {
      errors.push(`${scope}: migrated story hero image or alt is missing`)
    }
  } else if (hero) {
    errors.push(`${scope}: story without an image unexpectedly renders a hero`)
  }

  for (const [attributeName, key, expected] of [
    ['property', 'og:image', expectedImageUrl],
    ['property', 'og:image:alt', expectedImageAlt],
    ['name', 'twitter:image', expectedImageUrl],
    ['name', 'twitter:image:alt', expectedImageAlt],
  ]) {
    if (metaContent(html, attributeName, key) !== expected) {
      errors.push(`${scope}: ${key} does not match the migrated story image`)
    }
  }

  if (story.image && article?.image !== expectedImageUrl) {
    errors.push(`${scope}: Article.image does not match the migrated image`)
  }
  if (!story.image && Object.hasOwn(article ?? {}, 'image')) {
    errors.push(`${scope}: Article.image must be omitted without a story image`)
  }
}

function inspectPageMetadata(html, article, story, storyUrl, scope) {
  const expectedUrl = storyUrl.toString()
  const expectedPageTitle = `${story.title} | ${settings.shortTitle}`
  if (canonicalHref(html) !== expectedUrl) {
    errors.push(`${scope}: canonical does not match the story URL`)
  }
  for (const [attributeName, key, expected] of [
    ['property', 'og:type', 'article'],
    ['property', 'og:url', expectedUrl],
    ['property', 'og:title', expectedPageTitle],
    ['property', 'og:description', story.description],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', expectedPageTitle],
    ['name', 'twitter:description', story.description],
  ]) {
    if (metaContent(html, attributeName, key) !== expected) {
      errors.push(`${scope}: ${key} metadata is missing or invalid`)
    }
  }

  if (
    !article ||
    article['@id'] !== `${expectedUrl}#article` ||
    article.url !== expectedUrl ||
    article.mainEntityOfPage?.['@id'] !== `${expectedUrl}#webpage` ||
    article.headline !== story.title ||
    article.description !== story.description ||
    article.datePublished !== story.datePublished ||
    article.author?.name !== story.author ||
    article.publisher?.['@id'] !== `${siteUrl}#organization`
  ) {
    errors.push(`${scope}: Article JSON-LD core fields are missing or invalid`)
  }
}

async function inspectStoryIndex() {
  const scope = 'stories/index'
  let html

  try {
    html = await readFile(path.join(distDir, 'stories', 'index.html'), 'utf8')
  } catch {
    errors.push(`${scope}: generated HTML is missing`)
    return
  }

  const expectedUrl = new URL('/stories/', siteUrl).toString()
  if (canonicalHref(html) !== expectedUrl) {
    errors.push(`${scope}: canonical does not match the story index URL`)
  }

  for (const story of stories) {
    const href = `/stories/${story.slug}/`
    const occurrences = [...html.matchAll(/<a\b[^>]*>/gi)].filter(
      (match) => attributeValue(match[0], 'href') === href,
    ).length
    if (occurrences !== 1) {
      errors.push(
        `${scope}: expected one detail link for ${story.slug}, found ${occurrences}`,
      )
    }
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

  inspectPageMetadata(html, article, story, storyUrl, scope)
  inspectBreadcrumb(html, nodes, story, storyUrl, scope)
  inspectImage(html, article, story, scope)
}

await inspectStoryIndex()

if (errors.length > 0) {
  console.error('Generated story output validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `Generated story output validation passed for ${stories.length} story page(s).`,
)
