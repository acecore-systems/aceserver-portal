import { CMS_PRODUCTION_HOSTNAME, CMS_REPOSITORY } from './_cms-policy.ts'

const GITHUB_API_VERSION = '2022-11-28'
const GITHUB_REPOSITORY = `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`
const GITHUB_REPOSITORY_ID = 550360134
const OAUTH_OPENER_ORIGIN = `https://${CMS_PRODUCTION_HOSTNAME}`
const OAUTH_CALLBACK_URL = `${OAUTH_OPENER_ORIGIN}/admin/api/callback`
const STATE_COOKIE = 'aceserver_portal_cms_oauth_state'
const STATE_TTL_SECONDS = 10 * 60

export type CmsOAuthEnv = {
  CMS_GITHUB_APP_CLIENT_ID?: string
  CMS_GITHUB_APP_CLIENT_SECRET?: string
  CMS_GITHUB_APP_INSTALLATION_ID?: string
  CMS_OAUTH_STATE_SECRET?: string
}

type OAuthStatePayload = {
  codeChallenge: string
  expiresAt: number
  issuedAt: number
  nonce: string
  openerOrigin: string
}

type OAuthStateCookie = {
  codeVerifier: string
  state: string
}

type GitHubTokenResponse = {
  access_token?: unknown
  error?: unknown
  error_description?: unknown
  expires_in?: unknown
  refresh_token?: unknown
  refresh_token_expires_in?: unknown
  scope?: unknown
  token_type?: unknown
}

export class CmsOAuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getOAuthConfig(env: CmsOAuthEnv) {
  const clientId = env.CMS_GITHUB_APP_CLIENT_ID?.trim()
  const clientSecret = env.CMS_GITHUB_APP_CLIENT_SECRET?.trim()
  const stateSecret = env.CMS_OAUTH_STATE_SECRET?.trim()

  if (!clientId || !clientSecret || !stateSecret) {
    throw new CmsOAuthError(
      'CMS GitHub App設定がCloudflare Pagesにありません。',
      503,
    )
  }

  if (new TextEncoder().encode(stateSecret).byteLength < 32) {
    throw new CmsOAuthError(
      'CMS OAuth state secretは32バイト以上にしてください。',
      503,
    )
  }

  const installationId = getGitHubInstallationId(env)

  return { clientId, clientSecret, installationId, stateSecret }
}

export function getGitHubInstallationId(
  env: Pick<CmsOAuthEnv, 'CMS_GITHUB_APP_INSTALLATION_ID'>,
) {
  const installationIdValue = env.CMS_GITHUB_APP_INSTALLATION_ID?.trim()

  if (!installationIdValue) {
    throw new CmsOAuthError(
      'CMS GitHub App設定がCloudflare Pagesにありません。',
      503,
    )
  }

  if (!/^[1-9]\d*$/.test(installationIdValue)) {
    throw new CmsOAuthError('CMS GitHub App installation IDが不正です。', 503)
  }

  const installationId = Number(installationIdValue)

  if (!Number.isSafeInteger(installationId)) {
    throw new CmsOAuthError('CMS GitHub App installation IDが不正です。', 503)
  }

  return installationId
}

export async function createOAuthState(secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const codeVerifier = randomBase64Url(32)
  const codeChallenge = await createCodeChallenge(codeVerifier)
  const payload: OAuthStatePayload = {
    codeChallenge,
    expiresAt: issuedAt + STATE_TTL_SECONDS,
    issuedAt,
    nonce: randomBase64Url(32),
    openerOrigin: OAUTH_OPENER_ORIGIN,
  }
  const encodedPayload = encodeBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  )
  const signature = await signState(encodedPayload, secret)
  const state = `${encodedPayload}.${signature}`

  return { codeChallenge, codeVerifier, state }
}

export async function verifyOAuthState({
  cookieHeader,
  secret,
  state,
}: {
  cookieHeader: string | null
  secret: string
  state: string
}) {
  const cookie = parseStateCookie(getCookie(cookieHeader, STATE_COOKIE))

  if (!cookie || cookie.state !== state) return null

  const parts = state.split('.')

  if (parts.length !== 2) return null

  const [encodedPayload, signature] = parts
  const key = await importStateKey(secret)
  const verified = await crypto.subtle.verify(
    'HMAC',
    key,
    decodeBase64Url(signature),
    new TextEncoder().encode(encodedPayload),
  )

  if (!verified) return null

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload)),
    ) as Partial<OAuthStatePayload>
    const now = Math.floor(Date.now() / 1000)
    const codeChallenge = await createCodeChallenge(cookie.codeVerifier)

    const validState =
      payload.openerOrigin === OAUTH_OPENER_ORIGIN &&
      payload.codeChallenge === codeChallenge &&
      typeof payload.expiresAt === 'number' &&
      payload.expiresAt >= now &&
      payload.expiresAt <= now + STATE_TTL_SECONDS &&
      typeof payload.issuedAt === 'number' &&
      payload.issuedAt <= now + 60 &&
      payload.issuedAt >= now - STATE_TTL_SECONDS &&
      payload.expiresAt - payload.issuedAt === STATE_TTL_SECONDS &&
      typeof payload.nonce === 'string' &&
      payload.nonce.length >= 32

    return validState ? cookie.codeVerifier : null
  } catch {
    return null
  }
}

export function buildStateCookie(state: string, codeVerifier: string) {
  const value = JSON.stringify({
    codeVerifier,
    state,
  } satisfies OAuthStateCookie)

  return [
    `${STATE_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/admin/api/callback',
    `Max-Age=${STATE_TTL_SECONDS}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ')
}

export function clearStateCookie() {
  return [
    `${STATE_COOKIE}=`,
    'Path=/admin/api/callback',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ')
}

export function buildGitHubAuthorizeUrl(
  clientId: string,
  state: string,
  codeChallenge: string,
) {
  const url = new URL('https://github.com/login/oauth/authorize')

  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', OAUTH_CALLBACK_URL)
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('allow_signup', 'false')

  return url.href
}

export async function exchangeGitHubCode({
  clientId,
  clientSecret,
  code,
  codeVerifier,
  installationId,
}: {
  clientId: string
  clientSecret: string
  code: string
  codeVerifier: string
  installationId: number
}) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'aceserver-portal-sveltia-cms',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      redirect_uri: OAUTH_CALLBACK_URL,
      repository_id: String(GITHUB_REPOSITORY_ID),
    }),
  })
  const data = (await response
    .json()
    .catch(() => null)) as GitHubTokenResponse | null

  if (!response.ok || !isExpiringGitHubAppToken(data)) {
    const message =
      data && typeof data.error_description === 'string'
        ? data.error_description
        : 'GitHub App user tokenを取得できませんでした。'

    throw new CmsOAuthError(message, response.ok ? 502 : response.status)
  }

  await verifyRepositoryWriteAccess(data.access_token, installationId)

  return data.access_token
}

export function callbackHtmlResponse({
  message,
  status,
  token,
}: {
  message?: string
  status: 'success' | 'error'
  token?: string
}) {
  const nonce = randomBase64Url(18)
  const payload =
    status === 'success'
      ? { provider: 'github', token: token || '' }
      : {
          error: message || 'GitHub認証に失敗しました。',
          errorCode: 'AUTHORIZATION_FAILED',
          provider: 'github',
        }
  const authorizationMessage = `authorization:github:${status}:${JSON.stringify(payload)}`
  const title =
    status === 'success' ? '認証が完了しました' : '認証に失敗しました'
  const body =
    status === 'success'
      ? 'CMSへ戻ります。'
      : message || 'GitHub認証に失敗しました。'
  const probe = 'authorizing:github'
  const script = `
    const openerOrigin = ${serializeForInlineScript(OAUTH_OPENER_ORIGIN)};
    const probe = ${serializeForInlineScript(probe)};
    const authorizationMessage = ${serializeForInlineScript(authorizationMessage)};
    const openerWindow = window.opener;

    const sendAuthorization = (event) => {
      if (
        !openerWindow ||
        event.data !== probe ||
        event.origin !== openerOrigin ||
        event.source !== openerWindow
      ) {
        return;
      }

      openerWindow.postMessage(authorizationMessage, openerOrigin);
      window.removeEventListener("message", sendAuthorization);
    };

    window.addEventListener("message", sendAuthorization);

    if (openerWindow) {
      openerWindow.postMessage(probe, openerOrigin);
    }
  `

  // `/admin/` 側の `same-origin-allow-popups` が OAuth popup を保持する。
  // callback も同じ値にすると GitHub から戻る navigation で opener が切れ、
  // Sveltia CMS が popup.closed と判定するため、callback は明示的に分離しない。
  return new Response(
    `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <p>${escapeHtml(body)}</p>
    <script nonce="${nonce}">${script}</script>
  </body>
</html>`,
    {
      status: status === 'success' ? 200 : 400,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Security-Policy': [
          "default-src 'none'",
          `script-src 'nonce-${nonce}'`,
          "base-uri 'none'",
          "frame-ancestors 'none'",
          "form-action 'none'",
        ].join('; '),
        'Content-Type': 'text/html; charset=utf-8',
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Referrer-Policy': 'no-referrer',
        'Set-Cookie': clearStateCookie(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  )
}

function isExpiringGitHubAppToken(
  data: GitHubTokenResponse | null,
): data is GitHubTokenResponse & { access_token: string } {
  return (
    !!data &&
    typeof data.access_token === 'string' &&
    data.access_token.startsWith('ghu_') &&
    data.token_type === 'bearer' &&
    data.scope === '' &&
    typeof data.expires_in === 'number' &&
    Number.isInteger(data.expires_in) &&
    data.expires_in > 0 &&
    data.expires_in <= 8 * 60 * 60 &&
    typeof data.refresh_token === 'string' &&
    data.refresh_token.startsWith('ghr_') &&
    typeof data.refresh_token_expires_in === 'number' &&
    Number.isInteger(data.refresh_token_expires_in) &&
    data.refresh_token_expires_in > data.expires_in
  )
}

export async function verifyRepositoryWriteAccess(
  token: string,
  installationId: number,
) {
  const installationResponse = await fetch(
    'https://api.github.com/user/installations?per_page=100',
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'aceserver-portal-sveltia-cms',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    },
  )
  const installationData = (await installationResponse
    .json()
    .catch(() => null)) as {
    installations?: {
      id?: unknown
      permissions?: Record<string, unknown>
    }[]
    total_count?: unknown
  } | null
  const installations = Array.isArray(installationData?.installations)
    ? installationData.installations
    : []
  const installation =
    installationData?.total_count === 1 &&
    installations.length === 1 &&
    installations[0]?.id === installationId
      ? installations[0]
      : null

  if (!installationResponse.ok) {
    throw new CmsOAuthError(
      'GitHub App installationを確認できませんでした。',
      502,
    )
  }

  if (!installation) {
    throw new CmsOAuthError(
      'このGitHubアカウントにはエースサーバーポータルを編集する権限がありません。',
      403,
    )
  }

  const permissions =
    installation?.permissions &&
    typeof installation.permissions === 'object' &&
    !Array.isArray(installation.permissions)
      ? installation.permissions
      : null
  const unexpectedWritePermission = permissions
    ? Object.entries(permissions).some(
        ([name, level]) => name !== 'contents' && level === 'write',
      )
    : true

  if (permissions?.contents !== 'write' || unexpectedWritePermission) {
    throw new CmsOAuthError(
      'CMS GitHub AppはContents write以外のwrite権限を持たない設定にしてください。',
      503,
    )
  }

  const response = await fetch(
    `https://api.github.com/user/installations/${installationId}/repositories?per_page=100`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'aceserver-portal-sveltia-cms',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    },
  )
  const data = (await response.json().catch(() => null)) as {
    repositories?: {
      full_name?: unknown
      id?: unknown
      permissions?: { push?: unknown }
    }[]
    total_count?: unknown
  } | null
  const repositories = Array.isArray(data?.repositories)
    ? data.repositories
    : []
  const repository = repositories.find(
    ({ full_name, id }) =>
      id === GITHUB_REPOSITORY_ID && full_name === GITHUB_REPOSITORY,
  )

  if (
    !response.ok ||
    data?.total_count !== 1 ||
    repositories.length !== 1 ||
    repository?.permissions?.push !== true
  ) {
    throw new CmsOAuthError(
      'このGitHubアカウントにはエースサーバーポータルを編集する権限がありません。',
      403,
    )
  }
}

function getCookie(header: string | null, name: string) {
  if (!header) return null

  for (const item of header.split(';')) {
    const [rawName, ...valueParts] = item.trim().split('=')

    if (rawName === name) {
      return decodeURIComponent(valueParts.join('='))
    }
  }

  return null
}

function parseStateCookie(value: string | null): OAuthStateCookie | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<OAuthStateCookie>

    if (
      typeof parsed.state !== 'string' ||
      typeof parsed.codeVerifier !== 'string' ||
      !/^[A-Za-z0-9_-]{43,128}$/.test(parsed.codeVerifier)
    ) {
      return null
    }

    return {
      codeVerifier: parsed.codeVerifier,
      state: parsed.state,
    }
  } catch {
    return null
  }
}

async function signState(payload: string, secret: string) {
  const key = await importStateKey(secret)
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  )

  return encodeBase64Url(new Uint8Array(signature))
}

function importStateKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function randomBase64Url(length: number) {
  const bytes = new Uint8Array(length)

  crypto.getRandomValues(bytes)
  return encodeBase64Url(bytes)
}

async function createCodeChallenge(codeVerifier: string) {
  return encodeBase64Url(
    new Uint8Array(
      await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier),
      ),
    ),
  )
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) binary += String.fromCharCode(byte)

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(`${normalized}${padding}`)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function serializeForInlineScript(value: string) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]!
  })
}
