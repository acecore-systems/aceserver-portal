import { CMS_PRODUCTION_HOSTNAME } from './api/_cms-policy.ts'

type PagesContext = {
  request: Request
  next: () => Promise<Response>
}

export const onRequestGet = async ({
  request,
  next,
}: PagesContext): Promise<Response> => {
  if (new URL(request.url).hostname !== CMS_PRODUCTION_HOSTNAME) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  const response = await next()

  if (!response.ok) return response

  const origin = new URL(request.url).origin
  const source = await response.text()
  const config = source
    .replace(/^(\s*api_root:\s*).+$/m, `$1${origin}/admin/api/github`)
    .replace(/^(\s*graphql_api_root:\s*).+$/m, `$1${origin}/admin/api/graphql`)

  return new Response(config, {
    status: response.status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/yaml; charset=utf-8',
    },
  })
}
