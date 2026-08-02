# アルファくん正史の生成・保存設計

## 目的と境界

アルファくん個人の過去は、最初から長い設定資料を作らず、訪問者の質問をきっかけに少しずつ正史へ追加する。Aceserver、Acecore、WIKI、運営、実在人物、ルール、価格、予定、稼働状況などの現実の事実はこの正史へ書かず、従来どおり公式Portal・WIKIの検索根拠から回答する。

正史経路が扱うのはアルファくん個人の創作上の記憶だけである。公開チャットからできる操作はappendのみで、既存revisionの更新、撤回、retconは実装しない。将来それらが必要になった場合は、認証済み管理経路と監査ログを別に設計する。

## 一度に増やす量

1回の新規生成は次の契約に固定する。

- 記憶断片は1件だけ
- 中心となる出来事は1つ、時代区分も1つだけ
- `body_ja` は160〜320文字
- `title_ja` は30文字以下、`summary_ja` は80文字以下
- 新しい事実は1〜2件
- 次の話題へのhookは最大1件
- `granularity` は常に `fragment`

「あなたの過去は？」のような広い質問は `past.early_memory` だけを対象とし、低影響な最初の記憶を1件だけ作る。同じ質問が再度来た場合は同じ `coverage_key` の既存revisionを返し、新しい正史は作らない。学校、友人、失敗など複数の小話を持てるテーマでは、`medium` のcoverage計画が既存断片で十分か、新しい小断片が必要かを判断する。「ほかには？」「続きは？」は、直前のassistant回答にD1で有効な正史revision IDが付いている場合だけ、そのrevisionにつながる新しい断片を1件だけ作る。通常の案内会話に続く同じ表現は正史経路へ入れない。複数の話題を一度に尋ねられた場合は、最初の未回答topicだけを処理する。

年齢、生年月日、家族、出生地、名前、正体・由来は基礎設定として扱い、そのtopicを直接質問された場合だけ作成を許可する。家族は父、母、両親、きょうだい、概要を別のatomic topicとして扱い、一つの質問から家系全体を作らない。広い過去質問や別topicへの回答から基礎設定を追加してはいけない。

## OpenAI呼び出し

モデルは既存チャットと同じ `gpt-5.6-luna` を使い、Responses APIはすべて `store: false` とする。

| 処理                     | reasoning effort |  `max_output_tokens` | D1書き込み   |
| ------------------------ | ---------------- | -------------------: | ------------ |
| 通常会話・正史回答の翻訳 | `medium`         | 既存回答320、翻訳480 | なし         |
| 未知topicのcoverage計画  | `medium`         |                 1024 | なし         |
| 記憶断片の執筆           | `max`            |                 4096 | まだ行わない |
| 独立した整合性審査       | `max`            |                 2048 | まだ行わない |

計画、執筆、審査はstrictなStructured Outputsを使い、アプリ側でもZodと決定的な制約を再検証する。拒否、incomplete、JSON/schema不正、文字数違反、coverage違反、基礎設定の越権、既存factとの重複・矛盾、未取得revisionへの参照、審査rejectのいずれかがあればD1へ書かない。`max_output_tokens`を使い切った場合も部分出力は採用しない。

正史の本文・要約・factは日本語で保存する。他言語の質問には保存済み日本語正史を `medium` で忠実に翻訳して返し、翻訳結果は正史として保存しない。ブラウザ側の応答待ち上限は、未知topicの計画、2段階の `max` 呼び出し、必要な翻訳を途中で切らないよう240秒にしている。

## D1を正本にする

migrationは `migrations/alpha-lore/0001_initial.sql` に置く。専用D1には次を保存する。

- `alpha_lore_world`: 現在revisionと正史憲法
- `alpha_lore_revisions`: 日本語の記憶断片、coverage、生成audit
- `alpha_lore_facts`: 現在有効な正史fact
- `alpha_lore_revision_refs`: 続き・参照関係
- `alpha_lore_vector_outbox`: Vectorize同期の再試行状態
- `alpha_lore_generation_locks`: 高コストな同時生成を1件に抑える短期lease
- `alpha_lore_generation_events`: `created`、`reused`、`rejected`、`conflict`、`busy`、`failed` の結果

rawの質問文、会話履歴、IPアドレスは保存しない。generation eventにもcoverage、revision ID、一般化したerror codeだけを残す。

新規revisionは、lease取得後に現在revisionを読み、執筆と審査を終えてからD1 `batch()`で確定する。batch内では期待した現在revisionを条件にrevision・fact・参照・outbox・eventを追加し、`alpha_lore_world.current_revision`をcompare-and-swapで進める。別requestが先に確定した場合は追加せず、同じcoverageがあれば既存revisionを返す。

PreviewとProductionは必ず別D1にする。既存の `SEARCH_RATE_LIMIT_DB` や他サイトのD1を正史保存に流用しない。

## Vectorizeは派生索引にする

Productionでは正史専用の1536次元・cosine indexを用意し、`text-embedding-3-large`で `coverage_key`、時代、タイトル、要約、本文、factを埋め込む。vector IDはD1 revision IDと同じ値にし、namespaceは `alpha-canon-ja` とする。検索後は必ずIDからD1のactive revisionを取得し、Vectorize metadataだけを回答根拠にしない。

commit時にD1 outboxへ追加し、Pages Functionsの `waitUntil()` でupsertする。upsert失敗時はoutboxを `retry` に戻し、その後の正史requestで少数件ずつ再試行する。Vectorize mutationが反映されるまでの間もD1のcoverage検索と最近のrevisionで回答できるため、正史の正しさはVectorizeの可用性に依存しない。

Previewは当初Vectorizeをbindingせず、専用Preview D1のcoverage検索と最近のrevisionだけで確認する。既存のWIKI・Portal・Acecore等のindexへ正史vectorを混ぜない。

## 現在の安全状態

repositoryにはschema、migration、実装、テストだけを追加し、Cloudflare上のD1・Vectorizeはまだ作成していない。`wrangler.jsonc` は全環境で次のkill switchを維持している。

```json
{
  "ALPHA_LORE_ENABLED": "false",
  "ALPHA_LORE_VECTOR_SEARCH_ENABLED": "false",
  "ALPHA_LORE_REASONING_EFFORT": "max"
}
```

そのため、この変更だけがdeployされても新しい正史生成やD1書き込みは始まらない。通常チャットは従来どおり `medium` で動く。

## リソース作成後の段階的な有効化

外部リソース作成は費用・本番状態を変えるため、明示承認を得てから行う。推奨名は次のとおり。

- Preview D1: `aceserver-alpha-lore-preview`
- Production D1: `aceserver-alpha-lore-production`
- Production Vectorize: `aceserver-alpha-lore-openai-1536-production`

承認後の順序は次のとおり。

1. Preview D1とProduction D1を別々に作成する。
2. 両D1へ `migrations/alpha-lore/0001_initial.sql` をmigrationとして適用する。
3. Production専用Vectorizeを1536次元・cosineで作成する。
4. `wrangler.jsonc` のPreviewへ `ALPHA_LORE_DB`だけ、Productionへ別IDの `ALPHA_LORE_DB` と `ALPHA_LORE_INDEX`を追加する。各D1 bindingには `migrations_dir: "migrations/alpha-lore"` を設定する。
5. `npm run types:functions`でbinding型を再生成する。
6. Previewだけ `ALPHA_LORE_ENABLED: "true"` にし、「あなたの過去は？」が1件だけ作ること、再質問で件数が増えないこと、基礎設定が混ざらないこと、矛盾時に書かれないことを確認する。
7. Preview D1を確認してからProduction bindingを反映する。Productionの `ALPHA_LORE_ENABLED` はまだfalseのままdeployする。
8. ProductionのD1 migration、Vectorize binding、OpenAI secret、WAF、ログを確認し、明示承認後に `ALPHA_LORE_ENABLED` と `ALPHA_LORE_VECTOR_SEARCH_ENABLED` をtrueにする。
9. GitHub連携の `main` pushによるCloudflare Pages production deployとcustom domain上の実requestで確認する。Direct Uploadを本番完了条件にしない。

リソース作成コマンドの例は次のとおりだが、IDを得るまでは `wrangler.jsonc` に仮IDを入れない。

```powershell
npx wrangler d1 create aceserver-alpha-lore-preview
npx wrangler d1 create aceserver-alpha-lore-production
npx wrangler vectorize create aceserver-alpha-lore-openai-1536-production --dimensions=1536 --metric=cosine
```

実際のmigration適用、binding変更、Production有効化は、作成結果のresource IDと対象environmentを再確認してから別々に行う。
