# CMS 書き込み branch 運用

最終確認日: 2026-07-20

## 現在の構成

- GitHub repository: `acecore-systems/aceserver-portal`
- CMS: Sveltia CMS
- 認証: GitHub OAuth Worker
- publication branch: `main`
- 保存API: 同一originの `/admin/api/github/*` と `/admin/api/graphql`
- 保存branch: `cms/aceserver/*` の短命branch
- 本番deploy: Cloudflare PagesのGitHub連携 `main`
- `main` protection: private repositoryのGitHub plan制限により未設定

`publish_mode: editorial_workflow` は設定しません。Sveltia CMSでは現時点でEditorial Workflowが未実装であり、設定だけを追加しても短命branchやPRは作られないためです。

## 保存経路

1. 編集者がGitHub OAuth Worker経由でSveltia CMSへログインする。
2. Pages FunctionsがOAuth tokenでGitHub userと `aceserver-portal` へのpush権限を確認する。
3. CMSのreadは、許可されたcontentとmediaのtree / blobだけを同一origin proxy経由で返す。
4. 保存時はrepository、base branch `main`、最新HEAD、変更path、ファイル数、合計サイズを検証する。
5. proxyが `cms/aceserver/*` branchを `main` から作り、画像とコンテンツを同じcommitへ保存して `main` 向けPRを作る。
6. PR CIでformat、content validation、buildを通し、レビュー後にmergeする。
7. `main` pushを受けてCloudflare Pagesがproduction deployする。

private repositoryのplan制約でbranch protectionを設定できない間も、CMS proxyは `main` への直接writeを受け付けません。人が行う変更もPRを使います。保護機能が利用可能になった時点で、PR必須、strictな `Build and Format`、admin enforcement、force push / deletion禁止を設定します。

恒久的な `cms-content` branchは使いません。Sveltia CMSがEditorial Workflowを実装した後も、現行proxyと同等のpath制限、PR、CI、実保存テストを満たすまでは設定だけで置き換えません。

## CMS管理対象

- `public/admin/config.yml` の `files` に列挙した `src/content/pages/*.json`
- `public/admin/config.yml` の `files` に列挙した `src/content/site/*.json`
- `public/uploads/**` の許可済み画像・PDF形式

schema、workflow、source codeなど上記以外はproxyが拒否します。1回の保存は最大100ファイル、追加データ合計25 MiBです。

## 認証方式の境界

AcecoreとAceServerはGitHub認証型で、編集者のOAuth tokenを本人確認とGitHub上の保存actorに使います。CherryとHattはCloudflare Access認証型で、サイト専用GitHub Appを保存actorに使います。短命branch、content-only制約、PR、CIという書き込み方針は共通ですが、認証情報やAppは共用しません。

GitHub認証型では、CMS proxy内の操作は制限されても、編集者個人のGitHub権限自体は変わりません。将来backend actorをGitHub Appへ分離する場合も、GitHubログインは維持し、Appとprivate keyはrepository単位で分離します。

## 検証

`npm run validate:content` は、`main`、same-origin proxy、Pages Functions route、GitHub user権限検証、`cms/aceserver/*` PR作成、CMS公開pathを確認します。proxy変更時は次も実行します。

```powershell
npm run test:cms
npm run typecheck:functions
npm run format:check
npm run validate:content
npm run build
git diff --check
```
