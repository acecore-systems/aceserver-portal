import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  areTranslationSourcesCurrent,
  getExpectedTranslationFiles,
  parseTranslationSourceMarker,
} from './translation-source-contract.mjs'
import {
  hasOnlyTranslationStringChanges,
  isSafeTranslatedStoryContent,
} from './translation-change-policy.mjs'

const GITHUB_API_URL = 'https://api.github.com'
const FULL_SHA_PATTERN = /^[0-9a-f]{40}$/iu
const TRANSLATION_TITLE = '[翻訳] Aceserver Portalの日本語正本へ追従'
const COPILOT_AUTHOR_LOGIN = 'copilot-swe-agent[bot]'
const SAFE_MERGEABLE_STATES = new Set(['clean', 'blocked', 'unstable'])

export function parseArguments(argv) {
  const options = { prNumber: null }

  for (const argument of argv) {
    if (!argument.startsWith('--pr=')) {
      throw new Error(`Unknown argument: ${argument}`)
    }
    if (options.prNumber !== null) {
      throw new Error('--pr may only be provided once.')
    }
    const value = argument.slice('--pr='.length)
    if (!/^[1-9][0-9]*$/u.test(value)) {
      throw new Error('--pr must be a positive pull request number.')
    }
    const prNumber = Number(value)
    if (!Number.isSafeInteger(prNumber)) {
      throw new Error('--pr must be a safe integer.')
    }
    options.prNumber = prNumber
  }

  return options
}

function inferRepositoryFromGitRemote() {
  try {
    const remoteUrl = execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
    }).trim()
    const match = remoteUrl.match(
      /github\.com(?::|\/)([^/]+\/[^/.]+)(?:\.git)?$/u,
    )
    return match?.[1] ?? null
  } catch {
    return null
  }
}

export function parseRepositoryInfo(value) {
  if (typeof value !== 'string') {
    throw new Error('GITHUB_REPOSITORY is required.')
  }
  const match = value.match(/^([^/\s]+)\/([^/\s]+)$/u)
  if (!match?.[1] || !match[2]) {
    throw new Error('GITHUB_REPOSITORY must be owner/repository.')
  }
  const [, owner, repo] = match
  return { owner, repo, repository: `${owner}/${repo}` }
}

function getRepositoryInfo(environment = process.env) {
  return parseRepositoryInfo(
    environment.GITHUB_REPOSITORY || inferRepositoryFromGitRemote(),
  )
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredRecord(value, label) {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`)
  return value
}

function requiredString(record, key, label) {
  const value = record[key]
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label}.${key} must be a non-empty string.`)
  }
  return value
}

function optionalString(record, key) {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value : null
}

function requiredBoolean(record, key, label) {
  const value = record[key]
  if (typeof value !== 'boolean') {
    throw new Error(`${label}.${key} must be a boolean.`)
  }
  return value
}

function positiveInteger(record, key, label) {
  const value = record[key]
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label}.${key} must be a positive safe integer.`)
  }
  return value
}

export function parsePullRequest(value) {
  const pullRequest = requiredRecord(value, 'GitHub pull request')
  const base = requiredRecord(pullRequest.base, 'GitHub pull request.base')
  const head = requiredRecord(pullRequest.head, 'GitHub pull request.head')
  const author = requiredRecord(pullRequest.user, 'GitHub pull request.user')
  const headRepository = isRecord(head.repo) ? head.repo : null
  const headSha = requiredString(head, 'sha', 'GitHub pull request.head')
  if (!FULL_SHA_PATTERN.test(headSha)) {
    throw new Error('GitHub pull request.head.sha must be a full Git SHA.')
  }

  return {
    number: positiveInteger(pullRequest, 'number', 'GitHub pull request'),
    state: requiredString(pullRequest, 'state', 'GitHub pull request'),
    baseRef: requiredString(base, 'ref', 'GitHub pull request.base'),
    headRef: optionalString(head, 'ref'),
    headSha,
    headRepositoryFullName: headRepository
      ? optionalString(headRepository, 'full_name')
      : null,
    title: requiredString(pullRequest, 'title', 'GitHub pull request'),
    body: optionalString(pullRequest, 'body'),
    authorLogin: requiredString(author, 'login', 'GitHub pull request.user'),
    draft: requiredBoolean(pullRequest, 'draft', 'GitHub pull request'),
    mergeableState: requiredString(
      pullRequest,
      'mergeable_state',
      'GitHub pull request',
    ),
    autoMergeEnabled: isRecord(pullRequest.auto_merge),
    nodeId: optionalString(pullRequest, 'node_id'),
  }
}

export function parseCheckRuns(value) {
  const response = requiredRecord(value, 'GitHub check runs response')
  if (!Array.isArray(response.check_runs)) {
    throw new Error('GitHub check runs response.check_runs must be an array.')
  }

  return response.check_runs.map((entry, index) => {
    const checkRun = requiredRecord(
      entry,
      `GitHub check runs response.check_runs[${index}]`,
    )
    const app = isRecord(checkRun.app) ? checkRun.app : null
    const conclusion = checkRun.conclusion
    if (conclusion !== null && typeof conclusion !== 'string') {
      throw new Error(
        `GitHub check runs response.check_runs[${index}].conclusion must be a string or null.`,
      )
    }
    return {
      name: requiredString(
        checkRun,
        'name',
        `GitHub check runs response.check_runs[${index}]`,
      ),
      status: requiredString(
        checkRun,
        'status',
        `GitHub check runs response.check_runs[${index}]`,
      ),
      conclusion,
      appSlug: app ? optionalString(app, 'slug') : null,
    }
  })
}

function formatGitHubError(value) {
  if (isRecord(value) && typeof value.message === 'string') return value.message
  return JSON.stringify(value)
}

async function readGitHubJson(response, label) {
  try {
    return await response.json()
  } catch {
    throw new Error(`${label} returned non-JSON with ${response.status}.`)
  }
}

export function createGitHubClient({
  token,
  fetchImpl = globalThis.fetch,
  userAgent = 'aceserver-portal-translation-pr-merge',
} = {}) {
  if (!token) throw new Error('A GitHub token is required.')
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': userAgent,
    'X-GitHub-Api-Version': '2022-11-28',
  }

  return {
    async request(path, { method = 'GET', body } = {}) {
      const response = await fetchImpl(`${GITHUB_API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (response.status === 404 || response.status === 204) return null
      const payload = await readGitHubJson(
        response,
        `GitHub API ${method} ${path}`,
      )
      if (!response.ok) {
        throw new Error(
          `GitHub API ${method} ${path} failed: ${response.status} ${formatGitHubError(payload)}`,
        )
      }
      return payload
    },

    async graphql(query, variables = {}) {
      const response = await fetchImpl(`${GITHUB_API_URL}/graphql`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
      })
      const payload = requiredRecord(
        await readGitHubJson(response, 'GitHub GraphQL request'),
        'GitHub GraphQL response',
      )
      if (
        !response.ok ||
        (Array.isArray(payload.errors) && payload.errors.length > 0)
      ) {
        throw new Error(
          `GitHub GraphQL request failed: ${response.status} ${formatGitHubError(payload.errors ?? payload)}`,
        )
      }
      return requiredRecord(payload.data, 'GitHub GraphQL response.data')
    },
  }
}

function repositoryPath(repository, suffix) {
  return `/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}${suffix}`
}

async function getPullRequest(prNumber, repository, client) {
  const response = await client.request(
    repositoryPath(repository, `/pulls/${prNumber}`),
  )
  return response === null ? null : parsePullRequest(response)
}

async function getPullRequestFiles(prNumber, repository, client) {
  const filenames = []
  for (let page = 1; page <= 30; page += 1) {
    const response = await client.request(
      repositoryPath(
        repository,
        `/pulls/${prNumber}/files?per_page=100&page=${page}`,
      ),
    )
    if (!Array.isArray(response)) {
      throw new Error('GitHub pull request files response must be an array.')
    }
    response.forEach((entry, index) => {
      const file = requiredRecord(
        entry,
        `GitHub pull request files response[${index}]`,
      )
      filenames.push(
        requiredString(
          file,
          'filename',
          `GitHub pull request files response[${index}]`,
        ),
      )
    })
    if (response.length < 100) return filenames
  }
  throw new Error('Translation pull request exceeds the 3000-file API limit.')
}

async function getCheckRuns(headSha, repository, client) {
  const response = await client.request(
    repositoryPath(repository, `/commits/${headSha}/check-runs?per_page=100`),
  )
  if (response === null) {
    throw new Error('GitHub check runs response was unexpectedly empty.')
  }
  return parseCheckRuns(response)
}

async function getMainHead(repository, client) {
  const response = requiredRecord(
    await client.request(repositoryPath(repository, '/git/ref/heads/main')),
    'GitHub main ref',
  )
  const object = requiredRecord(response.object, 'GitHub main ref.object')
  const sha = requiredString(object, 'sha', 'GitHub main ref.object')
  if (!FULL_SHA_PATTERN.test(sha)) {
    throw new Error('GitHub main ref SHA must be a full Git SHA.')
  }
  return sha
}

async function getRepositoryFileContent(repository, relativePath, ref, client) {
  const encodedPath = relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  const response = await client.request(
    repositoryPath(
      repository,
      `/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
    ),
  )
  if (response === null) return null
  const file = requiredRecord(response, 'GitHub repository content')
  if (file.encoding !== 'base64' || typeof file.content !== 'string') {
    throw new Error(
      `GitHub did not return base64 file content: ${relativePath}`,
    )
  }
  return Buffer.from(file.content.replaceAll(/\s/gu, ''), 'base64').toString(
    'utf8',
  )
}

async function hasSafeTranslationContentChanges(
  contract,
  pullRequest,
  mainSha,
  repository,
  readClient,
) {
  const expectedFiles = getExpectedTranslationFiles(contract)
  if (expectedFiles.includes('src/i18n/translations.ts')) {
    const [baseContent, headContent] = await Promise.all([
      getRepositoryFileContent(
        repository,
        'src/i18n/translations.ts',
        mainSha,
        readClient,
      ),
      getRepositoryFileContent(
        repository,
        'src/i18n/translations.ts',
        pullRequest.headSha,
        readClient,
      ),
    ])
    if (!hasOnlyTranslationStringChanges(baseContent, headContent)) return false
  }

  const storySources = new Map(
    contract.sources
      .filter((source) => source.path.startsWith('src/content/stories/'))
      .map((source) => [
        source.path.slice('src/content/stories/'.length),
        source,
      ]),
  )
  for (const relativePath of expectedFiles) {
    const match = relativePath.match(
      /^src\/content\/stories\/(?:en|zh-cn|es|pt|fr|ko|de|ru)\/(.+\.md)$/u,
    )
    if (!match?.[1]) continue
    const source = storySources.get(match[1])
    if (!source) return false
    const headContent = await getRepositoryFileContent(
      repository,
      relativePath,
      pullRequest.headSha,
      readClient,
    )
    if (source.hash === null) {
      if (headContent !== null) return false
      continue
    }
    if (!isSafeTranslatedStoryContent(headContent)) return false
  }

  return true
}

export function isEligibleTranslationPullRequest(pullRequest, repository) {
  return (
    pullRequest.state === 'open' &&
    pullRequest.baseRef === 'main' &&
    pullRequest.authorLogin === COPILOT_AUTHOR_LOGIN &&
    pullRequest.headRepositoryFullName?.toLowerCase() ===
      repository.repository.toLowerCase() &&
    pullRequest.headRef?.startsWith('copilot/') === true &&
    pullRequest.title === TRANSLATION_TITLE
  )
}

export function hasMatchingSourceShaMarker(body, sourceCommit) {
  if (typeof body !== 'string') return false
  const matches = [...body.matchAll(/translation-source-sha:([a-f0-9]{40})/gu)]
  return matches.length === 1 && matches[0]?.[1] === sourceCommit
}

export function hasExactlyExpectedTranslationFiles(filenames, contract) {
  if (!Array.isArray(filenames) || filenames.length === 0) return false
  const actual = [...new Set(filenames)].sort()
  const expected = getExpectedTranslationFiles(contract)
  return (
    actual.length === filenames.length &&
    actual.length === expected.length &&
    actual.every((filename, index) => filename === expected[index])
  )
}

export function hasSuccessfulPortalCi(checkRuns) {
  return checkRuns.some(
    (checkRun) =>
      checkRun.name === 'Build and Format' &&
      checkRun.status === 'completed' &&
      checkRun.conclusion === 'success' &&
      checkRun.appSlug === 'github-actions',
  )
}

function localMainSha() {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim()
  if (!FULL_SHA_PATTERN.test(sha)) {
    throw new Error('Local main HEAD must be a full Git SHA.')
  }
  return sha
}

function isSourceCommitOnCurrentMain(sourceCommit) {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', sourceCommit, 'HEAD'], {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

async function closeStalePullRequest(
  pullRequest,
  repository,
  readClient,
  writeClient,
  logger,
) {
  const latest = await getPullRequest(
    pullRequest.number,
    repository,
    readClient,
  )
  if (
    !latest ||
    latest.state !== 'open' ||
    latest.headSha !== pullRequest.headSha ||
    latest.body !== pullRequest.body
  ) {
    logger.warn(
      `PR #${pullRequest.number} changed during stale validation; leaving it open for reevaluation.`,
    )
    return false
  }
  await writeClient.request(
    repositoryPath(repository, `/pulls/${pullRequest.number}`),
    { method: 'PATCH', body: { state: 'closed' } },
  )
  logger.log(`Closed stale Portal translation PR #${pullRequest.number}.`)
  return true
}

export async function updatePullRequestBranch(
  pullRequest,
  { writeClient, logger = console, repository },
) {
  const response = await writeClient.request(
    repositoryPath(repository, `/pulls/${pullRequest.number}/update-branch`),
    {
      method: 'PUT',
      body: { expected_head_sha: pullRequest.headSha },
    },
  )
  if (!isRecord(response) || typeof response.message !== 'string') {
    logger.warn(
      `GitHub did not confirm the branch update for PR #${pullRequest.number}.`,
    )
    return false
  }
  logger.log(
    `Updating PR #${pullRequest.number} with current main before auto-merge.`,
  )
  return true
}

export async function markPullRequestReadyForReview(
  pullRequest,
  { writeClient, logger = console },
) {
  if (!pullRequest.draft) return true
  if (!pullRequest.nodeId) return false
  const data = await writeClient.graphql(
    `mutation MarkPullRequestReadyForReview($pullRequestId: ID!) {
      markPullRequestReadyForReview(input: { pullRequestId: $pullRequestId }) {
        pullRequest { number isDraft }
      }
    }`,
    { pullRequestId: pullRequest.nodeId },
  )
  const mutation = requiredRecord(
    data.markPullRequestReadyForReview,
    'GitHub markPullRequestReadyForReview response',
  )
  const result = requiredRecord(
    mutation.pullRequest,
    'GitHub markPullRequestReadyForReview response.pullRequest',
  )
  if (
    positiveInteger(result, 'number', 'GitHub ready response') !==
      pullRequest.number ||
    requiredBoolean(result, 'isDraft', 'GitHub ready response')
  ) {
    logger.warn(`GitHub did not mark PR #${pullRequest.number} ready.`)
    return false
  }
  logger.log(`Marked PR #${pullRequest.number} ready for review.`)
  return true
}

export async function enablePullRequestAutoMerge(
  pullRequest,
  { writeClient, logger = console },
) {
  if (pullRequest.autoMergeEnabled) {
    logger.log(`Auto-merge is already enabled for PR #${pullRequest.number}.`)
    return true
  }
  if (!pullRequest.nodeId) return false
  const data = await writeClient.graphql(
    `mutation EnablePullRequestAutoMerge(
      $pullRequestId: ID!
      $expectedHeadOid: GitObjectID!
      $commitHeadline: String!
    ) {
      enablePullRequestAutoMerge(input: {
        pullRequestId: $pullRequestId
        expectedHeadOid: $expectedHeadOid
        mergeMethod: SQUASH
        commitHeadline: $commitHeadline
      }) {
        pullRequest {
          number
          merged
          autoMergeRequest { mergeMethod }
        }
      }
    }`,
    {
      pullRequestId: pullRequest.nodeId,
      expectedHeadOid: pullRequest.headSha,
      commitHeadline: pullRequest.title,
    },
  )
  const mutation = requiredRecord(
    data.enablePullRequestAutoMerge,
    'GitHub enablePullRequestAutoMerge response',
  )
  const result = requiredRecord(
    mutation.pullRequest,
    'GitHub enablePullRequestAutoMerge response.pullRequest',
  )
  const number = positiveInteger(result, 'number', 'GitHub auto-merge response')
  const merged = requiredBoolean(result, 'merged', 'GitHub auto-merge response')
  const enabled = isRecord(result.autoMergeRequest)
  if (number !== pullRequest.number || (!merged && !enabled)) {
    logger.warn(
      `GitHub did not enable auto-merge for PR #${pullRequest.number}.`,
    )
    return false
  }
  logger.log(
    merged
      ? `PR #${pullRequest.number} merged after validation.`
      : `Enabled squash auto-merge for PR #${pullRequest.number}.`,
  )
  return true
}

export async function runMergeAutomation(
  argv,
  {
    readClient,
    writeClient,
    environment = process.env,
    logger = console,
    repository,
  } = {},
) {
  const { prNumber } = parseArguments(argv)
  if (!prNumber) {
    logger.log('No pull request number provided. Skipping merge automation.')
    return
  }
  const currentRepository = repository ?? getRepositoryInfo(environment)
  const currentReadClient =
    readClient ??
    createGitHubClient({
      token: environment.GITHUB_READ_TOKEN,
      userAgent: 'aceserver-portal-translation-pr-read',
    })
  const currentWriteClient =
    writeClient ??
    createGitHubClient({
      token: environment.GITHUB_TOKEN,
      userAgent: 'aceserver-portal-translation-pr-write',
    })

  const pullRequest = await getPullRequest(
    prNumber,
    currentRepository,
    currentReadClient,
  )
  if (!pullRequest) {
    logger.log(`Pull request #${prNumber} was not found. Skipping.`)
    return
  }
  if (!isEligibleTranslationPullRequest(pullRequest, currentRepository)) {
    logger.log(`Pull request #${prNumber} is not an eligible translation PR.`)
    return
  }

  let contract
  try {
    contract = parseTranslationSourceMarker(pullRequest.body, {
      secret: environment.PORTAL_TRANSLATION_CONTRACT_SECRET,
    })
  } catch (error) {
    throw new Error(
      `Translation PR #${prNumber} has an invalid source contract: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
  if (!contract) {
    logger.log(`Translation PR #${prNumber} has no source contract.`)
    return
  }
  if (
    contract.repository.toLowerCase() !==
    currentRepository.repository.toLowerCase()
  ) {
    throw new Error(`Translation PR #${prNumber} targets another repository.`)
  }
  if (!hasMatchingSourceShaMarker(pullRequest.body, contract.sourceCommit)) {
    throw new Error(
      `Translation PR #${prNumber} has an invalid source SHA marker.`,
    )
  }

  const remoteMainSha = await getMainHead(currentRepository, currentReadClient)
  if (localMainSha() !== remoteMainSha) {
    logger.log(
      'The checked-out main branch is no longer current; retrying later.',
    )
    return
  }
  if (
    !isSourceCommitOnCurrentMain(contract.sourceCommit) ||
    !areTranslationSourcesCurrent(contract)
  ) {
    await closeStalePullRequest(
      pullRequest,
      currentRepository,
      currentReadClient,
      currentWriteClient,
      logger,
    )
    return
  }

  const changedFiles = await getPullRequestFiles(
    prNumber,
    currentRepository,
    currentReadClient,
  )
  if (!hasExactlyExpectedTranslationFiles(changedFiles, contract)) {
    throw new Error(
      `Translation PR #${prNumber} changed files outside its exact source contract: ${changedFiles.join(', ') || '(none)'}`,
    )
  }
  if (pullRequest.mergeableState === 'behind') {
    if (
      !(await updatePullRequestBranch(pullRequest, {
        writeClient: currentWriteClient,
        logger,
        repository: currentRepository,
      }))
    ) {
      throw new Error(`Could not update translation PR #${prNumber}.`)
    }
    return
  }
  if (
    !(await hasSafeTranslationContentChanges(
      contract,
      pullRequest,
      remoteMainSha,
      currentRepository,
      currentReadClient,
    ))
  ) {
    throw new Error(
      `Translation PR #${prNumber} contains structural code changes or unsafe Story content.`,
    )
  }

  const checkRuns = await getCheckRuns(
    pullRequest.headSha,
    currentRepository,
    currentReadClient,
  )
  if (!hasSuccessfulPortalCi(checkRuns)) {
    logger.log(
      `Translation PR #${prNumber} does not have a successful Portal CI check yet.`,
    )
    return
  }

  if (!SAFE_MERGEABLE_STATES.has(pullRequest.mergeableState)) {
    logger.log(
      `Translation PR #${prNumber} mergeable state is ${pullRequest.mergeableState}; skipping.`,
    )
    return
  }

  if (
    !(await markPullRequestReadyForReview(pullRequest, {
      writeClient: currentWriteClient,
      logger,
    }))
  ) {
    throw new Error(`Could not mark translation PR #${prNumber} ready.`)
  }
  if (
    !(await enablePullRequestAutoMerge(pullRequest, {
      writeClient: currentWriteClient,
      logger,
    }))
  ) {
    throw new Error(`Could not enable auto-merge for PR #${prNumber}.`)
  }
}

function isDirectExecution() {
  if (!process.argv[1]) return false
  return (
    resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase()
  )
}

if (isDirectExecution()) {
  await runMergeAutomation(process.argv.slice(2))
}
