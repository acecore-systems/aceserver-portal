import { SignJWT, exportJWK, generateKeyPair } from 'jose'
import { CMS_PRODUCTION_HOSTNAME } from '../functions/admin/api/_cms-policy.ts'
const { privateKey, publicKey } = await generateKeyPair('RS256')
const jwk = {
  ...(await exportJWK(publicKey)),
  kid: 'cms-access',
  alg: 'RS256',
  use: 'sig',
}
export const accessEnv = {
  CMS_ACCESS_AUD: 'cms-test',
  CMS_ACCESS_TEAM_DOMAIN: 'https://cms-test.cloudflareaccess.com',
  CMS_ACCESS_HOSTNAMES: CMS_PRODUCTION_HOSTNAME,
}
export const subject = '11111111-1111-4111-8111-111111111111'
export async function mintAccess(overrides = {}) {
  return new SignJWT({
    sub: 'access-user',
    iss: accessEnv.CMS_ACCESS_TEAM_DOMAIN,
    aud: accessEnv.CMS_ACCESS_AUD,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    type: 'app',
    custom: {
      'https://acecore.net/claims/subject': subject,
      'https://acecore.net/claims/github-id': '1',
    },
    ...overrides,
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'cms-access' })
    .sign(privateKey)
}
export const accessToken = await mintAccess()
export function accessCerts(input) {
  if (
    String(input) ===
    accessEnv.CMS_ACCESS_TEAM_DOMAIN + '/cdn-cgi/access/certs'
  )
    return Response.json({ keys: [jwk] })
}
