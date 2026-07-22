# エースサーバーポータル

エースサーバーの公式ポータルサイトです。Astro + UnoCSS + Sveltia CMS で構成しています。

## 開発

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

このリポジトリの CMS 認証は GitHub 認証型です。編集者は GitHub OAuth Worker 経由で保存し、Cloudflare Access を使う場合も前段の入口保護に限定します。

告知は CMS の「告知」から編集します。表示/非表示、表示順、表示トーン、リンク、表示期間を `src/content/site/announcements.json` で管理します。表示期間は訪問者のブラウザ時刻で判定するため、デプロイ後も時刻到達時に切り替わります。

Cloudflare Pages のproduction / previewでは、build前に `public/admin/runtime-config.js` を生成してSveltia CMSを手動初期化します。CMSのpublication branchは常に `main` で、previewから保存した場合も短命branchと `main` 向けPRを作ります。生成ファイルはGit管理対象外です。

## アルファくん AI 案内チャット

サイト全体に右下固定のアルファくん案内チャットを表示します。アルファくんはエースサーバーのキャラクター案内役として、参加方法、ワールド、ルール、ストーリー導線を案内します。

`functions/api/alpha-chat.js` の Cloudflare Pages Function から Cloudflare Workers AI binding を呼び出します。既定では GLM 5.2 (`@cf/zai-org/glm-5.2`) を reasoning effort `low` で使います。ブラウザには AI 実行用のキーを渡しません。

`functions/api/alpha-wiki-context.js` に Aceserver WIKI の公開記事から作った AI 用抜粋データを置きます。API は質問内容に合う抜粋だけを選び、Workers AI の文脈として渡すため、ルール、参加方法、ワールド、コマンドなどは WIKI に基づいて具体的に答えます。

Cloudflare Pages 側では `wrangler.jsonc` を設定の正とし、acecore-net と同じ方式で以下を preview / production の両方に定義します。

- Workers AI binding: `AI`
- `CLOUDFLARE_AI_MODEL`: 使用モデル（未設定時は `@cf/zai-org/glm-5.2`）
- `CLOUDFLARE_AI_REASONING_EFFORT`: 推論 effort（未設定時は `low`）

### 本番 CMS の保存と PR 反映

- 本番ソースの正は `main` です。Cloudflare Pages の production deploy 元も GitHub 連携の `main` にします。
- Sveltia CMS は `backend.branch: main` と同一originのGitHub API proxyで運用します。現行SveltiaではEditorial Workflowが未実装のため、`publish_mode` には依存しません。
- proxyがGitHub OAuth userのwrite権限と変更pathを検証し、保存ごとに `cms/aceserver/*` の短命branchとPRを作ります。`main` へ直接commitしません。
- 恒久的な `cms-content` 投稿受け皿 branch は使いません。
- PR CI では `npm run format:check`、`npm run validate:content`、`npm run build` を実行します。
- CMS PR が `main` に merge されると、Cloudflare Pages が GitHub `main` push を受けて production deploy します。
- 旧 remote `cms-content` branch は未反映差分がないことを確認して削除済みです。

運用判断と廃止条件は [docs/cms-write-workflow.md](docs/cms-write-workflow.md) を参照してください。

## 環境変数

- `PUBLIC_SITE_URL`: 本番の canonical / sitemap 用 URL。未設定時は `https://asv.acecore.net` を使います。
