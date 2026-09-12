import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import {
  assertDeployedPortalBuild,
  readDeployedPortalBuild,
} from './wait-for-portal-deployment.mjs'

const markerUrl =
  'https://asv.acecore.net/.well-known/aceserver-portal-build.json'
const indexName = 'aceserver-portal-search-bge-m3-1024-production-v1'
const receiptName = 'portal-vectorize-receipt'
const stateDir = '.portal-sync-state'
export const maxReceiptAgeMs = 24 * 60 * 60 * 1000

export function shouldReconcile({
  receipt,
  corpusVersion,
  toolingVersion,
  force,
  now = Date.now(),
}) {
  const age = now - Date.parse(receipt?.verifiedAt)
  return (
    Boolean(force) ||
    receipt?.schema !== 1 ||
    receipt?.indexName !== indexName ||
    receipt?.corpusVersion !== corpusVersion ||
    receipt?.toolingVersion !== toolingVersion ||
    !Number.isFinite(age) ||
    age < 0 ||
    age >= maxReceiptAgeMs
  )
}

export function isPagesSuccess(event) {
  const check = event?.check_run
  return (
    check?.name === 'Cloudflare Pages' &&
    check?.app?.id === 85455 &&
    check?.app?.slug === 'cloudflare-workers-and-pages' &&
    check?.conclusion === 'success' &&
    check?.status === 'completed' &&
    /^[0-9a-f]{40}$/.test(check?.head_sha ?? '')
  )
}

export function previousRelevantRun(runs, currentRunId) {
  // A failed/cancelled/incomplete attempt may have partially mutated the index.
  // Never look past it to an older successful receipt. Job-level skipped runs did not mutate.
  return runs.find(
    (run) =>
      String(run.id) !== String(currentRunId) && run.conclusion !== 'skipped',
  )
}

function gh(args) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    timeout: 30000,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function restoreReceipt() {
  try {
    if (Number(process.env.GITHUB_RUN_ATTEMPT) > 1) return null
    const repo = process.env.GITHUB_REPOSITORY
    if (repo !== 'acecore-systems/aceserver-portal') return null
    const { workflow_runs: runs } = JSON.parse(
      gh([
        'api',
        `repos/${repo}/actions/workflows/sync-portal-vectorize.yml/runs?branch=main&per_page=100`,
      ]),
    )
    const previous = previousRelevantRun(runs, process.env.GITHUB_RUN_ID)
    if (previous?.status !== 'completed' || previous.conclusion !== 'success')
      return null
    await mkdir(`${stateDir}/previous`, { recursive: true })
    gh([
      'run',
      'download',
      String(previous.id),
      '--repo',
      repo,
      '--name',
      receiptName,
      '--dir',
      `${stateDir}/previous`,
    ])
    const text = await readFile(`${stateDir}/previous/receipt.json`, 'utf8')
    if (Buffer.byteLength(text) > 4096) return null
    return JSON.parse(text)
  } catch {
    // Expired/missing artifacts, API errors and invalid receipts always run the full reconciliation.
    return null
  }
}

async function outputs(values) {
  await appendFile(
    process.env.GITHUB_OUTPUT,
    Object.entries(values)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(''),
  )
}

async function prepare() {
  const eventName = process.env.GITHUB_EVENT_NAME
  if (!['check_run', 'schedule', 'workflow_dispatch'].includes(eventName))
    throw new Error('Unsupported event')
  const event = JSON.parse(
    await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'),
  )
  if (eventName === 'check_run' && !isPagesSuccess(event)) {
    await outputs({ eligible: false, sync: false })
    return
  }
  const marker = await readDeployedPortalBuild(markerUrl)
  if (eventName === 'check_run' && marker.commit !== event.check_run.head_sha) {
    console.log(
      'Deployment event is not the currently public commit; no index mutation.',
    )
    await outputs({ eligible: false, sync: false })
    return
  }
  execFileSync('git', ['merge-base', '--is-ancestor', marker.commit, 'HEAD'], {
    stdio: 'pipe',
  })
  const toolingVersion = createHash('sha256')
    .update(
      execFileSync('git', [
        'ls-tree',
        '-r',
        'HEAD',
        'scripts',
        'functions/api/alpha-search-embedding.ts',
        'package-lock.json',
        '.node-version',
        '.github/workflows/sync-portal-vectorize.yml',
      ]),
    )
    .digest('hex')
  const receipt = await restoreReceipt()
  const sync = shouldReconcile({
    receipt,
    corpusVersion: marker.searchCorpusVersion,
    toolingVersion,
    force:
      eventName === 'workflow_dispatch' &&
      process.env.FORCE_RECONCILE !== 'false',
  })
  await mkdir(stateDir, { recursive: true })
  await writeFile(
    `${stateDir}/current.json`,
    JSON.stringify({ marker, toolingVersion, sync, receipt }),
  )
  await outputs({ eligible: true, sync, commit: marker.commit })
  console.log(
    JSON.stringify({
      event: 'portal_sync_preflight',
      commit: marker.commit,
      corpusVersion: marker.searchCorpusVersion,
      reconcile: sync,
    }),
  )
}

async function record() {
  const current = JSON.parse(await readFile(`${stateDir}/current.json`, 'utf8'))
  await assertDeployedPortalBuild(
    markerUrl,
    current.marker.commit,
    current.marker.searchCorpusVersion,
  )
  const receipt = {
    schema: 1,
    indexName,
    corpusVersion: current.marker.searchCorpusVersion,
    toolingVersion: current.toolingVersion,
    verifiedAt: current.sync
      ? new Date().toISOString()
      : current.receipt.verifiedAt,
  }
  await writeFile(`${stateDir}/receipt.json`, JSON.stringify(receipt))
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (process.argv[2] === 'prepare') await prepare()
  else if (process.argv[2] === 'record') await record()
  else throw new Error('Expected prepare or record')
}
