# 共有Alpha Chat切替

Portalの `/api/alpha-chat` はブラウザの入口として、同一origin検証と既存のWAFレート制限を維持します。共有モードではブラウザから共有Workerへ直接通信させません。

- `ALPHA_CHAT_SHARED_ENABLED=false` は移行用の既存実装です。共有Worker未配備の状態で既存の本番チャットを止めないためにだけ残します。
- `ALPHA_CHAT_SHARED_ENABLED=true` のときは `ALPHA_CHAT_SERVICE.fetch()` だけを呼びます。Service Bindingがない、または応答が壊れている場合は `503` と固定案内を返し、ローカルOpenAI処理へ戻りません。
- Service Bindingは共有WorkerのPreview/productionデプロイ後に実際のWorker名で追加します。存在しないWorker名や仮のresource IDは設定しません。
- 共有Workerが正史D1、正史Vectorize、モデルsecret、会話ポリシー、RAG選択を所有します。Portalは公開corpusとVectorize同期ジョブの所有者として残ります。

切替順は、共有WorkerをデプロイしてからService Bindingを追加し、Previewで通常質問・正史の初回生成・再利用・直後の続きを確認した後にproduction flagを有効化します。
