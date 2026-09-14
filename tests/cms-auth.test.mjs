import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { getAcecoreGitHubId } from '../functions/admin/api/_acecore-auth.ts'
import { onRequest as auth } from '../functions/admin/api/auth.ts'
import { onRequest as callback } from '../functions/admin/api/callback.ts'
import { onRequest as githubProxy } from '../functions/admin/api/github/[[path]].ts'
import {
  accessEnv,
  accessToken,
  accessCerts,
  mintAccess,
} from './cms-access-fixture.mjs'
const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})
const request = (token = accessToken, extra = {}) =>
  new Request(
    'https://' + accessEnv.CMS_ACCESS_HOSTNAMES + '/admin/api/github/user',
    { headers: { 'Cf-Access-Jwt-Assertion': token, ...extra } },
  )
test('valid signed AcecoreID linked immutable GitHub ID', async () => {
  globalThis.fetch = async (input) =>
    accessCerts(input) || assert.fail('Unexpected network')
  assert.equal(await getAcecoreGitHubId(request(), accessEnv), '1')
})
for (const { custom, code } of [
  { custom: undefined, code: 'CMS_AUTH_CUSTOM_CLAIMS_MISSING' },
  { custom: {}, code: 'CMS_AUTH_SUBJECT_INVALID' },
  { custom: [], code: 'CMS_AUTH_CUSTOM_CLAIMS_MISSING' },
  {
    custom: {
      'https://acecore.net/claims/subject': 'invalid',
      'https://acecore.net/claims/github-id': '1',
    },
    code: 'CMS_AUTH_SUBJECT_INVALID',
  },
  {
    custom: {
      'https://acecore.net/claims/subject':
        '11111111-1111-4111-8111-111111111111',
      'https://acecore.net/claims/github-id': '0',
    },
    code: 'CMS_AUTH_GITHUB_ID_INVALID',
  },
]) {
  test(
    'reject malformed or missing linkage: ' + JSON.stringify(custom),
    async () => {
      globalThis.fetch = async (input) =>
        accessCerts(input) || assert.fail('Unexpected network')
      await assert.rejects(
        getAcecoreGitHubId(request(await mintAccess({ custom })), accessEnv),
        { status: 403, code },
      )
    },
  )
}
test('reject service token, wrong audience and forged signature', async () => {
  globalThis.fetch = async (input) =>
    accessCerts(input) || assert.fail('Unexpected network')
  await assert.rejects(
    getAcecoreGitHubId(
      request(await mintAccess({ type: 'service' })),
      accessEnv,
    ),
    { status: 403, code: 'CMS_AUTH_TOKEN_TYPE_INVALID' },
  )
  await assert.rejects(
    getAcecoreGitHubId(request(), {
      ...accessEnv,
      CMS_ACCESS_AUD: 'other-site',
    }),
    { status: 401 },
  )
  const parts = accessToken.split('.')
  parts[2] = (parts[2][0] === 'A' ? 'B' : 'A') + parts[2].slice(1)
  await assert.rejects(
    getAcecoreGitHubId(request(parts.join('.')), accessEnv),
    { status: 401 },
  )
})
test('CMS初期化APIは固定の認証診断codeだけをJSONで返す', async () => {
  globalThis.fetch = async (input) =>
    accessCerts(input) || assert.fail('Unexpected network')
  const response = await githubProxy({
    env: accessEnv,
    request: request(await mintAccess({ custom: undefined })),
  })

  assert.equal(response.status, 403)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.deepEqual(await response.json(), {
    message: 'AcecoreIDの連携GitHubを確認してください。',
    code: 'CMS_AUTH_CUSTOM_CLAIMS_MISSING',
  })
})
test('reject missing configuration and bearer-only path', async () => {
  await assert.rejects(getAcecoreGitHubId(request(), {}), { status: 503 })
  await assert.rejects(
    getAcecoreGitHubId(
      request('', { Authorization: 'Bearer ghu_old-token' }),
      accessEnv,
    ),
    { status: 401 },
  )
})
test('reject cross-origin POST and missing Origin before authentication', async () => {
  for (const origin of ['', 'https://other.acecore.net']) {
    await assert.rejects(
      getAcecoreGitHubId(
        new Request(request(), { method: 'POST', headers: { Origin: origin } }),
        accessEnv,
      ),
      { status: 403 },
    )
  }
})
test('retired OAuth endpoints never exchange codes or return tokens', async () => {
  globalThis.fetch = async () => assert.fail('No OAuth exchange')
  for (const handler of [auth, callback]) {
    const response = await handler({
      request: new Request(request().url + '?code=old'),
    })
    assert.equal(response.status, 410)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
  }
})
test('署名が正しくても期限切れ・issuer違い・必須claim欠落を拒否する', async () => {
  globalThis.fetch = async (input) =>
    accessCerts(input) || assert.fail('Unexpected network')
  for (const overrides of [
    { exp: 0 },
    { exp: undefined },
    { iat: undefined },
    { sub: undefined },
    { iss: 'https://other.cloudflareaccess.com' },
  ])
    await assert.rejects(
      getAcecoreGitHubId(request(await mintAccess(overrides)), accessEnv),
      { status: 401 },
    )
})
