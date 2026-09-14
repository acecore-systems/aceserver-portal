import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import vm from 'node:vm'

const source = await readFile(
  new URL('../public/admin/init.js', import.meta.url),
  'utf8',
)

async function runAdminInit(response) {
  const appended = []
  const cmsCalls = []
  const document = {
    body: {
      append(...nodes) {
        appended.push(...nodes)
      },
    },
    createElement(tagName) {
      return {
        addEventListener() {},
        append() {},
        remove() {},
        setAttribute() {},
        tagName,
        textContent: '',
      }
    },
  }
  const context = {
    CMS: { init: async (options) => cmsCalls.push(options) },
    btoa: (value) => Buffer.from(value).toString('base64'),
    document,
    fetch: async () => response,
    history: { replaceState() {} },
    location: { pathname: '/admin/', search: '' },
    TextDecoder,
  }

  vm.runInNewContext(source, context)
  await new Promise((resolve) => setImmediate(resolve))

  return { appended, cmsCalls }
}

test('CMS初期化は許可済みの認証診断だけをHTTP status付きで表示する', async () => {
  const { appended, cmsCalls } = await runAdminInit(
    Response.json(
      { code: 'CMS_AUTH_SUBJECT_INVALID', message: 'server detail' },
      { status: 403 },
    ),
  )
  const status = appended.find((node) => node.tagName === 'p')

  assert.equal(
    status.textContent,
    'AcecoreIDの連携情報（利用者ID）を確認してください。（HTTP 403 / CMS_AUTH_SUBJECT_INVALID）',
  )
  assert.equal(status.textContent.includes('server detail'), false)
  assert.deepEqual(cmsCalls, [])
})

test('CMS初期化はリポジトリ編集権限なしを固定codeで表示する', async () => {
  const { appended, cmsCalls } = await runAdminInit(
    Response.json(
      {
        code: 'CMS_AUTH_REPOSITORY_WRITE_DENIED',
        message: 'server detail',
      },
      { status: 403 },
    ),
  )
  const status = appended.find((node) => node.tagName === 'p')

  assert.equal(
    status.textContent,
    '連携GitHubアカウントのCMS編集権限を確認してください。（HTTP 403 / CMS_AUTH_REPOSITORY_WRITE_DENIED）',
  )
  assert.equal(status.textContent.includes('server detail'), false)
  assert.deepEqual(cmsCalls, [])
})

for (const { responseStatus, code, expected } of [
  {
    responseStatus: 401,
    code: 'CMS_AUTH_ACCESS_SUBJECT_INVALID',
    expected: 'AcecoreIDのAccess認証情報を確認してください。',
  },
  {
    responseStatus: 403,
    code: 'CMS_AUTH_IDENTITY_SOURCE_CONFLICT',
    expected: 'AcecoreIDの連携情報が一致していません。',
  },
  {
    responseStatus: 502,
    code: 'CMS_AUTH_IDENTITY_UNAVAILABLE',
    expected:
      'AcecoreIDの本人情報を取得できませんでした。時間をおいて再度お試しください。',
  },
  {
    responseStatus: 502,
    code: 'CMS_AUTH_IDENTITY_INVALID',
    expected: 'AcecoreIDの本人情報の応答を確認できませんでした。',
  },
]) {
  test(`CMS初期化はidentity診断を安全な固定表示にする (${responseStatus}:${code})`, async () => {
    const { appended, cmsCalls } = await runAdminInit(
      Response.json(
        { code, message: 'internal server detail' },
        { status: responseStatus },
      ),
    )
    const status = appended.find((node) => node.tagName === 'p')

    assert.equal(
      status.textContent,
      `${expected}（HTTP ${responseStatus} / ${code}）`,
    )
    assert.equal(status.textContent.includes('internal server detail'), false)
    assert.deepEqual(cmsCalls, [])
  })
}

for (const responseStatus of [403, 502]) {
  test(`CMS初期化は${responseStatus} JSONが4 KiBを超える場合に本文を表示しない`, async () => {
    const { appended, cmsCalls } = await runAdminInit(
      new Response(
        JSON.stringify({
          code: 'CMS_AUTH_IDENTITY_INVALID',
          message: 'internal server detail',
          padding: 'x'.repeat(4096),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: responseStatus,
        },
      ),
    )
    const status = appended.find((node) => node.tagName === 'p')

    assert.equal(
      status.textContent,
      `CMSを開始できませんでした。AcecoreIDのログインと連携GitHubの編集権限を確認してください。（HTTP ${responseStatus}）`,
    )
    assert.equal(
      status.textContent.includes('CMS_AUTH_IDENTITY_INVALID'),
      false,
    )
    assert.deepEqual(cmsCalls, [])
  })
}

for (const response of [
  Response.json(
    { code: 'CMS_AUTH_UNKNOWN', message: 'internal server detail' },
    { status: 403 },
  ),
  Response.json(
    { code: 'CMS_AUTH_SUBJECT_INVALID', message: 'internal server detail' },
    { status: 500 },
  ),
  new Response(
    JSON.stringify({
      code: 'CMS_AUTH_SUBJECT_INVALID',
      message: 'internal server detail',
    }),
    { headers: { 'Content-Type': 'text/plain' }, status: 403 },
  ),
  new Response('not json', { status: 502 }),
]) {
  test(`CMS初期化は未知または内部エラーを共通案内へ制限する (${response.status})`, async () => {
    const { appended, cmsCalls } = await runAdminInit(response)
    const status = appended.find((node) => node.tagName === 'p')

    assert.equal(
      status.textContent,
      `CMSを開始できませんでした。AcecoreIDのログインと連携GitHubの編集権限を確認してください。（HTTP ${response.status}）`,
    )
    assert.equal(status.textContent.includes('internal server detail'), false)
    assert.deepEqual(cmsCalls, [])
  })
}

test('CMS初期化は成功時にCMSを開始する', async () => {
  const { appended, cmsCalls } = await runAdminInit(
    Response.json({ login: 'editor' }),
  )

  assert.equal(
    appended.some((node) => node.tagName === 'p'),
    false,
  )
  assert.equal(cmsCalls.length, 1)
  assert.equal(cmsCalls[0].config.backend.branch, 'main')
})
