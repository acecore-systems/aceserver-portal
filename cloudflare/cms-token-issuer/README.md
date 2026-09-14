# Portal CMS秘密鍵の保存先

専用GitHub Appの秘密鍵はCloudflare Secrets Storeの
`aceserver-portal-production-github-app-private-key`を正本とする。
`CMS_GITHUB_APP_PRIVATE_KEY_STORE.get()`でリクエストごとに読み、鍵はキャッシュしない。
欠落・空値・読取失敗では503を返し、旧Worker secretへのfallbackは行わない。

公開URL・Pagesへの秘密鍵配布・別repositoryへの権限追加は行わない。
既存のPortal限定・Contents write限定の短期token契約とPages側の認可を維持する。
この変更は保存先の移行であり、操作結果のみを返す方式への全面移行ではない。

## 反映と更新

1. 対象Appと一致する鍵を上記Store名へ保存（scope Workers）。値をGit・ログへ書かない。
2. 型生成、CMSテスト、issuer型検査、dry-run、CIを確認してPRをmainへマージする。
3. 専用Workerをこのconfigでdeployし、本番CMSのsessionと記事一覧のreadを確認する。
4. 確認後に旧Worker secret `CMS_GITHUB_APP_PRIVATE_KEY`を削除する。先に削除しない。

更新時も同じStore名を使う。GitHub上の旧鍵を失効させる前に本番readを確認する。
ロールバックで旧コードへ戻す場合は、旧Worker secretの有無を先に確認する。
Pagesや他サイトの秘密情報の移行完了を意味しない。
