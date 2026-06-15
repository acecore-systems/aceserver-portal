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

## 主なページ

| ページ                       | パス                         |
| ---------------------------- | ---------------------------- |
| トップ                       | `/`                          |
| 動画                         | `/youtube-search-aceserver/` |
| ワールドマップ               | `/world-map/`                |
| メインサーバーワールドマップ | `/world-map-main/`           |
| 資源サーバーワールドマップ   | `/world-map-sigen/`          |
| RPGサーバーワールドマップ    | `/world-map-rpg/`            |
| Season Aワールドマップ       | `/world-map-season-a/`       |
| Sveltia CMS                  | `/admin/`                    |

## CMS

Sveltia CMS では `src/content/pages/*.json` と `src/content/site/*.json` を編集します。
メディアは `public/uploads/` に保存します。

告知は CMS の「告知」から編集します。表示/非表示、表示順、表示トーン、リンク、表示期間を `src/content/site/announcements.json` で管理します。表示期間は訪問者のブラウザ時刻で判定するため、デプロイ後も時刻到達時に切り替わります。

Cloudflare Pages の preview では、build 前に `public/admin/runtime-config.js` を生成し、CMS が preview 対象の PR ブランチを読むようにしています。生成ファイルは Git 管理対象外です。

### 本番 CMS の保存と PR 反映

- 本番 CMS の保存先は `cms-content` ブランチです。`main` は protected branch のため、CMS から直接 commit しません。
- `cms-content` に保存されると `.github/workflows/cms-content-pr.yml` が `main` 向けの「CMS編集内容を反映」PRを作成します。既に open PR がある場合は二重作成しません。
- 初回セットアップやブランチ再作成が必要な場合は、`main` の最新状態から `git fetch origin main`、`git push origin origin/main:refs/heads/cms-content` で `cms-content` を用意します。
- CMS PR は通常の merge commit または rebase merge でマージします。
- GitHub Actions の `GITHUB_TOKEN` で PR 作成が許可されていない環境では、Repository settings の Actions 権限を見直すか、PR 作成権限を持つ `CMS_PR_TOKEN` secret を設定します。

## 環境変数

- `PUBLIC_SITE_URL`: 本番の canonical / sitemap 用 URL。未設定時は `https://asv.acecore.net` を使います。
