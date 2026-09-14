import { CMS_PRODUCTION_HOSTNAME } from './_cms-policy.ts'

// Discard only this site's local Access session. Do not revoke the user's
// organization session or affect another site's authentication cookies.
export const onRequest: PagesFunction = async ({ request }) => {
  const origin = `https://${CMS_PRODUCTION_HOSTNAME}`
  if (request.method !== 'POST')
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  if (
    new URL(request.url).origin !== origin ||
    request.headers.get('Origin') !== origin ||
    ['cross-site', 'same-site'].includes(
      request.headers.get('Sec-Fetch-Site') || '',
    )
  )
    return new Response(null, { status: 403 })
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/admin/',
      'Cache-Control': 'no-store',
      'Set-Cookie':
        'CF_Authorization=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    },
  })
}
