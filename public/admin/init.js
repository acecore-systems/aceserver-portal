void initialize().catch((error) => {
  const status = document.createElement('p')
  status.textContent =
    error instanceof Error
      ? error.message
      : 'AcecoreIDのログインを確認してください。'
  document.body.append(status)
})

const INITIALIZE_FALLBACK_MESSAGE =
  'CMSを開始できませんでした。AcecoreIDのログインと連携GitHubの編集権限を確認してください。'
const MAX_INITIALIZATION_ERROR_BYTES = 4 * 1024
const READABLE_INITIALIZATION_ERROR_STATUSES = new Set([401, 403, 502])
const INITIALIZE_ERROR_MESSAGES = new Map([
  [
    '401:CMS_AUTH_ACCESS_SUBJECT_INVALID',
    'AcecoreIDのAccess認証情報を確認してください。',
  ],
  [
    '403:CMS_AUTH_CUSTOM_CLAIMS_MISSING',
    'AcecoreIDの連携情報を確認してください。',
  ],
  [
    '403:CMS_AUTH_TOKEN_TYPE_INVALID',
    'AcecoreIDの認証情報を確認してください。',
  ],
  [
    '403:CMS_AUTH_SUBJECT_INVALID',
    'AcecoreIDの連携情報（利用者ID）を確認してください。',
  ],
  [
    '403:CMS_AUTH_GITHUB_ID_INVALID',
    'AcecoreIDの連携GitHubを確認してください。',
  ],
  [
    '403:CMS_AUTH_REPOSITORY_WRITE_DENIED',
    '連携GitHubアカウントのCMS編集権限を確認してください。',
  ],
  [
    '403:CMS_AUTH_IDENTITY_INVALID',
    'AcecoreIDの本人情報とログイン先を確認してください。',
  ],
  [
    '403:CMS_AUTH_IDENTITY_SOURCE_CONFLICT',
    'AcecoreIDの連携情報が一致していません。',
  ],
  [
    '502:CMS_AUTH_IDENTITY_UNAVAILABLE',
    'AcecoreIDの本人情報を取得できませんでした。時間をおいて再度お試しください。',
  ],
  [
    '502:CMS_AUTH_IDENTITY_INVALID',
    'AcecoreIDの本人情報の応答を確認できませんでした。',
  ],
])

async function initialize() {
  const response = await fetch('/admin/api/github/user', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw await getInitializationError(response)
  // UI marker only; the server never trusts this as a credential.
  const signin = btoa(
    JSON.stringify({ token: 'acecore-id-access', prefs: { language: 'ja' } }),
  )
  history.replaceState(
    null,
    '',
    `${location.pathname}${location.search}#/signin/${signin}`,
  )
  await CMS.init({ config: { backend: { branch: 'main' } } })
}

async function getInitializationError(response) {
  const body = await readInitializationErrorBody(response)
  const code =
    body && typeof body === 'object' && typeof body.code === 'string'
      ? body.code
      : ''
  const message =
    INITIALIZE_ERROR_MESSAGES.get(`${response.status}:${code}`) ||
    INITIALIZE_FALLBACK_MESSAGE

  const diagnostic =
    code && message !== INITIALIZE_FALLBACK_MESSAGE ? ` / ${code}` : ''

  return new Error(`${message}（HTTP ${response.status}${diagnostic}）`)
}

async function readInitializationErrorBody(response) {
  if (
    !READABLE_INITIALIZATION_ERROR_STATUSES.has(response.status) ||
    !/^application\/json(?:;|$)/i.test(
      response.headers.get('Content-Type')?.trim() || '',
    )
  )
    return null

  const reader = response.body?.getReader()
  if (!reader) return null

  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      bytes += value.byteLength
      if (bytes > MAX_INITIALIZATION_ERROR_BYTES) {
        await reader.cancel()
        return null
      }

      text += decoder.decode(value, { stream: true })
    }

    return JSON.parse(text + decoder.decode())
  } catch {
    return null
  } finally {
    reader.releaseLock()
  }
}

const notice = document.createElement('aside')
const noticeTitle = document.createElement('strong')
const noticeBody = document.createElement('span')
const noticeClose = document.createElement('button')

notice.className = 'cms-publish-notice'
notice.setAttribute('aria-label', 'CMSの公開方法')
noticeTitle.textContent = '保存すると自動で公開されます'
noticeBody.textContent =
  '通常は数分でサイトに反映されます。画像の削除は参照確認を伴うPull Requestで行います。'
noticeClose.className = 'cms-publish-notice__close'
noticeClose.type = 'button'
noticeClose.setAttribute('aria-label', '公開方法の案内を閉じる')
noticeClose.textContent = '×'
noticeClose.addEventListener('click', () => notice.remove())
notice.append(noticeTitle, noticeBody, noticeClose)
document.body.append(notice)
