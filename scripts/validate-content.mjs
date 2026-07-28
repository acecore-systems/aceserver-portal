import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const errors = []

function fail(scope, message) {
  errors.push(`${scope}: ${message}`)
}

async function readJson(relativePath) {
  const filePath = path.join(root, relativePath)
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
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
  const routes = new Set(['/'])
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
    routes.add(routeForSlug(page.slug))

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
  if (!isNonEmptyString(href) || isExternalHref(href)) {
    return
  }

  if (!href.startsWith('/')) {
    fail(scope, `internal href must start with / (${href})`)
    return
  }

  if (!routes.has(href)) {
    fail(scope, `internal href does not match a page route (${href})`)
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
  const configFunction = await readFile(
    path.join(root, 'functions/admin/config.yml.ts'),
    'utf8',
  )
  const adminPage = await readFile(
    path.join(root, 'src/pages/admin/index.astro'),
    'utf8',
  )
  const adminInit = await readFile(
    path.join(root, 'public/admin/init.js'),
    'utf8',
  )

  if (/name:\s*path\b/.test(config)) {
    fail(scope, 'page path field must not be exposed in CMS')
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
    !config.includes('api_root: /admin/api/github') ||
    !config.includes('graphql_api_root: /admin/api/graphql')
  ) {
    fail(scope, 'CMS must use the same-origin GitHub REST and GraphQL proxy')
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
    !oauth.includes("path: '/user'")
  ) {
    fail(
      scope,
      'CMS proxy must validate the GitHub user and repository write access',
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
    !adminInit.includes('通常は数分でサイトに反映されます。')
  ) {
    fail(scope, 'CMS must explain that saving publishes automatically')
  }
}

const routes = await validatePages()
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
