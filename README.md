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

Cloudflare Pages の preview では、build 前に `public/admin/runtime-config.js` を生成し、CMS が preview 対象の PR ブランチを読むようにしています。生成ファイルは Git 管理対象外です。

### 本番 CMS の保存と PR 反映

- 本番ソースの正は `main` です。Cloudflare Pages の production deploy 元も GitHub 連携の `main` にします。
- Sveltia CMS は `backend.branch: main` と `publish_mode: editorial_workflow` で運用します。
- CMS 保存時は `cms/...` のような短命 branch と PR が作られ、`main` に直接 commit しません。
- 恒久的な `cms-content` 投稿受け皿 branch は使いません。
- PR CI では `npm run format:check`、`npm run validate:content`、`npm run build` を実行します。
- CMS PR が `main` に merge されると、Cloudflare Pages が GitHub `main` push を受けて production deploy します。
- 旧 remote `cms-content` branch は未反映差分がないことを確認して削除済みです。

運用判断と廃止条件は [docs/cms-write-workflow.md](docs/cms-write-workflow.md) を参照してください。

## 環境変数

- `PUBLIC_SITE_URL`: 本番の canonical / sitemap 用 URL。未設定時は `https://asv.acecore.net` を使います。
