void initialize().catch((error) => {
  const status = document.createElement('p')
  status.textContent =
    error instanceof Error
      ? error.message
      : 'AcecoreIDのログインを確認してください。'
  document.body.append(status)
})
async function initialize() {
  const response = await fetch('/admin/api/github/user', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok)
    throw new Error(
      'AcecoreIDへのログインと連携GitHubの編集権限を確認してください。',
    )
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
