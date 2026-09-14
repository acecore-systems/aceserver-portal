# AcecoreID管理ログイン移行

## 状態

サイト側の実装PR。**本番未切替**。既存のrepository権限とAccess policyは維持する。編集者は本人のAcecoreIDへGitHubを連携する。下記のアカウント照会不可の1件は、ユーザー承認により権限を削除せず独立した確認事項に分離し、他の移行を妨げない。本番設定と接続検証・レビューを経て切り替える。

### 2026-09-14 の準備・検証

- 専用issuerは `d46df6f` から配信済み（version `ba38fad0-2e18-4565-b603-d355ddaea0aa`、100%）。登録鍵の指紋一致と `secret_text`、workers.dev / preview URL無効を確認した。秘密値のファイル化を避け、初回配信はCloudflare APIのメモリ内multipartで行った。
- Pages本番に専用Service Bindingを追加した。Preview・既存環境変数・source・現在の本番deploymentは不変。Accessの公開設定3項目も本番Wrangler設定へ明記した。サイトの再配信・ログイン切替は未実施。
- ローカルから専用Appで短期tokenを発行し、対象がPortal 1 repositoryだけであることを確認した。検証用tokenは失効済み。配信済みWorker経由の疎通試験とは区別する。
- 実APIでは管理用認証のcollaborators一覧がpush User 15件なのに対し、専用Appの一覧は200で空だった。個別照会方式で14件の不変ID・push権限が一致した。残る1件は数値ID・ユーザー名・プロフィールが404だが権限登録は残っている。不存在や権限剥奪とは断定せず、登録権限を維持して別途確認する。
- 配信済みWorkerへの認証済みremote Service Binding検証で、`redirect: error` によるruntime TypeErrorを検出した。`manual` と3xx拒否に変更後、POST 200・token契約・no-store・GET 404を確認し、試験tokenを失効した（version `2503eda1-7b53-47e6-a8bc-f92918f8ca9f`）。秘密値を含まない例外分類のみ内部応答ヘッダーへ追加した。

## 認証と認可

- ログインはAcecoreIDのみ。Access JWTのRS256署名・issuer・audience・期限・app種別・AcecoreID subject・GitHub数値IDを検証する。
- メール、表示名、Hatt entitlement、共通CMS AI membershipで編集権限を追加しない。
- 連携済みのGitHub不変IDから現在のloginを解決し、対象repositoryの個別permission応答に同じ不変IDと現在loginが含まれ、base permissionが `write` または `admin` であることを毎回確認する。途中のrename・login再割当て、異常応答、連携なし、権限剥奪はfail-closedで拒否し、保存直前も再確認する。
- ブラウザへGitHub tokenを渡さず、旧Authorization bearerだけではアクセス不可。旧auth/callbackは410でOAuth codeを交換しない。
- 同一origin POSTのみ許可。CMS対象path・容量・削除制限・expected main HEAD・曖昧応答の復旧検証は従来のまま。
- `CMS_ACCESS_AUD`、`CMS_ACCESS_TEAM_DOMAIN`（HTTPSのチームorigin）、`CMS_ACCESS_HOSTNAMES`（本番host）は本番設定が必要。未設定では503。本番以外のhostは設定によらず拒否する。
- Access IdPをAcecoreIDのみに限定し、既存policyを維持したうえで `https://acecore.net/claims/subject` と `https://acecore.net/claims/github-id` をJWTのcustomにマッピングする。共通IdPへのclaim追加は対象サイトの準備状況も確認して行う。

## 保存actor

Portal専用 `cloudflare/cms-token-issuer/` Workerを使用する。App秘密鍵はこのWorkerだけに設定し、Pagesへ置かない。

- Workerは `workers_dev: false`、`preview_urls: false`、公開routeなし。Portal本番の `CMS_GITHUB_TOKEN_ISSUER` Service Bindingだけから呼ぶ。Previewにはbindingを付けない。
- issuerはPortal専用GitHub Appの公開値 `CMS_GITHUB_APP_CLIENT_ID` と `CMS_GITHUB_APP_INSTALLATION_ID` をWorker設定の `vars` に固定し、秘密鍵 `CMS_GITHUB_APP_PRIVATE_KEY` だけをWorker secretにする。別サイトのAppを流用しない。鍵はGit、PR、ログ、Pagesへ載せない。`secrets.required` により、未設定のままWorkerをdeployしない。
- Secrets Storeは1 secretあたり1,024 bytesまででGitHub App RSA PEMを単一値として格納できないため、このWorkerでは使わない。独自分割・符号化は行わず、Worker専用secretを維持する。
- 発行先は `acecore-systems/aceserver-portal` 固定でContents writeのみ。発行応答のrepo・scope・期限・ghs形式を確認する。GitHub応答は64 KiBまで、redirect拒否・8秒timeoutで読み取り、installation tokenはrequest外へcacheしない。呼出元の任意repoや権限指定は受け付けない。
- 本番Workerの作成・secret設定・bindingの成立確認が必要。新規Workerでは `wrangler secret put` を先に実行できないため、最初のdeployは `--secrets-file` で必須secretを渡す必要がある。鍵の作成・既存鍵の読出し・そのファイルへの入力は、このPRでは行わない。承認済みの担当者本人が未追跡のローカル入力ファイルを用意して実行し、その後に安全に取り扱う。今回のPR作成だけでは本番準備完了ではない。
- 検証: `npm run test:cms`、`npx tsc -p cloudflare/cms-token-issuer/tsconfig.json`、`npx wrangler deploy --config cloudflare/cms-token-issuer/wrangler.jsonc --dry-run`。

## 本番切替とロールバック

1. 既存Access policy、全既存編集者、対象repositoryの現在権限を読み取り照合する。本人がAcecoreIDのGitHub連携を行い、同等の利用条件を確認する。秘密allowlist/tokenはログやPRへ記載しない。
2. 保存actorとAccessの本番設定を準備する。許可/拒否・権限剥奪・連携なし・preview・別originを検証する。
3. PR/CI成功、レビュー、merge後のGitHub連携Pages production deployとcustom domainを確認する。Previewや手動Uploadを本番完了にしない。
4. AcecoreIDで実ログインし、読取と承認済みの保存確認を行う。保存の試験は既存コンテンツを無断変更しない。
5. 問題時は旧ソースのGit revert PRと切替前に記録したAccess設定へ戻す。旧OAuth secretsは、全員の利用確認が完了するまで実環境から削除しない。コード上の廃止とsecretの実削除は別作業。

GitHub認可の根拠: [Get a user using their ID](https://docs.github.com/en/rest/users/users#get-a-user-using-their-id)、[Get repository permissions for a user](https://docs.github.com/en/rest/collaborators/collaborators#get-repository-permissions-for-a-user)。
