# CMS 書き込み branch 運用

最終確認日: 2026-06-19

## 現在の live 状態

- GitHub repository: `acecore-systems/aceserver-portal`
- GitHub default branch: `main`
- CMS backend: `public/admin/config.yml` の `backend.name: github`
- CMS OAuth backend: `https://sveltia-cms-auth.sparkling-tree-7cef.workers.dev`
- CMS production 保存先: `cms-content`
- `cms-content`: branch は存在し、GitHub API 上は unprotected
- `cms-content`: `main` との差分は `ahead_by: 0`、`behind_by: 20` で、未反映 CMS commit はなし
- `main`: GitHub branch API 上の `protected` は `false`、required status checks の enforcement は off
- Branch protection / ruleset 詳細 API: private repository の plan 制限で取得不可

Cloudflare Pages は次の状態を API で確認済みです。

- Project: `aceserver-portal`
- Git Provider: Yes (`source.type: github`)
- Source repository: `acecore-systems/aceserver-portal`
- Production branch: `main`
- Latest production deploy: `github:push`、branch `main`、commit `ca596e4e04f6b123b6ea1250b07fdfacedeb06a6`、status `success`
- Custom domain: `asv.acecore.net` は `active`

## 判断

`main` は本番ソースの唯一の正にします。Cloudflare Pages の production deploy 元も GitHub 連携の `main` だけにします。

一方で、現在の Sveltia CMS は GitHub OAuth 経由で保存します。このまま CMS の保存先を `main` にすると、編集者個人の GitHub 権限で `main` に commit する形になり、次の条件を満たせません。

- 書き込み主体を専用 bot / GitHub App / backend に限定する
- 書き込み可能 path を `src/content/**` と `public/uploads/**` などに限定する
- schema / build / lint などの検証を通してから `main` に入れる
- `main` protection の bypass を専用 actor だけに限定する

そのため、`cms-content` は暫定の CMS 投稿受け皿として残します。ただし、`cms-content` を本番 deploy 元にはしません。

## 現行フロー

1. Sveltia CMS が `cms-content` に保存する。
2. `.github/workflows/cms-content-pr.yml` が `cms-content` と `main` の差分を確認する。
3. 差分が `src/content/**` と `public/uploads/**` のみであれば、`main` 向け PR を作成する。
4. PR CI が `npm run format:check`、`npm run validate:content`、`npm run build` を実行する。
5. レビュー後、merge commit または rebase merge で `main` に入れる。
6. Cloudflare Pages が GitHub `main` push を受けて production deploy する。
7. `.github/workflows/cms-content-sync.yml` が、未反映 CMS commit がない場合だけ `cms-content` を `main` に fast-forward する。

CMS PR は squash merge しません。squash merge では `cms-content` の commit が `main` から到達不能になり、自動同期が安全に fast-forward できません。

## `cms-content` の扱い

`cms-content` は恒久的な別本流ではありません。現在は CMS の投稿受け皿としてのみ使います。

`cms-content` に未反映 commit がある場合、同期 workflow は自動更新を止めます。この場合は open CMS PR を確認し、content-only であれば `main` に merge してから再同期します。content-only でない場合は PR を merge せず、差分を取り除いてから再保存します。

## 廃止条件

次のどちらかを満たしたら `cms-content` を削除候補にします。

- CMS backend を専用 GitHub App / bot / backend actor に移し、content-only PR を直接 `main` 向けに作れる。
- `main` protection の bypass を専用 actor だけに限定し、path 制限と `format:check` / `validate:content` / `build` 相当の検証を必須にできる。

廃止時は `public/admin/config.yml`、`scripts/write-cms-runtime-config.mjs`、`public/admin/init.js`、関連 GitHub Actions を同時に更新し、`cms-content` に未反映差分がないことを確認してから branch 削除します。
