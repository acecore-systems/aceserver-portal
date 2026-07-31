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
| 読みもの                      | `/stories/`                  |
| メインサーバーワールドマップ  | `/world-map-main/`           |
| 資源サーバーワールドマップ    | `/world-map-sigen/`          |
| RPGサーバーワールドマップ     | `/world-map-rpg/`            |
| ロビーワールドマップ          | `/world-map-lobby/`          |
| RPGサブワールドマップ         | `/world-map-rpg-sub/`        |
| Season Aワールドマップ        | `/world-map-season-a/`       |
| Season Creativeワールドマップ | `/world-map-season-a-c/`     |
| イベントワールドマップ        | `/world-map-event/`          |
| Sveltia CMS                   | `/admin/`                    |

エースサーバー固有の出来事やコミュニティ記事は
`src/content/stories/*.md` を正としてポータル内で公開します。Acecoreの
コーポレートサイトには本文を複製せず、旧URLから各記事へ転送します。
Storiesは日本語を正とするPR管理コンテンツです。日本語と8言語の翻訳を
ポータル内の言語別URLで公開し、Acecore側の旧記事URLも対応する言語版へ
301で転送します。翻訳は日本語正本のsource hashと構造をbuild前に検証します。

## CMS

Sveltia CMS では `src/content/pages/*.json` と `src/content/site/*.json` を編集します。
メディアは `public/uploads/` に保存します。

このリポジトリの CMS 認証は GitHub 認証型です。編集者はPortal専用GitHub Appのsame-origin OAuth（PKCE S256）でログインし、期限付きの `ghu_` user access tokenで保存します。Cloudflare Accessを使う場合も前段の入口保護に限定します。

告知は CMS の「告知」から編集します。表示/非表示、表示順、表示トーン、リンク、表示期間を `src/content/site/announcements.json` で管理します。表示期間は訪問者のブラウザ時刻で判定するため、デプロイ後も時刻到達時に切り替わります。

Cloudflare Pages のproduction / previewでは、build前に `public/admin/runtime-config.js` を生成してSveltia CMSを手動初期化します。CMSのpublication branchは常に `main` です。保存時は同一origin proxyがCMS管理対象だけを最新の `main` へ直接commitし、Cloudflare PagesのGitHub連携がproduction deployを開始します。生成ファイルはGit管理対象外です。

## アルファくん AI 案内チャット

サイト全体に右下固定のアルファくん案内チャットを表示します。アルファくんはエースサーバーのキャラクター案内役として、参加方法、ワールド、ルール、ストーリー導線を案内します。

`functions/api/alpha-chat.js` の Cloudflare Pages Function からOpenAI APIへ直接接続します。質問は `text-embedding-3-large` を `dimensions: 1536` で呼び出してベクトル化し、Aceserver portal全体とAceserver WIKIのVectorize indexを同時に検索します。portal側はbuild後の公開HTMLからホーム、固定ページ、ワールド案内、動画、読みものの日本語正本を抽出して`vector-corpus.json`を生成し、同じ内容の翻訳routeは重複登録しません。多言語チャットでは日本語の検索根拠を `gpt-5.6-luna` が回答言語へ翻訳し、portalの参照リンクは対応する言語別URLへ切り替えます。検索で得たchunk IDは各サイトの公開corpusへ照合し、metadataの短い抜粋だけでなく最大1200文字の元chunkを回答根拠にします。回答生成はResponses APIを `reasoning.effort: medium`、`store: false` で呼び出します。ブラウザにはOpenAI APIキーを渡しません。

portal検索は公開サイトの紹介、ワールド案内、動画、読みもの、掲載ページの発見に使います。ルール、コマンド、参加条件、ワールドの詳細、運用情報ではportalよりAceserver WIKIを情報の正として扱います。Acecore、運営元、サービス、技術記事に関する質問だけは、同じembeddingでacecore-netのVectorize indexを検索します。Acecore Schoolsの学習分野、学び方、相談、料金、FAQに関する質問はSchools専用indexを検索し、取得した公開routeだけを `https://schools.acecore.net` 配下のリンクとして許可します。World Foundationについての質問は、専用のWorld Foundation Vectorize indexから日本語の公開設計資料を検索します。検索元ごとのしきい値と用途を分け、異なるサイトの根拠を誤って混ぜません。

VectorizeまたはOpenAI Embeddingsの取得に失敗した場合は検索なしの案内へフォールバックします。portalまたはWIKIのcorpus取得に失敗した場合はVectorize metadataの抜粋へフォールバックし、アルファくん自体は利用を継続します。ルール、コマンド、参加条件など変更される情報は、検索で取得したWIKI内容に根拠がある範囲だけ具体的に回答し、出典記事をMarkdownリンクで示します。

ルール、参加条件、コマンド、プラグインなど変更され得る情報はrepositoryへ複製しません。アルファくんは固定知識から詳細を断定せず、現行情報の正であるAceserver WIKIからVectorize検索で取得した根拠を使います。根拠を取得できない場合はAceserver WIKIまたは公式Discordへ案内します。

Cloudflare Pages 側では `wrangler.jsonc` を設定の正とし、acecore-net と同じ方式で以下を preview / production の両方に定義します。

- Pages secret: `OPENAI_API_KEY`
- Vectorize binding: `WIKI_SEARCH_INDEX`
- Aceserver portal Vectorize binding: `PORTAL_SEARCH_INDEX`
- Acecore Vectorize binding: `ACECORE_SEARCH_INDEX`
- Acecore Schools Vectorize binding: `SCHOOLS_SEARCH_INDEX`
- Acecore Systems Vectorize binding: `SYSTEMS_SEARCH_INDEX`
- World Foundation Vectorize binding: `WORLD_FOUNDATION_SEARCH_INDEX`
- `OPENAI_RESPONSE_MODEL`: Responses APIモデル（既定 `gpt-5.6-luna`）
- `OPENAI_REASONING_EFFORT`: reasoning effort（既定 `medium`）
- `OPENAI_EMBEDDING_MODEL`: 埋め込みモデル（既定 `text-embedding-3-large`）
- `OPENAI_EMBEDDING_DIMENSIONS`: Vectorizeと一致させる埋め込み次元数（`1536`）
- `WIKI_SEARCH_ENABLED`: WIKI検索のkill switch（`"false"`で無効化）
- `WIKI_SEARCH_MIN_SCORE`: 回答根拠に採用するVectorize scoreの下限（既定`0.40`）
- `PORTAL_SEARCH_ENABLED`: portal全体検索のkill switch（`"false"`で無効化）
- `PORTAL_SEARCH_MIN_SCORE`: portal検索結果を採用するscoreの下限（既定`0.45`）
- `ACECORE_SEARCH_ENABLED`: Acecore検索のkill switch（`"false"`で無効化）
- `ACECORE_SEARCH_MIN_SCORE`: Acecore検索結果を採用するscoreの下限（既定`0.50`）
- `SCHOOLS_SEARCH_ENABLED`: Acecore Schools検索のkill switch（`"false"`で無効化）
- `SCHOOLS_SEARCH_MIN_SCORE`: Acecore Schools検索結果を採用するscoreの下限（既定`0.50`）
- `WORLD_FOUNDATION_SEARCH_ENABLED`: World Foundation検索のkill switch（`"false"`で無効化）
- `WORLD_FOUNDATION_SEARCH_MIN_SCORE`: World Foundation検索結果を採用するscoreの下限（既定`0.40`）
- WIKI Preview / Production index: `aceserver-wiki-search-openai-1536-preview` / `aceserver-wiki-search-openai-1536-production`
- Aceserver portal Preview / Production index: `aceserver-portal-search-openai-1536-preview` / `aceserver-portal-search-openai-1536-production`
- Acecore Preview / Production index: `acecore-net-search-openai-1536-preview` / `acecore-net-search-openai-1536-production`
- Acecore Schools Preview / Production index: `acecore-schools-search-openai-1536-preview` / `acecore-schools-search-openai-1536-production`
- Acecore Systems Preview / Production index: `acecore-systems-search-openai-1536-preview` / `acecore-systems-search-openai-1536-production`
- World Foundation Preview / Production index: `world-foundation-search-openai-1536-preview` / `world-foundation-search-openai-1536-production`

`npm run build` は `dist/vector-corpus.json` まで生成します。indexへ書き込む前に `npm run sync:portal-vectorize:dry-run` でsource数、vector数、corpus versionを確認します。実同期は `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`、`OPENAI_API_KEY`、`VECTORIZE_INDEX_NAME` を環境変数で渡して `npm run sync:portal-vectorize` を実行します。OpenAI APIは埋め込み生成だけに、Cloudflare API tokenはVectorizeの作成・一覧・upsert・削除だけに使用します。同期先は上記の新portal index 2個だけに制限され、管理外ID、20%を超える削除、10 source未満のcorpusでは停止します。

1536次元indexは既存indexと別名で作成し、既存indexを削除しません。初回のコード移行ではPreview / Productionとも6つの検索kill switchを`false`に保ちます。各owner repositoryの同期、次元数・corpus version・vector件数・代表的な日本語検索を確認した後、別PRで6つを一括して`true`へ切り替えます。一部だけ旧indexへ向けた状態や、空indexを有効化した状態ではマージ・デプロイしません。

`.github/workflows/sync-portal-vectorize.yml` は、GitHub連携のPagesで公開されたcommitとcorpus versionを照合してからproduction indexを同期します。通常は`main`へのpushで同期し、取りこぼしの再照合を6時間ごとに行います。Previewはprotected `main` を手動同期し、PRごとの共有index競合を避けます。自動同期を有効にする前に、Repository Variable `ACESERVER_PORTAL_VECTORIZE_SYNC_ENABLED=true` と次のGitHub Environment secretを設定します。

- `cloudflare-portal-search-preview`: `CLOUDFLARE_PORTAL_SEARCH_PREVIEW_API_TOKEN`、`OPENAI_API_KEY`
- `cloudflare-portal-search-production`: `CLOUDFLARE_PORTAL_SEARCH_PRODUCTION_API_TOKEN`、`OPENAI_API_KEY`

Cloudflare tokenは対象accountだけに限定し、Cloudflareの現行permission名で `Vectorize Edit` だけを付与します。PreviewとProductionは別tokenにし、repository共通の広い権限を持つtokenを流用しません。OpenAI APIキーもこのサービス専用Projectのキーを使い、PagesとGitHub Environmentのsecretとして管理します。

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
