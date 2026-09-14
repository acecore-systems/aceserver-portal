import { GitHubApiError, isRecord } from './_github-api.ts'
import { CMS_REPOSITORY } from './_cms-policy.ts'

export type CmsGitHubAppEnv = Partial<
  Pick<Cloudflare.Env, 'CMS_GITHUB_TOKEN_ISSUER'>
>

export async function getGitHubAppToken(
  env: CmsGitHubAppEnv,
  _options: { forceRefresh?: boolean } = {},
) {
  if (!env.CMS_GITHUB_TOKEN_ISSUER)
    throw new GitHubApiError(
      'Portal専用の保存用Service Bindingが未設定です。',
      503,
    )
  let value: unknown
  try {
    const response = await env.CMS_GITHUB_TOKEN_ISSUER.fetch(
      'https://cms-token.internal/token',
      { method: 'POST' },
    )
    if (!response.ok) throw new Error()
    value = await response.json()
  } catch {
    throw new GitHubApiError(
      'Portal専用の保存用トークンを取得できません。',
      503,
    )
  }
  if (
    !isRecord(value) ||
    typeof value.token !== 'string' ||
    // GitHub's stateless installation tokens contain JWT separators and may
    // exceed the legacy length. Treat their contents as opaque credentials.
    !/^ghs_[A-Za-z0-9_.-]{1,4092}$/.test(value.token) ||
    value.repository !== `${CMS_REPOSITORY.owner}/${CMS_REPOSITORY.name}`
  )
    throw new GitHubApiError(
      'Portal専用の保存用トークンの応答が不正です。',
      503,
    )
  return value.token
}
