# 検索インデックス同期の実行条件

Cloudflare Pagesの成功したcheck_runを契機に同期を開始します。GitHub App ID・名前・成功状態を確認し、
イベントのSHAが公開ビルド情報と一致し、protected mainの祖先である場合だけ対象にします。
previewや古いデプロイ通知では変更しません。保護されたmainの同期ツールを使い、公開中のcommitをビルドします。
デプロイ完了をrunner内で待つループは使用しません。

6時間ごとのscheduleは通知欠落・遅延時の補完として維持します。公開検索データ版・ツール版・indexが直前の
成功した実行のreceiptと一致し、全件照合から24時間未満なら依存取得、build、Vectorize照合を省略します。
軽量な公開ビルド確認は毎回行います。省略した実行でも元の全件照合時刻を引き継ぐため、監査が無期限に延期されません。

receiptはGitHub Actions artifactとして3日保持します。直前の失敗・cancel・実行中を飛び越えて過去の成功を
採用しません。artifact欠落・破損・API障害、再実行、ツール変更、データ変更、24時間経過では全件照合します。
成功記録は同期が成功し、公開commitとデータ版がまだ一致することを確認した後だけ保存します。
削除上限、upsert後の削除順序、Vectorize検証、環境の承認境界は従来どおりです。

手動実行は`force_reconcile: true`が既定です。運用検証で明示的にfalseを指定した場合だけ通常の省略判定を使います。
通常の成功通知だけで実行済みと判断せず、`portal_sync_preflight`の`reconcile`と同期ログを確認します。

検証: `npm run test:portal-vectorize`、`npm run format:check`、`npm run build`。
