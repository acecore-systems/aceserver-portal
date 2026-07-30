import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const ZERO_SHA = '0000000000000000000000000000000000000000'
const COPILOT_API_BASE = 'https://api.githubcopilot.com'
const COPILOT_API_VERSION = '2026-01-09'
const COPILOT_INTEGRATION_ID = 'aceserver-portal-translation-task'
const TRANSLATED_LOCALES = ['en', 'zh-cn', 'es', 'pt', 'fr', 'ko', 'de', 'ru']
const SAFE_PATH_PATTERN = /^[A-Za-z0-9._/-]+$/u
const SHA_PATTERN = /^[a-f0-9]{40}$/u

export function isJapaneseTranslationSource(relativePath) {
  return (
    /^src\/content\/pages\/[A-Za-z0-9._-]+\.json$/u.test(relativePath) ||
    /^src\/content\/site\/(?:settings|navigation|announcements)\.json$/u.test(
      relativePath,
    ) ||
    /^src\/content\/stories\/[A-Za-z0-9._-]+\.md$/u.test(relativePath)
  )
}

export function parseChangedFiles(value) {
  if (!value?.trim()) return null

  const files = [
    ...new Set(
      value
        .split(',')
        .map((entry) => entry.trim().replaceAll('\\', '/'))
        .filter(Boolean),
    ),
  ]

  for (const file of files) {
    if (!SAFE_PATH_PATTERN.test(file) || !isJapaneseTranslationSource(file)) {
      throw new Error(`Unsupported Japanese translation source path: ${file}`)
    }
  }

  return files
}

export function normalizeSha(value) {
  const normalized = value?.trim().toLowerCase()
  if (!normalized || normalized === ZERO_SHA) return null
  if (!SHA_PATTERN.test(normalized)) {
    throw new Error(`Invalid Git SHA: ${value}`)
  }
  return normalized
}

export function isCmsCommitSubject(subject) {
  return /^cms: (?:create|update|delete|upload) /u.test(subject || '')
}

export function classifyCmsCommitSet(commits) {
  const contentCommits = commits.filter(
    (commit) => commit.parentShas.length < 2,
  )
  if (contentCommits.length === 0) return 'empty'

  const cmsCount = contentCommits.filter((commit) =>
    isCmsCommitSubject(commit.subject),
  ).length
  if (cmsCount === 0) return 'none'
  return cmsCount === contentCommits.length ? 'cms-only' : 'mixed'
}

function runGit(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function listChangedFiles(baseSha, headSha) {
  const range = baseSha ? `${baseSha}..${headSha}` : `${headSha}^..${headSha}`
  const output = runGit(['diff', '--name-only', '--diff-filter=ACMRD', range])
  if (!output) return []

  return [
    ...new Set(
      output
        .split(/\r?\n/u)
        .map((entry) => entry.trim().replaceAll('\\', '/'))
        .filter(
          (entry) =>
            SAFE_PATH_PATTERN.test(entry) && isJapaneseTranslationSource(entry),
        ),
    ),
  ]
}

function listCommits(baseSha, headSha) {
  const range = baseSha ? `${baseSha}..${headSha}` : `-n 1 ${headSha}`
  const args = baseSha
    ? ['log', '--format=%H%x00%P%x00%s', range]
    : ['log', '--format=%H%x00%P%x00%s', '-n', '1', headSha]
  const output = runGit(args)
  if (!output) return []

  return output.split(/\r?\n/u).map((line) => {
    const [sha, parents, subject = ''] = line.split('\0')
    return {
      sha,
      parentShas: parents ? parents.split(' ').filter(Boolean) : [],
      subject,
    }
  })
}

export function buildTranslationProblemStatement({
  repository,
  headSha,
  changedFiles,
}) {
  const fixedSources = changedFiles.filter(
    (file) => !file.startsWith('src/content/stories/'),
  )
  const storySources = changedFiles.filter((file) =>
    file.startsWith('src/content/stories/'),
  )
  const marker = `translation-source-sha:${headSha}`

  return [
    'Aceserver Portal の日本語正本に追従する翻訳PRを作成してください。',
    '',
    marker,
    `Repository: ${repository}`,
    `Source commit: ${headSha}`,
    `Target locales: ${TRANSLATED_LOCALES.join(', ')}`,
    'Changed Japanese source files:',
    ...changedFiles.map((file) => `- ${file}`),
    '',
    '必須条件:',
    '- 日本語正本は変更しない。',
    '- 固定ページ変更がある場合は src/i18n/translations.ts の対応する8言語だけを更新し、各localeのsourceHashを日本語固定コンテンツ全体のLF正規化SHA-256へ更新する。',
    '- Story変更がある場合は src/content/stories/{locale}/{slug}.md の対応ファイルだけを更新し、translationOfと日本語Story全体のLF正規化sourceHashを更新する。',
    '- 見出し構造、リンクの役割、画像、date、author、placeholder、URL、route、製品名、Minecraftコマンド、コード風tokenを壊さない。',
    '- Portal内部リンクとsystems.acecore.netのリンクは対象localeのprefixを使う。WIKIの可変情報をPortalへ複製しない。',
    '- 翻訳はCMSへ直接保存せず、このPRだけで変更する。',
    '- npm run format:check、npm run validate:content、npm run test:i18n、npm run buildを実行し、未実施や失敗はPR本文に明記する。',
    fixedSources.length
      ? `Fixed-content sources: ${fixedSources.join(', ')}`
      : 'Fixed-content sources: none',
    storySources.length
      ? `Story sources: ${storySources.join(', ')}`
      : 'Story sources: none',
  ].join('\n')
}

function repositoryInfo() {
  const repository = process.env.GITHUB_REPOSITORY?.trim()
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(repository || '')) {
    throw new Error('GITHUB_REPOSITORY must be owner/repository')
  }
  const [owner, repo] = repository.split('/')
  return { owner, repo, repository }
}

async function requestJson(url, { token, method = 'GET', body, headers = {} }) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': COPILOT_INTEGRATION_ID,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const responseText = await response.text()
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}: ${responseText}`,
    )
  }
  return responseText ? JSON.parse(responseText) : {}
}

async function hasOpenTranslationPullRequest(owner, repo, marker) {
  const token = process.env.GITHUB_TOKEN?.trim()
  if (!token) throw new Error('GITHUB_TOKEN is required')

  for (let page = 1; ; page += 1) {
    const pullRequests = await requestJson(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=open&per_page=100&page=${page}`,
      { token },
    )
    if (
      pullRequests.some(
        (pullRequest) =>
          pullRequest.title === '[翻訳] Aceserver Portalの日本語正本へ追従' ||
          pullRequest.body?.includes(marker),
      )
    ) {
      return true
    }
    if (pullRequests.length < 100) return false
  }
}

async function main() {
  const { owner, repo, repository } = repositoryInfo()
  const baseSha =
    normalizeSha(process.env.INPUT_BASE_SHA) ??
    normalizeSha(process.env.GITHUB_EVENT_BEFORE)
  const headSha =
    normalizeSha(process.env.INPUT_HEAD_SHA) ??
    normalizeSha(process.env.GITHUB_SHA) ??
    normalizeSha(runGit(['rev-parse', 'HEAD']))
  const manualFiles = parseChangedFiles(process.env.INPUT_CHANGED_FILES)
  const changedFiles = manualFiles ?? listChangedFiles(baseSha, headSha)

  if (changedFiles.length === 0) {
    console.log('No Japanese translation sources changed.')
    return
  }

  if (process.env.GITHUB_EVENT_NAME === 'push') {
    const classification = classifyCmsCommitSet(listCommits(baseSha, headSha))
    if (classification === 'none' || classification === 'empty') {
      console.log(
        'No direct CMS commit detected. Normal PRs must update translations before merge.',
      )
      return
    }
    if (classification === 'mixed') {
      throw new Error(
        'CMS and non-CMS commits are mixed; create the translation task manually after reviewing the source diff.',
      )
    }
  }

  const title = '[翻訳] Aceserver Portalの日本語正本へ追従'
  const problemStatement = buildTranslationProblemStatement({
    repository,
    headSha,
    changedFiles,
  })
  const marker = `translation-source-sha:${headSha}`

  if (process.env.INPUT_DRY_RUN === 'true') {
    console.log(JSON.stringify({ title, problemStatement }, null, 2))
    return
  }

  if (await hasOpenTranslationPullRequest(owner, repo, marker)) {
    console.log('An open translation PR already covers this source commit.')
    return
  }

  const token = process.env.COPILOT_AGENT_TOKEN?.trim()
  if (!token) throw new Error('COPILOT_AGENT_TOKEN is required')
  const job = await requestJson(
    `${COPILOT_API_BASE}/agents/swe/v1/jobs/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      token,
      method: 'POST',
      headers: {
        'Copilot-Integration-Id': COPILOT_INTEGRATION_ID,
        'X-Github-Api-Version': COPILOT_API_VERSION,
      },
      body: {
        title,
        problem_statement: problemStatement,
        event_type: 'translation-pr',
      },
    },
  )
  console.log(`Started translation task ${job.id ?? job.job_id ?? 'unknown'}.`)
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : ''
if (import.meta.url === entryUrl) {
  await main()
}
