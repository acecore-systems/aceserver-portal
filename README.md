# エースサーバーポータル

エースサーバーの公式ポータルサイトです。Astro 7 + Tailwind CSS v4 + Sveltia CMS で構成しています。

## UI スタイル

Tailwind CSS v4 は Astro の Vite プラグインで統合しています。共通の色、書体、
重み、遷移時間は `src/styles/global.css` の `@theme` に定義し、既存の共通ボタン・
パネル規約は同ファイルの `@utility` に集約しています。`@import "tailwindcss"` による
Preflight を採用し、サイト固有のグローバル基準・キーボードフォーカス・reduced motion
のルールも同ファイルで維持します。

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

### 翻訳PRの自動検証とマージ

CMSが日本語正本を`main`へ直接保存すると、`Create Translation Task`がCopilotへ
8言語の追従PRを依頼します。`Merge Translation PR`は、Copilotの署名済みactor、
同一repositoryの`copilot/` branch、固定タイトル、タスク生成時に記録した日本語正本の
LF正規化SHA-256とHMAC署名、変更可能な翻訳ファイルの完全一致、`translations.ts`の
翻訳文字列以外にコード差分がないこと、GitHub Actions由来の`Build and Format`成功を
すべて確認した場合だけsquash auto-mergeを予約します。
対象の日本語正本が後から変わったPRはstaleとして閉じ、判定不能・余分な変更・CI失敗は
fail closedでマージしません。翻訳データのキーや配列構造を変える追加・削除は自動化せず、
通常の人手レビューで扱います。

タスク生成には`COPILOT_AGENT_TOKEN`、マージ操作にはrepositoryへinstallした
`Acecore Translation Bot`とRepository Secretsの`TRANSLATION_BOT_CLIENT_ID`、
`TRANSLATION_BOT_APP_PRIVATE_KEY`を使います。source contractの署名・検証には32 byte以上の
`PORTAL_TRANSLATION_CONTRACT_SECRET`を使います。CIやPR内容のreadは権限を分離したActionsの
`GITHUB_TOKEN`で行うため、Translation BotへChecks権限は付与しません。

## CMS

Sveltia CMS では `src/content/pages/*.json` と `src/content/site/*.json` を編集します。
メディアは `public/uploads/` に保存します。

このリポジトリの CMS 認証は GitHub 認証型です。編集者はPortal専用GitHub Appのsame-origin OAuth（PKCE S256）でログインし、期限付きの `ghu_` user access tokenで保存します。Cloudflare Accessを使う場合も前段の入口保護に限定します。

告知は CMS の「告知」から編集します。表示/非表示、表示順、表示トーン、リンク、表示期間を `src/content/site/announcements.json` で管理します。表示期間は訪問者のブラウザ時刻で判定するため、デプロイ後も時刻到達時に切り替わります。

Cloudflare Pages のproduction / previewでは、build前に `public/admin/runtime-config.js` を生成してSveltia CMSを手動初期化します。CMSのpublication branchは常に `main` です。保存時は同一origin proxyがCMS管理対象だけを最新の `main` へ直接commitし、Cloudflare PagesのGitHub連携がproduction deployを開始します。生成ファイルはGit管理対象外です。

## アルファくん AI 案内チャット

サイト全体に右下固定のアルファくん案内チャットを表示します。アルファくんはエースサーバーのキャラクター案内役として、参加方法、ワールド、ルール、ストーリー導線を案内します。

`functions/api/alpha-chat.ts` は同一origin検証とD1レート制限を行った後、Private Service Binding `ALPHA_CHAT_SERVICE` を通じて共有Worker `aceserver-alpha-chat` だけを呼びます。共有Workerが人格、口調、質問分類、RAG、引用検証、Workers AI `@cf/zai-org/glm-5.3-flash`による生成、正史作成を一元管理します。Portalに切替flagやローカルLLM生成はなく、Service Bindingがない場合や共有Workerの応答が壊れている場合は、選択localeの固定案内を返してfail closedします。

ブラウザは`Accept: text/event-stream`を指定し、Pages Functionは共有WorkerのSSE bodyをバッファせず転送します。生成deltaは平文で逐次表示し、共有Workerが検証を終えた`complete`イベントで最終表示と会話コンテキストを確定します。別モデルやPortal内のローカル生成への切替はありません。

チャットで使う検索index、しきい値、根拠選択は共有Worker側の設定です。Portal repositoryは公開corpusの生成と同期を所有しますが、ブラウザ入口では検索や回答生成を行いません。Aceserver WIKIは引き続きルール、コマンド、参加条件、ワールド詳細、運用情報の正です。

Portal固有の `/api/search` はチャットとは別機能で、`PORTAL_SEARCH_INDEX` とCloudflare Workers AI BGE-M3を使ってこのサイト内の公開ページだけを検索します。`SEARCH_EMBEDDING_MODEL` と `SEARCH_EMBEDDING_DIMENSIONS` はそれぞれ `@cf/baai/bge-m3` と `1024` に固定し、Previewでは検索を無効化します。実行時フォールバックは設けません。

`npm run build` は `dist/vector-corpus.json` まで生成します。`npm run sync:portal-vectorize:dry-run` でsource数、vector数、corpus versionを確認できます。実同期先は `aceserver-portal-search-bge-m3-1024-production-v1` だけに制限し、対象index名と完全一致する `--confirm-production` がない実行、管理外ID、20%を超える削除、10 source未満のcorpusでは停止します。旧OpenAI indexはロールバック用に保持し、新しい同期先からは更新しません。

`.github/workflows/sync-portal-vectorize.yml` はProduction専用です。GitHub連携のPagesで公開されたcommitとcorpus versionを照合してから運用indexへ同期し、全vector IDの一致と実query canaryを確認します。`PORTAL_SEARCH_INDEX` bindingは検証済みのv2を参照します。通常は`main`へのpush、取りこぼしは6時間ごとのscheduleで再照合し、20%超の削除をworkflowから上書きする経路は設けません。旧indexは切替直後のロールバック用に削除せず保持します。

自動同期には Repository Variable `ACESERVER_PORTAL_VECTORIZE_SYNC_ENABLED=true` と、GitHub Environment `cloudflare-portal-search-production` の `CLOUDFLARE_PORTAL_SEARCH_PRODUCTION_API_TOKEN` を使います。Cloudflare tokenは対象accountに限定し、Vectorize更新とWorkers AI実行に必要な最小権限を付与します。この構成はProduction専用であり、PreviewにはVectorize bindingや同期用secret、GitHub Environmentを置きません。Cloudflare Pages PreviewとPreview用D1は維持し、Previewは検索kill switchをすべて `"false"` にした安全なフォールバックで動作します。

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

詳しい境界と障害時の扱いは [CMS直接公開運用](docs/04_運用設計/01_CMS直接公開運用.md) を参照してください。

設計文書の入口は [docs/README.md](docs/README.md) です。

## 環境変数

- `PUBLIC_SITE_URL`: 本番の canonical / sitemap 用 URL。未設定時は `https://asv.acecore.net` を使います。
- Production secrets: `CMS_GITHUB_APP_CLIENT_ID`、`CMS_GITHUB_APP_CLIENT_SECRET`、`CMS_GITHUB_APP_INSTALLATION_ID`、`CMS_OAUTH_STATE_SECRET`。Previewには設定しません。
