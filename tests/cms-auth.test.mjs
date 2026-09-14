import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { getAcecoreGitHubId } from '../functions/admin/api/_acecore-auth.ts'
import { onRequest as auth } from '../functions/admin/api/auth.ts'
import { onRequest as callback } from '../functions/admin/api/callback.ts'
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
for (const custom of [
  undefined,
  {},
  [],
  {
    'https://acecore.net/claims/subject': 'invalid',
    'https://acecore.net/claims/github-id': '1',
  },
  {
    'https://acecore.net/claims/subject':
      '11111111-1111-4111-8111-111111111111',
    'https://acecore.net/claims/github-id': '0',
  },
]) {
  test(
    'reject malformed or missing linkage: ' + JSON.stringify(custom),
    async () => {
      globalThis.fetch = async (input) =>
        accessCerts(input) || assert.fail('Unexpected network')
      await assert.rejects(
        getAcecoreGitHubId(request(await mintAccess({ custom })), accessEnv),
        { status: 403 },
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
    { status: 403 },
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
