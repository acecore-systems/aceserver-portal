# 共有Alpha Chat切替

Portalの `/api/alpha-chat` はブラウザの入口として、同一origin検証と既存のWAF・D1レート制限を維持します。ブラウザから共有Workerへ直接通信させません。

- Portalは常に `ALPHA_CHAT_SERVICE.fetch()` だけを呼びます。移行用のローカルOpenAI生成と切替flagはありません。
- Service Bindingがない、または応答が壊れている場合は、選択localeの固定案内を `503` で返します。共有Worker障害時もローカル生成へ戻りません。
- Service Bindingは共有WorkerのPreview/productionデプロイ後に実際のWorker名で追加します。存在しないWorker名や仮のresource IDは設定しません。
- 共有Workerが正史D1、正史Vectorize、モデルsecret、会話ポリシー、RAG選択を所有します。Portalは公開corpusとVectorize同期ジョブの所有者として残ります。

反映順は、共有Workerを先にデプロイして安全な一般質問で検証し、次にPortalのService Bindingを反映します。Previewとproductionはそれぞれの承認・検証ゲートを通し、個人的な過去や未知の正史質問を本番確認に使いません。
