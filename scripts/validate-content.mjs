import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { validatePortalContentFile } from '../src/data/content-schemas.ts'
import { extractStoryMarkdownTargets } from './markdown-targets.mjs'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const errors = []
const LOCALES = ['ja', 'en', 'zh-cn', 'es', 'pt', 'fr', 'ko', 'de', 'ru']
const TRANSLATED_LOCALES = LOCALES.filter((locale) => locale !== 'ja')
const EXPECTED_STORY_SLUGS = new Set([
  'aceserver-hijacked',
  'aceserver-portal-launch',
  'aceserver-beginners-guide',
  'minecraft-java-bedrock-crossplay',
  'minecraft-java-bedrock-shared-server',
  'minecraft-server-cannot-join',
  'minecraft-play-with-friends',
  'minecraft-server-osusume',
  'minecraft-server-setup',
  'metaverse-is-close',
])
const REQUIRED_STORY_IMAGE_SLUGS = new Set([
  'aceserver-portal-launch',
  'aceserver-beginners-guide',
  'minecraft-java-bedrock-shared-server',
  'minecraft-server-cannot-join',
  'metaverse-is-close',
])
const RELATED_GUIDE_STORY_SLUGS = new Set([
  'minecraft-java-bedrock-crossplay',
  'minecraft-java-bedrock-shared-server',
  'minecraft-play-with-friends',
  'minecraft-server-cannot-join',
  'minecraft-server-osusume',
  'minecraft-server-setup',
])

function fail(scope, message) {
  errors.push(`${scope}: ${message}`)
}

async function readJson(relativePath) {
  const filePath = path.join(root, relativePath)
  try {
    const value = JSON.parse(await readFile(filePath, 'utf8'))
    const validation = validatePortalContentFile(relativePath, value)

    if (!validation.ok) {
      fail(relativePath, validation.message)
    }

    return value
  } catch (error) {
    fail(relativePath, `invalid JSON (${error.message})`)
    return undefined
  }
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isExternalHref(href) {
  return /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')
}

function routeForSlug(slug) {
  return slug === 'top' ? '/' : `/${slug}/`
}

function localizedRoute(locale, route) {
  return locale === 'ja' ? route : `/${locale}${route}`
}

function frontmatterForStory(source) {
  return source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]
}

function frontmatterString(frontmatter, key) {
  if (!frontmatter) return undefined

  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm'))
  if (!match) return undefined

  const value = match[1].trim()
  const quote = value[0]
  if (
    value.length >= 2 &&
    (quote === '"' || quote === "'") &&
    value.at(-1) === quote
  ) {
    return value.slice(1, -1)
  }

  return value
}

function frontmatterList(frontmatter, key) {
  if (!frontmatter) return []

  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*\\r?\\n((?:[ \\t]+-.*(?:\\r?\\n|$))+)`, 'm'),
  )
  if (!match) return []

  return [...match[1].matchAll(/^[ \t]+-\s*(.*?)\s*$/gmu)].map((item) => {
    const value = item[1].trim()
    const quote = value[0]
    return value.length >= 2 &&
      (quote === '"' || quote === "'") &&
      value.at(-1) === quote
      ? value.slice(1, -1)
      : value
  })
}

function validateRelatedItems(story, frontmatter, japaneseSlugs, routes) {
  const relatedStories = frontmatterList(frontmatter, 'relatedStories')
  const relatedPages = frontmatterList(frontmatter, 'relatedPages')

  if (story.locale !== 'ja') {
    if (relatedStories.length > 0 || relatedPages.length > 0) {
      fail(
        story.relativePath,
        'related content must be declared only on the Japanese source story',
      )
    }
    return
  }

  for (const [kind, values] of [
    ['relatedStories', relatedStories],
    ['relatedPages', relatedPages],
  ]) {
    if (values.length > (kind === 'relatedStories' ? 4 : 3)) {
      fail(story.relativePath, `${kind} has too many entries`)
    }
    const seen = new Set()
    for (const value of values) {
      if (!isNonEmptyString(value)) {
        fail(story.relativePath, `${kind} must contain non-empty slugs`)
        continue
      }
      if (seen.has(value)) {
        fail(story.relativePath, `${kind} contains a duplicate (${value})`)
      }
      seen.add(value)
    }
  }

  if (
    RELATED_GUIDE_STORY_SLUGS.has(story.slug) &&
    relatedStories.length === 0
  ) {
    fail(story.relativePath, 'guide stories must declare relatedStories')
  }

  for (const slug of relatedStories) {
    if (slug === story.slug) {
      fail(
        story.relativePath,
        'relatedStories must not include the story itself',
      )
    } else if (!japaneseSlugs.has(slug)) {
      fail(story.relativePath, `related story does not exist (${slug})`)
    }
  }

  for (const slug of relatedPages) {
    if (!routes.has(routeForSlug(slug))) {
      fail(story.relativePath, `related page does not exist (${slug})`)
    }
  }
}

function markdownTargets(source, scope) {
  let targets

  try {
    targets = extractStoryMarkdownTargets(source)
  } catch (error) {
    fail(scope, `Markdown could not be parsed (${error.message})`)
    return { images: [], links: [] }
  }

  for (const reference of targets.missingReferences) {
    const nodeScope = reference.line ? `${scope}:${reference.line}` : scope
    fail(nodeScope, `Markdown reference target is missing (${reference.label})`)
  }

  return {
    images: targets.images.map((image) => ({
      ...image,
      scope: image.line ? `${scope}:${image.line}` : scope,
    })),
    links: targets.links.map((link) => ({
      ...link,
      scope: link.line ? `${scope}:${link.line}` : scope,
    })),
  }
}

function hasSectionType(page, type) {
  if (!Array.isArray(page.sections)) {
    return false
  }

  return page.sections.some((section) => section?.type === type)
}

async function validatePages() {
  const pagesDir = path.join(root, 'src/content/pages')
  const pageFiles = (await readdir(pagesDir))
    .filter((file) => file.endsWith('.json'))
    .sort()
  const routes = new Set(LOCALES.map((locale) => localizedRoute(locale, '/')))
  for (const locale of LOCALES) {
    routes.add(localizedRoute(locale, '/alpha-diary/'))
  }
  const slugs = new Set()

  for (const file of pageFiles) {
    const relativePath = `src/content/pages/${file}`
    const page = await readJson(relativePath)

    if (!isRecord(page)) {
      fail(relativePath, 'page must be an object')
      continue
    }

    if (hasOwn(page, 'path')) {
      fail(relativePath, 'path is not editable content; use slug-based routes')
    }

    const expectedSlug = path.basename(file, '.json')
    if (page.slug !== expectedSlug) {
      fail(relativePath, `slug must match filename (${expectedSlug})`)
    }

    if (slugs.has(page.slug)) {
      fail(relativePath, `duplicate slug "${page.slug}"`)
    }
    slugs.add(page.slug)
    const route = routeForSlug(page.slug)
    for (const locale of LOCALES) {
      routes.add(localizedRoute(locale, route))
    }

    if (!Array.isArray(page.sections) || page.sections.length === 0) {
      fail(relativePath, 'sections must contain at least one section')
      continue
    }

    if (page.kind === 'embed' && !hasSectionType(page, 'iframe')) {
      fail(relativePath, 'embed pages must include an iframe section')
    }

    if (page.kind === 'worldMap' && !hasSectionType(page, 'featureImageFull')) {
      fail(
        relativePath,
        'worldMap pages must include a featureImageFull intro section',
      )
    }

    page.sections.forEach((section, index) => {
      if (
        !isRecord(section) ||
        !['featureImageFull', 'featureImageRight', 'featureImageLeft'].includes(
          section.type,
        )
      ) {
        return
      }

      const scope = `${relativePath}.sections[${index}]`
      if (!isNonEmptyString(section.image)) {
        fail(scope, 'image is required for an image feature section')
      }
      if (!isNonEmptyString(section.imageAlt)) {
        fail(scope, 'imageAlt is required when an image is rendered')
      }
    })
  }

  return routes
}

function validateInternalHref(scope, href, routes) {
  if (!isNonEmptyString(href)) {
    fail(scope, 'internal href must be a non-empty string')
    return
  }

  if (isExternalHref(href)) {
    return
  }

  if (!href.startsWith('/')) {
    fail(scope, `internal href must start with / (${href})`)
    return
  }

  const route = href.split(/[?#]/, 1)[0]
  if (!routes.has(route)) {
    fail(scope, `internal href does not match a page route (${href})`)
  }
}

async function validateLocalImage(scope, image) {
  if (!isNonEmptyString(image)) {
    fail(scope, 'image reference must be a non-empty string')
    return
  }

  if (isExternalHref(image)) {
    return
  }

  const pathname = image.split(/[?#]/, 1)[0]
  if (!pathname.startsWith('/')) {
    fail(scope, `local image reference must start with / (${image})`)
    return
  }

  let decodedPathname
  try {
    decodedPathname = decodeURIComponent(pathname)
  } catch {
    fail(scope, `local image reference is not valid URL encoding (${image})`)
    return
  }

  const publicDir = path.join(root, 'public')
  const filePath = path.resolve(publicDir, decodedPathname.replace(/^\/+/, ''))
  if (
    filePath !== publicDir &&
    !filePath.startsWith(`${publicDir}${path.sep}`)
  ) {
    fail(scope, `local image reference escapes public directory (${image})`)
    return
  }

  try {
    const fileStats = await stat(filePath)
    if (!fileStats.isFile()) {
      fail(scope, `local image reference is not a file (${image})`)
    }
  } catch {
    fail(scope, `local image reference does not exist (${image})`)
  }
}

async function validateStories(routes) {
  const storiesDir = path.join(root, 'src/content/stories')
  const storyEntries = await readdir(storiesDir, { recursive: true })
  for (const file of storyEntries.filter((entry) => /\.mdx$/i.test(entry))) {
    fail(
      `src/content/stories/${file.replaceAll(path.sep, '/')}`,
      'MDX stories are not supported; use a .md file',
    )
  }
  const storyFiles = storyEntries.filter((file) => /\.md$/i.test(file)).sort()
  const stories = []
  const storyKeys = new Set()
  const japaneseSlugs = new Set()

  for (const locale of LOCALES) {
    routes.add(localizedRoute(locale, '/stories/'))
  }

  for (const file of storyFiles) {
    const normalizedFile = file.replaceAll(path.sep, '/')
    const pathWithoutExtension = normalizedFile.replace(/\.md$/i, '')
    const relativePath = `src/content/stories/${normalizedFile}`
    const segments = pathWithoutExtension.split('/')
    const locale = segments.length === 1 ? 'ja' : segments[0]
    const slug = segments.at(-1)

    if (
      segments.length > 2 ||
      (segments.length === 2 && !TRANSLATED_LOCALES.includes(locale))
    ) {
      fail(
        relativePath,
        'translated story files must use src/content/stories/{locale}/{slug}.md',
      )
      continue
    }

    const storyKey = `${locale}/${slug}`
    if (storyKeys.has(storyKey)) {
      fail(relativePath, `duplicate story key "${storyKey}"`)
      continue
    }

    storyKeys.add(storyKey)
    if (locale === 'ja') japaneseSlugs.add(slug)
    routes.add(localizedRoute(locale, `/stories/${slug}/`))
    stories.push({
      locale,
      relativePath,
      slug,
      source: await readFile(path.join(storiesDir, file), 'utf8'),
    })
  }

  for (const expectedSlug of EXPECTED_STORY_SLUGS) {
    if (!japaneseSlugs.has(expectedSlug)) {
      fail(
        'src/content/stories',
        `expected migrated story is missing (${expectedSlug})`,
      )
    }
  }

  for (const story of stories) {
    const frontmatter = frontmatterForStory(story.source)
    if (frontmatter === undefined) {
      fail(story.relativePath, 'story frontmatter is missing')
      continue
    }

    const image = frontmatterString(frontmatter, 'image')
    const imageAlt = frontmatterString(frontmatter, 'imageAlt')
    if (
      REQUIRED_STORY_IMAGE_SLUGS.has(story.slug) &&
      (image === undefined || imageAlt === undefined)
    ) {
      fail(
        story.relativePath,
        'migrated story image and imageAlt must be preserved',
      )
    }
    if ((image === undefined) !== (imageAlt === undefined)) {
      fail(story.relativePath, 'image and imageAlt must be provided together')
    }
    if (image !== undefined) {
      await validateLocalImage(`${story.relativePath}.image`, image)
    }
    if (imageAlt !== undefined && !isNonEmptyString(imageAlt)) {
      fail(`${story.relativePath}.imageAlt`, 'imageAlt must not be empty')
    }

    const markdown = markdownTargets(story.source, story.relativePath)
    for (const { alt, scope, target } of markdown.images) {
      if (!isNonEmptyString(alt)) {
        fail(scope, 'Markdown image alt must not be empty')
      }
      await validateLocalImage(scope, target)
    }

    for (const { scope, target } of markdown.links) {
      validateInternalHref(scope, target, routes)
    }

    validateRelatedItems(story, frontmatter, japaneseSlugs, routes)
  }
}

async function validateSiteConfig(routes) {
  const settings = await readJson('src/content/site/settings.json')
  if (isRecord(settings) && !isNonEmptyString(settings.logoAlt)) {
    fail(
      'src/content/site/settings.json.logoAlt',
      'logoAlt must be a non-empty string',
    )
  }

  if (isRecord(settings) && Array.isArray(settings.worlds)) {
    settings.worlds.forEach((world, index) => {
      const scope = `src/content/site/settings.json.worlds[${index}]`
      if (!isRecord(world)) {
        fail(scope, 'world must be an object')
        return
      }
      if (!isNonEmptyString(world.slug)) {
        fail(scope, 'slug is required')
      }
      if (!isNonEmptyString(world.title)) {
        fail(scope, 'title is required')
      }
      if (!isNonEmptyString(world.image)) {
        fail(scope, 'image is required')
      }
      if (!isNonEmptyString(world.imageAlt)) {
        fail(scope, 'imageAlt is required')
      }
      if (world.href !== undefined) {
        validateInternalHref(`${scope}.href`, world.href, routes)
      }
    })
  } else {
    fail('src/content/site/settings.json', 'worlds must be an array')
  }

  const navigation = await readJson('src/content/site/navigation.json')
  if (isRecord(navigation) && Array.isArray(navigation.items)) {
    navigation.items.forEach((item, index) => {
      const scope = `src/content/site/navigation.json.items[${index}]`
      if (!isRecord(item)) {
        fail(scope, 'item must be an object')
        return
      }
      if (!isNonEmptyString(item.text)) {
        fail(scope, 'text is required')
      }
      if (!isNonEmptyString(item.href)) {
        fail(scope, 'href is required')
        return
      }
      validateInternalHref(`${scope}.href`, item.href, routes)
    })
  } else {
    fail('src/content/site/navigation.json', 'items must be an array')
  }

  const announcements = await readJson('src/content/site/announcements.json')
  if (isRecord(announcements) && Array.isArray(announcements.items)) {
    announcements.items.forEach((item, index) => {
      const scope = `src/content/site/announcements.json.items[${index}]`
      if (!isRecord(item)) {
        fail(scope, 'item must be an object')
        return
      }
      if (item.href !== undefined) {
        validateInternalHref(`${scope}.href`, item.href, routes)
      }
    })
  } else {
    fail('src/content/site/announcements.json', 'items must be an array')
  }
}

async function validateCmsConfig() {
  const scope = 'public/admin/config.yml'
  const config = await readFile(path.join(root, scope), 'utf8')
  const graphql = await readFile(
    path.join(root, 'functions/admin/api/graphql.ts'),
    'utf8',
  )
  const oauth = await readFile(
    path.join(root, 'functions/admin/api/_github-oauth.ts'),
    'utf8',
  )
  const appOAuth = await readFile(
    path.join(root, 'functions/admin/api/_github-app-oauth.ts'),
    'utf8',
  )
  const authRoute = await readFile(
    path.join(root, 'functions/admin/api/auth.ts'),
    'utf8',
  )
  const callbackRoute = await readFile(
    path.join(root, 'functions/admin/api/callback.ts'),
    'utf8',
  )
  const configFunction = await readFile(
    path.join(root, 'functions/admin/config.yml.ts'),
    'utf8',
  )
  const headers = await readFile(path.join(root, 'public/_headers'), 'utf8')
  const adminPage = await readFile(
    path.join(root, 'src/pages/admin/index.astro'),
    'utf8',
  )
  const adminInit = await readFile(
    path.join(root, 'public/admin/init.js'),
    'utf8',
  )

  if (
    !adminPage.includes(
      'src="https://unpkg.com/@sveltia/cms@0.191.1/dist/sveltia-cms.js"',
    ) ||
    !adminPage.includes(
      'integrity="sha384-1e+sEYxphmj/Z7BnuanO53c4BveZJ5fdJIkHSuHRO2T7jmC7Ih0BeJPK6x5XHxx6"',
    )
  ) {
    fail(scope, 'CMS script must use the reviewed 0.191.1 bundle and SRI')
  }
  if (
    !/font-src[^;]*https:\/\/cdn\.jsdelivr\.net/u.test(headers) ||
    !/connect-src[^;]*https:\/\/unpkg\.com/u.test(headers)
  ) {
    fail(scope, 'CMS CSP must allow the pinned bundle fonts and locale data')
  }

  if (/name:\s*path\b/.test(config)) {
    fail(scope, 'page path field must not be exposed in CMS')
  }
  if (
    !/backend:\s*[\s\S]*?\n\s+repo:\s+acecore-systems\/aceserver-portal\b/.test(
      config,
    )
  ) {
    fail(
      scope,
      'CMS backend repository must be acecore-systems/aceserver-portal',
    )
  }
  if (!/backend:\s*[\s\S]*?\n\s+branch:\s*main\b/.test(config)) {
    fail(
      scope,
      'CMS backend branch must be main; do not use a permanent cms-content branch',
    )
  }
  if (/^publish_mode:\s*editorial_workflow\b/m.test(config)) {
    fail(
      scope,
      'Sveltia CMS does not implement editorial_workflow; use the restricted same-origin proxy',
    )
  }
  if (
    !/^\s+base_url:\s+https:\/\/asv\.acecore\.net\/admin\/api$/m.test(config) ||
    !/^\s+auth_endpoint:\s+auth$/m.test(config) ||
    !config.includes('api_root: /admin/api/github') ||
    !config.includes('graphql_api_root: /admin/api/graphql')
  ) {
    fail(
      scope,
      'CMS must use the same-origin GitHub App auth, REST, and GraphQL endpoints',
    )
  }
  if (
    !graphql.includes('branchName: CMS_REPOSITORY.branch') ||
    !graphql.includes('expectedHeadOid: mainSha') ||
    !graphql.includes('CMS-Request-ID:') ||
    !graphql.includes('findCommittedRequest') ||
    graphql.includes('createCmsBranch') ||
    graphql.includes('/pulls')
  ) {
    fail(
      scope,
      'CMS writes must atomically commit allowed content directly to the expected main HEAD',
    )
  }
  if (
    !oauth.includes('repository.permissions.push !== true') ||
    !oauth.includes("path: '/user'") ||
    !oauth.includes("token.startsWith('ghu_')") ||
    !oauth.includes('verifyRepositoryWriteAccess(token, installationId)') ||
    !oauth.includes('CMS_PRODUCTION_HOSTNAME')
  ) {
    fail(
      scope,
      'CMS proxy must require a GitHub App user token and revalidate repository write access',
    )
  }
  if (
    !appOAuth.includes("data.access_token.startsWith('ghu_')") ||
    !appOAuth.includes("data.scope === ''") ||
    !appOAuth.includes("url.searchParams.set('code_challenge'") ||
    !appOAuth.includes('code_verifier: codeVerifier') ||
    !appOAuth.includes('repository_id: String(GITHUB_REPOSITORY_ID)') ||
    !appOAuth.includes('/user/installations/${installationId}/repositories') ||
    !appOAuth.includes('data?.total_count !== 1') ||
    !appOAuth.includes("permissions?.contents !== 'write'") ||
    !appOAuth.includes('event.origin !== openerOrigin') ||
    appOAuth.includes("postMessage(probe, '*')")
  ) {
    fail(
      scope,
      'CMS auth must require PKCE, an expiring ghu_ token, and one Contents-only repository installation',
    )
  }
  if (
    !authRoute.includes('url.hostname !== CMS_PRODUCTION_HOSTNAME') ||
    !callbackRoute.includes('url.hostname !== CMS_PRODUCTION_HOSTNAME') ||
    headers.includes('sveltia-cms-auth.sparkling-tree-7cef.workers.dev')
  ) {
    fail(
      scope,
      'CMS auth routes must be production-only without the shared OAuth Worker',
    )
  }
  if (
    !configFunction.includes('$1${origin}/admin/api/github') ||
    !configFunction.includes('$1${origin}/admin/api/graphql')
  ) {
    fail(scope, 'CMS runtime config must use the deployment origin proxy')
  }
  if (
    !adminPage.includes('href="/admin/cms-notice.css"') ||
    !adminInit.includes('保存すると自動で公開されます') ||
    !adminInit.includes('通常は数分でサイトに反映されます。') ||
    !adminInit.includes('画像の削除は参照確認を伴うPull Request')
  ) {
    fail(scope, 'CMS must explain that saving publishes automatically')
  }
}

const routes = await validatePages()
await validateStories(routes)
await validateSiteConfig(routes)
await validateCmsConfig()

if (errors.length > 0) {
  console.error('Content validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(`Content validation passed for ${routes.size} route(s).`)
