import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const pendingPath = 'src/i18n/pending-seo-revisions.json'
const locales = ['en', 'zh-cn', 'es', 'pt', 'fr', 'ko', 'de', 'ru']
export const sourceDirectory = 'src/content/stories'
export const hashText = (value) =>
  createHash('sha256').update(value.replace(/\r\n?/g, '\n')).digest('hex')
const read = (root, file) => readFileSync(join(root, file), 'utf8')
const translationPath = (source, locale) =>
  source.replace(/\/([^/]+)$/, `/${locale}/$1`)

export function loadPending(root) {
  if (!existsSync(join(root, pendingPath))) return {}
  const value = JSON.parse(read(root, pendingPath))
  assert.deepEqual(Object.keys(value).sort(), ['revisions', 'version'])
  assert.equal(value.version, 1)
  assert.ok(
    value.revisions &&
      typeof value.revisions === 'object' &&
      !Array.isArray(value.revisions),
  )
  for (const [path, entry] of Object.entries(value.revisions)) {
    assert.ok(path.startsWith(sourceDirectory + '/'))
    assert.match(path.slice(sourceDirectory.length + 1), /^[a-zA-Z0-9_-]+\.md$/)
    assert.deepEqual(Object.keys(entry).sort(), [
      'previousSource',
      'previousSourceHash',
      'sourceHash',
      'translations',
    ])
    assert.equal(typeof entry.previousSource, 'string')
    assert.match(entry.sourceHash, /^[a-f0-9]{64}$/)
    assert.equal(hashText(entry.previousSource), entry.previousSourceHash)
    assert.notEqual(entry.previousSourceHash, entry.sourceHash)
    assert.deepEqual(
      Object.keys(entry.translations).sort(),
      [...locales].sort(),
    )
    for (const hash of Object.values(entry.translations))
      assert.match(hash, /^[a-f0-9]{64}$/)
  }
  return value.revisions
}

// Only exact, unchanged translations may still be checked against the prior source.
// Updated translations always undergo the ordinary current-source validation.
export function translationBaseline(root, sourcePath, locale, translated) {
  const entry = loadPending(root)[sourcePath]
  if (!entry || hashText(translated) !== entry.translations[locale])
    return read(root, sourcePath)
  assert.equal(
    hashText(read(root, sourcePath)),
    entry.sourceHash,
    'pending SEO source changed',
  )
  return entry.previousSource
}

export function pendingSourceOverrides(root) {
  const overrides = new Map()
  for (const [path, entry] of Object.entries(loadPending(root))) {
    const unchanged = locales.every(
      (locale) =>
        hashText(read(root, translationPath(path, locale))) ===
        entry.translations[locale],
    )
    if (!unchanged) continue
    assert.equal(
      hashText(read(root, path)),
      entry.sourceHash,
      'pending SEO source changed',
    )
    overrides.set(path, entry.previousSource)
  }
  return overrides
}

export function stageTranslation(root, source, baseSha) {
  assert.match(baseSha, /^[a-f0-9]{40}$/)
  assert.ok(source.startsWith(sourceDirectory + '/'))
  assert.match(source.slice(sourceDirectory.length + 1), /^[a-zA-Z0-9_-]+\.md$/)
  const git = (args) =>
    execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
    })
  assert.equal(
    git(['rev-parse', 'HEAD']).trim(),
    baseSha,
    'base commit changed',
  )
  const previousSource = git(['show', `${baseSha}:${source}`])
  const sourceHash = hashText(read(root, source))
  assert.notEqual(
    sourceHash,
    hashText(previousSource),
    'Japanese source did not change',
  )
  const revisions = loadPending(root)
  for (const [path, entry] of Object.entries(revisions)) {
    const stillPending = locales.some(
      (locale) =>
        hashText(read(root, translationPath(path, locale))) ===
        entry.translations[locale],
    )
    if (!stillPending) delete revisions[path]
  }
  assert.ok(!revisions[source], 'previous translation is still pending')
  const translations = {}
  for (const locale of locales) {
    const path = translationPath(source, locale)
    const original = git(['show', `${baseSha}:${path}`])
    assert.equal(
      hashText(read(root, path)),
      hashText(original),
      'translation changed during Japanese revision',
    )
    translations[locale] = hashText(original)
  }
  revisions[source] = {
    sourceHash,
    previousSource,
    previousSourceHash: hashText(previousSource),
    translations,
  }
  mkdirSync(dirname(join(root, pendingPath)), { recursive: true })
  writeFileSync(
    join(root, pendingPath),
    JSON.stringify({ version: 1, revisions }, null, 2) + '\n',
  )
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const args = process.argv.slice(2)
  assert.equal(args.length, 4)
  assert.equal(args[0], '--source')
  assert.equal(args[2], '--base-sha')
  stageTranslation(process.cwd(), args[1], args[3])
}
