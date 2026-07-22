import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = path.join(root, 'dist')
const errors = []

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)))
    } else {
      files.push(entryPath)
    }
  }

  return files
}

function relativePath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/')
}

function inspectImageTags(filePath, html) {
  let imageCount = 0
  let match
  const imagePattern = /<img\b[^>]*>/gi

  while ((match = imagePattern.exec(html)) !== null) {
    imageCount += 1
    const tag = match[0]
    const altMatch = tag.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    const alt = altMatch?.slice(1).find((value) => value !== undefined)

    if (alt === undefined) {
      errors.push(`${relativePath(filePath)}: img ${imageCount} has no alt`)
    } else if (alt.trim().length === 0) {
      errors.push(`${relativePath(filePath)}: img ${imageCount} has empty alt`)
    }
  }

  return imageCount
}

function htmlFileForPathname(pathname) {
  const decodedPathname = decodeURIComponent(pathname)
  if (decodedPathname === '/') {
    return path.join(distDir, 'index.html')
  }

  const relative = decodedPathname.replace(/^\/+|\/+$/g, '')
  return path.join(distDir, relative, 'index.html')
}

const files = await listFiles(distDir)
const htmlFiles = files.filter((file) => file.endsWith('.html')).sort()
const sitemapFiles = files
  .filter(
    (file) =>
      /sitemap[^/\\]*\.xml$/i.test(file) && !/sitemap-index\.xml$/i.test(file),
  )
  .sort()

if (sitemapFiles.length === 0) {
  errors.push('dist: no generated sitemap file found')
}

let imageCount = 0
for (const file of htmlFiles) {
  imageCount += inspectImageTags(file, await readFile(file, 'utf8'))
}

const sitemapUrls = new Set()
for (const file of sitemapFiles) {
  const xml = await readFile(file, 'utf8')
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = new URL(match[1])
    if (!url.pathname.endsWith('.xml')) {
      sitemapUrls.add(url.toString())
    }
  }
}

if (sitemapUrls.size === 0) {
  errors.push('dist: no page URL found in generated sitemap files')
}

for (const url of sitemapUrls) {
  const filePath = htmlFileForPathname(new URL(url).pathname)
  if (!htmlFiles.includes(filePath)) {
    errors.push(`${url}: sitemap URL has no generated HTML file`)
  }
}

if (errors.length > 0) {
  console.error('Generated image alt validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(
  `Generated image alt validation passed for ${sitemapUrls.size} sitemap URL(s), ${htmlFiles.length} HTML file(s), and ${imageCount} image(s).`,
)
