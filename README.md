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

告知は CMS の「告知」から編集します。表示/非表示、表示順、表示トーン、リンク、表示期間を `src/content/site/announcements.json` で管理します。表示期間は訪問者のブラウザ時刻で判定するため、デプロイ後も時刻到達時に切り替わります。

Cloudflare Pages の preview では、build 前に `public/admin/runtime-config.js` を生成し、CMS が preview 対象の PR ブランチを読むようにしています。生成ファイルは Git 管理対象外です。

### 本番 CMS の保存と PR 反映

- 本番ソースの正は `main` です。Cloudflare Pages の production deploy 元も GitHub 連携の `main` にします。
- 現在の Sveltia CMS は GitHub OAuth 経由で保存するため、編集者個人の権限で `main` に直接 commit する構成にはしません。
- 本番 CMS の保存先は暫定的に `cms-content` ブランチです。`cms-content` は投稿受け皿であり、本番 deploy 元ではありません。
- `cms-content` に保存されると `.github/workflows/cms-content-pr.yml` が `main` 向けの「CMS編集内容を反映」PRを作成します。既に open PR がある場合は二重作成しません。
- CMS PR 作成前に、差分が `src/content/**` と `public/uploads/**` のみであることを検査します。
- PR CI では `npm run format:check`、`npm run validate:content`、`npm run build` を実行します。
- CMS PR は通常の merge commit または rebase merge でマージします。`cms-content` を安全に fast-forward 同期するため、squash merge は避けます。
- `main` に push されると `.github/workflows/cms-content-sync.yml` が、未反映 CMS commit がない場合だけ `cms-content` を `main` へ fast-forward します。
- 初回セットアップやブランチ再作成が必要な場合は、`main` の最新状態から `git fetch origin main`、`git push origin origin/main:refs/heads/cms-content` で `cms-content` を用意します。
- GitHub Actions の `GITHUB_TOKEN` で PR 作成が許可されていない環境では、Repository settings の Actions 権限を見直すか、PR 作成権限を持つ `CMS_PR_TOKEN` secret を設定します。

運用判断と廃止条件は [docs/cms-write-workflow.md](docs/cms-write-workflow.md) を参照してください。

## 環境変数

- `PUBLIC_SITE_URL`: 本番の canonical / sitemap 用 URL。未設定時は `https://asv.acecore.net` を使います。
