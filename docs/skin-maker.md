# スキンメーカー

公開予定URLは `https://asv.acecore.net/skin-maker/`。既存の8翻訳localeにも同じルートを生成する。利用者の外部アカウント・APIキーは不要。**初期設定は全環境でAI生成無効。本番反映・DB変更・Turnstile設定はこのPRに含めない。**

## 構成とデータ契約

- Astroの既存BaseLayout、ヘッダー、フッター、9言語の言語切替を使用。フッターから到達できる。広告は表示しない。
- `src/lib/skin-maker.ts` がClassic（腕4px）／Slim（腕3px）の72面（6部位×6面×2レイヤー）のUVを定義する。左右は着用者基準。旧64×32やHDスキン、自動的な腕タイプ変換には対応しない。
- 新規生成ではGLMから**各面の独立したピクセル画**を受け取り、コードが最寄りのピクセルを使って面サイズへ収め、64×64アトラスに配置する。例：モデルが頭の側面を8×12で描いても、隣のUVへはみ出さず8×8へ収める。面ごとの拡縮は特徴を変える可能性があるため3Dで確認する。
- すべての基本36面が必要。基本面の透明ピクセル、未知の色記号、不均一な行、未知の面は拒否する。外側面は任意で、未指定面・未使用UVは透明。AIが見た目だけMinecraft風の全体画像を返してもスキンとして採用しない。
- 色変更には`recolors`を追加し、選択面内の完全一致する不透明RGBだけを置換する。離れた両目にも同じ色置換を適用し、肌など別色・半透明の画素を維持する。元色がない操作・選択外・重複操作は拒否する。同じ面の同じ色を持つ無関係な模様も対象になるため、用途の選択はモデル依存であり、面の選択とUndoも併用する。
- 形や模様の修正では`patches`の局所座標を使用する。**修正を拡縮しない。** 選択した部位・面・レイヤー以外への書き込み、面からのはみ出し、重複パッチを拒否する。全検証成功後にコピーへ反映し、パッチ外のRGBAをバイト単位で維持する。モデルには元アトラス画像と、編集可能面の正確なRGBAも渡す。
- パッチの意味が利用者の意図どおりかはモデル依存。小さい変更ではUIの変更可能範囲を絞る。修正前の履歴をブラウザ内に最大10件持ち、取り消せる。失敗時は前のスキンを維持する。
- `fast-png@6.4.0`でRGBAをPNGへエンコード。読み込みは64×64の8bit RGB/RGBA・パレットPNG（低bit深度は非interlace）に対応し、基本面が不透明か検証する。ブラウザCanvasからの再読取による半透明ピクセルの丸めを避け、保存には元のRGBA配列を使う。
- `skinview3d@3.4.2`をこのページだけ動的に読み込み、出力RGBAを描いたCanvasをテクスチャとして使う。架空の見本や別画像でプレビューを代用しない。正面・背面・左右、ドラッグ回転、自動回転、外側レイヤーの表示切替に対応。外側の表示切替は保存データを変更しない。WebGL利用不可でもPNGを保存できる。

新規生成のモデル出力（全基本面が必要なので以下は説明用の抜粋）：

```json
{
  "palette": { "1": "#ddaa88", "a": "#226655" },
  "faces": { "head.base.front": ["11111111", "11111111"] }
}
```

修正のモデル出力：

```json
{
  "palette": { "g": "#228844" },
  "patches": [
    {
      "part": "head",
      "layer": "base",
      "face": "front",
      "x": 2,
      "y": 3,
      "rows": ["g"]
    }
  ]
}
```

色置換のモデル出力例（fromは元スキンの実RGB、toは変更後のRGB）：

```json
{
  "palette": {},
  "recolors": [
    {
      "part": "head",
      "layer": "base",
      "face": "front",
      "from": "#3a6fd8",
      "to": "#3fae4a"
    }
  ]
}
```

色キーは`1..9,a..z`の最大35色。`0`は透明専用で外側にのみ使う。配列の色番号計算をモデルにさせる形式は実試行で誤りがあったため採用しない。文章のみの入力は文字列、画像付きはmultimodal content配列を使用する。GLMがJSON Modeの公式対応モデル一覧にないことと実試行の内部エラーを踏まえ、`response_format`は指定しない。返答全体が単一のJSONコード枠の場合のみ枠を外す。説明文の混入・途中切れ・JSON不正は引き続き拒否する。

## 公開APIと費用・不正利用対策

`GET /api/skin-maker` は有効状態と公開site keyだけを返す。`POST` はJSONの生成・修正要求を受け取り、検証済みRGBAのbase64、モデル型、変更ピクセル数を返す。応答はすべて`no-store`。画像やプロンプトをURLに含めない。

1. 機能フラグとすべての必須設定を確認し、未設定なら503。OriginはリクエストURLのoriginとの完全一致が必要。
2. Content-Lengthを信用せず、ストリームの実バイト数を450,000 bytesで制限。文章1,200文字、参考画像最大256×256のRGBA、元スキン64×64のRGBAだけを受理する。任意URLや任意モデルの指定は受け付けない。
3. Turnstile Siteverifyの成功、hostname完全一致、`action=skin-maker`を確認する。トークンは毎回使い切り、失効・エラー時に生成ボタンを無効化する。
4. Cloudflareの`CF-Connecting-IP`を秘密saltによるHMAC-SHA256へ変換する。D1の**単一INSERT SELECT**で、同じIPの60秒内1回・UTC日次5回・全体UTC日次100回を同時に確認し予約する。複数PoPのメモリカウンターや非atomicなread→writeに依存しない。
5. 予約後のみ`env.AI.run('@cf/zai-org/glm-5.3-flash', ...)`を1回呼ぶ。出力上限12,000 tokens、`reasoning_effort=low`、`store=false`、サーバー側240秒timeout。クライアント待ちは270秒。自動retry・他モデルへのfallbackはしない。
6. 失敗・拒否・出力不正でも予約を戻さない。応答にupstreamエラー本文や入力を含めない。危険な出力・画像埋め込み・任意コードを実行する仕組みはない。

IPv6のアドレス変更や分散したアクセスでは個別上限を回避できるが、全体上限100回/日は残る。IP共有環境では上限を共有する。公開前にCloudflare WAFで当該POSTルートへの送信数を制限することも検討する。API前段の大量リクエストまでD1予約だけで無料になるわけではない。

2026-09-06確認の[モデル単価](https://developers.cloudflare.com/workers-ai/models/glm-5.3-flash/)は入力$0.15/M、出力$0.50/M。出力が毎回12,000 tokensに達しても100回の出力分は$0.60/日。入力・画像トークン、Workers Paid基本料、D1等は別。これは請求額の固定上限ではない。入力は文字数・画像寸法・元スキンサイズを制限している。実計測例の画像生成は1,936入力+3,116出力tokens（約$0.00185、その他サービス料金を除く）。公開前にダッシュボードで利用量・請求・失敗率を確認し、上限値を見直す。

## アップロードと保存

- 参考画像はローカルでPNG/JPEG/WebP（5 MB以下）を読み、縦横比を保ったまま最大256×256へ縮小し、RGBAにする。元ファイル名・EXIF・位置情報などを送信しない。既存PNGは1 MB以下。
- 送信時の同意チェックで、使用権限とCloudflareのAI処理への送信を明示する。個人情報・秘密を含む画像を避ける案内を9言語で表示する。
- 自サイトでは文章・画像・生成物をD1/R2/KV/localStorageに保存しない。ローカルプレビューの読み込みだけではAIへ送らない。永続的なギャラリー・公開共有機能はない。
- D1には予約ID、UTC日付、IPのHMAC、時刻だけを記録する。成功した予約処理時に48時間より古い行を削除する。アクセスが止まった場合は自動で削除されないので、下記の定期メンテナンスを行う。
- プロンプト・画像・AI応答を`console.log`しない。AI Gatewayを利用していない。将来Gatewayを追加する場合はpayload logging・cacheを有効にしない。[Cloudflareのデータ取扱い](https://developers.cloudflare.com/workers-ai/platform/data-usage/)も確認する。
- モデルへの安全指示は拒否を要求するが、すべての不適切な画像を検出する専用分類器ではない。広範な安全性評価は未実施。公開共有を追加するなら別途モデレーション設計が必要。

## 公開前の設定手順（別途承認後）

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

`npm run probe:skin-maker -- --live`は**実モデルを最大3回呼ぶ有料の明示opt-in**。`CLOUDFLARE_ACCOUNT_ID`と既存Wrangler認証が必要。自作の合成人物画像・文章しか使わず、公開deployや本番DB変更はしない。出力はOS一時ディレクトリ（`SKIN_PROBE_OUTPUT`で変更可能）へ保存する。`--text-edit-only`、`--edit-only`で対象を限定できる。修正元は`SKIN_PROBE_SOURCE`と`SKIN_PROBE_SOURCE_MODEL`で指定可能。開発接続ではAbortSignalを直列化できないため、250秒の待機上限に達したら以降の呼び出しを止めて接続を破棄する。本番の240秒native signalによる中断とは別の検証であり、中断しても費用がゼロになるとは限らない。

## 実測と公開前に残る確認

2026-09-07の実モデル試行では、画像入力からのSkin生成を実行し、髪色・青い目・青緑の服・金色の襟・紺のズボンを持つSlim出力を確認した。初期形式で105.3秒、色対応表形式で81.6秒。後者の頭側面12行を面フィットする回帰fixtureを`tests/fixtures/skin-maker`に収録した（辞書への機械変換のみで、色・各面の絵は変更していない）。正面・背面・側面に穴がないこと、外側レイヤー、64×64 RGBA/PNGの往復を確認した。これは1種類の単純な合成参照画像であり、写真・複雑な衣装・斜め姿勢での忠実度を保証する結果ではない。

初期試行では内部エラー・不整合な色記号・160秒の待機上限が発生した。2026-09-07の再検証では最終面辞書形式で文章生成が139.5秒で成功した。一方、「両目」の修正が片目だけに適用される意味上の失敗を検出したため、全対象の座標を確認する指示を追加し、寸法表も生成時は基本36面、修正時は編集対象面だけに短縮した。修正の入力tokensは2,401から976へ減った。

修正後は実モデルが5.1秒で両目2画素を緑に変更し、それ以外の全RGBAが不変であることを自動比較で確認した。合成fixtureの青い目を検出する意味検証もprobeに追加し、片目だけの修正・無関係な画素の変更は失敗扱いにする。失敗・編集元不成立のskipがあればprobeの終了コードを1にする。成功した文章出力と両目パッチは回帰fixtureに収録し、18件のテストが成功した。

短縮後の文章生成も127.0秒で成功したが、別試行では160秒を超えた。150秒のAPI上限では成功例でも余裕が小さいため、サーバー240秒・ブラウザ270秒・probe250秒へ揃えて延長し、9言語の表示を1〜4分にした。出力token・日次回数上限、自動retryなしは維持した。これは短時間応答を保証する変更ではない。少数の成功例から本番の成功率を断定しない。

その後、別の生成物に対する座標パッチが両目の間の肌も変える問題を意味検証で検出した。色だけの変更を座標パッチから完全一致の`recolors`へ切り替え、2種類の実生成スキンでそれぞれ4画素・2画素の両目のみが変更され、対象外の全RGBAが不変であることを確認した。

| 最終形式の実モデル検証 |    時間 | 入力 / 出力 tokens | 結果                  |
| ---------------------- | ------: | -----------------: | --------------------- |
| 文章 → Classic         | 127.0秒 |        814 / 5,502 | 全基本面・PNG検証成功 |
| 合成参照画像 → Slim    |  81.4秒 |        823 / 3,462 | 全基本面・PNG検証成功 |
| 両目の色置換（4画素）  |   3.3秒 |         1,113 / 42 | 対象外全RGBA保持      |
| 両目の色置換（2画素）  |   2.3秒 |         1,103 / 42 | 対象外全RGBA保持      |

生成例の費用は文章約$0.00287、画像約$0.00185、色置換各約$0.00019（推論のみ）。一般的な成功率の保証ではなく、自作の限定されたテストケースでの実測。現在のモデルが数秒で新規生成を終えるとは案内しない。

Minecraftはインストール済みLauncherの起動とBedrock選択まで進めたが、ユーザーのEsc入力でComputer Useが停止された。以降の画面操作は行っておらず、ゲームでのPNG適用は引き続き未確認。

確認すべき項目：

- 通常のPages binding経由で、文章のみ、写真、イラスト、生成済みPNGの部分修正の成功率・遅延・費用を計測する。長い出力による品質低下やJSON不成立を含め、全体の成功率を評価する。
- 正面・背面・左右・頭頂・足裏・脇・肩の継ぎ目、左右非対称の衣装、外側透明領域を確認する。画像にない背面は推測であることを理解して評価する。
- 目の色だけ、右袖だけ、背中の柄だけを修正し、対象外ピクセルの全バイトを比較する。モデルが意図より広い範囲のパッチを返す可能性も評価する。
- 本物のTurnstileと本番相当D1の同時アクセス・制限・期限切れ・失敗経路を確認する。現時点では合成tokenとSQLiteでのテストのみ。
- Java Editionと対応するBedrock端末でPNGを実際に読み込み、Classic/Slim、帽子・上着・袖・ズボンの外側レイヤーを確認する。**Minecraft実機は未確認。** ゲームの端末・バージョンによるカスタムスキン読み込み可否も公開前に確認する。
- Safari/iPhone/WebGL無効、低速回線、タブを閉じた場合を追加確認する。9言語の文言は翻訳済みだが母語話者レビューは未実施。

参考：[skinview3d](https://github.com/bs-community/skinview3d)、[Workers AI JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)、[Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)。
