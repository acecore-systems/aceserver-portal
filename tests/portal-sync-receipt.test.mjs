import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import {
  isPagesSuccess,
  maxReceiptAgeMs,
  previousRelevantRun,
  shouldReconcile,
} from '../scripts/portal-sync-receipt.mjs'

const now = Date.parse('2026-09-12T03:00:00Z')
const receipt = {
  schema: 1,
  indexName: 'aceserver-portal-search-bge-m3-1024-production-v1',
  corpusVersion: 'a'.repeat(20),
  toolingVersion: 'b'.repeat(64),
  verifiedAt: new Date(now - 1000).toISOString(),
}
const options = {
  receipt,
  corpusVersion: receipt.corpusVersion,
  toolingVersion: receipt.toolingVersion,
  now,
}
test('only an unchanged recently verified index skips reconciliation', () => {
  assert.equal(shouldReconcile(options), false)
  for (const patch of [
    { force: true },
    { receipt: null },
    { corpusVersion: 'c'.repeat(20) },
    { toolingVersion: 'd'.repeat(64) },
  ])
    assert.equal(shouldReconcile({ ...options, ...patch }), true)
})
test('daily audit, invalid timestamps, wrong schema and different indexes require full verification', () => {
  for (const patch of [
    { verifiedAt: new Date(now - maxReceiptAgeMs).toISOString() },
    { verifiedAt: new Date(now + 1).toISOString() },
    { verifiedAt: 'bad' },
    { schema: 2 },
    { indexName: 'other' },
  ])
    assert.equal(
      shouldReconcile({ ...options, receipt: { ...receipt, ...patch } }),
      true,
    )
})
test('a failed attempt invalidates all older successes including a rollback to their corpus version', () => {
  const failed = { id: 2, status: 'completed', conclusion: 'failure' }
  assert.equal(
    previousRelevantRun(
      [{ id: 3 }, failed, { id: 1, conclusion: 'success' }],
      3,
    ),
    failed,
  )
  assert.equal(
    previousRelevantRun(
      [
        { id: 3 },
        { id: 2, conclusion: 'skipped' },
        { id: 1, conclusion: 'success' },
      ],
      3,
    ).id,
    1,
  )
})
test('only successful Cloudflare Pages checks are deployment signals', () => {
  const check = {
    name: 'Cloudflare Pages',
    app: { id: 85455, slug: 'cloudflare-workers-and-pages' },
    conclusion: 'success',
    status: 'completed',
    head_sha: 'a'.repeat(40),
  }
  assert.equal(isPagesSuccess({ check_run: check }), true)
  for (const patch of [
    { app: { id: 1, slug: check.app.slug } },
    { conclusion: 'failure' },
    { head_sha: 'main' },
    { name: 'CI' },
  ])
    assert.equal(isPagesSuccess({ check_run: { ...check, ...patch } }), false)
})

test('同期profileが異なるreceiptは同じ公開corpusでも再検証する', () => {
  const moduleUrl = new URL(
    '../scripts/portal-sync-receipt.mjs',
    import.meta.url,
  ).href
  const code = `import {shouldReconcile} from ${JSON.stringify(moduleUrl)}; const x=JSON.parse(process.env.TEST_RECEIPT); console.log(shouldReconcile({receipt:x,corpusVersion:x.corpusVersion,toolingVersion:x.toolingVersion,now:Date.parse(x.verifiedAt)+1000}));`
  const result = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', code],
    {
      env: {
        ...process.env,
        PORTAL_SYNC_PROFILE: 'both',
        TEST_RECEIPT: JSON.stringify(receipt),
      },
      encoding: 'utf8',
    },
  ).trim()
  assert.equal(result, 'true')
  const both = {
    ...receipt,
    profile: 'both',
    indexNames: [
      receipt.indexName,
      'aceserver-portal-search-voyage-4-lite-1024-production-v1',
    ],
  }
  const matching = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', code],
    {
      env: {
        ...process.env,
        PORTAL_SYNC_PROFILE: 'both',
        TEST_RECEIPT: JSON.stringify(both),
      },
      encoding: 'utf8',
    },
  ).trim()
  assert.equal(matching, 'false')
})
