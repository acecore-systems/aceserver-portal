# Repository Guidelines

このリポジトリはエースサーバーポータルの Astro 静的サイトです。AI エージェントや自動化ツールは、変更前にこのファイルを確認してください。

## 基本方針

- ユーザー指示、issue/PR 本文、チェックリストを受け入れ条件として扱い、このファイルより具体的な現在の指示を優先する。
- GitHub 上のユーザー向け文章（issue、pull request、コメント、レビュー返信、作業報告）は、明示がない限り日本語で書く。
- 既存の Astro、TypeScript、UnoCSS、Sveltia CMS、Cloudflare Pages 構成に合わせ、差分は目的に必要な範囲に絞る。
- 関連のない整形、リファクタリング、生成物更新を混ぜない。
- 既存の未コミット変更や別 branch の作業を戻さない。
- 失敗した検証、未実施の確認、外部要因による制約は隠さず報告する。

## CMS とコンテンツ

- CMS 編集対象は `src/content/pages/*.json` と `src/content/site/*.json` を正とする。
- CMS content の shape は `src/content.config.ts` の Astro Content Collections schema に合わせる。
- 複数ファイルをまたぐ制約（slug とファイル名、内部リンク、CMS config の公開フィールドなど）は `npm run validate:content` で確認する。
- 公開 URL は `slug` ベースの route を正とし、CMS editable content に `path` を戻さない。
- `main` は本番ソースの唯一の正とし、Cloudflare Pages の production deploy 元も GitHub 連携の `main` にする。
- このリポジトリの CMS 認証は GitHub 認証型とする。Cloudflare Access を前段に置く場合も、保存認証は GitHub OAuth Worker を使う。
- CMS のpublication branchは `main` にし、同一originのREST / GraphQL proxyがGitHub user、repository権限、書き込みpath、最新HEADを検証して、CMS管理対象だけをexpected HEAD付きの1 commitで `main` へ直接保存する。
- Sveltia CMSではEditorial Workflowが未実装のため、`publish_mode: editorial_workflow` の設定だけで保存経路を成立させたと判断しない。
- Cherry / HattのCloudflare Access認証型とは認証情報とbackend actorを共用しない。content-only制約とatomicなdirect commitという書き込み方針だけを揃える。
- `cms-content` のような恒久的な CMS 投稿受け皿 branch は使わない。
- source code、schema、CMS設定、workflowの変更はPRとCIを通して `main` に入れる。direct commitはproxy allowlist内のCMSコンテンツとメディアだけに限定する。
- GitHub認証型でbackend actorをGitHub Appへ分離する場合も、Appとprivate keyはrepository単位で分離する。

## 検証

- サイト出力に影響する変更では原則 `npm run build` を実行する。
- Markdown、JSON、YAML、Astro、TypeScript、CSS を変更した場合は `npm run format:check` を実行する。
- CMS/content/schema/route/link に関わる変更では `npm run validate:content` を実行する。
- コミット前に `git diff --check` を実行する。
- Windows sandbox で `spawn EPERM` が出た場合は、同じコマンドを権限付きで再実行して環境要因か切り分ける。

## PR 作成

- PR タイトルと本文は日本語で書き、`.github/pull_request_template.md` に沿って関連 Issue、概要、確認、補足を簡潔に書く。
- PR は draft で作成してよい。ユーザーが ready を求めた場合、または自動化タスクが ready for review を明示している場合だけ ready にする。
- 実行したコマンドは省略せず書く。実行していない検証は「未実施」と明記する。
