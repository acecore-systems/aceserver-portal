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
| Sveltia CMS                  | `/admin/index.html`          |

## CMS

Sveltia CMS では `src/content/pages/*.json` と `src/content/site/*.json` を編集します。
メディアは `public/uploads/` に保存します。

## 環境変数

- `PUBLIC_SITE_URL`: 本番の canonical / sitemap 用 URL。未設定時は `https://asv.acecore.net` を使います。
