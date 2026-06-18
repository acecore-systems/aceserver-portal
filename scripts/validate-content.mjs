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

function validateButton(scope, button, required) {
  if (!isRecord(button)) {
    if (required) {
      fail(scope, 'button is required')
    }
    return
  }

  if (!isNonEmptyString(button.label)) {
    fail(scope, 'button.label is required')
  }
  if (!isNonEmptyString(button.href)) {
    fail(scope, 'button.href is required')
  }
}

function validateSection(scope, section) {
  if (!isRecord(section)) {
    fail(scope, 'section must be an object')
    return
  }

  const validTypes = new Set([
    'hero',
    'featureImageFull',
    'featureImageRight',
    'featureImageLeft',
    'cta',
    'iframe',
  ])

  if (!validTypes.has(section.type)) {
    fail(scope, `unknown section type "${section.type}"`)
    return
  }

  if (section.type === 'iframe') {
    if (!isNonEmptyString(section.src)) {
      fail(scope, 'iframe src is required')
    }
    if (
      section.variant !== undefined &&
      section.variant !== 'map' &&
      section.variant !== 'video'
    ) {
      fail(scope, 'iframe variant must be map or video')
    }
    return
  }

  if (!isNonEmptyString(section.titleCopy)) {
    fail(scope, 'titleCopy is required')
  }

  if (section.type === 'cta') {
    validateButton(`${scope}.ctaButton`, section.ctaButton, true)
  }

  if (section.type === 'hero') {
    validateButton(`${scope}.ctaButton`, section.ctaButton, false)
  }
}

function hasSectionType(page, type) {
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

    if (!['home', 'worldMap', 'embed'].includes(page.kind)) {
      fail(relativePath, 'kind must be home, worldMap, or embed')
    }

    if (!isRecord(page.meta)) {
      fail(relativePath, 'meta is required')
    } else {
      if (!isNonEmptyString(page.meta.title)) {
        fail(relativePath, 'meta.title is required')
      }
      if (!isNonEmptyString(page.meta.description)) {
        fail(relativePath, 'meta.description is required')
      }
    }

    if (!Array.isArray(page.sections) || page.sections.length === 0) {
      fail(relativePath, 'sections must contain at least one section')
      continue
    }

    page.sections.forEach((section, index) => {
      validateSection(`${relativePath}.sections[${index}]`, section)
    })

    if (page.kind === 'embed' && !hasSectionType(page, 'iframe')) {
      fail(relativePath, 'embed pages must include an iframe section')
    }

    if (page.kind === 'worldMap' && !hasSectionType(page, 'featureImageFull')) {
      fail(
        relativePath,
        'worldMap pages must include a featureImageFull intro section',
      )
    }
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
}

async function validateCmsConfig() {
  const config = await readFile(
    path.join(root, 'public/admin/config.yml'),
    'utf8',
  )
  if (/name:\s*path\b/.test(config)) {
    fail(
      'public/admin/config.yml',
      'page path field must not be exposed in CMS',
    )
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
