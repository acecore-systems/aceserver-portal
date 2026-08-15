import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import { readFileSync } from 'node:fs'

export const TRANSLATED_LOCALES = [
  'en',
  'zh-cn',
  'es',
  'pt',
  'fr',
  'ko',
  'de',
  'ru',
]

const CONTRACT_VERSION = 1
const FULL_SHA_PATTERN = /^[a-f0-9]{40}$/u
const SOURCE_HASH_PATTERN = /^[a-f0-9]{64}$/u
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u
const NONCE_PATTERN = /^[A-Za-z0-9_-]{22}$/u
const SOURCE_MARKER_PATTERN =
  /<!-- portal-translation-source:([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+) -->/gu
const MINIMUM_CONTRACT_SECRET_LENGTH = 32

export function isJapaneseTranslationSource(relativePath) {
  return (
    /^src\/content\/pages\/[A-Za-z0-9._-]+\.json$/u.test(relativePath) ||
    /^src\/content\/site\/(?:settings|navigation|announcements)\.json$/u.test(
      relativePath,
    ) ||
    /^src\/content\/stories\/[A-Za-z0-9._-]+\.md$/u.test(relativePath)
  )
}

export function normalizeSourceText(value) {
  return value.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
}

export function hashSourceText(value) {
  return createHash('sha256').update(normalizeSourceText(value)).digest('hex')
}

function defaultReadSourceFile(relativePath) {
  try {
    return readFileSync(relativePath, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

function assertRepository(repository) {
  if (!REPOSITORY_PATTERN.test(repository || '')) {
    throw new Error('Translation source repository must be owner/repository.')
  }
}

function assertSourceCommit(sourceCommit) {
  if (!FULL_SHA_PATTERN.test(sourceCommit || '')) {
    throw new Error('Translation source commit must be a full lowercase SHA.')
  }
}

function assertSourceEntry(source, index) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error(`Translation source entry ${index} must be an object.`)
  }
  if (
    typeof source.path !== 'string' ||
    !isJapaneseTranslationSource(source.path)
  ) {
    throw new Error(`Translation source entry ${index} has an invalid path.`)
  }
  if (
    source.hash !== null &&
    (typeof source.hash !== 'string' || !SOURCE_HASH_PATTERN.test(source.hash))
  ) {
    throw new Error(`Translation source entry ${index} has an invalid hash.`)
  }
}

export function validateTranslationSourceContract(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Translation source contract must be an object.')
  }
  if (value.version !== CONTRACT_VERSION) {
    throw new Error('Unsupported translation source contract version.')
  }
  assertRepository(value.repository)
  assertSourceCommit(value.sourceCommit)
  if (typeof value.nonce !== 'string' || !NONCE_PATTERN.test(value.nonce)) {
    throw new Error('Translation source contract nonce is invalid.')
  }
  if (
    !Array.isArray(value.sources) ||
    value.sources.length === 0 ||
    value.sources.length > 100
  ) {
    throw new Error(
      'Translation source contract must contain 1 to 100 sources.',
    )
  }

  value.sources.forEach(assertSourceEntry)
  const paths = value.sources.map((source) => source.path)
  const expectedPaths = [...new Set(paths)].sort()
  if (
    paths.length !== expectedPaths.length ||
    paths.some((path, index) => path !== expectedPaths[index])
  ) {
    throw new Error(
      'Translation source contract paths must be unique and sorted.',
    )
  }

  return value
}

export function createTranslationSourceContract({
  repository,
  sourceCommit,
  changedFiles,
  readSourceFile = defaultReadSourceFile,
  nonce = randomBytes(16).toString('base64url'),
}) {
  assertRepository(repository)
  assertSourceCommit(sourceCommit)
  const paths = [...new Set(changedFiles)].sort()
  if (paths.length === 0 || paths.length > 100) {
    throw new Error(
      'Translation source contract must contain 1 to 100 sources.',
    )
  }

  const sources = paths.map((path) => {
    if (!isJapaneseTranslationSource(path)) {
      throw new Error(`Unsupported Japanese translation source path: ${path}`)
    }
    const content = readSourceFile(path)
    if (content !== null && typeof content !== 'string') {
      throw new Error(
        `Translation source reader returned invalid data: ${path}`,
      )
    }
    return { path, hash: content === null ? null : hashSourceText(content) }
  })

  return validateTranslationSourceContract({
    version: CONTRACT_VERSION,
    repository,
    sourceCommit,
    nonce,
    sources,
  })
}

function contractSecretBuffer(secret) {
  if (
    typeof secret !== 'string' ||
    Buffer.byteLength(secret, 'utf8') < MINIMUM_CONTRACT_SECRET_LENGTH
  ) {
    throw new Error(
      `Portal translation contract secret must be at least ${MINIMUM_CONTRACT_SECRET_LENGTH} bytes.`,
    )
  }
  return Buffer.from(secret, 'utf8')
}

function signContractPayload(encodedPayload, secret) {
  return createHmac('sha256', contractSecretBuffer(secret))
    .update(encodedPayload, 'utf8')
    .digest('base64url')
}

export function formatTranslationSourceMarker(contract, { secret } = {}) {
  const validated = validateTranslationSourceContract(contract)
  const encoded = Buffer.from(JSON.stringify(validated), 'utf8').toString(
    'base64url',
  )
  const signature = signContractPayload(encoded, secret)
  return `<!-- portal-translation-source:${encoded}.${signature} -->`
}

export function parseTranslationSourceMarker(body, { secret } = {}) {
  if (typeof body !== 'string' || !body.trim()) return null
  const matches = [...body.matchAll(SOURCE_MARKER_PATTERN)]
  if (matches.length === 0) return null
  if (matches.length !== 1) {
    throw new Error(
      'Translation PR body must contain exactly one source marker.',
    )
  }

  const marker = matches[0]?.[1]
  if (!marker || marker.length > 64 * 1024) {
    throw new Error('Translation source marker is empty or too large.')
  }
  const parts = marker.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      'Translation source marker has an invalid signature format.',
    )
  }
  const [encoded, providedSignature] = parts

  const expectedSignature = signContractPayload(encoded, secret)
  const provided = Buffer.from(providedSignature, 'utf8')
  const expected = Buffer.from(expectedSignature, 'utf8')
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    throw new Error('Translation source marker signature is invalid.')
  }

  let decoded
  try {
    decoded = Buffer.from(encoded, 'base64url').toString('utf8')
  } catch {
    throw new Error('Translation source marker is not valid base64url.')
  }
  if (Buffer.from(decoded, 'utf8').toString('base64url') !== encoded) {
    throw new Error('Translation source marker is not canonical base64url.')
  }

  let contract
  try {
    contract = JSON.parse(decoded)
  } catch {
    throw new Error('Translation source marker does not contain valid JSON.')
  }
  return validateTranslationSourceContract(contract)
}

export function areTranslationSourcesCurrent(
  contract,
  { readSourceFile = defaultReadSourceFile } = {},
) {
  const validated = validateTranslationSourceContract(contract)
  return validated.sources.every((source) => {
    const content = readSourceFile(source.path)
    if (content === null) return source.hash === null
    if (typeof content !== 'string') return false
    return source.hash === hashSourceText(content)
  })
}

export function getExpectedTranslationFiles(contract) {
  const validated = validateTranslationSourceContract(contract)
  const expected = new Set()

  for (const source of validated.sources) {
    if (!source.path.startsWith('src/content/stories/')) {
      expected.add('src/i18n/translations.ts')
      continue
    }

    const storyFilename = source.path.slice('src/content/stories/'.length)
    for (const locale of TRANSLATED_LOCALES) {
      expected.add(`src/content/stories/${locale}/${storyFilename}`)
    }
  }

  return [...expected].sort()
}
