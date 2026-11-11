# Discord参加ボタンの匿名集計

公式ポータルから専用招待を開く操作を、掲載位置（`home`、`story`、`alpha`）と表示言語だけで集計します。本文は固定値の `placement` と `locale` のみで、識別子、IP、ユーザーエージェント、URL、クエリ、招待コード、Cookieをデータポイントに書きません。ブラウザーはCookieとRefererを送らず、記録の成否を待たずにリンクを開きます。JavaScript無効・ブロック・通信失敗などは計測されず、計測値は参加完了数でもユニーク人数でもなく、重複操作や不正な送信も含まれ得ます。Search Consoleのクリック数やDiscordの招待利用数とは別です。通常のHTTP通信に伴うCloudflare側のアクセス処理は別途適用されます。

Pages productionの `DISCORD_CTA_METRICS` binding は `portal_discord_cta` dataset に書き込みます。プレビューにはbindingを設定せず、送信失敗でもリンクを利用できます。datasetは初回書込時に作成されます。データ保持は3か月で、高トラフィック時のサンプリングを考慮して `_sample_interval` を合計します。Workers Analytics Engine SQL APIを利用できる既存アカウントの権限で、次のSQLを実行します（資格情報はログやリポジトリに保存しない）。

```sql
SELECT blob1 AS placement, blob2 AS locale, SUM(_sample_interval) AS clicks
FROM portal_discord_cta
WHERE timestamp >= NOW() - INTERVAL '7' DAY
GROUP BY placement, locale
ORDER BY clicks DESC
```

デプロイ後はPagesのproduction binding・対象commitを確認し、実際のクリックについてSQLで到達を確かめます。初回データが記録されるまでdatasetは存在しません。`204` は送信が受け付けられたことを示し、集計への到達確認の代わりにはなりません。Analytics EngineはFree/Workers Paidとも枠があり、Cloudflareは将来の課金予定を案内しているため利用量と最新料金を確認します。

参考: [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)、[Analytics Engine SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)、[料金](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)、[制限と保持期間](https://developers.cloudflare.com/analytics/analytics-engine/limits/)。
