# SEO改訂と自動翻訳の分担

2026年10月24日の利用者決定。SEO処理は日本語正本の調査・改訂・AI校閲・Draft PRで終了する。日本語PRの統合後、既存の翻訳処理が8言語へ反映する。

## 翻訳待ち

SEO runnerは整形済み日本語に対し `node scripts/stage-seo-translation.mjs --source <日本語path> --base-sha <改訂元commit>` を実行する。`src/i18n/pending-seo-revisions.json` に新正本hash、元正本とhash、既存8訳のhashを記録する。翻訳本文・翻訳済みhashを偽更新しない。

検証は、宣言と一致する新正本に対して原バイトhashが保持された旧訳だけを元正本と比較する。変更された訳は現行正本との通常検査へ戻る。翻訳待ち宣言なし・正本不一致・旧訳改ざんは許可しない。旧訳は既存URLで保持し、その更新日を日本語改訂日に偽更新しない。

完了後の宣言は通常検査を免除しない。次回SEO stagingで全訳更新済みの宣言を除去する。翻訳待ちの同一記事を再度stagingしない。通常の翻訳と同様に、検証・PR・統合・公開の各状態を区別する。

## 既存翻訳taskへの接続

mainへの日本語Stories更新は、CMS commitでなくても、commit範囲の元正本・新正本・8訳不変が翻訳待ち宣言と一致するときに既存Copilot翻訳taskへ渡す。固定ページと任意の通常PRへ対象を広げない。既存の署名付きsource契約・重複PR検査・翻訳PRの検証とマージ条件は維持する。Draft branchでは翻訳taskを起動しない。
