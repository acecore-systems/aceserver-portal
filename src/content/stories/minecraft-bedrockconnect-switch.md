---
title: SwitchからMinecraft統合版の外部サーバーへ接続する方法｜BedrockConnectの使い方
description: Nintendo Switch版Minecraftから、BedrockConnectを使って外部のBedrockサーバーへ接続する手順を解説します。DNS設定、接続先情報の入力、Aceserver参加時の確認事項をまとめました。
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - 統合版
  - Nintendo Switch
  - はじめ方
author: Gui
---

Nintendo Switch版のMinecraft統合版から、公式の特集サーバー以外へ参加したいときは、BedrockConnectを使う方法があります。SwitchのDNSをBedrockConnectへ向け、Minecraftの特集サーバーを入口にして、接続したいBedrockサーバーの一覧を開く手順です。

この記事では、AceserverのようにBedrock版から参加できる外部サーバーへ、Switchから接続する流れをまとめます。接続先のアドレスとポートはサーバーごとに異なるため、必ず各サーバーの公式案内から最新情報を確認してください。

BedrockConnectはMinecraftやNintendoの公式機能ではありません。無料のオープンソースプロジェクトですが、利用前に[公式GitHubのREADME](https://github.com/Pugmatt/BedrockConnect)を確認し、公式リポジトリ以外のアプリやダウンロードは利用しないでください。

## BedrockConnectでできること

Switch版Minecraftには、任意の外部サーバーを直接登録するための一般的なサーバー一覧画面がありません。BedrockConnectでは、次のようにDNSと特集サーバーを入口として、接続先を入力する画面を開きます。

1. SwitchのDNS設定をBedrockConnectに変更する
2. Minecraftの「サーバー」タブから、対応する特集サーバーへ入る
3. BedrockConnectの画面で、目的のサーバーのアドレスとポートを入力する
4. BedrockConnectから目的のサーバーへ移動する

DNSを変更しても、接続先のサーバーがBedrock版に対応していなければ参加できません。また、DNSの数値や画面表示は将来変更される可能性があるため、この記事の数値よりも[BedrockConnect公式README](https://github.com/Pugmatt/BedrockConnect)の最新案内を優先してください。

## 事前に用意するもの

- Minecraft統合版が動作するNintendo Switch
- MinecraftとMicrosoftアカウントでオンラインプレイできる状態
- 接続先サーバーが公開しているBedrock版のアドレスとポート
- 変更前のSwitchのDNS設定に戻せるようにするための、現在のネットワーク設定

Aceserverへ参加する場合は、まず[エースサーバーポータル](/)と[公式Discord](https://discord.gg/acsv)から現在の参加案内を確認してください。ルールや参加後のDiscord連携など、更新される情報は[Aceserver WIKI](https://asv-wiki.acecore.net)を正とします。

## 手順1：SwitchのDNSを手動設定する

1. Switchの「設定」を開き、「インターネット」から「インターネット設定」を選びます。
2. 接続中のネットワークを選び、「設定の変更」を開きます。
3. 「DNS設定」を「自動」から「手動」に変更します。
4. BedrockConnect公式READMEに掲載されている現在の値を入力します。2026年8月6日時点の案内では、次の値です。
   - 優先DNS：`104.238.130.180`
   - 代替DNS：`8.8.8.8`

5. 設定を保存し、接続テストを実行します。

この設定はSwitchのネットワーク接続に適用されます。BedrockConnectを使い終わったら、同じ画面でDNS設定を「自動」に戻せます。

## 手順2：MinecraftからBedrockConnectを開く

1. Minecraftを起動し、Microsoftアカウントでサインインします。
2. 「プレイ」から「サーバー」タブを開きます。
3. 次のいずれかの特集サーバーへ接続します。
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

これらは、BedrockConnect公式READMEでDNS方式のリダイレクト対応として案内されている特集サーバーです。接続すると、通常の特集サーバーではなくBedrockConnectのサーバー一覧が表示されます。

一覧が表示されず通常の特集サーバーへ入った場合は、DNSの入力値を確認してから、別の対応サーバーでも試してください。ゲームやネットワークを再起動すると改善することもあります。

## 手順3：接続先のサーバーを登録する

BedrockConnectの画面が表示されたら、次の手順で外部サーバーを登録します。

1. `Connect to a Server`を選びます。
2. `Server Address`に、接続先サーバーのドメイン名またはIPアドレスを入力します。
3. `Server Port`に、接続先サーバーが案内しているBedrock用ポートを入力します。`19132`が使われることもありますが、サーバーごとの案内を優先してください。
4. `Display Name`に、一覧で分かりやすい名前を入力します。この項目は任意です。
5. 次回から入力を省略したい場合は、`Add to server list`をオンにします。
6. 送信ボタンを選び、接続を開始します。

登録情報を変更したいときは、`Manage Server List`から`Edit a Server`を開き、対象のサーバーを選んで編集します。

## Aceserverへ参加する場合

AceserverはJava版と統合版のどちらからでも参加できる公開Minecraftサーバーです。ただし、BedrockConnectの画面に入力する接続先アドレスとポートは、運用状況によって変更される可能性があります。

そのため、次の順番で確認してください。

1. [エースサーバーポータル](/)から最新の参加案内を確認する
2. [公式Discord](https://discord.gg/acsv)で現在の接続先アドレスとポートを確認する
3. その情報をBedrockConnectの`Server Address`と`Server Port`へ入力する
4. 参加後は[Aceserver WIKI](https://asv-wiki.acecore.net)でルールと必要なDiscord連携を確認する

古いブログ記事やスクリーンショットに掲載されたIPアドレスを、そのまま使わないようにしましょう。接続先が変わっている場合やメンテナンス中の場合は、公式Discordの案内を優先してください。

## うまく接続できないとき

### BedrockConnectの一覧が表示されない

- SwitchのDNS設定が「手動」になっているか確認する
- 優先DNSと代替DNSの入力ミスがないか確認する
- BedrockConnect公式READMEに掲載された最新のDNS値を確認する
- 対応している別の特集サーバーから接続してみる
- MinecraftとSwitchのネットワーク接続を再起動する

### 一覧は表示されるが、目的のサーバーへ入れない

- `Server Address`が現在の案内と一致しているか確認する
- `Server Port`がJava版用ではなくBedrock版用になっているか確認する
- 接続先サーバーがBedrock版からの参加を受け付けているか確認する
- 接続先のメンテナンスやアクセス制限がないか、公式案内を確認する

### 設定を元に戻したい

Switchの「設定」→「インターネット」→「インターネット設定」から使用中のネットワークを開き、DNS設定を「自動」に戻して保存してください。

## 利用時の注意

BedrockConnectは、公式サーバーの機能を追加するものではなく、DNS方式で特集サーバーからBedrockConnectの一覧へ接続する外部サービスです。ゲームの更新やサービス側の変更によって、手順が使えなくなる可能性があります。

BedrockConnect公式READMEでは、同名の非公式モバイルアプリはプロジェクトと関係がないと案内されています。アプリのインストールやアカウント情報の入力を求められた場合は、[公式GitHub](https://github.com/Pugmatt/BedrockConnect)の案内と照合してください。

## まとめ

Switchから外部のMinecraft統合版サーバーへ接続するには、BedrockConnectのDNS方式が使えます。DNSを設定し、対応する特集サーバーからBedrockConnectを開いたあと、接続先のアドレスとポートを入力するだけです。

Aceserverへ参加する場合は、固定された古い接続情報ではなく、[エースサーバーポータル](/)、[公式Discord](https://discord.gg/acsv)、[Aceserver WIKI](https://asv-wiki.acecore.net)の最新案内を確認してから入力してください。

## 参考リンク

- [BedrockConnect公式GitHub README](https://github.com/Pugmatt/BedrockConnect)
- [Aceserver公式ポータル](/)
- [Aceserver WIKI](https://asv-wiki.acecore.net)
- [参考にしたSwitchから外部サーバーへ接続する解説](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
