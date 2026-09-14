import { getGitHubAppToken, GitHubApiError } from './token.ts'

// No public routes, workers.dev or preview URLs. Only Portal's service binding.
export default {
  async fetch(request: Request, env: TokenIssuerEnv): Promise<Response> {
    if (
      request.url !== 'https://cms-token.internal/token' ||
      request.method !== 'POST'
    )
      return new Response(null, { status: 404 })
    try {
      const token = await getGitHubAppToken(env)
      return Response.json(
        { token, repository: 'acecore-systems/aceserver-portal' },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch (error) {
      // Do not expose upstream error bodies or credentials to callers/logs.
      return new Response('CMS保存用トークンを取得できません。', {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'X-CMS-Issuer-Failure':
            error instanceof GitHubApiError
              ? `github-${error.status}`
              : error instanceof Error &&
                  ['TypeError', 'TimeoutError', 'AbortError'].includes(
                    error.name,
                  )
                ? `runtime-${error.name}-${typeof AbortSignal.timeout}`
                : 'runtime',
        },
      })
    }
  },
} satisfies ExportedHandler<TokenIssuerEnv>
