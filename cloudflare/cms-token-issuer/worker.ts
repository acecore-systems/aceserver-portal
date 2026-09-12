import { getGitHubAppToken } from './token.ts'

// No public routes, workers.dev or preview URLs. Only Portal's service binding.
export default {
  async fetch(request: Request, env: TokenIssuerEnv): Promise<Response> {
    if (
      request.url !== 'https://cms-token.internal/token' ||
      request.method !== 'POST'
    )
      return new Response(null, { status: 404 })
    try {
      const token = await getGitHubAppToken(env, { forceRefresh: true })
      return Response.json(
        { token, repository: 'acecore-systems/aceserver-portal' },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    } catch {
      // Do not expose upstream error bodies or credentials to callers/logs.
      return new Response('CMS保存用トークンを取得できません。', {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      })
    }
  },
} satisfies ExportedHandler<TokenIssuerEnv>
