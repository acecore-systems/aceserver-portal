import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

import { onRequestGet as handleAuth } from '../functions/admin/api/auth.ts'
import { onRequestGet as handleCallback } from '../functions/admin/api/callback.ts'

const originalFetch = globalThis.fetch
const repositoryId = 550360134
const productionOrigin = 'https://asv.acecore.net'
const env = {
  CMS_GITHUB_APP_CLIENT_ID: 'Iv1.aceserver-portal',
  CMS_GITHUB_APP_CLIENT_SECRET: 'client-secret',
  CMS_GITHUB_APP_INSTALLATION_ID: '987654321',
  CMS_OAUTH_STATE_SECRET: 's'.repeat(32),
}
const installationId = Number(env.CMS_GITHUB_APP_INSTALLATION_ID)
const installationsUrl =
  'https://api.github.com/user/installations?per_page=100'
const installationRepositoriesUrl = `https://api.github.com/user/installations/${installationId}/repositories?per_page=100`

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('本番CMSだけがPKCE付きPortal GitHub App認証を開始できる', async () => {
  const response = await startAuthorization()
  const location = new URL(response.headers.get('Location'))
  const cookie = response.headers.get('Set-Cookie')

  assert.equal(response.status, 302)
  assert.equal(location.origin, 'https://github.com')
  assert.equal(location.pathname, '/login/oauth/authorize')
  assert.equal(
    location.searchParams.get('client_id'),
    env.CMS_GITHUB_APP_CLIENT_ID,
  )
  assert.equal(
    location.searchParams.get('redirect_uri'),
    `${productionOrigin}/admin/api/callback`,
  )
  assert.equal(location.searchParams.get('code_challenge_method'), 'S256')
  assert.match(
    location.searchParams.get('code_challenge'),
    /^[A-Za-z0-9_-]{43}$/,
  )
  assert.match(location.searchParams.get('state'), /^[^.]+\.[A-Za-z0-9_-]+$/)
  assert.equal(location.searchParams.has('scope'), false)
  assert.match(cookie, /^aceserver_portal_cms_oauth_state=/)
  assert.match(cookie, /Path=\/admin\/api\/callback/)
  assert.match(cookie, /Max-Age=600/)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /SameSite=Lax/)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
})

test('preview・別site_id・未設定環境では認証を開始しない', async () => {
  const preview = await handleAuth({
    env,
    request: new Request(
      'https://preview.pages.dev/admin/api/auth?provider=github&site_id=preview.pages.dev',
    ),
  })
  const wrongSite = await handleAuth({
    env,
    request: new Request(
      `${productionOrigin}/admin/api/auth?provider=github&site_id=evil.example`,
    ),
  })
  const missingConfig = await handleAuth({
    env: {},
    request: authRequest(),
  })
  const invalidInstallation = await handleAuth({
    env: { ...env, CMS_GITHUB_APP_INSTALLATION_ID: 'not-a-number' },
    request: authRequest(),
  })
  let callbackFetchCalled = false
  globalThis.fetch = async () => {
    callbackFetchCalled = true
    throw new Error('GitHub must not be called')
  }
  const previewCallback = await handleCallback({
    env,
    request: new Request(
      'https://preview.pages.dev/admin/api/callback?code=oauth-code&state=state',
    ),
  })

  assert.equal(preview.status, 400)
  assert.equal(wrongSite.status, 400)
  assert.equal(missingConfig.status, 503)
  assert.equal(invalidInstallation.status, 503)
  assert.equal(previewCallback.status, 400)
  assert.equal(callbackFetchCalled, false)
})

test('callbackはstate・PKCE・installation・repositoryを照合してtokenを返す', async () => {
  const authorization = await startAuthorization()
  const location = new URL(authorization.headers.get('Location'))
  const state = location.searchParams.get('state')
  const cookieHeader = authorization.headers.get('Set-Cookie').split(';')[0]
  const cookieValue = JSON.parse(
    decodeURIComponent(cookieHeader.split('=').slice(1).join('=')),
  )
  const accessToken = 'ghu_test-user-access-token'
  const requests = []

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input)
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : null
    requests.push({ body, init, url })

    if (url === 'https://github.com/login/oauth/access_token') {
      assert.equal(body.client_id, env.CMS_GITHUB_APP_CLIENT_ID)
      assert.equal(body.client_secret, env.CMS_GITHUB_APP_CLIENT_SECRET)
      assert.equal(body.code, 'oauth-code')
      assert.equal(body.code_verifier, cookieValue.codeVerifier)
      assert.equal(body.repository_id, String(repositoryId))
      assert.equal(body.scope, undefined)

      return jsonResponse({
        access_token: accessToken,
        expires_in: 8 * 60 * 60,
        refresh_token: 'ghr_test-refresh-token',
        refresh_token_expires_in: 6 * 30 * 24 * 60 * 60,
        scope: '',
        token_type: 'bearer',
      })
    }

    if (url === installationsUrl) {
      return jsonResponse({
        installations: [
          {
            id: installationId,
            permissions: { contents: 'write', metadata: 'read' },
          },
        ],
        total_count: 1,
      })
    }

    if (url === installationRepositoriesUrl) {
      assert.equal(
        new Headers(init.headers).get('Authorization'),
        `Bearer ${accessToken}`,
      )

      return jsonResponse({
        repositories: [
          {
            full_name: 'acecore-systems/aceserver-portal',
            id: repositoryId,
            permissions: { push: true },
          },
        ],
        total_count: 1,
      })
    }

    throw new Error(`Unexpected request: ${url}`)
  }

  const response = await handleCallback({
    env,
    request: callbackRequest({ cookieHeader, state }),
  })
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.equal(requests.length, 3)
  assert.match(html, /authorization:github:success/)
  assert.match(html, new RegExp(accessToken))
  assert.match(html, /event\.origin !== openerOrigin/)
  assert.match(html, /event\.source !== openerWindow/)
  assert.match(html, /postMessage\(authorizationMessage, openerOrigin\)/)
  assert.doesNotMatch(html, /postMessage\([^)]*,\s*["']\*["']\)/)
  assert.match(
    response.headers.get('Content-Security-Policy'),
    /frame-ancestors 'none'/,
  )
  assert.equal(
    response.headers.get('Cross-Origin-Opener-Policy'),
    'unsafe-none',
  )
  assert.match(
    response.headers.get('Set-Cookie'),
    /aceserver_portal_cms_oauth_state=;/,
  )
})

test('installation一覧の404をcallbackでfail closedにする', async () => {
  const accessToken = 'ghu_installation-list-404'
  const attempt = await callbackAttempt(async (url) => {
    if (url === 'https://github.com/login/oauth/access_token') {
      return jsonResponse(expiringUserToken(accessToken))
    }

    assert.equal(url, installationsUrl)

    return jsonResponse({ message: 'Not Found' }, 404)
  })

  assert.equal(attempt.response.status, 400)
  assert.doesNotMatch(attempt.html, new RegExp(accessToken))
  assert.match(attempt.html, /installationを確認できませんでした/)
})

test('accessible installationが複数あるtokenをcallbackで拒否する', async () => {
  const accessToken = 'ghu_multiple-installations'
  const attempt = await callbackAttempt(async (url) => {
    if (url === 'https://github.com/login/oauth/access_token') {
      return jsonResponse(expiringUserToken(accessToken))
    }

    assert.equal(url, installationsUrl)

    return jsonResponse({
      installations: [
        {
          id: installationId,
          permissions: { contents: 'write', metadata: 'read' },
        },
        {
          id: installationId + 1,
          permissions: { contents: 'write', metadata: 'read' },
        },
      ],
      total_count: 2,
    })
  })

  assert.equal(attempt.response.status, 400)
  assert.doesNotMatch(attempt.html, new RegExp(accessToken))
  assert.match(attempt.html, /編集する権限がありません/)
})

test('設定と異なるinstallation IDをcallbackで拒否する', async () => {
  const accessToken = 'ghu_wrong-installation'
  const attempt = await callbackAttempt(async (url) => {
    if (url === 'https://github.com/login/oauth/access_token') {
      return jsonResponse(expiringUserToken(accessToken))
    }

    assert.equal(url, installationsUrl)

    return jsonResponse({
      installations: [
        {
          id: installationId + 1,
          permissions: { contents: 'write', metadata: 'read' },
        },
      ],
      total_count: 1,
    })
  })

  assert.equal(attempt.response.status, 400)
  assert.doesNotMatch(attempt.html, new RegExp(accessToken))
  assert.match(attempt.html, /編集する権限がありません/)
})

test('stateまたはPKCE cookieの改変をGitHubへの通信前に拒否する', async () => {
  const authorization = await startAuthorization()
  const location = new URL(authorization.headers.get('Location'))
  const state = location.searchParams.get('state')
  const cookieHeader = authorization.headers.get('Set-Cookie').split(';')[0]
  const [cookieName, ...cookieValueParts] = cookieHeader.split('=')
  const cookieValue = JSON.parse(decodeURIComponent(cookieValueParts.join('=')))
  const verifierSuffix = cookieValue.codeVerifier.endsWith('A') ? 'B' : 'A'
  cookieValue.codeVerifier = `${cookieValue.codeVerifier.slice(0, -1)}${verifierSuffix}`
  let called = false

  globalThis.fetch = async () => {
    called = true
    throw new Error('GitHub must not be called')
  }

  const response = await handleCallback({
    env,
    request: callbackRequest({
      cookieHeader: `${cookieName}=${encodeURIComponent(JSON.stringify(cookieValue))}`,
      state,
    }),
  })

  assert.equal(response.status, 400)
  assert.equal(called, false)
  assert.match(await response.text(), /stateを確認できません/)
})

test('OAuth App tokenや対象外repositoryをcallbackから返さない', async () => {
  const oauthAppAttempt = await callbackAttempt(async (url) => {
    assert.equal(url, 'https://github.com/login/oauth/access_token')

    return jsonResponse({
      access_token: 'gho_broad-oauth-token',
      scope: 'repo,user',
      token_type: 'bearer',
    })
  })

  assert.equal(oauthAppAttempt.response.status, 400)
  assert.doesNotMatch(oauthAppAttempt.html, /gho_broad-oauth-token/)

  const broadInstallationAttempt = await callbackAttempt(async (url) => {
    if (url === 'https://github.com/login/oauth/access_token') {
      return jsonResponse({
        access_token: 'ghu_scoped-token',
        expires_in: 3600,
        refresh_token: 'ghr_refresh-token',
        refresh_token_expires_in: 3600 * 24,
        scope: '',
        token_type: 'bearer',
      })
    }

    if (url === installationsUrl) {
      return jsonResponse({
        installations: [
          {
            id: installationId,
            permissions: { contents: 'write', metadata: 'read' },
          },
        ],
        total_count: 1,
      })
    }

    return jsonResponse({
      repositories: [
        {
          full_name: 'acecore-systems/aceserver-portal',
          id: repositoryId,
          permissions: { push: true },
        },
        {
          full_name: 'acecore-systems/another-repository',
          id: repositoryId + 1,
          permissions: { push: true },
        },
      ],
      total_count: 2,
    })
  })

  assert.equal(broadInstallationAttempt.response.status, 400)
  assert.doesNotMatch(broadInstallationAttempt.html, /ghu_scoped-token/)
  assert.match(broadInstallationAttempt.html, /編集する権限がありません/)
})

test('Pull requests writeを含むGitHub App権限をcallbackで拒否する', async () => {
  const attempt = await callbackAttempt(async (url) => {
    if (url === 'https://github.com/login/oauth/access_token') {
      return jsonResponse({
        access_token: 'ghu_overprivileged-token',
        expires_in: 3600,
        refresh_token: 'ghr_refresh-token',
        refresh_token_expires_in: 3600 * 24,
        scope: '',
        token_type: 'bearer',
      })
    }

    assert.equal(url, installationsUrl)

    return jsonResponse({
      installations: [
        {
          id: installationId,
          permissions: {
            contents: 'write',
            metadata: 'read',
            pull_requests: 'write',
          },
        },
      ],
      total_count: 1,
    })
  })

  assert.equal(attempt.response.status, 400)
  assert.doesNotMatch(attempt.html, /ghu_overprivileged-token/)
  assert.match(attempt.html, /Contents write以外のwrite権限/)
})

test('対象repositoryへのpush権限がないApp userをcallbackで拒否する', async () => {
  const attempt = await callbackAttempt(async (url) => {
    if (url === 'https://github.com/login/oauth/access_token') {
      return jsonResponse({
        access_token: 'ghu_read-only-token',
        expires_in: 3600,
        refresh_token: 'ghr_refresh-token',
        refresh_token_expires_in: 3600 * 24,
        scope: '',
        token_type: 'bearer',
      })
    }

    if (url === installationsUrl) {
      return jsonResponse({
        installations: [
          {
            id: installationId,
            permissions: { contents: 'write', metadata: 'read' },
          },
        ],
        total_count: 1,
      })
    }

    assert.equal(url, installationRepositoriesUrl)

    return jsonResponse({
      repositories: [
        {
          full_name: 'acecore-systems/aceserver-portal',
          id: repositoryId,
          permissions: { push: false },
        },
      ],
      total_count: 1,
    })
  })

  assert.equal(attempt.response.status, 400)
  assert.doesNotMatch(attempt.html, /ghu_read-only-token/)
  assert.match(attempt.html, /編集する権限がありません/)
})

async function callbackAttempt(fetchHandler) {
  const authorization = await startAuthorization()
  const location = new URL(authorization.headers.get('Location'))
  const cookieHeader = authorization.headers.get('Set-Cookie').split(';')[0]
  globalThis.fetch = fetchHandler
  const response = await handleCallback({
    env,
    request: callbackRequest({
      cookieHeader,
      state: location.searchParams.get('state'),
    }),
  })

  return { html: await response.text(), response }
}

function authRequest() {
  return new Request(
    `${productionOrigin}/admin/api/auth?provider=github&site_id=asv.acecore.net&scope=repo%2Cuser`,
  )
}

function callbackRequest({ cookieHeader, state }) {
  return new Request(
    `${productionOrigin}/admin/api/callback?code=oauth-code&state=${encodeURIComponent(state)}`,
    { headers: { Cookie: cookieHeader } },
  )
}

function startAuthorization() {
  return handleAuth({ env, request: authRequest() })
}

function expiringUserToken(accessToken) {
  return {
    access_token: accessToken,
    expires_in: 3600,
    refresh_token: 'ghr_refresh-token',
    refresh_token_expires_in: 3600 * 24,
    scope: '',
    token_type: 'bearer',
  }
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
