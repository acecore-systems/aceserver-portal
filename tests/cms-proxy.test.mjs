import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, test } from 'node:test'

import {
  CMS_PRODUCTION_HOSTNAME,
  CMS_REPOSITORY,
  isAllowedCmsDeletePath,
  isAllowedCmsDirectoryPath,
  isAllowedCmsWritePath,
} from '../functions/admin/api/_cms-policy.ts'
import { validateCmsAddition } from '../functions/admin/api/_content-validation.ts'
import { clearGitHubEditorCacheForTests } from '../functions/admin/api/_github-oauth.ts'
import { onRequestGet as handleCmsConfig } from '../functions/admin/config.yml.ts'
import { onRequestPost as handleGraphql } from '../functions/admin/api/graphql.ts'
import { onRequest as handleGithubRest } from '../functions/admin/api/github/[[path]].ts'

const originalFetch = globalThis.fetch
const mainSha = 'a'.repeat(40)
const topicSha = 'b'.repeat(40)
const oauthToken = 'test-oauth-token'
const repositoryApi = `https://api.github.com/repos/${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`
const contentPath =
  CMS_REPOSITORY.name === 'acecore-net'
    ? 'src/content/blog/example.md'
    : 'src/content/pages/top.json'
const validContentBase64 = (
  await readFile(new URL(`../${contentPath}`, import.meta.url))
).toString('base64')
const validPngBase64 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
  0x4e, 0x44, 0x00, 0x00, 0x00, 0x00,
]).toString('base64')
const rejectedPath =
  CMS_REPOSITORY.name === 'acecore-net'
    ? 'src/i18n/translations/en.json'
    : 'src/content.config.ts'
const collectionWritePaths =
  CMS_REPOSITORY.name === 'acecore-net'
    ? [
        'src/content/blog/example.md',
        'src/content/authors/example.json',
        'src/content/tags/example.json',
        'src/i18n/source/ja/campaigns/example.json',
      ]
    : []
const unlistedContentPath =
  CMS_REPOSITORY.name === 'acecore-net'
    ? 'src/content/blog/en/example.md'
    : 'src/content/pages/unlisted.json'

const editor = {
  avatar_url: 'https://avatars.githubusercontent.com/u/1',
  email: null,
  html_url: 'https://github.com/editor',
  id: 1,
  login: 'editor',
  name: 'Editor',
  type: 'User',
}

afterEach(() => {
  globalThis.fetch = originalFetch
  clearGitHubEditorCacheForTests()
})

test('CMS対象pathだけを許可する', () => {
  assert.equal(isAllowedCmsWritePath(contentPath), true)
  for (const path of collectionWritePaths) {
    assert.equal(isAllowedCmsWritePath(path), true)
  }
  assert.equal(isAllowedCmsWritePath('public/uploads/example.png'), true)
  assert.equal(isAllowedCmsWritePath('public/uploads/example.svg'), false)
  assert.equal(isAllowedCmsWritePath('public/uploads/example.pdf'), false)
  assert.equal(isAllowedCmsDeletePath('public/uploads/example.png'), true)
  assert.equal(isAllowedCmsDeletePath(contentPath), false)
  assert.equal(isAllowedCmsWritePath(rejectedPath), false)
  assert.equal(isAllowedCmsWritePath(unlistedContentPath), false)
  assert.equal(isAllowedCmsWritePath('README.md'), false)
  assert.equal(isAllowedCmsWritePath('../README.md'), false)
  assert.equal(isAllowedCmsWritePath(`${contentPath}\nREADME.md`), false)
})

test('現行mainの全CMS対象ファイルを同期validatorが受理する', async () => {
  const config = await readFile(
    new URL('../public/admin/config.yml', import.meta.url),
    'utf8',
  )
  const contentPaths = Array.from(
    config.matchAll(/^\s*file:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  )
  const uploadRoot = new URL('../public/uploads/', import.meta.url)
  const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
  const uploads = await readdir(uploadRoot, {
    recursive: true,
    withFileTypes: true,
  })

  for (const cmsPath of contentPaths) {
    const bytes = await readFile(new URL(`../${cmsPath}`, import.meta.url))
    const validation = validateCmsAddition(cmsPath, bytes.toString('base64'))

    assert.equal(validation.ok, true, cmsPath)
  }

  for (const entry of uploads) {
    if (!entry.isFile()) continue
    const absolutePath = `${entry.parentPath}/${entry.name}`
    const relativePath = path
      .relative(repositoryRoot, absolutePath)
      .replaceAll('\\', '/')

    if (!isAllowedCmsWritePath(relativePath)) continue

    const bytes = await readFile(absolutePath)
    const validation = validateCmsAddition(
      relativePath,
      bytes.toString('base64'),
    )

    assert.equal(validation.ok, true, relativePath)
  }
})

test('壊れたJSON・SVG・拡張子を偽装した画像を同期validatorが拒否する', () => {
  assert.equal(
    validateCmsAddition(
      contentPath,
      Buffer.from('{"sections":').toString('base64'),
    ).ok,
    false,
  )
  const svg = Buffer.from('<svg onload="alert(1)"/>').toString('base64')

  assert.equal(validateCmsAddition('public/uploads/xss.svg', svg).ok, false)
  assert.equal(validateCmsAddition('public/uploads/xss.png', svg).ok, false)
})

test('optional fieldの省略を許可し、iframe srcはHTTPSに限定する', async () => {
  const embedPath = 'src/content/pages/world-map-main.json'
  const embedValue = JSON.parse(
    await readFile(new URL(`../${embedPath}`, import.meta.url), 'utf8'),
  )

  delete embedValue.hideFooter
  delete embedValue.meta.ogImage
  delete embedValue.sections[0].externalUrl
  delete embedValue.sections[0].fallbackImage

  assert.equal(
    validateCmsAddition(
      embedPath,
      Buffer.from(JSON.stringify(embedValue)).toString('base64'),
    ).ok,
    true,
  )

  for (const dangerousUrl of [
    'http://example.com/map',
    'java&#x09;script:alert(1)',
    'java&#13;script:alert(1)',
    'java&Tab;script:alert(1)',
    'java&NewLine;script:alert(1)',
  ]) {
    embedValue.sections[0].src = dangerousUrl

    assert.equal(
      validateCmsAddition(
        embedPath,
        Buffer.from(JSON.stringify(embedValue)).toString('base64'),
      ).ok,
      false,
      dangerousUrl,
    )
  }
})

test('CMS設定で公開したfolderとfileがproxyの許可範囲に収まる', async () => {
  const config = await readFile(
    new URL('../public/admin/config.yml', import.meta.url),
    'utf8',
  )
  const folders = Array.from(
    config.matchAll(/^\s*folder:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  )
  const files = Array.from(
    config.matchAll(/^\s*file:\s*([^,\s]+),?\s*$/gm),
    (match) => match[1],
  )

  if (CMS_REPOSITORY.name === 'acecore-net') {
    assert.ok(folders.length > 0)
  }
  assert.ok(files.length > 0)

  for (const path of folders) {
    assert.equal(isAllowedCmsDirectoryPath(path), true, path)
  }

  for (const path of files) {
    assert.equal(isAllowedCmsWritePath(path), true, path)
  }
})

test('GitHub OAuth認証がないrequestを拒否する', async () => {
  let called = false
  globalThis.fetch = async () => {
    called = true
    throw new Error('GitHub must not be called')
  }

  const response = await handleGraphql({
    request: graphqlRequest({ authorization: null }),
  })

  assert.equal(response.status, 401)
  assert.equal(called, false)
})

test('previewのCMS APIをGitHubへの通信前に拒否する', async () => {
  let called = false
  globalThis.fetch = async () => {
    called = true
    throw new Error('GitHub must not be called')
  }

  const response = await handleGraphql({
    request: graphqlRequest({
      url: 'https://cms-preview.pages.dev/admin/api/graphql',
    }),
  })

  assert.equal(response.status, 403)
  assert.equal(called, false)
})

test('previewではCMS設定を配信しない', async () => {
  let nextCalled = false
  const response = await handleCmsConfig({
    request: new Request('https://cms-preview.pages.dev/admin/config.yml'),
    next: async () => {
      nextCalled = true
      return new Response('backend:\n  name: github\n')
    },
  })

  assert.equal(response.status, 404)
  assert.equal(nextCalled, false)
})

test('repositoryへのpush権限がないGitHub userを拒否する', async () => {
  mockGitHub(async () => {
    throw new Error('CMS operation must not continue')
  }, false)

  const response = await handleGraphql({
    request: graphqlRequest(),
  })

  assert.equal(response.status, 403)
  assert.match((await response.json()).message, /write権限/)
})

test('保存直前にGitHub userのpush権限を再確認する', async () => {
  let repositoryReads = 0

  mockGitHub(
    async () => {
      throw new Error('CMS mutation must not continue')
    },
    () => {
      repositoryReads += 1
      return repositoryReads === 1
    },
  )

  const response = await handleGraphql({
    request: graphqlRequest(),
  })

  assert.equal(response.status, 403)
  assert.equal(repositoryReads, 2)
  assert.match((await response.json()).message, /write権限/)
})

test('Sveltia CMS 0.172のlast-commit queryを許可する', async () => {
  mockGitHub(async (url, _init, body) => {
    assert.match(url, /\/graphql$/)
    assert.match(body.query, /ref\(qualifiedName: \$branch\)/)

    return jsonResponse({
      data: {
        repository: {
          ref: {
            target: {
              history: { nodes: [{ oid: mainSha, message: 'latest' }] },
            },
          },
        },
      },
    })
  })

  const response = await handleGraphql({
    request: graphqlReadRequest(
      `
        query($owner: String!, $repo: String!, $branch: String!) {
          repository(owner: $owner, name: $repo) {
            ref(qualifiedName: $branch) {
              target {
                ... on Commit {
                  history(first: 1) { nodes { oid message } }
                }
              }
            }
          }
        }
      `,
      {
        owner: CMS_REPOSITORY.owner,
        repo: CMS_REPOSITORY.name,
        branch: 'main',
      },
    ),
  })

  assert.equal(response.status, 200)
})

test('Sveltia CMS 0.172のcontent queryをCMS対象blobだけ許可する', async () => {
  const blobSha = 'b'.repeat(40)

  mockGitHub(async (url, _init, body) => {
    if (url.includes('/git/trees/main?recursive=1')) {
      return jsonResponse({
        sha: mainSha,
        truncated: false,
        tree: [
          {
            mode: '100644',
            path: contentPath,
            sha: blobSha,
            size: 12,
            type: 'blob',
          },
        ],
      })
    }

    assert.match(url, /\/graphql$/)
    assert.match(body.query, /content_0:\s*object/)
    assert.match(body.query, /commit_0:\s*ref/)

    return jsonResponse({ data: { repository: {} } })
  })

  const response = await handleGraphql({
    request: graphqlReadRequest(
      `
        query($owner: String!, $repo: String!, $branch: String!) {
          repository(owner: $owner, name: $repo) {
            content_0: object(oid: "${blobSha}") {
              ... on Blob { text }
            }
            commit_0: ref(qualifiedName: $branch) {
              target {
                ... on Commit {
                  history(first: 1, path: "${contentPath}") {
                    nodes {
                      author {
                        name
                        email
                        user { id: databaseId login }
                      }
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        owner: CMS_REPOSITORY.owner,
        repo: CMS_REPOSITORY.name,
        branch: 'main',
      },
    ),
  })

  assert.equal(response.status, 200)
})

test('画像と本文をexpected HEAD付きの1 commitでmainへ直接保存する', async () => {
  const calls = []

  mockGitHub(async (url, init, body) => {
    calls.push({ url, init, body })

    if (url.endsWith('/git/ref/heads/main')) {
      return jsonResponse({ object: { sha: mainSha } })
    }

    if (url.endsWith('/graphql')) {
      assert.match(body.query, /mutation CmsCommit/)
      assert.equal(
        body.variables.input.branch.repositoryNameWithOwner,
        `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
      )
      assert.equal(body.variables.input.branch.branchName, 'main')
      assert.equal(body.variables.input.expectedHeadOid, mainSha)
      assert.deepEqual(
        body.variables.input.fileChanges.additions.map(({ path }) => path),
        ['public/uploads/example.png', contentPath],
      )
      assert.match(body.variables.input.message.body, /CMS editor: @editor/)
      assert.match(
        body.variables.input.message.body,
        /CMS-Request-ID: [0-9a-f-]+/,
      )

      return jsonResponse({
        data: {
          createCommitOnBranch: {
            commit: {
              oid: topicSha,
              committedDate: '2026-07-20T00:00:00Z',
              file_0: { oid: 'c'.repeat(40) },
              file_1: { oid: 'd'.repeat(40) },
            },
          },
        },
      })
    }

    throw new Error(`Unexpected GitHub request: ${url}`)
  })

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: 'main',
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [
              {
                path: 'public/uploads/example.png',
                contents: validPngBase64,
              },
              {
                path: contentPath,
                contents: validContentBase64,
              },
            ],
            deletions: [],
          },
          message: { headline: 'cms: update example' },
        },
      },
    }),
  })
  const result = await response.json()

  assert.equal(response.status, 200)
  assert.equal(result.data.createCommitOnBranch.commit.oid, topicSha)
  assert.deepEqual(result.extensions.cms, {
    branch: 'main',
    publication: {
      mode: 'direct',
      published: true,
    },
  })
  assert.equal(calls.length, 2)
})

test('commit応答が不明でも固有ID付きmain commitから成功応答へ復旧する', async () => {
  const contentBlobSha = gitBlobOid(validContentBase64)
  let requestId = ''
  let mutationCount = 0

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith('/git/ref/heads/main')) {
      return jsonResponse({ object: { sha: mainSha } })
    }

    if (url.endsWith('/graphql')) {
      mutationCount += 1
      requestId = body.variables.input.message.body
        .split('\n')
        .find((line) => line.startsWith('CMS-Request-ID: '))
        .slice('CMS-Request-ID: '.length)
      throw new Error('Commit response was lost')
    }

    if (url.includes('/commits?sha=main&per_page=20')) {
      return jsonResponse([
        {
          sha: topicSha,
          commit: {
            message: `cms: update ${contentPath}\n\nCMS editor: @editor\nCMS-Request-ID: ${requestId}`,
            committer: { date: '2026-07-20T00:00:00Z' },
          },
          parents: [{ sha: mainSha }],
        },
      ])
    }

    if (url.endsWith(`/commits/${topicSha}?per_page=100`)) {
      return jsonResponse({
        sha: topicSha,
        files: [{ filename: contentPath, status: 'modified' }],
      })
    }

    if (url.includes(`/git/trees/${topicSha}?recursive=1`)) {
      return jsonResponse({
        sha: topicSha,
        truncated: false,
        tree: [
          {
            mode: '100644',
            path: contentPath,
            sha: contentBlobSha,
            type: 'blob',
          },
        ],
      })
    }

    throw new Error(`Unexpected GitHub request: ${url}`)
  })

  const response = await handleGraphql({ request: graphqlRequest() })
  const result = await response.json()

  assert.equal(response.status, 200)
  assert.equal(mutationCount, 1)
  assert.deepEqual(result.data.createCommitOnBranch.commit, {
    oid: topicSha,
    committedDate: '2026-07-20T00:00:00Z',
    file_0: { oid: contentBlobSha },
  })
  assert.equal(result.extensions.cms.publication.published, true)
})

test('markerと親が一致しても変更pathまたはblobが違うcommitを復旧しない', async () => {
  let requestId = ''

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith('/git/ref/heads/main')) {
      return jsonResponse({ object: { sha: mainSha } })
    }

    if (url.endsWith('/graphql')) {
      requestId = body.variables.input.message.body
        .split('\n')
        .find((line) => line.startsWith('CMS-Request-ID: '))
        .slice('CMS-Request-ID: '.length)
      throw new Error('Commit response was lost')
    }

    if (url.includes('/commits?sha=main&per_page=20')) {
      return jsonResponse([
        {
          sha: topicSha,
          commit: {
            message: `cms: update ${contentPath}\n\nCMS-Request-ID: ${requestId}`,
          },
          parents: [{ sha: mainSha }],
        },
      ])
    }

    if (url.endsWith(`/commits/${topicSha}?per_page=100`)) {
      return jsonResponse({
        sha: topicSha,
        files: [{ filename: contentPath, status: 'modified' }],
      })
    }

    if (url.includes(`/git/trees/${topicSha}?recursive=1`)) {
      return jsonResponse({
        sha: topicSha,
        truncated: false,
        tree: [
          {
            mode: '100644',
            path: contentPath,
            sha: 'f'.repeat(40),
            type: 'blob',
          },
        ],
      })
    }

    throw new Error(`Unexpected GitHub request: ${url}`)
  })

  const response = await handleGraphql({ request: graphqlRequest() })

  assert.equal(response.status, 409)
  assert.match((await response.json()).message, /保存内容と一致しない/)
})

test('commit応答不明時にmainが別commitへ進んでいれば再保存を促さない', async () => {
  let requestId = ''
  let mutationCount = 0

  mockGitHub(async (url, _init, body) => {
    if (url.endsWith('/git/ref/heads/main')) {
      return jsonResponse({ object: { sha: mainSha } })
    }

    if (url.endsWith('/graphql')) {
      mutationCount += 1
      requestId = body.variables.input.message.body
      throw new Error('Commit response was lost')
    }

    if (url.includes('/commits?sha=main&per_page=20')) {
      assert.match(requestId, /CMS-Request-ID:/)
      return jsonResponse([
        {
          sha: topicSha,
          commit: {
            message: 'unrelated commit',
            committer: { date: '2026-07-20T00:00:00Z' },
          },
          parents: [{ sha: mainSha }],
        },
      ])
    }

    throw new Error(`Unexpected GitHub request: ${url}`)
  })

  const response = await handleGraphql({ request: graphqlRequest() })
  const result = await response.json()

  assert.equal(response.status, 409)
  assert.equal(mutationCount, 1)
  assert.match(result.message, /保存結果は確認できない/)
})

test('GitHubがcommit失敗を返した場合もmutationを再送しない', async () => {
  let mutationCount = 0
  let historyLookupCount = 0

  mockGitHub(async (url) => {
    if (url.endsWith('/git/ref/heads/main')) {
      return jsonResponse({ object: { sha: mainSha } })
    }

    if (url.endsWith('/graphql')) {
      mutationCount += 1
      return jsonResponse({
        errors: [{ message: 'Expected head oid does not match' }],
      })
    }

    if (url.includes('/commits?sha=main&per_page=20')) {
      historyLookupCount += 1
      return jsonResponse([
        {
          sha: mainSha,
          commit: {
            message: 'existing commit',
            committer: { date: '2026-07-20T00:00:00Z' },
          },
          parents: [{ sha: '0'.repeat(40) }],
        },
      ])
    }

    throw new Error(`Unexpected GitHub request: ${url}`)
  })

  const response = await handleGraphql({ request: graphqlRequest() })
  const result = await response.json()

  assert.equal(response.status, 502)
  assert.equal(mutationCount, 1)
  assert.equal(historyLookupCount, 1)
  assert.match(result.message, /Expected head oid does not match/)
})

test('保存直前にmain HEADが変わっていればcommitを作成しない', async () => {
  let mutationCalled = false

  mockGitHub(async (url) => {
    if (url.endsWith('/git/ref/heads/main')) {
      return jsonResponse({ object: { sha: topicSha } })
    }

    if (url.endsWith('/graphql')) mutationCalled = true

    throw new Error(`Unexpected GitHub request: ${url}`)
  })

  const response = await handleGraphql({ request: graphqlRequest() })
  const result = await response.json()

  assert.equal(response.status, 409)
  assert.equal(mutationCalled, false)
  assert.match(result.message, /mainが更新されています/)
})

test('CMS管理対象外の保存をGitHubへ送らない', async () => {
  let cmsOperationCalled = false

  mockGitHub(async () => {
    cmsOperationCalled = true
    throw new Error('CMS operation must not continue')
  })

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: 'main',
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [
              {
                path: 'README.md',
                contents: Buffer.from('blocked').toString('base64'),
              },
            ],
            deletions: [],
          },
          message: { headline: 'cms: update blocked' },
        },
      },
    }),
  })

  assert.equal(response.status, 403)
  assert.equal(cmsOperationCalled, false)
})

test('必須JSONの削除をGitHubへ送らない', async () => {
  let cmsOperationCalled = false

  mockGitHub(async () => {
    cmsOperationCalled = true
    throw new Error('CMS operation must not continue')
  })

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: 'main',
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [],
            deletions: [{ path: contentPath }],
          },
          message: { headline: 'cms: delete blocked' },
        },
      },
    }),
  })

  assert.equal(response.status, 403)
  assert.equal(cmsOperationCalled, false)
})

test('main以外を指定した保存を拒否する', async () => {
  let cmsOperationCalled = false

  mockGitHub(async () => {
    cmsOperationCalled = true
    throw new Error('CMS operation must not continue')
  })

  const response = await handleGraphql({
    request: graphqlRequest({
      variables: {
        input: {
          branch: {
            repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
            branchName: 'preview',
          },
          expectedHeadOid: mainSha,
          fileChanges: {
            additions: [
              {
                path: contentPath,
                contents: Buffer.from('blocked').toString('base64'),
              },
            ],
            deletions: [],
          },
          message: { headline: 'cms: update blocked' },
        },
      },
    }),
  })

  assert.equal(response.status, 403)
  assert.equal(cmsOperationCalled, false)
})

test('Git tree responseからCMS対象外pathを除外する', async () => {
  mockGitHub(async (url) => {
    assert.match(url, /\/git\/trees\/main\?recursive=1$/)

    return jsonResponse({
      sha: mainSha,
      truncated: false,
      tree: [
        { mode: '040000', path: 'src', sha: '1'.repeat(40), type: 'tree' },
        {
          mode: '100644',
          path: contentPath,
          sha: '2'.repeat(40),
          size: 12,
          type: 'blob',
        },
        {
          mode: '100644',
          path: 'README.md',
          sha: '3'.repeat(40),
          size: 12,
          type: 'blob',
        },
      ],
    })
  })

  const response = await handleGithubRest({
    request: new Request(
      `https://${CMS_PRODUCTION_HOSTNAME}/admin/api/github/api/v3/repos/${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}/git/trees/main?recursive=1`,
      { headers: authorizationHeaders() },
    ),
  })
  const result = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(
    result.tree.filter(({ type }) => type === 'blob').map(({ path }) => path),
    [contentPath],
  )
})

test('REST writeを認証前に拒否する', async () => {
  let called = false
  globalThis.fetch = async () => {
    called = true
    throw new Error('GitHub must not be called')
  }

  const response = await handleGithubRest({
    request: new Request(
      `https://${CMS_PRODUCTION_HOSTNAME}/admin/api/github/user`,
      {
        method: 'POST',
        headers: authorizationHeaders(),
      },
    ),
  })

  assert.equal(response.status, 405)
  assert.equal(called, false)
})

function mockGitHub(handler, push = true) {
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input)
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : null

    if (url === 'https://api.github.com/user') {
      assert.equal(
        new Headers(init.headers).get('Authorization'),
        `Bearer ${oauthToken}`,
      )
      return jsonResponse(editor)
    }

    if (url === repositoryApi) {
      return jsonResponse({
        permissions: { push: typeof push === 'function' ? push() : push },
      })
    }

    return handler(url, init, body)
  }
}

function graphqlRequest({
  authorization = `Bearer ${oauthToken}`,
  url = `https://${CMS_PRODUCTION_HOSTNAME}/admin/api/graphql`,
  variables = {
    input: {
      branch: {
        repositoryNameWithOwner: `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`,
        branchName: 'main',
      },
      expectedHeadOid: mainSha,
      fileChanges: {
        additions: [
          {
            path: contentPath,
            contents: validContentBase64,
          },
        ],
        deletions: [],
      },
      message: { headline: 'cms: update example' },
    },
  },
} = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json' })

  if (authorization) headers.set('Authorization', authorization)

  return new Request(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
        mutation($input: CreateCommitOnBranchInput!) {
          createCommitOnBranch(input: $input) {
            commit { oid committedDate }
          }
        }
      `,
      variables,
    }),
  })
}

function authorizationHeaders() {
  return { Authorization: `Bearer ${oauthToken}` }
}

function graphqlReadRequest(query, variables) {
  return new Request(`https://${CMS_PRODUCTION_HOSTNAME}/admin/api/graphql`, {
    method: 'POST',
    headers: {
      ...authorizationHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function gitBlobOid(contents) {
  const bytes = Buffer.from(contents, 'base64')

  return createHash('sha1')
    .update(`blob ${bytes.byteLength}\0`)
    .update(bytes)
    .digest('hex')
}
