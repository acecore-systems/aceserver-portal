# スキンストア

`/skin-maker/store/` と8翻訳localeに、利用者が公開に同意した生成スキンを新着順で表示する無料のストアを追加する。購入・課金・会員登録は不要。生成画面とストアは共通のナビゲーションで行き来できる。

## 利用の流れ

1. スキンメーカーで生成する。生成だけではスキンを保存・公開しない。
2. スキンの名前（40文字以内）を入力し、誰でも無料でダウンロード・使用できることに同意して公開する。
3. ストアで名前の検索、Classic／Slimの絞り込み、24件ずつの追加読み込みができる。カードは正規UVから作った全身サムネイル。詳細を開くと同じPNGを3D表示する。WebGLがない場合もサムネイルとPNG保存は使える。
4. 公開した本人は、生成後24時間以内、この生成画面を開いている間に公開を取り消せる。画面を閉じたり新しいスキンを生成したりすると操作キーは失われる。入力文・参考画像・公開操作キーは永続保存しない。それ以降の取り下げは運営へ依頼する。

過去の生成物は保存していなかったため、過去に作ったスキンは一覧へ復元できない。公開された実作品がない場合は空の状態と作成へのリンクを表示する。架空の作品を本番に混ぜない。

## データとAPI

- 保存先は既存の `SEARCH_RATE_LIMIT_DB` に追加する独立テーブル `skin_store`。新しいR2 bucketやsecretは不要。PNGをbase64で保存し、入力文・参考画像・IPを作品テーブルへ保存しない。
- `SKIN_STORE_ENABLED` は生成とは独立したフラグ。root／Previewは `false`、productionは `true`。生成機能を一時停止しても公開済みのストアは利用可能。
- `GET /api/skin-store?model=all|classic|slim&q=...&cursor=...`：公開作品のmetadataと小さなサムネイルだけを最大24件返す。`created DESC, id DESC` による安定したページング。検索の `%`・`_` は文字として扱う。
- `GET /api/skin-store?id=UUID`：公開作品のmetadataと64×64 PNG data URL。
- `GET /api/skin-store?id=UUID&download=1`：PNG本体。腕タイプ入りの固定ファイル名でdownloadする。
- `POST /api/skin-store`：名前、腕タイプ、生成RGBA、署名済みticket、公開同意。入力文・参考画像・任意ファイルは受理しない。
- `DELETE /api/skin-store`：本人の削除ticketで公開を取り消す。PNG・サムネイルを空にして非公開状態を残す。同じticketでの再公開を防ぐ。すでに利用者が保存したPNGを回収することはできない。
- `POST /api/skin-store?action=report`：作品IDと固定の通報理由だけを受理する。

生成APIは、出力ピクセルのSHA-256・腕タイプ・生成ID・origin・有効期限・用途を `SKIN_QUOTA_SALT` でHMAC署名した24時間のticketを返す。ticketそのものは保存しない。AI部分修正は現在画像と一致する有効な生成ticketがある場合だけ、修正結果の新しいticketを返す。手編集後は公開ticketを外し、手編集→AI部分修正もPNG保存だけに対応する。Undoで署名済み結果へ戻れば公開できる。公開済み作品は編集で書き換えない。公開APIで署名とピクセルを再確認するため、画像の差し替え・型の変更・生成外の任意アップロードはできない。生成とAI修正の共通上限（全体100回/UTC日）と作品IDの一意制約で新規投稿を制限する。応答喪失後の再送は同じ作品と取り消しticketを返し、重複投稿を作らない。

POST／DELETEは同一originだけを許可し、実ストリームを28,000 bytesで制限する。名前の表示はtextContentで行う。公開一覧・詳細・PNGは `no-store` とし、公開の取り消しや運営非公開化が新しい取得に反映される。APIは未設定・migration未適用・DB障害時に503。例外本文やticketをログに出さない。

## 通報と運営対応

通報理由は「不適切な内容」「権利に関する問題」「その他」の固定値。自由文や連絡先を収集しない。IPを用途別のHMACへ変換し、1作品への通報は1回/UTC日、利用者合計5回/UTC日、サイト全体500回/UTC日に単一SQLで制限する。通報による自動非公開化は行わない。運営が内容を確認して判断する。

運営は公開後の通報を確認し、問題のある作品を非公開化する担当と頻度をリリース前に決める。専用の管理UIや自動分類器は今回含まない。

```sql
SELECT s.id, s.name, s.model, count(*) AS reports
FROM skin_store_reports r JOIN skin_store s ON s.id = r.skin_id
WHERE s.state = 'published'
GROUP BY s.id ORDER BY reports DESC;

-- 対象UUIDを確認してから実施する。blockedは一覧・詳細・PNGから即時除外される。
UPDATE skin_store SET state = 'blocked' WHERE id = '対象UUID' AND state = 'published';
-- 誤判定の復旧は運営が対象を再確認して行う。
UPDATE skin_store SET state = 'published' WHERE id = '対象UUID' AND state = 'blocked';

DELETE FROM skin_store_reports WHERE created < unixepoch() - 604800;
```

通報記録は成功した通報時に7日超を削除する。厳密なTTLではないので、既存の予約・診断データの定期メンテナンスにも上記DELETEを追加する。

## リリース

本番DB変更・マージ・本番反映は実装PR作成とは別の承認対象。GitHub連携Pagesを使用する。

1. ローカルSQLiteと隔離したPreview DBへ `0003_store.sql` を適用して確認する。現行のPreview bindingは本番検索DBなので、そのまま有効化・書き込み確認しない。
2. CI・画面確認・差分レビュー後に、本番DBへの追加テーブル適用とmainへのマージについて承認を得る。
3. 本番DBを確認・バックアップし、先にmigrationを適用する。既存の検索・予約・診断テーブルは変更しない。

   ```powershell
   npx wrangler d1 execute SEARCH_RATE_LIMIT_DB --env production --remote --file migrations/skin-maker/0003_store.sql
   ```

4. PRをmainへマージし、Git Provider: Yes、source repo、production branch main、github:push由来deploy成功、custom domain activeを確認する。
5. 公開build metadataと対象commit、9言語のストアを確認する。利用者が明示して行う実生成→公開→一覧→PNG保存→取り消しを受入確認する。
6. 緊急停止は `SKIN_STORE_ENABLED=false`。生成APIは引き続き既存の機能フラグで制御する。

## 開発検証

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

テストは実際のSQLiteにmigrationを適用し、生成ticketの改変・期限・型・origin、公開同意、任意入力拒否、PNG一致、重複再送、取り消し後の再公開拒否、検索、同一時刻ページング、運営非公開、通報のquotaを検証する。画面確認には隔離したローカルDBとfixtureを使用し、実AI呼び出しや本番への試験投稿はしない。
