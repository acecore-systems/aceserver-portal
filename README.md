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

`functions/api/alpha-chat.ts` の Cloudflare Pages Function からOpenAI APIへ直接接続します。質問は `text-embedding-3-large` を `dimensions: 1536` で呼び出してベクトル化し、Aceserver portal全体とAceserver WIKIのVectorize indexを同時に検索します。portal側はbuild後の公開HTMLからホーム、固定ページ、ワールド案内、動画、読みものの日本語正本を抽出して`vector-corpus.json`を生成し、同じ内容の翻訳routeは重複登録しません。多言語チャットでは日本語の検索根拠を `gpt-5.6-luna` が回答言語へ翻訳し、portalの参照リンクは対応する言語別URLへ切り替えます。検索で得たchunk IDは各サイトの公開corpusへ照合し、metadataの短い抜粋だけでなく最大1200文字の元chunkを回答根拠にします。回答生成はResponses APIを `reasoning.effort: medium`、`store: false` で呼び出します。ブラウザにはOpenAI APIキーを渡しません。

アルファくん個人の過去を尋ねる質問には、通常の公式情報案内と分離した正史経路を使えます。正史の正本は専用D1、Vectorizeはrevision IDを探すための派生索引とし、質問文自体は保存しません。一度に作るのは160〜320文字の記憶断片1件、新しい事実1〜2件だけです。通常会話と既存正史の再利用は `medium`、正史の執筆と独立した整合性審査は `max` に固定します。現在の `wrangler.jsonc` では外部リソース未作成のためkill switchを `"false"` にしてあり、専用D1・Vectorizeを作成してmigrationとbindingを確認するまで有効になりません。設計、データ境界、段階的な有効化手順は [docs/alpha-lore-canon.md](docs/alpha-lore-canon.md) を参照してください。

portal検索は公開サイトの紹介、ワールド案内、動画、読みもの、掲載ページの発見に使います。ルール、コマンド、参加条件、ワールドの詳細、運用情報ではportalよりAceserver WIKIを情報の正として扱います。Acecore、運営元、サービス、技術記事に関する質問だけは、同じembeddingでacecore-netのVectorize indexを検索します。Acecore Schoolsの学習分野、学び方、相談、料金、FAQに関する質問はSchools専用indexを検索し、取得した公開routeだけを `https://schools.acecore.net` 配下のリンクとして許可します。World Foundationについての質問は、専用のWorld Foundation Vectorize indexから日本語の公開設計資料を検索します。検索元ごとのしきい値と用途を分け、異なるサイトの根拠を誤って混ぜません。

VectorizeまたはOpenAI Embeddingsの取得に失敗した場合は検索なしの案内へフォールバックします。portalまたはWIKIのcorpus取得に失敗した場合はVectorize metadataの抜粋へフォールバックし、アルファくん自体は利用を継続します。ルール、コマンド、参加条件など変更される情報は、検索で取得したWIKI内容に根拠がある範囲だけ具体的に回答し、出典記事をMarkdownリンクで示します。

ルール、参加条件、コマンド、プラグインなど変更され得る情報はrepositoryへ複製しません。アルファくんは固定知識から詳細を断定せず、現行情報の正であるAceserver WIKIからVectorize検索で取得した根拠を使います。根拠を取得できない場合はAceserver WIKIまたは公式Discordへ案内します。

Cloudflare Pages 側では `wrangler.jsonc` を設定の正とし、Vectorize binding は Production にだけ定義します。通常の Pages Preview には Vectorize binding を置かず、6個の検索kill switchをすべて `"false"` にして、固定の案内とWIKI・公式Discordへの安全なフォールバックを確認します。

Production には次の1536次元indexをbindingします。

- `WIKI_SEARCH_INDEX`: `aceserver-wiki-search-openai-1536-production`
- `PORTAL_SEARCH_INDEX`: `aceserver-portal-search-openai-1536-production`
- `ACECORE_SEARCH_INDEX`: `acecore-net-search-openai-1536-production`
- `SCHOOLS_SEARCH_INDEX`: `acecore-schools-search-openai-1536-production`
- `SYSTEMS_SEARCH_INDEX`: `acecore-systems-search-openai-1536-production`
- `WORLD_FOUNDATION_SEARCH_INDEX`: `world-foundation-search-openai-1536-production`

`OPENAI_RESPONSE_MODEL`、`OPENAI_REASONING_EFFORT`、`ALPHA_LORE_REASONING_EFFORT`、`OPENAI_EMBEDDING_MODEL`、`OPENAI_EMBEDDING_DIMENSIONS`はそれぞれ `gpt-5.6-luna`、`medium`、`max`、`text-embedding-3-large`、`1536` とします。検索元ごとの `*_SEARCH_ENABLED` がkill switch、`*_SEARCH_MIN_SCORE` が採用scoreの下限です。正史は `ALPHA_LORE_ENABLED`、正史Vectorize検索は `ALPHA_LORE_VECTOR_SEARCH_ENABLED` を別々に有効化します。

新indexは空の状態で本番検索へ使い始めません。6個のProduction indexは、WIKI 26件、Portal 15件、Acecore 308件、Schools 7件、Systems 256件、World Foundation 135件について、1536次元・cosine、mutation反映、`ja` namespaceの代表query、再同期の収束を確認済みです。そのためProductionの6つの `*_SEARCH_ENABLED` は一括して `"true"` にしています。設定の既定値とPreviewは引き続きすべて `"false"` で、PreviewにはVectorize bindingも置きません。一部だけ旧indexへ向けた状態や、空indexを有効化した状態ではマージ・デプロイしません。旧1024次元のProduction indexは削除済みで、Productionには1536次元indexだけを残します。

`npm run build` は `dist/vector-corpus.json` まで生成します。`npm run sync:portal-vectorize:dry-run` でsource数、vector数、corpus versionを確認できます。実同期先は `aceserver-portal-search-openai-1536-production` だけに制限し、`--confirm-production aceserver-portal-search-openai-1536-production` がない実行、管理外ID、20%を超える削除、10 source未満のcorpusでは停止します。

`.github/workflows/sync-portal-vectorize.yml` はProduction専用です。GitHub連携のPagesで公開されたcommitとcorpus versionを照合してから同期し、通常は`main`へのpush、取りこぼしは6時間ごとのscheduleで再照合します。20%超の削除をworkflowから上書きする経路は設けず、安全ゲートで停止します。

自動同期には Repository Variable `ACESERVER_PORTAL_VECTORIZE_SYNC_ENABLED=true` と、GitHub Environment `cloudflare-portal-search-production` の `CLOUDFLARE_PORTAL_SEARCH_PRODUCTION_API_TOKEN`、`OPENAI_API_KEY` を使います。Cloudflare tokenは対象accountに限定した `Vectorize Write`、OpenAI APIキーはPortal専用Projectのものを使用します。この構成はProduction専用であり、PreviewにはVectorize binding、Vectorize用のCloudflare/OpenAI secret、GitHub Environmentを置きません。Cloudflare Pages PreviewとPreview用D1は維持し、Previewは検索kill switchをすべて `"false"` にした安全なフォールバックで動作します。

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
