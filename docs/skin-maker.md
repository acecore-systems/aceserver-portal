# スキンメーカー

公開URL: https://asv.acecore.net/skin-maker/ 。日本語と8翻訳localeに対応。本番のみ生成を有効化し、Preview・ローカルは無効。利用者の外部登録・APIキーは不要。

## 機能とデータ契約

- 画像・文章から毎回新しいスキンを生成する。既存スキンの修正、スキン読み込み、編集範囲指定、Undoは提供しない。
- Classic（腕4px）／Slim（腕3px）、実出力のskinview3dプレビュー、正面・背面・側面・自動回転・外側レイヤー表示、64×64 PNG保存に対応する。
- プレビューと保存は同じRGBAを使用。生成失敗時は直前の出力を保持する。次の生成の腕タイプを変更しても、表示・保存中の出力は変換しない。
- APIは`mode: "create"`のみ受理し、`current`や編集範囲フィールド、`mode: "edit"`を400で拒否する。生成済み画像は次のリクエストに含めない。
- モデルは最大35色の`palette`と`faces`を返す。6部位×6面の基本36面を必須とし、外側36面は任意。独立した面を最近傍で正規UVへ収める。基本面の透明色、未知色、不均一な行、不正な面名は拒否する。未使用UVは透明。
- 応答全体が単一JSONコード枠の場合のみ枠を外す。不正JSON・途中切れ・説明文混入を拒否し、コードやURLを実行しない。
- AI応答の`refused: true`だけを生成拒否とする。正常な`palette`・`faces`に付いた`refused: false`は受理し、省略時と同じピクセルへ変換する。文字列や数値の`refused`、不正な面・色は引き続き拒否する。
- 64×64 RGBAをfast-pngで保存する。Minecraft実機での確認はユーザーが実施する。

生成応答の例（実際は全基本面が必要）：

```json
{
  "palette": { "1": "#ddaa88" },
  "faces": { "head.base.front": ["11111111", "11111111"] }
}
```

## 公開APIと費用・不正利用対策

`GET /api/skin-maker` は有効状態と公開site keyだけを返す。`POST` はJSONの生成・修正要求を受け取り、検証済みRGBAのbase64、モデル型、変更ピクセル数を返す。応答はすべて`no-store`。画像やプロンプトをURLに含めない。

1. 機能フラグとすべての必須設定を確認し、未設定なら503。OriginはリクエストURLのoriginとの完全一致が必要。
2. Content-Lengthを信用せず、ストリームの実バイト数を450,000 bytesで制限。文章1,200文字、参考画像最大256×256のRGBAだけを受理する。任意URLや任意モデルの指定は受け付けない。
3. Turnstile Siteverifyの成功、hostname完全一致、`action=skin-maker`を確認する。トークンは毎回使い切り、失効・エラー時に生成ボタンを無効化する。
4. Cloudflareの`CF-Connecting-IP`を秘密saltによるHMAC-SHA256へ変換する。D1の**単一INSERT SELECT**で、同じIPの60秒内1回・UTC日次5回・全体UTC日次100回を同時に確認し予約する。複数PoPのメモリカウンターや非atomicなread→writeに依存しない。
5. 予約後のみ`env.AI.run('@cf/zai-org/glm-5.3-flash', ...)`を1回呼ぶ。出力上限12,000 tokens、`reasoning_effort=low`、`store=false`、サーバー側240秒timeout。クライアント待ちは270秒。自動retry・他モデルへのfallbackはしない。
6. 失敗・拒否・出力不正でも予約を戻さない。応答にupstreamエラー本文や入力を含めない。危険な出力・画像埋め込み・任意コードを実行する仕組みはない。

IPv6のアドレス変更や分散したアクセスでは個別上限を回避できるが、全体上限100回/日は残る。IP共有環境では上限を共有する。公開前にCloudflare WAFで当該POSTルートへの送信数を制限することも検討する。API前段の大量リクエストまでD1予約だけで無料になるわけではない。

2026-09-06確認の[モデル単価](https://developers.cloudflare.com/workers-ai/models/glm-5.3-flash/)は入力$0.15/M、出力$0.50/M。出力が毎回12,000 tokensに達しても100回の出力分は$0.60/日。入力・画像トークン、Workers Paid基本料、D1等は別。これは請求額の固定上限ではない。入力は文字数・画像寸法を制限している。実計測例の画像生成は1,936入力+3,116出力tokens（約$0.00185、その他サービス料金を除く）。公開前にダッシュボードで利用量・請求・失敗率を確認し、上限値を見直す。

## アップロードと保存

- 参考画像はローカルでPNG/JPEG/WebP（5 MB以下）を読み、縦横比を保ったまま最大256×256へ縮小し、RGBAにする。元ファイル名・EXIF・位置情報などを送信しない。
- 送信時の同意チェックで、使用権限とCloudflareのAI処理への送信を明示する。個人情報・秘密を含む画像を避ける案内を9言語で表示する。
- 自サイトでは文章・画像・生成物をD1/R2/KV/localStorageに保存しない。参考画像を選ぶだけではAIへ送らない。永続的なギャラリー・公開共有機能はない。
- D1には予約ID、UTC日付、IPのHMAC、時刻だけを記録する。成功した予約処理時に48時間より古い行を削除する。アクセスが止まった場合は自動で削除されないので、下記の定期メンテナンスを行う。
- プロンプト・画像・AI応答を`console.log`しない。AI Gatewayを利用していない。将来Gatewayを追加する場合はpayload logging・cacheを有効にしない。[Cloudflareのデータ取扱い](https://developers.cloudflare.com/workers-ai/platform/data-usage/)も確認する。
- モデルへの安全指示は拒否を要求するが、すべての不適切な画像を検出する専用分類器ではない。広範な安全性評価は未実施。公開共有を追加するなら別途モデレーション設計が必要。

## 公開・再設定手順

1. このPRのCIとレビューを通す。`main`へマージする前に、本番反映の承認を得る。GitHub連携Pagesの`main`を本番ソースとし、Direct Uploadや手動deployを本番完了条件にしない。
2. Workers Paidと対象モデルの利用権限を確認する。既存の`AI` bindingを利用する。
3. Turnstile widgetを作り、`asv.acecore.net`のみ許可する。Previewで試す場合は対象Preview hostnameを明示的に追加し、別widgetを使う。公開キーを`SKIN_TURNSTILE_SITE_KEY`、秘密キーをPages secret `SKIN_TURNSTILE_SECRET`へ設定する。ローカル用test keyを本番で使用しない。
4. ランダムな32bytes以上の値をPages secret `SKIN_QUOTA_SALT`へ設定する。秘密をリポジトリやPRに書かない。これらのsecretは既存CMSの必須secret一覧には追加しておらず、機能無効時の既存deployを妨げない。
5. 現在の設計は既存の`SEARCH_RATE_LIMIT_DB`内に**独立した`skin_maker_usage`テーブル**を追加する。既存検索テーブルや行には触れない。DBを確認・バックアップし、次のSQLを承認後に適用する。Previewは先に隔離したDBへbindingを差し替えること。現行Preview bindingは本番検索DBを指しているので、そのまま検証SQLを実行しない。

   ```powershell
   npx wrangler d1 execute SEARCH_RATE_LIMIT_DB --env production --remote --file migrations/skin-maker/0001_usage.sql
   ```

6. Previewで実際のTurnstile→Pages→AI→PNGの経路を検証し、下の実機・品質確認を済ませる。`SKIN_MAKER_ENABLED`を対象環境だけ`true`にする設定変更はPRで行う。全環境へ一括で有効化しない。
7. Git Provider: Yes、source repo=`acecore-systems/aceserver-portal`、production branch=`main`、`github:push`由来deploy成功、custom domain activeを確認する。対象commitとPages deploymentを照合し、`asv.acecore.net`から実APIと各localeを確認する。
8. ロールバックは`SKIN_MAKER_ENABLED=false`を優先する。実行中の推論はすでに費用が発生している可能性がある。画像プレビュー・保存は引き続き利用可能。予約テーブルを削除する必要はない。

定期メンテナンスは管理側の既存スケジューラ等で日次実行する。内容は予約メタデータの期限切れ削除のみ。公開前に実行担当と手段を決める。

```sql
DELETE FROM skin_maker_usage WHERE created < unixepoch() - 172800;
SELECT day, count(*) AS attempts FROM skin_maker_usage GROUP BY day ORDER BY day DESC;
```

## 開発・検証

```powershell
npm ci
npm run test:skin-maker
npm run typecheck:skin-maker
npm run typecheck:functions
npm run types:functions:check
npm run format:check
npm run validate:content
npm run build
git diff --check
```

`npm run dev`はAstro画面のみで、Pages APIは404になる。Pages経路のローカル検証には隔離したWrangler configとローカルD1を使う。`AI` bindingはローカル起動でも有料の実モデルへ接続するため、暗黙に生成を有効化しない。

`npm run probe:skin-maker -- --live`は実モデルを最大2回呼ぶ明示opt-in。自作合成画像と文章による新規生成のみを検証する。`--text-only` / `--reference-only`で対象を絞れる。`CLOUDFLARE_ACCOUNT_ID`とWrangler認証が必要。失敗時は終了コード1。公開deployや本番DB変更は行わない。生成が遅い場合は250秒で打ち切る。実モデルの再試行は有料なので暗黙に実行しない。

## 検証状況

2026-09-08、短文「気持ち悪い」の実モデル試験で`refused: false`と有効な36基本面が返り、旧APIが422として誤って拒否することを再現。拒否判定と生成スキーマを修正し、実返答fixtureを使ってAPIの200応答とPNGの全ピクセル一致を検証した。`refused: true`の拒否、不正な値・欠けた面・未定義色の拒否も回帰テストで維持する。修正後の同じ短文による実モデル再試行は約78秒で完了し、スキンの検証と変換に成功した。本番で報告された過去の返答本文は保存していないため、同じ原因だったかまでは断定しない。

以前の新規生成の実モデル試験では文章→Classicが127秒、合成参照画像→Slimが81秒で有効なPNGを返した。UV・色検証・PNG往復・API入力制限・利用制限は自動テストで確認する。少数のケースから一般的な品質・成功率は断定しない。

写真・複雑な衣装、Minecraft実機、Safari実機、実Turnstileを通した生成の確認はユーザー側で行う。

## 障害診断記録

Pagesの通常ログは永続化されないため、生成枠を予約した試行を既存D1の `skin_maker_diagnostics` に保存する。最大100試行/UTC日で、生成開始前の状態と最終結果を同じUUIDで更新する。保存項目はID、開始時刻、処理段階、固定のエラー分類、HTTPステータス、経過ミリ秒だけ。入力文、画像、AI返答、IP、認証トークン、例外本文・stack・Zod issueは記録しない。

- エラー応答の `requestId` を全9言語の画面に表示する。通信断などAPI応答が届かなかった場合はIDを表示できない。
- `stage=ai, code=started, status=0` が長時間残る場合は、AI待機中に処理終了・通信断等が起きた可能性がある。タイムアウトと断定しない。
- `timeout`、`invalid_json`、`incomplete`、`invalid_schema`、`palette` 等で切り分ける。AI事業者の自由文エラーは保存せず `ai_failed` とする。
- 予約前の拒否（入力不正・認証失敗・上限）とD1障害は構造化consoleログのみ。未認証アクセスによる無制限のD1保存を避ける。DBが停止している場合は永続化もできない。
- 保存失敗は `persistence_failed` をconsoleへ出し、元の生成応答を保つ。公開のログ取得APIは設けない。
- 7日より古い行は記録時に削除する。アクセス停止中は削除も停止するため、厳密な7日TTLではない。既存の日次メンテナンスにも下記DELETEを追加する。

リリース前に本番DBの追加テーブルを適用してからPRをマージする。本番SQL適用は別途承認の対象。既存テーブルは変更しない。

```powershell
npx wrangler d1 execute SEARCH_RATE_LIMIT_DB --env production --remote --file migrations/skin-maker/0002_diagnostics.sql
```

管理者はDBで問い合わせIDを照合する。以下のIDは実際のUUIDに置き換える。

```sql
SELECT id, created, stage, code, status, elapsed_ms
FROM skin_maker_diagnostics WHERE id = '問い合わせ用UUID';
DELETE FROM skin_maker_diagnostics WHERE created < unixepoch() - 604800;
```

[Pagesログの保存制限](https://developers.cloudflare.com/pages/functions/debugging-and-logging/#limits)
