# CMS 直接公開運用

最終確認日: 2026-07-28

## 現在の構成

- GitHub repository: `acecore-systems/aceserver-portal`
- CMS: Sveltia CMS
- 認証: GitHub OAuth Worker
- publication branch: `main`
- 保存API: 同一originの `/admin/api/github/*` と `/admin/api/graphql`
- 保存先: `main` へのexpected HEAD付きdirect commit
- 本番deploy: Cloudflare PagesのGitHub連携 `main`
- `main` protection: private repositoryのGitHub plan制限により未設定

`publish_mode: editorial_workflow` は設定しません。Sveltia CMSでは現時点でEditorial Workflowが未実装であり、CMS保存は同一origin proxyで制限します。

## 保存経路

1. 編集者がGitHub OAuth Worker経由でSveltia CMSへログインする。
2. Pages FunctionsがOAuth tokenでGitHub userと `aceserver-portal` へのpush権限を確認する。
3. CMSのreadは、許可されたcontentとmediaのtree / blobだけを同一origin proxy経由で返す。
4. 保存時はrepository、base branch `main`、最新HEAD、変更path、ファイル数、合計サイズを検証する。
5. proxyが画像とコンテンツを `expectedHeadOid` 付きの同じcommitで `main` へ保存する。保存直前にHEADが変わっていれば409で止め、再読み込みを求める。
6. `main` pushを受けてCloudflare Pagesがproduction deployする。

CMSの保存リクエストごとに固有の `CMS-Request-ID` をcommit本文へ記録します。GitHubのcommit応答が途切れた場合はmutationを再送せず、最新20件の `main` 履歴からrequest IDと親commitを照合します。一致したcommitがあれば成功応答を復元し、別commitへ進んでいて保存結果を確認できない場合は再保存を促さずGitHub履歴の確認を求めます。

CMS管理対象外のsource code、schema、CMS設定、workflowはdirect commitできません。これらは従来どおり作業branchからPRを作り、CIとレビューを通してmergeします。CMSのコンテンツ保存だけが例外です。

## CMS管理対象

- `public/admin/config.yml` の `files` に列挙した `src/content/pages/*.json`
- `public/admin/config.yml` の `files` に列挙した `src/content/site/*.json`
- `public/uploads/**` の許可済み画像・PDF形式

schema、workflow、source codeなど上記以外はproxyが拒否します。固定JSONは更新だけを許可し、削除できるのは許可済みメディアだけです。1回の保存は最大100ファイル、追加データ合計25 MiBです。

## 認証方式の境界

AcecoreとAceServerはGitHub認証型で、編集者のOAuth tokenを本人確認とGitHub上の保存actorに使います。CherryとHattはCloudflare Access認証型で、サイト専用GitHub Appを保存actorに使います。CMS管理対象だけを直接保存する境界は共通ですが、認証情報やAppは共用しません。

GitHub認証型では、CMS proxy内の操作は制限されても、編集者個人のGitHub権限自体は変わりません。将来backend actorをGitHub Appへ分離する場合も、GitHubログインは維持し、Appとprivate keyはrepository単位で分離します。

## 検証

`npm run validate:content` は、`main`、same-origin proxy、Pages Functions route、GitHub user権限検証、expected HEAD付きdirect commit、CMS公開pathを確認します。proxy変更時は次も実行します。

```powershell
npm run test:cms
npm run typecheck:functions
npm run format:check
npm run validate:content
npm run build
git diff --check
```
