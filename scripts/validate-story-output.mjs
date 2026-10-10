import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { readStoryMetadata } from './story-source-metadata.mjs'

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
    slug: 'minecraft-skin-maker-guide',
    author: 'Gui',
    datePublished: '2026-09-30T12:15:00.000Z',
    image: '/uploads/stories/minecraft-skin-maker-cover-v2.webp',
    imageAlt:
      '白いブロック人形と絵具パレットによるスキン作成の説明用イラスト。生成スキンの実例ではない。',
  },
  {
    slug: 'aceserver-hijacked',
    author: 'ハット',
    datePublished: '2022-10-11T15:00:00.000Z',
    image: '/uploads/stories/aceserver-hijacked.webp',
    imageAlt:
      '夜のブロックで作られた街を、紫と緑の光を放つ異常なサーバー装置が侵食しているイメージ',
  },
  {
    slug: 'aceserver-portal-launch',
    author: 'Gui',
    datePublished: '2026-06-07T01:00:00.000Z',
    image: '/uploads/stories/aceserver-portal-launch.webp',
    imageAlt:
      'Minecraftの街並みを背景にしたエースサーバーポータルのトップページ',
  },
  {
    slug: 'aceserver-beginners-guide',
    author: 'Gui',
    datePublished: '2026-08-09T01:00:00.000Z',
    image: '/uploads/stories/aceserver-beginners-guide-hero.png',
    imageAlt:
      '地図を持つ旅人が、ポータル、ワールドマップ、動画画面、ガイドブック、案内所をたどるブロック調の風景',
  },
  {
    slug: 'alpha-diary-guide',
    author: 'Gui',
    datePublished: '2026-09-24T15:00:00.000Z',
    image: '/uploads/stories/alpha-diary-guide-hero.webp',
    imageAlt:
      '開いた絵日記と日付を選ぶカレンダーを、ブロック調の風景に置いた案内用イラスト',
  },
  {
    slug: 'wiki-alpha-guide',
    author: 'Gui',
    datePublished: '2026-09-27T13:40:00.000Z',
    image: '/uploads/stories/wiki-alpha-guide-hero.webp',
    imageAlt:
      '公式アルファくんが開いた案内書と検索結果を示す、ブロック調の案内イラスト',
  },
  {
    slug: 'minecraft-server-cannot-join',
    author: 'Gui',
    datePublished: '2026-08-08T01:00:00.000Z',
    image: '/uploads/stories/minecraft-server-cannot-join-hero.webp',
    imageAlt:
      'パソコン・スマートフォン・ゲームコントローラーへ分かれる道を前に、地図を持つ旅人が接続先を選ぶブロック調の風景',
  },
  {
    slug: 'minecraft-java-bedrock-crossplay',
    author: 'Gui',
    datePublished: '2026-08-08T01:00:00.000Z',
    image: '/uploads/stories/minecraft-java-bedrock-crossplay-cover-v2.webp',
    imageAlt:
      'PCとタブレットから、共通のブロックの島へ橋を渡す説明用イラスト。実際の接続画面ではない',
  },
  {
    slug: 'minecraft-java-bedrock-shared-server',
    author: 'Gui',
    datePublished: '2026-08-09T01:00:00.000Z',
    image:
      '/uploads/stories/minecraft-java-bedrock-shared-server-cover-v2.webp',
    imageAlt:
      'サーバーを表すブロックの家にPCと橋を経由したタブレットがつながり、管理用の箱を分けた説明用イラスト',
  },
  {
    slug: 'minecraft-play-with-friends',
    author: 'Gui',
    datePublished: '2026-08-08T01:00:00.000Z',
    image: '/uploads/stories/minecraft-play-with-friends-hero.webp',
    imageAlt:
      'ブロック調の夕暮れの広場で、PC、携帯ゲーム機、スマホをそばに置き、地図を囲んで遊び方を相談する4人の友達',
  },
  {
    slug: 'minecraft-server-osusume',
    author: 'Gui',
    datePublished: '2026-08-01T01:00:00.000Z',
    image: '/uploads/stories/minecraft-server-osusume-cover-v2.webp',
    imageAlt:
      '街・鉄道・装置・市場・自然・建築の6種類の小さな島を並べた比較用イラスト。実サーバーのスクリーンショットではない',
  },
  {
    slug: 'minecraft-server-setup',
    author: 'Gui',
    datePublished: '2026-08-08T01:00:00.000Z',
    image: '/uploads/stories/minecraft-server-setup-cover-v2.webp',
    imageAlt:
      'ブロックの組立キット、工具、保管箱と小さなサーバーの家で、準備と運用を表した説明用イラスト',
  },
  {
    slug: 'metaverse-is-close',
    author: 'Gui',
    datePublished: '2023-03-22T15:00:00.000Z',
    image: '/uploads/stories/metaverse-is-close-cover-v2.webp',
    imageAlt:
      'PCとタブレットを入口に、人々がブロックの広場で共同建築を楽しむ説明用イラスト',
  },
]

for (const story of stories) {
  const markdown = await readFile(
    path.join(root, 'src/content/stories', `${story.slug}.md`),
    'utf8',
  )
  Object.assign(story, readStoryMetadata(markdown, story.slug))
}

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
    const detailLinks = [...html.matchAll(/<a\b[^>]*>/gi)]
      .map((match) => match[0])
      .filter((tag) => attributeValue(tag, 'href') === href)
    const thumbnailLink = detailLinks.find((tag) =>
      (attributeValue(tag, 'class') ?? '')
        .split(/\s+/)
        .includes('story-thumbnail'),
    )

    if (detailLinks.length !== 2) {
      errors.push(
        `${scope}: expected thumbnail and title links for ${story.slug}, found ${detailLinks.length}`,
      )
    }
    if (attributeValue(thumbnailLink ?? '', 'aria-label') !== story.title) {
      errors.push(`${scope}: thumbnail link is missing for ${story.slug}`)
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
