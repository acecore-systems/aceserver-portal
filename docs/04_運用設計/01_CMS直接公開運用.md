# CMS直接公開運用

最終確認日: 2026-07-29

## 現在の構成

- GitHub repository: `acecore-systems/aceserver-portal`
- CMS: Sveltia CMS
- 認証: Portal専用GitHub Appのsame-origin OAuth（PKCE S256）
- publication branch: `main`
- 認証API: 同一originの `/admin/api/auth` と `/admin/api/callback`
- 保存API: 同一originの `/admin/api/github/*` と `/admin/api/graphql`
- 保存先: `main` へのexpected HEAD付きdirect commit
- 本番deploy: Cloudflare PagesのGitHub連携 `main`
- `main` protection: private repositoryのGitHub plan制限により未設定

`publish_mode: editorial_workflow` は設定しません。Sveltia CMSでは現時点でEditorial Workflowが未実装であり、CMS保存は同一origin proxyで制限します。

## 保存経路

1. 編集者がsame-originの `/admin/api/auth` からPortal専用GitHub Appへログインする。
2. 認証開始時にPKCE S256のverifier / challengeを生成し、HMAC署名したstateとverifierを10分間の `HttpOnly`、`Secure`、`SameSite=Lax` cookieでcallbackまで保持する。
3. callbackでstate、cookie、PKCE verifier、期限を照合し、GitHub App user access tokenの `ghu_` 形式・有効期限・空scopeを確認する。
4. Pages Functionsがinstallationの権限を再取得し、Contents write以外のwrite権限がなく、installationが `acecore-systems/aceserver-portal` だけを含み、編集者にpush権限があることを確認する。
5. CMSのreadは、許可されたcontentとmediaのtree / blobだけを同一origin proxy経由で返す。
6. 保存時はinstallation・repository・push権限を再検証し、base branch `main`、最新HEAD、変更path、ファイル数、合計サイズを検証する。
7. proxyが画像とコンテンツを `expectedHeadOid` 付きの同じcommitで `main` へ保存する。保存直前にHEADが変わっていれば409で止め、再読み込みを求める。
8. `main` pushを受けてCloudflare Pagesがproduction deployする。

CMSの保存リクエストごとに固有の `CMS-Request-ID` をcommit本文へ記録します。GitHubのcommit応答が途切れた場合はmutationを再送せず、最新20件の `main` 履歴からrequest IDと親commitを照合します。一致したcommitがあれば成功応答を復元し、別commitへ進んでいて保存結果を確認できない場合は再保存を促さずGitHub履歴の確認を求めます。

CMS管理対象外のsource code、schema、CMS設定、workflowはdirect commitできません。これらは従来どおり作業branchからPRを作り、CIとレビューを通してmergeします。CMSのコンテンツ保存だけが例外です。

## CMS管理対象

- `public/admin/config.yml` の `files` に列挙した `src/content/pages/*.json`
- `public/admin/config.yml` の `files` に列挙した `src/content/site/*.json`
- `public/uploads/**` の許可済み画像形式

schema、workflow、source codeなど上記以外はproxyが拒否します。参照中画像を誤って消さないよう、CMSからの削除はJSON・画像とも拒否します。不要画像の削除は参照確認を含む通常のPull Requestで行います。CMS JSONはGitHub GraphQL readで本文が省略されないよう1ファイル448 KiB以下に限定します。1回の保存は最大100ファイル、追加データ合計25 MiBです。

## GitHub AppとCloudflare Pages設定

GitHub AppはPortal専用とし、installation対象を `acecore-systems/aceserver-portal` 1 repositoryだけにします。Repository permissionsはContentsをRead and write、MetadataをRead-onlyとし、Pull requestsを含むその他のwrite権限を付与しません。callback URLは `https://asv.acecore.net/admin/api/callback` です。編集者本人の期限付きGitHub App user access tokenを本人確認と保存actorに使い、App private keyはCloudflare Pagesへ配布しません。

Cloudflare PagesのProduction encrypted secretsには次の4項目を設定します。

| 変数名                           | 用途                                    |
| -------------------------------- | --------------------------------------- |
| `CMS_GITHUB_APP_CLIENT_ID`       | Portal専用GitHub Appのclient ID         |
| `CMS_GITHUB_APP_CLIENT_SECRET`   | Portal専用GitHub Appのclient secret     |
| `CMS_GITHUB_APP_INSTALLATION_ID` | Portal repository限定installation ID    |
| `CMS_OAUTH_STATE_SECRET`         | state署名用の32バイト以上のランダムな値 |

識別子を含む4項目はすべてProductionだけに設定し、Previewには設定しません。CMS設定・認証・callback・保存proxyは `asv.acecore.net` だけで有効です。Pages previewや別hostnameではGitHubへの通信前にfail-closedで拒否します。

外部Appの作成、1 repository限定installation、Production secretsの登録、認証実機確認が完了するまでは、この変更を本番へmergeしません。

## 検証

`npm run validate:content` は、`main`、same-origin PKCE認証、Pages Functions route、`ghu_` token、installation / repository / push / Contents-only権限検証、expected HEAD付きdirect commit、CMS公開pathを確認します。proxy変更時は次も実行します。

```powershell
npm run test:cms
npm run typecheck:functions
npm run format:check
npm run validate:content
npm run build
git diff --check
```
