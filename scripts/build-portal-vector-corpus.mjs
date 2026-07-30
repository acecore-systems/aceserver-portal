import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { load } from 'cheerio'

export const PORTAL_CORPUS_SCHEMA_VERSION = 1
export const PORTAL_EMBEDDING_MODEL = '@cf/baai/bge-m3'
export const PORTAL_EMBEDDING_DIMENSIONS = 1024
export const PORTAL_DISTANCE_METRIC = 'cosine'
export const PORTAL_VECTOR_LIMIT = 500
export const PORTAL_MIN_SOURCE_COUNT = 10
export const PORTAL_MIN_VECTOR_COUNT = 10
export const PORTAL_MAX_CORPUS_BYTES = 256_000
export const PORTAL_SEARCH_NAMESPACE = 'ja'

const PORTAL_ORIGIN = 'https://asv.acecore.net'
const DEFAULT_DIST_DIR = resolve('dist')
const DEFAULT_OUTPUT_FILE = resolve('dist/vector-corpus.json')
const TARGET_CHUNK_LENGTH = 850
const MAX_CHUNK_LENGTH = 1200
const OVERLAP_LENGTH = 120
const MIN_BLOCK_LENGTH = 12

const CONTENT_SELECTORS = [
  'h1',
  'h2',
  'h3',
  'p',
  'li',
  'blockquote',
  'pre',
  'dt',
  'dd',
].join(',')

const REMOVE_SELECTORS = [
  '[data-pagefind-ignore]',
  '[aria-hidden="true"]',
  'script',
  'style',
  'noscript',
  'template',
  'svg',
  'canvas',
  'form',
  'button',
  'nav',
  'aside',
  'footer',
].join(',')

export async function buildPortalVectorCorpus({
  distDir = DEFAULT_DIST_DIR,
  outputFile = DEFAULT_OUTPUT_FILE,
  write = true,
} = {}) {
  const htmlFiles = await findHtmlFiles(distDir)
  const documents = []

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8')
    const document = extractPortalSearchDocument(html, htmlFile, distDir)
    if (document) documents.push(document)
  }

  documents.sort((left, right) => left.url.localeCompare(right.url))
  assertUniqueDocumentUrls(documents)
  if (documents.length < PORTAL_MIN_SOURCE_COUNT) {
    throw new Error(
      `Portal corpus has ${documents.length} source documents; at least ${PORTAL_MIN_SOURCE_COUNT} are required.`,
    )
  }

  const chunks = documents.flatMap((document) =>
    chunkPortalSearchDocument(document),
  )
  if (chunks.length < PORTAL_MIN_VECTOR_COUNT) {
    throw new Error(
      `Portal corpus has ${chunks.length} vectors; at least ${PORTAL_MIN_VECTOR_COUNT} are required.`,
    )
  }
  if (chunks.length > PORTAL_VECTOR_LIMIT) {
    throw new Error(
      `Portal corpus has ${chunks.length} vectors; the configured limit is ${PORTAL_VECTOR_LIMIT}.`,
    )
  }

  const version = digest(
    chunks
      .map(({ id }) => id)
      .sort()
      .join('\n'),
  ).slice(0, 20)
  const corpus = {
    schemaVersion: PORTAL_CORPUS_SCHEMA_VERSION,
    version,
    embedding: {
      model: PORTAL_EMBEDDING_MODEL,
      dimensions: PORTAL_EMBEDDING_DIMENSIONS,
      metric: PORTAL_DISTANCE_METRIC,
    },
    chunking: {
      targetCharacters: TARGET_CHUNK_LENGTH,
      maximumCharacters: MAX_CHUNK_LENGTH,
      overlapCharacters: OVERLAP_LENGTH,
    },
    sourceCount: documents.length,
    vectorCount: chunks.length,
    localeCounts: {
      [PORTAL_SEARCH_NAMESPACE]: chunks.length,
    },
    chunks,
  }

  const serializedCorpus = `${JSON.stringify(corpus, null, 2)}\n`
  const corpusBytes = Buffer.byteLength(serializedCorpus, 'utf8')
  if (corpusBytes > PORTAL_MAX_CORPUS_BYTES) {
    throw new Error(
      `Portal corpus is ${corpusBytes} bytes; the runtime limit is ${PORTAL_MAX_CORPUS_BYTES}.`,
    )
  }

  if (write) {
    await writeFile(outputFile, serializedCorpus, 'utf8')
  }

  return corpus
}

export function extractPortalSearchDocument(html, htmlFile, distDir) {
  const $ = load(html)
  const fallbackPath = htmlFileToUrl(htmlFile, distDir)
  const canonicalPath = getCanonicalPath($, fallbackPath)
  const documentLocale = normalizeText($('html').attr('lang')).toLowerCase()

  if (
    documentLocale !== PORTAL_SEARCH_NAMESPACE ||
    shouldExcludePath(canonicalPath) ||
    isNoIndexPage($)
  ) {
    return null
  }

  const title = normalizeText(
    $('main h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text(),
  ).replace(/\s+[|｜]\s+エースサーバー$/u, '')
  if (!title) return null

  const description = normalizeText(
    $('meta[name="description"]').attr('content') || '',
  )
  const contentRoot = $('main').first().length
    ? $('main').first().clone()
    : $('body').first().clone()
  contentRoot.find(REMOVE_SELECTORS).remove()

  const blocks = collectContentBlocks($, contentRoot, title)
  if (
    description.length >= MIN_BLOCK_LENGTH &&
    !blocks.some(({ text }) => text === description)
  ) {
    blocks.unshift({ heading: title, text: description })
  }
  const contentLength = blocks.reduce(
    (total, block) => total + block.text.length,
    0,
  )
  if (contentLength < 50) return null

  return {
    url: canonicalPath,
    locale: PORTAL_SEARCH_NAMESPACE,
    title,
    description,
    contentType: getContentType(canonicalPath),
    blocks,
  }
}

export function chunkPortalSearchDocument(document) {
  const groups = []
  let current = []
  let currentLength = 0

  for (const block of document.blocks) {
    const blockLimit = Math.max(
      400,
      MAX_CHUNK_LENGTH - document.title.length - block.heading.length - 3,
    )

    for (const part of splitLongText(block.text, blockLimit)) {
      const next = { heading: block.heading, text: part }
      let separatorLength = current.length > 0 ? 1 : 0
      const wouldExceed =
        current.length > 0 &&
        (currentLength + separatorLength + part.length > TARGET_CHUNK_LENGTH ||
          composeChunkText(document, [...current, next]).length >
            MAX_CHUNK_LENGTH)

      if (wouldExceed) {
        groups.push(current)
        current = buildOverlap(current)
        if (
          composeChunkText(document, [...current, next]).length >
          MAX_CHUNK_LENGTH
        ) {
          current = []
        }
        currentLength = current.reduce(
          (total, item, index) =>
            total + item.text.length + (index > 0 ? 1 : 0),
          0,
        )
        separatorLength = current.length > 0 ? 1 : 0
      }

      current.push(next)
      currentLength += separatorLength + part.length
    }
  }

  if (current.length > 0) groups.push(current)

  return groups.map((group, index) => {
    const section =
      [...group].reverse().find(({ heading }) => heading)?.heading ||
      document.title
    const body = group.map(({ text }) => text).join('\n')
    const text = composeChunkText(document, group)
    if (text.length > MAX_CHUNK_LENGTH) {
      throw new Error(
        `Portal search chunk exceeds ${MAX_CHUNK_LENGTH} characters: ${document.url}`,
      )
    }

    const id = `v1-${digest(
      [
        document.locale,
        document.url,
        document.title,
        section,
        String(index),
        text,
      ].join('\n'),
    ).slice(0, 48)}`

    return {
      id,
      namespace: document.locale,
      text,
      metadata: {
        url: document.url,
        title: document.title,
        section,
        excerpt: createExcerpt(body || document.description),
        contentType: document.contentType,
        locale: document.locale,
      },
    }
  })
}

function composeChunkText(document, group) {
  const section =
    [...group].reverse().find(({ heading }) => heading)?.heading ||
    document.title
  const body = group.map(({ text }) => text).join('\n')

  return normalizeText(
    [document.title, section !== document.title ? section : '', body]
      .filter(Boolean)
      .join('\n'),
  )
}

function collectContentBlocks($, root, title) {
  const blocks = []
  let currentHeading = title
  let previousText = ''

  root.find(CONTENT_SELECTORS).each((_index, element) => {
    const tagName = String(element.tagName || '').toLowerCase()
    const text = normalizeText($(element).text())
    if (!text || text === previousText) return

    previousText = text
    if (/^h[1-3]$/u.test(tagName)) {
      currentHeading = text
      return
    }

    if (text.length < MIN_BLOCK_LENGTH) return
    blocks.push({ heading: currentHeading, text })
  })

  return blocks
}

function splitLongText(text, limit) {
  if (text.length <= limit) return [text]

  const sentences = text.split(/(?<=[。！？.!?])\s*/u).filter(Boolean)
  const parts = []
  let current = ''

  for (const sentence of sentences) {
    if (sentence.length > limit) {
      if (current) {
        parts.push(current)
        current = ''
      }
      for (let index = 0; index < sentence.length; index += limit) {
        parts.push(sentence.slice(index, index + limit))
      }
      continue
    }

    const candidate = current ? `${current} ${sentence}` : sentence
    if (candidate.length > limit) {
      parts.push(current)
      current = sentence
    } else {
      current = candidate
    }
  }

  if (current) parts.push(current)
  return parts
}

function buildOverlap(blocks) {
  const overlap = []
  let length = 0

  for (const block of [...blocks].reverse()) {
    if (overlap.length > 0 && length + block.text.length > OVERLAP_LENGTH) break
    overlap.unshift(block)
    length += block.text.length
    if (length >= OVERLAP_LENGTH) break
  }

  return overlap
}

function createExcerpt(text) {
  const normalized = normalizeText(text)
  if (normalized.length <= 220) return normalized
  return `${normalized.slice(0, 219).trimEnd()}…`
}

function getCanonicalPath($, fallbackPath) {
  const canonical = $('link[rel="canonical"]').attr('href')
  if (!canonical) return fallbackPath

  try {
    const url = new URL(canonical, PORTAL_ORIGIN)
    if (url.origin !== PORTAL_ORIGIN || url.search || url.hash) {
      return fallbackPath
    }
    return normalizeUrlPath(url.pathname)
  } catch {
    return fallbackPath
  }
}

function getContentType(path) {
  if (/^\/stories\/[^/]+\/$/u.test(path)) return 'story'
  if (path === '/stories/') return 'story-index'
  if (path === '/') return 'home'
  if (/^\/world-map(?:-|\/|$)/u.test(path)) return 'world-map'
  if (path === '/youtube-search-aceserver/') return 'videos'
  return 'page'
}

function shouldExcludePath(path) {
  return (
    /^\/(?:admin|api)(?:\/|$)/u.test(path) ||
    path === '/404/' ||
    path === '/404.html/' ||
    path === '/vector-corpus.json/'
  )
}

function isNoIndexPage($) {
  return $('meta[name="robots"]')
    .toArray()
    .some((element) =>
      String($(element).attr('content') || '')
        .toLowerCase()
        .split(',')
        .some((value) => value.trim() === 'noindex'),
    )
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) return findHtmlFiles(path)
      return entry.isFile() && entry.name.endsWith('.html') ? [path] : []
    }),
  )

  return files.flat()
}

function htmlFileToUrl(htmlFile, distDir) {
  const path = relative(distDir, htmlFile).split(sep).join('/')
  if (path === 'index.html') return '/'
  if (path.endsWith('/index.html')) {
    return normalizeUrlPath(`/${path.slice(0, -'index.html'.length)}`)
  }
  return normalizeUrlPath(`/${path}`)
}

function normalizeUrlPath(path) {
  const normalized = `/${path}`.replace(/\/+/gu, '/')
  if (normalized === '/') return normalized
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function assertUniqueDocumentUrls(documents) {
  const urls = new Set()
  for (const document of documents) {
    if (urls.has(document.url)) {
      throw new Error(`Duplicate portal corpus URL: ${document.url}`)
    }
    urls.add(document.url)
  }
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex')
}

function isDirectExecution() {
  if (!process.argv[1]) return false
  return (
    resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase()
  )
}

if (isDirectExecution()) {
  const corpus = await buildPortalVectorCorpus()
  console.log(
    JSON.stringify({
      event: 'portal_vector_corpus_built',
      version: corpus.version,
      sources: corpus.sourceCount,
      vectors: corpus.vectorCount,
      locales: corpus.localeCounts,
    }),
  )
}
