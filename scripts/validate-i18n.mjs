import { createHash } from 'node:crypto'
import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { LOCALES, TRANSLATED_LOCALES } from '../src/i18n/config.ts'
import { JA_UI, TRANSLATIONS } from '../src/i18n/translations.ts'
import { extractStoryMarkdownTargets } from './markdown-targets.mjs'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const errors = []
const expectedStorySlugs = [
  'aceserver-hijacked',
  'aceserver-portal-launch',
  'minecraft-java-bedrock-crossplay',
  'minecraft-java-bedrock-shared-server',
  'minecraft-server-cannot-join',
  'minecraft-server-osusume',
  'minecraft-server-setup',
  'metaverse-is-close',
]
const fixedSourceFiles = [
  ...(await readdir(path.join(root, 'src/content/pages')))
    .filter((file) => file.endsWith('.json'))
    .map((file) => `src/content/pages/${file}`),
  'src/content/site/announcements.json',
  'src/content/site/navigation.json',
  'src/content/site/settings.json',
].sort()

function fail(scope, message) {
  errors.push(`${scope}: ${message}`)
}

function normalizeLf(value) {
  return value.replaceAll('\r\n', '\n')
}

function hashSource(value) {
  return `sha256:${createHash('sha256').update(normalizeLf(value)).digest('hex')}`
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

function sortedKeys(value) {
  return Object.keys(value).sort()
}

function sameMembers(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function requireSameKeys(scope, actual, expected) {
  const actualKeys = sortedKeys(actual)
  const expectedKeys = [...expected].sort()
  if (!sameMembers(actualKeys, expectedKeys)) {
    fail(
      scope,
      `key mismatch (expected ${expectedKeys.join(', ')}; received ${actualKeys.join(', ')})`,
    )
  }
}

function collectPlaceholders(value, currentPath = '', result = new Map()) {
  if (typeof value === 'string') {
    result.set(
      currentPath,
      [...value.matchAll(/\{([a-z][a-z\d_-]*)\}/giu)]
        .map((match) => match[1])
        .sort(),
    )
    return result
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectPlaceholders(item, `${currentPath}[${index}]`, result),
    )
    return result
  }

  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      collectPlaceholders(
        item,
        currentPath ? `${currentPath}.${key}` : key,
        result,
      )
    }
  }

  return result
}

function collectStringValues(value, result = []) {
  if (typeof value === 'string') {
    result.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, result))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStringValues(item, result))
  }
  return result
}

function requireNonEmptyString(scope, value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(scope, 'translated copy must be a non-empty string')
    return false
  }
  return true
}

function containsUnexpectedJapanese(value, locale) {
  if (/[\u3040-\u30ff]/u.test(value)) return true
  return (
    locale !== 'zh-cn' &&
    /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u.test(value)
  )
}

function requireTranslatedCopy(scope, value, locale) {
  if (!requireNonEmptyString(scope, value)) return
  if (containsUnexpectedJapanese(value, locale)) {
    fail(scope, `translated copy contains Japanese text (${value})`)
  }
}

function requireCopyShape(scope, actual, expected, locale) {
  if (typeof expected === 'string') {
    requireTranslatedCopy(scope, actual, locale)
    return
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      fail(scope, `array shape mismatch (expected ${expected.length} items)`)
      return
    }
    expected.forEach((item, index) =>
      requireCopyShape(`${scope}[${index}]`, actual[index], item, locale),
    )
    return
  }

  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) {
      fail(scope, 'object shape mismatch')
      return
    }
    requireSameKeys(scope, actual, Object.keys(expected))
    for (const [key, value] of Object.entries(expected)) {
      requireCopyShape(`${scope}.${key}`, actual[key], value, locale)
    }
  }
}

function frontmatter(source) {
  return source.match(/^---\s*\n([\s\S]*?)\n---(?:\n|$)/u)?.[1]
}

function unquoteYamlScalar(value) {
  const trimmed = String(value || '').trim()
  const quote = trimmed[0]
  return (quote === "'" || quote === '"') && trimmed.at(-1) === quote
    ? trimmed.slice(1, -1)
    : trimmed
}

function frontmatterString(source, key) {
  const value = frontmatter(source)?.match(
    new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'mu'),
  )?.[1]
  if (!value) return undefined
  return unquoteYamlScalar(value)
}

function frontmatterList(source, key) {
  const value = frontmatter(source)?.match(
    new RegExp(`^${key}:\\s*\\n((?:[ \\t]+-.*(?:\\n|$))+)`, 'mu'),
  )?.[1]
  if (!value) return []
  return [...value.matchAll(/^[ \t]+-\s*(.*?)\s*$/gmu)].map((match) =>
    unquoteYamlScalar(match[1]),
  )
}

function markdownBody(source) {
  return source.replace(/^---\s*\n[\s\S]*?\n---(?:\n|$)/u, '')
}

function protectedCodeTokens(source) {
  return [
    ...source.matchAll(/```[\w-]*\n([\s\S]*?)```/gu),
    ...source.matchAll(/`([^`\n]+)`/gu),
  ]
    .map((match) => match[1])
    .sort()
}

function headingLevels(source) {
  return [...source.matchAll(/^(#{1,6})\s+\S.*$/gmu)].map(
    (match) => match[1].length,
  )
}

function localizeStoryTarget(locale, target) {
  if (target.startsWith('/')) {
    return `/${locale}${target}`
  }

  try {
    const url = new URL(target)
    if (
      url.hostname === 'systems.acecore.net' &&
      !url.pathname.startsWith(`/${locale}/`)
    ) {
      url.pathname = `/${locale}${url.pathname}`
      return url.toString()
    }
  } catch {
    // Markdown fragments and other non-URL targets are compared as-is.
  }

  return target
}

async function validateFixedContent() {
  const fixedSourceText = (
    await Promise.all(
      fixedSourceFiles.map(async (relativePath) => {
        const source = await readFile(path.join(root, relativePath), 'utf8')
        return `${relativePath}\n${normalizeLf(source)}`
      }),
    )
  ).join('\n')
  const expectedSourceHash = hashSource(fixedSourceText)
  const pages = await Promise.all(
    fixedSourceFiles
      .filter((file) => file.startsWith('src/content/pages/'))
      .map(readJson),
  )
  const settings = await readJson('src/content/site/settings.json')
  const navigation = await readJson('src/content/site/navigation.json')
  const announcements = await readJson('src/content/site/announcements.json')
  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))
  const expectedPageSlugs = [...pageBySlug.keys()]
  const expectedWorldSlugs = settings.worlds.map((world) => world.slug)
  const expectedNavigationHrefs = navigation.items.map((item) => item.href)
  const expectedAnnouncementIds = announcements.items.map((item) => item.id)
  const japanesePlaceholders = collectPlaceholders(JA_UI)

  requireSameKeys('src/i18n/translations.ts', TRANSLATIONS, TRANSLATED_LOCALES)

  for (const locale of TRANSLATED_LOCALES) {
    const scope = `src/i18n/translations.ts:${locale}`
    const translation = TRANSLATIONS[locale]
    if (!translation) continue

    if (translation.sourceHash !== expectedSourceHash) {
      fail(
        `${scope}.sourceHash`,
        `stale fixed-content translation (expected ${expectedSourceHash})`,
      )
    }

    requireSameKeys(`${scope}.pages`, translation.pages, expectedPageSlugs)
    requireSameKeys(
      `${scope}.settings.worlds`,
      translation.settings.worlds,
      expectedWorldSlugs,
    )
    requireSameKeys(
      `${scope}.navigation`,
      translation.navigation,
      expectedNavigationHrefs,
    )
    requireSameKeys(
      `${scope}.announcements`,
      translation.announcements,
      expectedAnnouncementIds,
    )
    requireCopyShape(`${scope}.ui`, translation.ui, JA_UI, locale)
    for (const key of ['title', 'shortTitle', 'description', 'logoAlt']) {
      requireTranslatedCopy(
        `${scope}.settings.${key}`,
        translation.settings[key],
        locale,
      )
    }
    for (const world of settings.worlds) {
      const translatedWorld = translation.settings.worlds[world.slug]
      if (!translatedWorld) continue
      for (const key of ['title', 'imageAlt', 'statusLabel']) {
        requireTranslatedCopy(
          `${scope}.settings.worlds.${world.slug}.${key}`,
          translatedWorld[key],
          locale,
        )
      }
    }
    for (const href of expectedNavigationHrefs) {
      requireTranslatedCopy(
        `${scope}.navigation.${href}`,
        translation.navigation[href],
        locale,
      )
    }
    for (const id of expectedAnnouncementIds) {
      const announcement = translation.announcements[id]
      if (!announcement) continue
      for (const key of ['title', 'text', 'linkLabel']) {
        requireTranslatedCopy(
          `${scope}.announcements.${id}.${key}`,
          announcement[key],
          locale,
        )
      }
    }

    for (const [slug, page] of pageBySlug) {
      const translatedPage = translation.pages[slug]
      if (
        translatedPage &&
        translatedPage.sections.length !== page.sections.length
      ) {
        fail(
          `${scope}.pages.${slug}.sections`,
          `section count mismatch (expected ${page.sections.length})`,
        )
      }
      if (!translatedPage) continue
      requireTranslatedCopy(
        `${scope}.pages.${slug}.pageName`,
        translatedPage.pageName,
        locale,
      )
      requireTranslatedCopy(
        `${scope}.pages.${slug}.meta.title`,
        translatedPage.meta?.title,
        locale,
      )
      requireTranslatedCopy(
        `${scope}.pages.${slug}.meta.description`,
        translatedPage.meta?.description,
        locale,
      )
      page.sections.forEach((section, index) => {
        const translatedSection = translatedPage.sections[index]
        if (!translatedSection) return
        for (const key of [
          'titleCopy',
          'text',
          'imageAlt',
          'title',
          'shoulderCopy',
        ]) {
          if (typeof section[key] !== 'string') continue
          requireTranslatedCopy(
            `${scope}.pages.${slug}.sections[${index}].${key}`,
            translatedSection[key],
            locale,
          )
        }
        if (typeof section.ctaButton?.label === 'string') {
          requireTranslatedCopy(
            `${scope}.pages.${slug}.sections[${index}].ctaLabel`,
            translatedSection.ctaLabel,
            locale,
          )
        }
      })
    }

    const translatedPlaceholders = collectPlaceholders(translation.ui)
    requireSameKeys(
      `${scope}.ui placeholders`,
      Object.fromEntries(translatedPlaceholders),
      japanesePlaceholders.keys(),
    )
    for (const [key, expectedTokens] of japanesePlaceholders) {
      const actualTokens = translatedPlaceholders.get(key) ?? []
      if (!sameMembers(actualTokens, expectedTokens)) {
        fail(
          `${scope}.ui.${key}`,
          `placeholder mismatch (expected ${expectedTokens.join(', ') || 'none'}; received ${actualTokens.join(', ') || 'none'})`,
        )
      }
    }

    for (const value of collectStringValues(translation)) {
      if (/https?:\/\//iu.test(value)) {
        fail(scope, `translated copy must not own a URL (${value})`)
      }
    }
  }
}

async function validateStories() {
  const japaneseStories = new Map()

  for (const slug of expectedStorySlugs) {
    const relativePath = `src/content/stories/${slug}.md`
    const source = normalizeLf(
      await readFile(path.join(root, relativePath), 'utf8'),
    )
    japaneseStories.set(slug, {
      source,
      sourceHash: hashSource(source),
      body: markdownBody(source),
      codeTokens: protectedCodeTokens(markdownBody(source)),
      links: extractStoryMarkdownTargets(source).links,
      images: extractStoryMarkdownTargets(source).images,
      author: frontmatterString(source, 'author'),
      date: frontmatterString(source, 'date'),
      image: frontmatterString(source, 'image'),
      imageAlt: frontmatterString(source, 'imageAlt'),
      tags: frontmatterList(source, 'tags'),
    })
  }

  for (const locale of TRANSLATED_LOCALES) {
    const localeDir = path.join(root, 'src/content/stories', locale)
    const files = (await readdir(localeDir))
      .filter((file) => file.endsWith('.md'))
      .sort()
    const slugs = files.map((file) => file.replace(/\.md$/u, ''))

    if (!sameMembers(slugs, [...expectedStorySlugs].sort())) {
      fail(
        `src/content/stories/${locale}`,
        `story parity mismatch (expected ${expectedStorySlugs.join(', ')}; received ${slugs.join(', ')})`,
      )
    }

    for (const slug of expectedStorySlugs) {
      const relativePath = `src/content/stories/${locale}/${slug}.md`
      let source
      try {
        source = normalizeLf(
          await readFile(path.join(root, relativePath), 'utf8'),
        )
      } catch {
        continue
      }
      const japanese = japaneseStories.get(slug)
      const translationOf = frontmatterString(source, 'translationOf')
      const sourceHash = frontmatterString(source, 'sourceHash')

      if (translationOf !== slug) {
        fail(relativePath, `translationOf must be "${slug}"`)
      }
      if (sourceHash !== japanese.sourceHash) {
        fail(relativePath, `stale sourceHash (expected ${japanese.sourceHash})`)
      }
      for (const key of ['author', 'date', 'image']) {
        const actual = frontmatterString(source, key)
        if (actual !== japanese[key]) {
          fail(
            `${relativePath}:${key}`,
            `must match Japanese source (${japanese[key]})`,
          )
        }
      }
      for (const key of ['title', 'description']) {
        requireTranslatedCopy(
          `${relativePath}:${key}`,
          frontmatterString(source, key),
          locale,
        )
      }
      if (japanese.imageAlt !== undefined) {
        requireTranslatedCopy(
          `${relativePath}:imageAlt`,
          frontmatterString(source, 'imageAlt'),
          locale,
        )
      }
      const tags = frontmatterList(source, 'tags')
      if (tags.length !== japanese.tags.length) {
        fail(
          `${relativePath}:tags`,
          `tag count mismatch (expected ${japanese.tags.length}, received ${tags.length})`,
        )
      }
      tags.forEach((tag, index) =>
        requireTranslatedCopy(`${relativePath}:tags[${index}]`, tag, locale),
      )

      if (japanese.image?.startsWith('/')) {
        try {
          await access(
            path.join(root, 'public', japanese.image.replace(/^\/+/u, '')),
          )
        } catch {
          fail(relativePath, `frontmatter image is missing (${japanese.image})`)
        }
      }

      const body = markdownBody(source)
      if (!sameMembers(protectedCodeTokens(body), japanese.codeTokens)) {
        fail(relativePath, 'code spans or fenced code blocks were changed')
      }
      if (!sameMembers(headingLevels(body), headingLevels(japanese.body))) {
        fail(
          relativePath,
          'heading-level structure differs from Japanese source',
        )
      }
      if (containsUnexpectedJapanese(body, locale)) {
        fail(relativePath, 'translated body contains Japanese text')
      }

      const markdown = extractStoryMarkdownTargets(source)
      const expectedTargets = japanese.links.map((link) =>
        localizeStoryTarget(locale, link.target),
      )
      const actualTargets = markdown.links.map((link) => link.target)
      if (!sameMembers(actualTargets, expectedTargets)) {
        fail(
          relativePath,
          `link-role parity mismatch (expected ${expectedTargets.join(', ') || 'none'}; received ${actualTargets.join(', ') || 'none'})`,
        )
      }
      for (const link of markdown.links) {
        if (
          link.target.startsWith('/') &&
          !link.target.startsWith(`/${locale}/`)
        ) {
          fail(
            `${relativePath}:${link.line ?? 1}`,
            `internal link must stay in the ${locale} route (${link.target})`,
          )
        }
        if (
          /^[a-z][a-z\d+.-]*:/iu.test(link.target) &&
          !/^https?:\/\//iu.test(link.target)
        ) {
          fail(
            `${relativePath}:${link.line ?? 1}`,
            `unsupported link protocol (${link.target})`,
          )
        }
      }
      const expectedImageTargets = japanese.images.map((image) => image.target)
      const actualImageTargets = markdown.images.map((image) => image.target)
      if (!sameMembers(actualImageTargets, expectedImageTargets)) {
        fail(
          relativePath,
          `image parity mismatch (expected ${expectedImageTargets.join(', ') || 'none'}; received ${actualImageTargets.join(', ') || 'none'})`,
        )
      }
      for (const image of markdown.images) {
        requireTranslatedCopy(
          `${relativePath}:${image.line ?? 1}:imageAlt`,
          image.alt,
          locale,
        )
        if (!image.target.startsWith('/')) continue
        try {
          await access(
            path.join(root, 'public', image.target.replace(/^\/+/u, '')),
          )
        } catch {
          fail(
            `${relativePath}:${image.line ?? 1}`,
            `local image is missing (${image.target})`,
          )
        }
      }

      if (new RegExp(`/${locale}/(?:blog|insights)/`, 'u').test(body)) {
        fail(relativePath, 'old local corporate article link remains')
      }
    }
  }

  if (LOCALES.length !== 9) {
    fail('src/i18n/config.ts', `expected 9 locales, received ${LOCALES.length}`)
  }
}

await validateFixedContent()
await validateStories()

if (errors.length > 0) {
  console.error('i18n validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `i18n validation passed for ${LOCALES.length} locales, ${fixedSourceFiles.length} fixed-content sources, and ${LOCALES.length * expectedStorySlugs.length} Stories.`,
)
