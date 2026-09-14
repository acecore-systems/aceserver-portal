// Legacy GitHub OAuth endpoints are deliberately retired, including callback codes.
export const onRequest: PagesFunction = async () =>
  new Response(
    'GitHubでの直接ログインは終了しました。本番の /admin/ からAcecoreIDでログインしてください。',
    {
      status: 410,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  )
export const onRequestGet = onRequest
