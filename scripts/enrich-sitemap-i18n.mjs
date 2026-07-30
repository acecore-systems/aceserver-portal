import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = path.join(root, 'dist')

function attributeValue(tag, name) {
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      'iu',
    ),
  )
  return match ? (match[1] ?? match[2] ?? match[3]) : null
}

function addXDefaultAlternates(xml, file) {
  let changed = false
  const enriched = xml.replace(/<url>([\s\S]*?)<\/url>/gu, (block) => {
    if (/\bhreflang=(?:"x-default"|'x-default')/iu.test(block)) {
      return block
    }

    const japaneseAlternate = [...block.matchAll(/<xhtml:link\b[^>]*\/>/giu)]
      .map((match) => match[0])
      .find((tag) => attributeValue(tag, 'hreflang') === 'ja')
    const href = japaneseAlternate
      ? attributeValue(japaneseAlternate, 'href')
      : null
    if (!href) {
      throw new Error(`${file}: Japanese alternate is missing from a URL entry`)
    }

    changed = true
    const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${href}"/>`
    return block.replace('</url>', `${xDefault}</url>`)
  })

  return { changed, xml: enriched }
}

const sitemapFiles = (await readdir(distDir))
  .filter((file) => /^sitemap-\d+\.xml$/u.test(file))
  .sort()

if (sitemapFiles.length === 0) {
  throw new Error('Generated sitemap URL files are missing.')
}

let updatedFiles = 0
for (const file of sitemapFiles) {
  const filePath = path.join(distDir, file)
  const source = await readFile(filePath, 'utf8')
  const result = addXDefaultAlternates(source, file)
  if (!result.changed) continue
  await writeFile(filePath, result.xml, 'utf8')
  updatedFiles += 1
}

console.log(
  `Added x-default sitemap alternates to ${updatedFiles} generated sitemap file(s).`,
)
