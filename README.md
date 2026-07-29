# エースサーバーポータル

エースサーバーの公式ポータルサイトです。Astro 7 + UnoCSS + Sveltia CMS で構成しています。

## 開発

Node.js 24.18.0 以上を使用してください。リポジトリの固定バージョンは `.node-version` に記載しています。

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## 検証

```bash
npm run format:check
npm run validate:content
npm run build
```

CMS content の shape は `src/content.config.ts` の Astro Content Collections schema で検証します。
`validate:content` は slug とファイル名、内部リンク、CMS config など複数ファイルをまたぐ制約を確認します。

## 主なページ

| ページ                        | パス                         |
| ----------------------------- | ---------------------------- |
| トップ                        | `/`                          |
| 動画                          | `/youtube-search-aceserver/` |
| ワールドマップ                | `/world-map/`                |
| メインサーバーワールドマップ  | `/world-map-main/`           |
| 資源サーバーワールドマップ    | `/world-map-sigen/`          |
| RPGサーバーワールドマップ     | `/world-map-rpg/`            |
| ロビーワールドマップ          | `/world-map-lobby/`          |
| RPGサブワールドマップ         | `/world-map-rpg-sub/`        |
| Season Aワールドマップ        | `/world-map-season-a/`       |
| Season Creativeワールドマップ | `/world-map-season-a-c/`     |
| イベントワールドマップ        | `/world-map-event/`          |
| Sveltia CMS                   | `/admin/`                    |

## CMS

Sveltia CMS では `src/content/pages/*.json` と `src/content/site/*.json` を編集します。
メディアは `public/uploads/` に保存します。

このリポジトリの CMS 認証は GitHub 認証型です。編集者はPortal専用GitHub Appのsame-origin OAuth（PKCE S256）でログインし、期限付きの `ghu_` user access tokenで保存します。Cloudflare Accessを使う場合も前段の入口保護に限定します。

告知は CMS の「告知」から編集します。表示/非表示、表示順、表示トーン、リンク、表示期間を `src/content/site/announcements.json` で管理します。表示期間は訪問者のブラウザ時刻で判定するため、デプロイ後も時刻到達時に切り替わります。

Cloudflare Pages のproduction / previewでは、build前に `public/admin/runtime-config.js` を生成してSveltia CMSを手動初期化します。CMSのpublication branchは常に `main` です。保存時は同一origin proxyがCMS管理対象だけを最新の `main` へ直接commitし、Cloudflare PagesのGitHub連携がproduction deployを開始します。生成ファイルはGit管理対象外です。

## アルファくん AI 案内チャット

サイト全体に右下固定のアルファくん案内チャットを表示します。アルファくんはエースサーバーのキャラクター案内役として、参加方法、ワールド、ルール、ストーリー導線を案内します。

`functions/api/alpha-chat.js` の Cloudflare Pages Function から Cloudflare Workers AI binding を呼び出します。既定では対話向けの GLM 4.7 Flash (`@cf/zai-org/glm-4.7-flash`) をthinking無効で使い、短い案内本文へtokenを集中させます。ブラウザには AI 実行用のキーを渡しません。

ルール、参加条件、コマンド、プラグインなど変更され得る情報はrepositoryへ複製しません。アルファくんは固定知識から詳細を断定せず、現行情報の正である Aceserver WIKI または公式Discordへ案内します。ポータルからNewt APIを直接参照しません。

Cloudflare Pages 側では `wrangler.jsonc` を設定の正とし、acecore-net と同じ方式で以下を preview / production の両方に定義します。

- Workers AI binding: `AI`
- `CLOUDFLARE_AI_MODEL`: 使用モデル（未設定時は `@cf/zai-org/glm-4.7-flash`）

本番custom domainの `/api/alpha-chat` へのPOSTは、`acecore.net` zoneのCloudflare WAF rate limiting rule `Rate limit Aceserver Alpha chat` で保護します。IP・colo単位で10秒に5 requestまでとし、超過時は10秒blockします。このruleはrepository外のCloudflare設定なので、zoneを再作成した場合は再設定してください。`pages.dev` のpreview URLはこのzone-level ruleの対象外です。

### 本番 CMS の保存と公開

- 本番ソースの正は `main` です。Cloudflare Pages の production deploy 元も GitHub 連携の `main` にします。
- Sveltia CMS は `backend.branch: main` と同一originのGitHub API proxyで運用します。現行SveltiaではEditorial Workflowが未実装のため、`publish_mode` には依存しません。
- proxyがGitHub App installation、対象repository、GitHub userのpush権限、Contents-only write権限、変更path、ファイル数、容量、最新HEADを保存直前に検証し、CMS管理対象のコンテンツとメディアだけを `main` へ1 commitで直接保存します。CMSからのJSON・画像削除は拒否し、参照確認を伴う通常のPull Requestで行います。
- CMS JSONはGitHub GraphQL readで本文が省略されないよう、1ファイル448 KiB以下に限定します。
- `expectedHeadOid` が最新の `main` と一致しない場合は保存せず、CMSの再読み込みを求めます。
- 通信結果が不明な場合は同じcommitを再送せず、固有のrequest IDをGitHub履歴と照合して成功を判定します。
- `main` pushを受けてCloudflare Pagesがproduction deployします。保存後は通常数分で公開サイトへ反映されます。
- source code、schema、CMS設定、workflowの変更はCMS proxyの許可対象外です。従来どおりbranchとPRを作り、CIの `format:check`、`validate:content`、`build` を通してからmergeします。

詳しい境界と障害時の扱いは [docs/cms-write-workflow.md](docs/cms-write-workflow.md) を参照してください。

## 環境変数

- `PUBLIC_SITE_URL`: 本番の canonical / sitemap 用 URL。未設定時は `https://asv.acecore.net` を使います。
- Production secrets: `CMS_GITHUB_APP_CLIENT_ID`、`CMS_GITHUB_APP_CLIENT_SECRET`、`CMS_GITHUB_APP_INSTALLATION_ID`、`CMS_OAUTH_STATE_SECRET`。Previewには設定しません。
