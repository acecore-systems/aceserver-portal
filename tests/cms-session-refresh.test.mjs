import assert from 'node:assert/strict'
import { test } from 'node:test'
import { onRequest } from '../functions/admin/api/refresh-session.ts'

test('ログイン更新は同一origin POSTでこのサイトのCookieだけを破棄する', async () => {
  const response = await onRequest({
    request: new Request('https://asv.acecore.net/admin/api/refresh-session', {
      method: 'POST',
      headers: {
        Origin: 'https://asv.acecore.net',
        'Sec-Fetch-Site': 'same-origin',
      },
    }),
  })
  assert.equal(response.status, 303)
  assert.equal(response.headers.get('Location'), '/admin/')
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(
    response.headers.get('Set-Cookie'),
    'CF_Authorization=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
  )
})

for (const [method, origin, site, hostname] of [
  ['GET', 'https://asv.acecore.net', 'same-origin', 'asv.acecore.net'],
  ['POST', '', 'same-origin', 'asv.acecore.net'],
  ['POST', 'https://evil.example', 'cross-site', 'asv.acecore.net'],
  ['POST', 'https://asv.acecore.net', 'same-site', 'asv.acecore.net'],
  ['POST', 'https://preview.pages.dev', 'same-origin', 'preview.pages.dev'],
]) {
  test(`ログイン更新は不正な操作を拒否する: ${method}/${origin}/${site}`, async () => {
    const response = await onRequest({
      request: new Request(`https://${hostname}/admin/api/refresh-session`, {
        method,
        headers: { Origin: origin, 'Sec-Fetch-Site': site },
      }),
    })
    assert.ok([403, 405].includes(response.status))
    assert.equal(response.headers.get('Set-Cookie'), null)
  })
}
