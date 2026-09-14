import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { generateKeyPair, exportPKCS8, jwtVerify } from 'jose'
import issuer from '../cloudflare/cms-token-issuer/worker.ts'
import { getGitHubAppToken } from '../functions/admin/api/_github-token-service.ts'
const { privateKey, publicKey } = await generateKeyPair('RS256', {
  extractable: true,
})
const env = {
  CMS_GITHUB_APP_CLIENT_ID: 'Iv_test_portal',
  CMS_GITHUB_APP_INSTALLATION_ID: '123',
  CMS_GITHUB_APP_PRIVATE_KEY: await exportPKCS8(privateKey),
}
const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})
const request = () =>
  new Request('https://cms-token.internal/token', { method: 'POST' })
const scope = {
  permissions: { contents: 'write', metadata: 'read' },
  repositories: [
    { name: 'aceserver-portal', full_name: 'acecore-systems/aceserver-portal' },
  ],
}
const tokenData = (changes = {}) => ({
  token: 'ghs_test_portal',
  expires_at: new Date(Date.now() + 3600000).toISOString(),
  ...scope,
  ...changes,
})
test('専用issuerはPortalのContents writeだけの短期tokenを発行する', async () => {
  globalThis.fetch = async (url, init) => {
    assert.equal(
      url,
      'https://api.github.com/app/installations/123/access_tokens',
    )
    const bearer = new Headers(init.headers).get('Authorization').slice(7)
    await jwtVerify(bearer, publicKey, { issuer: env.CMS_GITHUB_APP_CLIENT_ID })
    assert.deepEqual(JSON.parse(init.body), {
      repositories: ['aceserver-portal'],
      permissions: { contents: 'write' },
    })
    assert.equal(init.redirect, 'manual')
    assert.equal(init.signal instanceof AbortSignal, true)
    assert.equal(init.signal.aborted, false)
    return Response.json(tokenData())
  }
  const response = await issuer.fetch(request(), env)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(
    (await response.json()).repository,
    'acecore-systems/aceserver-portal',
  )
})
test('issuerはtokenをrequest外にcacheせず毎回GitHubへ発行要求する', async () => {
  let calls = 0
  globalThis.fetch = async () => {
    calls += 1
    return Response.json(tokenData())
  }
  assert.equal((await issuer.fetch(request(), env)).status, 200)
  assert.equal((await issuer.fetch(request(), env)).status, 200)
  assert.equal(calls, 2)
})
for (const change of [
  { repositories: [{ name: 'other', full_name: 'acecore-systems/other' }] },
  { permissions: { contents: 'write', pull_requests: 'write' } },
  { token: 'ghu_personal' },
  { expires_at: new Date(0).toISOString() },
  { expires_at: new Date(Date.now() + 7200000).toISOString() },
])
  test(
    'issuerは過大scope・誤repo・不正期限を拒否: ' + JSON.stringify(change),
    async () => {
      globalThis.fetch = async () => Response.json(tokenData(change))
      const response = await issuer.fetch(request(), env)
      assert.equal(response.status, 503)
      assert.equal((await response.text()).includes('ghs_'), false)
    },
  )
test('issuerは公開URLやGETではtokenを返さず、秘密鍵なしでも拒否する', async () => {
  globalThis.fetch = async () => assert.fail('Must not call GitHub')
  assert.equal(
    (
      await issuer.fetch(
        new Request('https://example.com/token', { method: 'POST' }),
        env,
      )
    ).status,
    404,
  )
  assert.equal(
    (await issuer.fetch(new Request('https://cms-token.internal/token'), env))
      .status,
    404,
  )
  assert.equal(
    (
      await issuer.fetch(request(), {
        ...env,
        CMS_GITHUB_APP_PRIVATE_KEY: undefined,
      })
    ).status,
    503,
  )
})
test('issuerは過大・不正なGitHub応答と上流エラー詳細を公開しない', async () => {
  const oversized = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(64 * 1024 + 1))
      controller.close()
    },
  })
  for (const response of [
    new Response(null, {
      status: 302,
      headers: { Location: 'https://example.invalid/' },
    }),
    new Response(oversized, {
      headers: { 'Content-Type': 'application/json' },
    }),
    new Response('{', { headers: { 'Content-Type': 'application/json' } }),
    Response.json({ message: 'upstream-secret-detail' }, { status: 401 }),
  ]) {
    globalThis.fetch = async () => response
    const result = await issuer.fetch(request(), env)
    assert.equal(result.status, 503)
    assert.equal(
      (await result.text()).includes('upstream-secret-detail'),
      false,
    )
  }
})
test('Pagesは旧形式とJWT形式のinstallation tokenをそのまま受け取る', async () => {
  for (const token of [
    'ghs_opaque_legacy',
    `ghs_4419780_${'a'.repeat(260)}.${'b'.repeat(260)}.signature`,
  ]) {
    assert.equal(
      await getGitHubAppToken({
        CMS_GITHUB_TOKEN_ISSUER: {
          fetch: async () =>
            Response.json({
              token,
              repository: 'acecore-systems/aceserver-portal',
            }),
        },
      }),
      token,
    )
  }
})

test('Pagesはbinding欠落・誤repo・個人token・issuer障害を拒否する', async () => {
  await assert.rejects(getGitHubAppToken({}), { status: 503 })
  for (const value of [
    { token: 'ghs_x', repository: 'other' },
    { token: 'ghu_x', repository: 'acecore-systems/aceserver-portal' },
    {
      token: 'ghs_x\r\nInjected: true',
      repository: 'acecore-systems/aceserver-portal',
    },
    {
      token: `ghs_${'a'.repeat(4093)}`,
      repository: 'acecore-systems/aceserver-portal',
    },
  ])
    await assert.rejects(
      getGitHubAppToken({
        CMS_GITHUB_TOKEN_ISSUER: { fetch: async () => Response.json(value) },
      }),
      { status: 503 },
    )
})
