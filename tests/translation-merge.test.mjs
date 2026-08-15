import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  enablePullRequestAutoMerge,
  hasExactlyExpectedTranslationFiles,
  hasMatchingSourceShaMarker,
  hasSuccessfulPortalCi,
  isEligibleTranslationPullRequest,
  parseArguments,
  runMergeAutomation,
} from '../scripts/merge-translation-pr.mjs'
import {
  areTranslationSourcesCurrent,
  createTranslationSourceContract,
  formatTranslationSourceMarker,
  getExpectedTranslationFiles,
  hashSourceText,
  parseTranslationSourceMarker,
} from '../scripts/translation-source-contract.mjs'
import {
  hasOnlyTranslationStringChanges,
  isSafeTranslatedStoryContent,
} from '../scripts/translation-change-policy.mjs'

const REPOSITORY = {
  owner: 'acecore-systems',
  repo: 'aceserver-portal',
  repository: 'acecore-systems/aceserver-portal',
}
const HEAD_SHA = 'a'.repeat(40)
const TEST_CONTRACT_SECRET = 'portal-translation-test-secret-32-bytes'

function createPullRequest(overrides = {}) {
  return {
    number: 42,
    state: 'open',
    baseRef: 'main',
    headRef: 'copilot/translate-portal-content',
    headSha: HEAD_SHA,
    headRepositoryFullName: REPOSITORY.repository,
    title: '[翻訳] Aceserver Portalの日本語正本へ追従',
    body: null,
    authorLogin: 'copilot-swe-agent[bot]',
    draft: true,
    mergeableState: 'clean',
    autoMergeEnabled: false,
    nodeId: 'PR_kwDOExample',
    ...overrides,
  }
}

function rawPullRequest(pullRequest) {
  return {
    number: pullRequest.number,
    state: pullRequest.state,
    base: { ref: pullRequest.baseRef },
    head: {
      ref: pullRequest.headRef,
      sha: pullRequest.headSha,
      repo: { full_name: pullRequest.headRepositoryFullName },
    },
    title: pullRequest.title,
    body: pullRequest.body,
    user: { login: pullRequest.authorLogin },
    draft: pullRequest.draft,
    mergeable_state: pullRequest.mergeableState,
    auto_merge: pullRequest.autoMergeEnabled
      ? { merge_method: 'squash' }
      : null,
    node_id: pullRequest.nodeId,
  }
}

function createLogger() {
  const logs = []
  const warnings = []
  return {
    logs,
    warnings,
    logger: {
      log(message) {
        logs.push(message)
      },
      warn(message) {
        warnings.push(message)
      },
    },
  }
}

test('source contractはLF正規化hashと完全な翻訳対象集合を固定する', () => {
  assert.equal(
    hashSourceText('line 1\r\nline 2\r\n'),
    hashSourceText('line 1\nline 2\n'),
  )

  const contract = createTranslationSourceContract({
    repository: REPOSITORY.repository,
    sourceCommit: HEAD_SHA,
    changedFiles: [
      'src/content/stories/example.md',
      'src/content/pages/top.json',
    ],
    readSourceFile(path) {
      return path.endsWith('.json') ? '{"title":"例"}\r\n' : '# 例\r\n'
    },
  })
  const marker = formatTranslationSourceMarker(contract, {
    secret: TEST_CONTRACT_SECRET,
  })

  assert.deepEqual(
    parseTranslationSourceMarker(`task\n${marker}`, {
      secret: TEST_CONTRACT_SECRET,
    }),
    contract,
  )
  assert.deepEqual(getExpectedTranslationFiles(contract), [
    'src/content/stories/de/example.md',
    'src/content/stories/en/example.md',
    'src/content/stories/es/example.md',
    'src/content/stories/fr/example.md',
    'src/content/stories/ko/example.md',
    'src/content/stories/pt/example.md',
    'src/content/stories/ru/example.md',
    'src/content/stories/zh-cn/example.md',
    'src/i18n/translations.ts',
  ])
  assert.equal(
    areTranslationSourcesCurrent(contract, {
      readSourceFile(path) {
        return path.endsWith('.json') ? '{"title":"例"}\n' : '# 例\n'
      },
    }),
    true,
  )
})

test('source markerの重複、改ざん、未許可pathはfail closedにする', () => {
  const contract = createTranslationSourceContract({
    repository: REPOSITORY.repository,
    sourceCommit: HEAD_SHA,
    changedFiles: ['src/content/pages/top.json'],
    readSourceFile: () => '{}',
  })
  const marker = formatTranslationSourceMarker(contract, {
    secret: TEST_CONTRACT_SECRET,
  })
  assert.throws(
    () =>
      parseTranslationSourceMarker(`${marker}\n${marker}`, {
        secret: TEST_CONTRACT_SECRET,
      }),
    /exactly one source marker/u,
  )
  assert.throws(
    () =>
      parseTranslationSourceMarker(marker, {
        secret: 'different-portal-translation-secret',
      }),
    /signature is invalid/u,
  )
  assert.throws(
    () =>
      createTranslationSourceContract({
        repository: REPOSITORY.repository,
        sourceCommit: HEAD_SHA,
        changedFiles: ['.github/workflows/ci.yml'],
      }),
    /Unsupported Japanese translation source path/u,
  )
})

test('translations.tsは翻訳blockの文字列値以外を変更できない', async () => {
  const base = await readFile('src/i18n/translations.ts', 'utf8')
  const translated = base.replace(
    'Official portal for the free public Minecraft server',
    'Official Aceserver community portal',
  )
  const japanese = base.replace(
    'Minecraft無料公開サーバーの公式ポータル',
    '変更された日本語正本',
  )
  const structural = base.replace(
    'const en: LocaleTranslation = {',
    'const en: LocaleTranslation = {\n  unexpectedCode: process.env.SECRET,',
  )

  assert.notEqual(translated, base)
  assert.equal(hasOnlyTranslationStringChanges(base, translated), true)
  assert.equal(hasOnlyTranslationStringChanges(base, japanese), false)
  assert.equal(hasOnlyTranslationStringChanges(base, structural), false)
})

test('翻訳Storyはraw HTML、active URL scheme、bidi制御文字を拒否する', () => {
  assert.equal(
    isSafeTranslatedStoryContent('---\ntitle: Example\n---\n\n# Safe story\n'),
    true,
  )
  assert.equal(isSafeTranslatedStoryContent('<script>alert(1)</script>'), false)
  assert.equal(
    isSafeTranslatedStoryContent('[open](javascript:alert(1))'),
    false,
  )
  assert.equal(isSafeTranslatedStoryContent(`safe\u202etxt`), false)
})

test('PR番号とCopilot PR provenanceを厳密に検証する', () => {
  assert.deepEqual(parseArguments(['--pr=42']), { prNumber: 42 })
  assert.throws(() => parseArguments(['--pr=0']), /positive pull request/u)
  assert.throws(() => parseArguments(['--skip-checks']), /Unknown argument/u)

  assert.equal(
    isEligibleTranslationPullRequest(createPullRequest(), REPOSITORY),
    true,
  )
  assert.equal(
    isEligibleTranslationPullRequest(
      createPullRequest({ authorLogin: 'gui-ace' }),
      REPOSITORY,
    ),
    false,
  )
  assert.equal(
    isEligibleTranslationPullRequest(
      createPullRequest({ headRef: 'codex/translate-content' }),
      REPOSITORY,
    ),
    false,
  )
  assert.equal(
    isEligibleTranslationPullRequest(
      createPullRequest({ headRepositoryFullName: 'fork/aceserver-portal' }),
      REPOSITORY,
    ),
    false,
  )
  assert.equal(
    isEligibleTranslationPullRequest(
      createPullRequest({ title: '[翻訳] 任意の変更' }),
      REPOSITORY,
    ),
    false,
  )
})

test('source SHA markerは署名contractのcommitと1回だけ一致させる', () => {
  assert.equal(
    hasMatchingSourceShaMarker(`translation-source-sha:${HEAD_SHA}`, HEAD_SHA),
    true,
  )
  assert.equal(
    hasMatchingSourceShaMarker(
      `translation-source-sha:${HEAD_SHA}\ntranslation-source-sha:${HEAD_SHA}`,
      HEAD_SHA,
    ),
    false,
  )
  assert.equal(
    hasMatchingSourceShaMarker(
      `translation-source-sha:${'b'.repeat(40)}`,
      HEAD_SHA,
    ),
    false,
  )
})

test('source contractが要求する翻訳ファイルの完全一致だけを認める', () => {
  const contract = createTranslationSourceContract({
    repository: REPOSITORY.repository,
    sourceCommit: HEAD_SHA,
    changedFiles: ['src/content/pages/top.json'],
    readSourceFile: () => '{}',
  })
  assert.equal(
    hasExactlyExpectedTranslationFiles(['src/i18n/translations.ts'], contract),
    true,
  )
  assert.equal(
    hasExactlyExpectedTranslationFiles(
      ['src/i18n/translations.ts', '.github/workflows/ci.yml'],
      contract,
    ),
    false,
  )
  assert.equal(hasExactlyExpectedTranslationFiles([], contract), false)
})

test('GitHub Actions由来の成功済みPortal CIだけを認める', () => {
  assert.equal(
    hasSuccessfulPortalCi([
      {
        name: 'Build and Format',
        status: 'completed',
        conclusion: 'success',
        appSlug: 'github-actions',
      },
    ]),
    true,
  )
  assert.equal(
    hasSuccessfulPortalCi([
      {
        name: 'Build and Format',
        status: 'completed',
        conclusion: 'success',
        appSlug: 'untrusted-check-app',
      },
    ]),
    false,
  )
})

test('sourceHashが古いCopilot翻訳PRは再読後にApp tokenで閉じる', async () => {
  const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim()
  const contract = {
    version: 1,
    repository: REPOSITORY.repository,
    sourceCommit: currentHead,
    nonce: 'a'.repeat(22),
    sources: [{ path: 'src/content/pages/top.json', hash: '0'.repeat(64) }],
  }
  const pullRequest = createPullRequest({
    headSha: 'b'.repeat(40),
    body: `${formatTranslationSourceMarker(contract, {
      secret: TEST_CONTRACT_SECRET,
    })}\ntranslation-source-sha:${currentHead}`,
  })
  const readCalls = []
  const writeCalls = []
  let pullReads = 0
  const readClient = {
    async request(path) {
      readCalls.push(path)
      if (path.endsWith('/pulls/42')) {
        pullReads += 1
        return rawPullRequest(pullRequest)
      }
      if (path.endsWith('/git/ref/heads/main')) {
        return { object: { sha: currentHead } }
      }
      throw new Error(`Unexpected read: ${path}`)
    },
    async graphql() {
      throw new Error('Read client GraphQL must not be called.')
    },
  }
  const writeClient = {
    async request(path, options) {
      writeCalls.push({ path, options })
      return {}
    },
    async graphql() {
      throw new Error('Stale PR must not use GraphQL.')
    },
  }
  const { logger, logs } = createLogger()

  await runMergeAutomation(['--pr=42'], {
    readClient,
    writeClient,
    logger,
    repository: REPOSITORY,
    environment: {
      PORTAL_TRANSLATION_CONTRACT_SECRET: TEST_CONTRACT_SECRET,
    },
  })

  assert.equal(pullReads, 2)
  assert.deepEqual(writeCalls, [
    {
      path: '/repos/acecore-systems/aceserver-portal/pulls/42',
      options: { method: 'PATCH', body: { state: 'closed' } },
    },
  ])
  assert.match(logs.at(-1) ?? '', /Closed stale Portal translation PR/u)
})

test('read tokenでCIを確認し、App tokenでready化とexpected HEAD auto-mergeを行う', async () => {
  const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim()
  const contract = createTranslationSourceContract({
    repository: REPOSITORY.repository,
    sourceCommit: currentHead,
    changedFiles: ['src/content/pages/top.json'],
  })
  const pullRequest = createPullRequest({
    headSha: 'c'.repeat(40),
    body: `${formatTranslationSourceMarker(contract, {
      secret: TEST_CONTRACT_SECRET,
    })}\ntranslation-source-sha:${currentHead}`,
  })
  const translationsContent = await readFile('src/i18n/translations.ts', 'utf8')
  const readClient = {
    async request(path) {
      if (path.endsWith('/pulls/42')) return rawPullRequest(pullRequest)
      if (path.endsWith('/git/ref/heads/main')) {
        return { object: { sha: currentHead } }
      }
      if (path.includes('/pulls/42/files?')) {
        return [{ filename: 'src/i18n/translations.ts' }]
      }
      if (path.includes('/contents/src/i18n/translations.ts?ref=')) {
        return {
          encoding: 'base64',
          content: Buffer.from(translationsContent, 'utf8').toString('base64'),
        }
      }
      if (path.includes(`/commits/${pullRequest.headSha}/check-runs`)) {
        return {
          check_runs: [
            {
              name: 'Build and Format',
              status: 'completed',
              conclusion: 'success',
              app: { slug: 'github-actions' },
            },
          ],
        }
      }
      throw new Error(`Unexpected read: ${path}`)
    },
    async graphql() {
      throw new Error('Read token must not be used for GraphQL mutations.')
    },
  }
  const graphqlCalls = []
  const writeClient = {
    async request() {
      throw new Error('Write REST must not be called for a clean PR.')
    },
    async graphql(query, variables) {
      graphqlCalls.push({ query, variables })
      if (query.includes('MarkPullRequestReadyForReview')) {
        return {
          markPullRequestReadyForReview: {
            pullRequest: { number: 42, isDraft: false },
          },
        }
      }
      return {
        enablePullRequestAutoMerge: {
          pullRequest: {
            number: 42,
            merged: false,
            autoMergeRequest: { mergeMethod: 'SQUASH' },
          },
        },
      }
    },
  }
  const { logger } = createLogger()

  await runMergeAutomation(['--pr=42'], {
    readClient,
    writeClient,
    logger,
    repository: REPOSITORY,
    environment: {
      PORTAL_TRANSLATION_CONTRACT_SECRET: TEST_CONTRACT_SECRET,
    },
  })

  assert.equal(graphqlCalls.length, 2)
  assert.deepEqual(graphqlCalls[1].variables, {
    pullRequestId: 'PR_kwDOExample',
    expectedHeadOid: pullRequest.headSha,
    commitHeadline: pullRequest.title,
  })
})

test('auto-mergeはsquashと検証済みHEAD SHAを固定する', async () => {
  const graphqlCalls = []
  const writeClient = {
    async request() {
      throw new Error('REST must not be called.')
    },
    async graphql(query, variables) {
      graphqlCalls.push({ query, variables })
      return {
        enablePullRequestAutoMerge: {
          pullRequest: {
            number: 42,
            merged: false,
            autoMergeRequest: { mergeMethod: 'SQUASH' },
          },
        },
      }
    },
  }
  assert.equal(
    await enablePullRequestAutoMerge(createPullRequest(), { writeClient }),
    true,
  )
  assert.match(graphqlCalls[0].query, /mergeMethod: SQUASH/u)
  assert.equal(graphqlCalls[0].variables.expectedHeadOid, HEAD_SHA)
})

test('workflowはCI成功・main更新の双方で再評価しread/write tokenを分離する', async () => {
  const [workflow, taskWorkflow] = await Promise.all([
    readFile('.github/workflows/merge-translation-pr.yml', 'utf8'),
    readFile('.github/workflows/create-translation-task.yml', 'utf8'),
  ])
  assert.match(workflow, /workflow_run:/u)
  assert.match(workflow, /workflows:\s+- CI/u)
  assert.match(workflow, /push:\s+branches:\s+- main/u)
  assert.match(workflow, /actions\/create-github-app-token@v3/u)
  assert.match(
    workflow,
    /client-id:\s+\$\{\{ secrets\.TRANSLATION_BOT_CLIENT_ID \}\}/u,
  )
  assert.match(
    workflow,
    /GITHUB_READ_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/u,
  )
  assert.match(
    workflow,
    /GITHUB_TOKEN: \$\{\{ steps\.app-token\.outputs\.token \}\}/u,
  )
  assert.match(
    workflow,
    /PORTAL_TRANSLATION_CONTRACT_SECRET: \$\{\{ secrets\.PORTAL_TRANSLATION_CONTRACT_SECRET \}\}/u,
  )
  assert.doesNotMatch(workflow, /TRANSLATION_BOT_APP_ID/u)
  assert.match(
    taskWorkflow,
    /PORTAL_TRANSLATION_CONTRACT_SECRET: \$\{\{ secrets\.PORTAL_TRANSLATION_CONTRACT_SECRET \}\}/u,
  )
})
