import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from 'parse5'
import {
  PORTAL_CORPUS_SCHEMA_VERSION,
  PORTAL_DISTANCE_METRIC,
  PORTAL_EMBEDDING_DIMENSIONS,
  PORTAL_EMBEDDING_MODEL,
  PORTAL_MAX_CORPUS_BYTES,
  PORTAL_MIN_SOURCE_COUNT,
  PORTAL_MIN_VECTOR_COUNT,
  PORTAL_SEARCH_NAMESPACE,
  PORTAL_VECTOR_LIMIT,
} from './portal-vectorize-config.mjs'

export {
  PORTAL_CORPUS_SCHEMA_VERSION,
  PORTAL_DISTANCE_METRIC,
  PORTAL_EMBEDDING_DIMENSIONS,
  PORTAL_EMBEDDING_MODEL,
  PORTAL_MAX_CORPUS_BYTES,
  PORTAL_MIN_SOURCE_COUNT,
  PORTAL_MIN_VECTOR_COUNT,
  PORTAL_SEARCH_NAMESPACE,
  PORTAL_VECTOR_LIMIT,
} from './portal-vectorize-config.mjs'

const PORTAL_ORIGIN = 'https://asv.acecore.net'
const DEFAULT_DIST_DIR = resolve('dist')
const DEFAULT_OUTPUT_FILE = resolve('dist/vector-corpus.json')
const TARGET_CHUNK_LENGTH = 850
const MAX_CHUNK_LENGTH = 1200
const OVERLAP_LENGTH = 120
const MIN_BLOCK_LENGTH = 12

const CONTENT_TAGS = new Set([
  'h1',
  'h2',
  'h3',
  'p',
  'li',
  'blockquote',
  'pre',
  'dt',
  'dd',
])

const REMOVED_TAGS = new Set([
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
])

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
  const htmlDocument = parse(html)
  const fallbackPath = htmlFileToUrl(htmlFile, distDir)
  const canonicalPath = getCanonicalPath(htmlDocument, fallbackPath)
  const documentLocale = normalizeText(
    getAttribute(
      findFirstElement(htmlDocument, (element) => element.tagName === 'html'),
      'lang',
    ),
  ).toLowerCase()

  if (
    documentLocale !== PORTAL_SEARCH_NAMESPACE ||
    shouldExcludePath(canonicalPath) ||
    isNoIndexPage(htmlDocument)
  ) {
    return null
  }

  const title = normalizeText(
    textContent(
      findFirstElement(
        htmlDocument,
        (element) =>
          element.tagName === 'h1' && hasAncestorTag(element, 'main'),
      ),
    ) ||
      getAttribute(
        findFirstElement(
          htmlDocument,
          (element) =>
            element.tagName === 'meta' &&
            getAttribute(element, 'property') === 'og:title',
        ),
        'content',
      ) ||
      textContentOfElements(
        htmlDocument,
        (element) => element.tagName === 'title',
      ),
  ).replace(/\s+[|｜]\s+エースサーバー$/u, '')
  if (!title) return null

  const description = normalizeText(
    getAttribute(
      findFirstElement(
        htmlDocument,
        (element) =>
          element.tagName === 'meta' &&
          getAttribute(element, 'name') === 'description',
      ),
      'content',
    ) || '',
  )
  const contentRoot =
    findFirstElement(htmlDocument, (element) => element.tagName === 'main') ||
    findFirstElement(htmlDocument, (element) => element.tagName === 'body')
  if (!contentRoot) return null

  const blocks = collectContentBlocks(contentRoot, title)
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

  return enrichPortalEmbeddingText(
    normalizeText(
      [document.title, section !== document.title ? section : '', body]
        .filter(Boolean)
        .join('\n'),
    ),
  )
}

export function enrichPortalEmbeddingText(value) {
  return value.replace(
    /Aceserver(?!\s+エースサーバー)/giu,
    (match) => `${match} エースサーバー`,
  )
}

function collectContentBlocks(root, title) {
  const blocks = []
  let currentHeading = title
  let previousText = ''

  visitElementDescendants(
    root,
    (element) => {
      if (!CONTENT_TAGS.has(element.tagName)) return
      const text = normalizeText(
        textContent(element, { skip: shouldRemoveElement }),
      )
      if (!text || text === previousText) return

      previousText = text
      if (/^h[1-3]$/u.test(element.tagName)) {
        currentHeading = text
        return
      }

      if (text.length < MIN_BLOCK_LENGTH) return
      blocks.push({ heading: currentHeading, text })
    },
    { skip: shouldRemoveElement },
  )

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

function getCanonicalPath(htmlDocument, fallbackPath) {
  const canonical = getAttribute(
    findFirstElement(
      htmlDocument,
      (element) =>
        element.tagName === 'link' &&
        getAttribute(element, 'rel') === 'canonical',
    ),
    'href',
  )
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

function isNoIndexPage(htmlDocument) {
  return findElements(
    htmlDocument,
    (element) =>
      element.tagName === 'meta' && getAttribute(element, 'name') === 'robots',
  ).some((element) =>
    String(getAttribute(element, 'content') || '')
      .toLowerCase()
      .split(',')
      .some((value) => value.trim() === 'noindex'),
  )
}

function findFirstElement(root, predicate) {
  let found = null
  visitElementDescendants(root, (element) => {
    if (!found && predicate(element)) found = element
  })
  return found
}

function findElements(root, predicate) {
  const elements = []
  visitElementDescendants(root, (element) => {
    if (predicate(element)) elements.push(element)
  })
  return elements
}

function textContentOfElements(root, predicate) {
  let text = ''
  visitElementDescendants(root, (element) => {
    if (predicate(element)) text += textContent(element)
  })
  return text
}

function visitElementDescendants(root, visitor, { skip } = {}) {
  for (const child of root?.childNodes || []) {
    visitElementTree(child, visitor, skip)
  }
}

function visitElementTree(node, visitor, skip) {
  if (isElement(node)) {
    if (skip?.(node)) return
    visitor(node)
  }

  for (const child of node?.childNodes || []) {
    visitElementTree(child, visitor, skip)
  }
}

function textContent(node, { skip } = {}) {
  if (!node) return ''
  if (node.nodeName === '#text') return node.value || ''
  if (isElement(node) && skip?.(node)) return ''

  return (node.childNodes || [])
    .map((child) => textContent(child, { skip }))
    .join('')
}

function isElement(node) {
  return typeof node?.tagName === 'string'
}

function hasAncestorTag(node, tagName) {
  let ancestor = node.parentNode
  while (ancestor) {
    if (ancestor.tagName === tagName) return true
    ancestor = ancestor.parentNode
  }
  return false
}

function getAttribute(element, name) {
  return element?.attrs?.find((attribute) => attribute.name === name)?.value
}

function hasAttribute(element, name) {
  return Boolean(element?.attrs?.some((attribute) => attribute.name === name))
}

function shouldRemoveElement(element) {
  return (
    REMOVED_TAGS.has(element.tagName) ||
    hasAttribute(element, 'data-pagefind-ignore') ||
    getAttribute(element, 'aria-hidden') === 'true'
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
