# 多言語コンテンツ運用

Aceserver Portal は、日本語を正本として `ja`、`en`、`zh-cn`、`es`、`pt`、`fr`、`ko`、`de`、`ru` の9言語を公開します。日本語だけは従来どおり prefix なし、他言語は `/{locale}/` です。

## 正本と編集経路

- 固定ページ、ナビゲーション、告知、ワールド設定の日本語正本は `src/content/pages/*.json` と `src/content/site/*.json` です。これらだけが Sveltia CMS から直接保存できます。
- 固定ページの8言語訳は `src/i18n/translations.ts` です。CMS allowlist には含めず、branch と Pull Request でのみ変更します。
- Stories の日本語正本は `src/content/stories/*.md`、8言語訳は `src/content/stories/{locale}/*.md` です。日本語を含め、Stories は CMS から直接保存しません。
- WIKI のルール、コマンド、参加要件、ワールドや稼働状況などの可変情報は Aceserver WIKI を正本とします。Portal の翻訳へ複製せず、WIKIへの導線とAlpha-kunの根拠取得を維持します。

この境界により、日本語CMS保存と翻訳ファイルの二重管理を避けます。

## sourceHash gate

`npm run validate:i18n` は次の同期状態を検証します。

- 固定ページは、対象14ファイルの相対pathとLF正規化内容を連結した SHA-256 が、各localeの `sourceHash` と一致すること。
- 各翻訳Storyは `translationOf` がファイルslugと一致し、日本語Story全体をLF正規化した SHA-256 が `sourceHash` と一致すること。
- 固定ページのpage、section、world、navigation、announcement、placeholderが日本語正本と同じ構造であること。
- Stories の件数、見出しレベル、リンクの役割、コードtokenが日本語正本と対応し、内部リンクとAcecore Systemsリンクが対象localeを使うこと。

日本語正本を変更したときは、翻訳と `sourceHash` を同じPull Requestで更新します。CMSが `main` へ直接保存した場合だけ、`.github/workflows/create-translation-task.yml` が翻訳PR taskを作成します。通常のコードPRは、CIを通すためPR内で翻訳も更新します。

## 検証

```text
npm run format:check
npm run validate:content
npm run test:i18n
npm run test:alpha
npm run test:cms
npm run typecheck:functions
npm run build
git diff --check
```

翻訳時は placeholder、URL、route、製品名、Minecraftコマンド、インラインコード、コードブロックを翻訳しません。失敗した検証や未実施項目はPull Request本文に残します。
