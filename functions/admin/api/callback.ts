import {
  CmsOAuthError,
  callbackHtmlResponse,
  exchangeGitHubCode,
  getOAuthConfig,
  verifyOAuthState,
  type CmsOAuthEnv,
} from './_github-app-oauth.ts'
import { CMS_PRODUCTION_HOSTNAME } from './_cms-policy.ts'

export const onRequestGet: PagesFunction<CmsOAuthEnv> = async ({
  request,
  env,
}) => {
  const url = new URL(request.url)

  if (url.hostname !== CMS_PRODUCTION_HOSTNAME) {
    return new Response('本番CMSのcallbackを使用してください。', {
      status: 400,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  const code = url.searchParams.get('code') || ''
  const state = url.searchParams.get('state') || ''

  if (!code || !state || url.searchParams.has('error')) {
    return callbackHtmlResponse({
      message: 'GitHub App callbackが不正です。',
      status: 'error',
    })
  }

  try {
    const { clientId, clientSecret, installationId, stateSecret } =
      getOAuthConfig(env)
    const codeVerifier = await verifyOAuthState({
      cookieHeader: request.headers.get('Cookie'),
      secret: stateSecret,
      state,
    })

    if (!codeVerifier) {
      return callbackHtmlResponse({
        message: 'GitHub OAuth stateを確認できません。',
        status: 'error',
      })
    }

    const token = await exchangeGitHubCode({
      clientId,
      clientSecret,
      code,
      codeVerifier,
      installationId,
    })

    return callbackHtmlResponse({ status: 'success', token })
  } catch (error) {
    if (error instanceof CmsOAuthError) {
      return callbackHtmlResponse({
        message: error.message,
        status: 'error',
      })
    }

    console.error(
      JSON.stringify({
        message: 'CMS GitHub App callback failed',
        error: error instanceof Error ? error.message : String(error),
      }),
    )

    return callbackHtmlResponse({
      message: 'CMS GitHub認証に失敗しました。',
      status: 'error',
    })
  }
}
