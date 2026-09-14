import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { getAcecoreGitHubId } from '../functions/admin/api/_acecore-auth.ts'
import { onRequest as auth } from '../functions/admin/api/auth.ts'
import { onRequest as callback } from '../functions/admin/api/callback.ts'
import { onRequest as githubProxy } from '../functions/admin/api/github/[[path]].ts'
import {
  accessIdentity,
  accessEnv,
  accessToken,
  accessCerts,
  accessUserUuid,
  mintAccess,
  subject,
} from './cms-access-fixture.mjs'
const originalFetch = globalThis.fetch
const originalWarn = console.warn
const identityUrl =
  accessEnv.CMS_ACCESS_TEAM_DOMAIN + '/cdn-cgi/access/get-identity'
const subjectClaim = 'https://acecore.net/claims/subject'
const githubIdClaim = 'https://acecore.net/claims/github-id'
beforeEach(() => {
  console.warn = () => {}
})
afterEach(() => {
  globalThis.fetch = originalFetch
  console.warn = originalWarn
})
const request = (token = accessToken, extra = {}) =>
  new Request(
    'https://' + accessEnv.CMS_ACCESS_HOSTNAMES + '/admin/api/github/user',
    { headers: { 'Cf-Access-Jwt-Assertion': token, ...extra } },
  )
const accessFetch =
  (token, respond = () => Response.json(accessIdentity())) =>
  async (input, init = {}) => {
    const certs = accessCerts(input)
    if (certs) return certs

    assert.equal(String(input), identityUrl)
    assert.equal(init.method, 'GET')
    assert.equal(init.redirect, 'manual')
    assert.equal(init.cache, 'no-store')
    assert.equal(init.signal instanceof AbortSignal, true)
    const headers = new Headers(init.headers)
    assert.deepEqual([...headers.keys()].sort(), ['accept', 'cookie'])
    assert.equal(headers.get('Accept'), 'application/json')
    assert.equal(headers.get('Cookie') === `CF_Authorization=${token}`, true)

    return respond(init)
  }
test('valid signed AcecoreID linked immutable GitHub ID', async () => {
  globalThis.fetch = async (input) =>
    accessCerts(input) || assert.fail('Unexpected network')
  assert.equal(await getAcecoreGitHubId(request(), accessEnv), '1')
})
for (const custom of [
  undefined,
  {},
  { 'https://acecore.net/claims/subject': subject },
  { 'https://acecore.net/claims/github-id': '1' },
  {
    oidc_fields: { [subjectClaim]: subject, [githubIdClaim]: '1' },
  },
]) {
  test(
    'custom直下claim欠落時だけ同じAccess sessionのfull identityで補完する: ' +
      JSON.stringify(custom),
    async () => {
      const token = await mintAccess({ custom })
      globalThis.fetch = accessFetch(token)

      assert.equal(await getAcecoreGitHubId(request(token), accessEnv), '1')
    },
  )
}
for (const { custom, code } of [
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
for (const sub of ['', false, 'not-a-uuid']) {
  test(
    'full identity取得前に不正なAccess subを拒否する: ' + String(sub),
    async () => {
      globalThis.fetch = async (input) =>
        accessCerts(input) || assert.fail('Unexpected identity request')

      await assert.rejects(
        getAcecoreGitHubId(request(await mintAccess({ sub })), accessEnv),
        { status: 401, code: 'CMS_AUTH_ACCESS_SUBJECT_INVALID' },
      )
    },
  )
}
for (const { name, identity, code = 'CMS_AUTH_IDENTITY_INVALID' } of [
  {
    name: 'different Access user',
    code: 'CMS_AUTH_IDENTITY_USER_MISMATCH',
    identity: accessIdentity({
      user_uuid: '33333333-3333-4333-8333-333333333333',
    }),
  },
  {
    name: 'different account',
    code: 'CMS_AUTH_IDENTITY_ACCOUNT_MISMATCH',
    identity: accessIdentity({ account_id: 'other-account' }),
  },
  {
    name: 'different IdP',
    code: 'CMS_AUTH_IDENTITY_PROVIDER_MISMATCH',
    identity: accessIdentity({ idp: { id: 'other-idp', type: 'oidc' } }),
  },
  {
    name: 'different IdP type',
    code: 'CMS_AUTH_IDENTITY_PROVIDER_TYPE_MISMATCH',
    identity: accessIdentity({
      idp: {
        id: 'a18ae74a-a342-40db-bfb2-7cc515d26637',
        type: 'github',
      },
    }),
  },
  {
    name: 'missing OIDC fields',
    code: 'CMS_AUTH_IDENTITY_FIELDS_MISSING',
    identity: accessIdentity({ oidc_fields: undefined }),
  },
  {
    name: 'unlinked subject',
    identity: accessIdentity({ oidc_fields: { [githubIdClaim]: '1' } }),
    code: 'CMS_AUTH_SUBJECT_INVALID',
  },
  {
    name: 'unlinked GitHub ID',
    identity: accessIdentity({ oidc_fields: { [subjectClaim]: subject } }),
    code: 'CMS_AUTH_GITHUB_ID_INVALID',
  },
]) {
  test('reject invalid full identity: ' + name, async () => {
    const token = await mintAccess({ custom: undefined })
    globalThis.fetch = accessFetch(token, () => Response.json(identity))

    await assert.rejects(getAcecoreGitHubId(request(token), accessEnv), {
      status: 403,
      code,
    })
  })
}
for (const { name, respond, code } of [
  {
    name: 'redirect',
    respond: () =>
      new Response(null, {
        status: 302,
        headers: { Location: 'https://attacker.example/' },
      }),
    code: 'CMS_AUTH_IDENTITY_UNAVAILABLE',
  },
  {
    name: 'timeout',
    respond: () => {
      throw new DOMException('timed out', 'TimeoutError')
    },
    code: 'CMS_AUTH_IDENTITY_UNAVAILABLE',
  },
  {
    name: 'oversize body',
    respond: () => new Response(new Uint8Array(64 * 1024 + 1)),
    code: 'CMS_AUTH_IDENTITY_INVALID',
  },
  {
    name: 'invalid JSON',
    respond: () => new Response('{'),
    code: 'CMS_AUTH_IDENTITY_INVALID',
  },
]) {
  test('reject unsafe full identity response: ' + name, async () => {
    const token = await mintAccess({ custom: undefined })
    globalThis.fetch = accessFetch(token, respond)

    await assert.rejects(getAcecoreGitHubId(request(token), accessEnv), {
      status: 502,
      code,
    })
  })
}
for (const { custom, identity } of [
  {
    custom: { 'https://acecore.net/claims/subject': subject },
    identity: accessIdentity({
      oidc_fields: {
        [subjectClaim]: '33333333-3333-4333-8333-333333333333',
        [githubIdClaim]: '1',
      },
    }),
  },
  {
    custom: { 'https://acecore.net/claims/github-id': '1' },
    identity: accessIdentity({
      oidc_fields: { [subjectClaim]: subject, [githubIdClaim]: '2' },
    }),
  },
]) {
  test('reject conflict between valid JWT claim and full identity', async () => {
    const token = await mintAccess({ custom })
    globalThis.fetch = accessFetch(token, () => Response.json(identity))

    await assert.rejects(getAcecoreGitHubId(request(token), accessEnv), {
      status: 403,
      code: 'CMS_AUTH_IDENTITY_SOURCE_CONFLICT',
    })
  })
}
test('full identity異常ログは固定codeだけでtokenや本人情報を含まない', async () => {
  const token = await mintAccess({ custom: undefined })
  const logs = []
  console.warn = (value) => logs.push(value)
  globalThis.fetch = accessFetch(token, () =>
    Response.json(
      accessIdentity({
        user_uuid: '33333333-3333-4333-8333-333333333333',
      }),
    ),
  )

  await assert.rejects(getAcecoreGitHubId(request(token), accessEnv), {
    code: 'CMS_AUTH_IDENTITY_USER_MISMATCH',
  })
  assert.deepEqual(logs, [
    JSON.stringify({
      message: 'CMS Access identity rejected',
      code: 'CMS_AUTH_IDENTITY_USER_MISMATCH',
    }),
  ])
  assert.equal(logs[0].includes(token), false)
  assert.equal(logs[0].includes(accessUserUuid), false)
})
test('CMS初期化APIは固定の認証診断codeだけをJSONで返す', async () => {
  const token = await mintAccess({ custom: undefined })
  globalThis.fetch = accessFetch(token, () => new Response('{'))
  const response = await githubProxy({
    env: accessEnv,
    request: request(token),
  })

  assert.equal(response.status, 502)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.deepEqual(await response.json(), {
    message: 'AcecoreIDの連携GitHubを確認してください。',
    code: 'CMS_AUTH_IDENTITY_INVALID',
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
