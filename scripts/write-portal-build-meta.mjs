import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const corpus = JSON.parse(
  await readFile(resolve('dist/vector-corpus.json'), 'utf8'),
)
const commit = String(
  process.env.CF_PAGES_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    'local',
)
  .trim()
  .toLowerCase()
const outputDirectory = resolve('dist/.well-known')

await mkdir(outputDirectory, { recursive: true })
await writeFile(
  resolve(outputDirectory, 'aceserver-portal-build.json'),
  `${JSON.stringify({
    commit,
    searchCorpusVersion: corpus.version,
  })}\n`,
  'utf8',
)
