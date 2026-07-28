import {
  CmsOAuthError,
  buildGitHubAuthorizeUrl,
  buildStateCookie,
  createOAuthState,
  getOAuthConfig,
  type CmsOAuthEnv,
} from './_github-app-oauth.ts'
import { CMS_PRODUCTION_HOSTNAME } from './_cms-policy.ts'

export const onRequestGet: PagesFunction<CmsOAuthEnv> = async ({
  request,
  env,
}) => {
  const url = new URL(request.url)

  if (
    url.hostname !== CMS_PRODUCTION_HOSTNAME ||
    url.searchParams.get('provider') !== 'github' ||
    url.searchParams.get('site_id') !== CMS_PRODUCTION_HOSTNAME
  ) {
    return text('本番CMSからGitHub認証を開始してください。', 400)
  }

  try {
    const { clientId, stateSecret } = getOAuthConfig(env)
    const { codeChallenge, codeVerifier, state } =
      await createOAuthState(stateSecret)

    return new Response(null, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store',
        Location: buildGitHubAuthorizeUrl(clientId, state, codeChallenge),
        'Referrer-Policy': 'no-referrer',
        'Set-Cookie': buildStateCookie(state, codeVerifier),
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch (error) {
    if (error instanceof CmsOAuthError) {
      return text(error.message, error.status)
    }

    console.error(
      JSON.stringify({
        message: 'CMS GitHub App authorization failed',
        error: error instanceof Error ? error.message : String(error),
      }),
    )

    return text('CMS GitHub認証を開始できませんでした。', 500)
  }
}

function text(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
