---
title: 'Minecraftスキンメーカーの使い方｜文章・画像で作成、3D編集・PNG保存'
description: 'Aceserverのスキンメーカーで、文章と任意の参考画像から新しいスキンを作り、Classic・Slimの型、3D表示、64×64 PNG保存を確認する手順を紹介します。'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-cover-v2.webp
imageAlt: '白いブロック人形と絵具パレットによるスキン作成の説明用イラスト。生成スキンの実例ではない。'
relatedStories: [aceserver-beginners-guide]
lastUpdated: 2026-10-09T15:00:00+09:00
---

文章や任意の参考画像から、Minecraft用の新しいスキンを作れる[スキンメーカー](/skin-maker/)があります。生成した見た目は3D表示で確認し、64×64 PNGとして保存できます。

初めてなら、腕の型を選び、服装と色を短い文章で指定して一体作るところから始めます。保存したPNGを使う前に、Minecraft公式の[スキンの説明と変更方法](https://www.minecraft.net/en-us/article/what-is-minecraft-skin)で、自分の版・端末が画像の読み込みに対応するか確認してください。ストアへ公開しなくても、PNGを保存して使えます。

## 1. 腕の型とイメージを選ぶ

Classicは4px、Slimは3pxの腕です。作りたい色や服装などを文章で書きます。参考画像は任意で、PNG・JPEG・WebP、5 MBまでです。生成後は「スキンを編集」で部位・面・レイヤーを選び、ペンや塗りつぶしで修正できます。AIで修正するときは四角い範囲・表示中の面・部位を選び、現在のスキンと修正指示の送信に同意して実行します。範囲外のピクセルは保持され、手編集とAI修正は元に戻す・やり直すが使えます。手編集中はAIへ送信しません。AI修正は生成と共通の利用上限に数えます。

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">ClassicとSlimの腕の違い</strong><span>腕の横幅を表す模式図です。生成スキンの実例ではありません。ゲーム側でも、作成時と同じ型を選びます。</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="腕の幅は4px" width="240" height="300" loading="lazy" decoding="async"/><span>腕の幅は4px</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="腕の幅は3px" width="240" height="300" loading="lazy" decoding="async"/><span>腕の幅は3px</span></li></ol></figure>

3Dモデルにはペンで直接描けます。右ドラッグや余白のドラッグで回転し、ホイールで拡大します。スマホでは道具を「回転・拡大」に切り替えます。「選択した部位だけを表示」で腕の内側なども編集できます。基本レイヤーの編集中は外側を隠します。細かい調整には選択面の2Dエディターも使えます。

## 2. 同意して生成を待つ

入力を送る前に、画像を使う権利とAI処理への同意を確認します。文章・画像は設定中のOpenAI APIまたはCloudflare Workers AIに送られます。個人情報や秘密を含む入力は使わないでください。生成には数分かかることがあり、利用制限や混雑で生成できない場合もあります。画面の案内を確認してください。

## 3. 3D表示で確かめる

生成できたら正面・背面・左右から確認します。ドラッグで回転でき、自動回転と外側レイヤーの表示も切り替えられます。AIの出力が意図した姿になるとは限らないため、保存前に腕や服の境目なども見てください。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">生成から保存までの確認順序</strong><span>生成には同意が必要です。生成後も、見た目を確認してから保存します。</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>文章・任意画像で生成</strong><span>権利とAI処理への同意を確認して送る。</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>3Dで各方向を確認</strong><span>正面・背面・左右、腕や服の境目を見る。</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>64×64 PNGを保存</strong><span>ページを閉じる前に保存し、同じ型でゲームへ読み込む。</span></li></ol></figure>

## 4. 保存してゲーム側で読み込む

「64×64 PNGを保存」からダウンロードし、ゲーム側のカスタムスキン読み込み機能を使います。ゲームでも生成時と同じClassic・Slimの型を選びます。端末やゲームの版によって読み込み方法や対応が異なるため、使えることを一律には保証しません。サイトは入力文・参考画像を保存しません。公開していないスキンはページを閉じると消えるので、必要なPNGを先に保存してください。

## 5. 希望する作品をストアに公開する

生成後に名前を付け、誰でも無料でダウンロード・使用できることに同意すると、[スキンストア](/skin-maker/store/)に公開できます。公開は任意で、名前と生成スキンだけが保存されます。生成後24時間以内、この生成画面を開いている間は公開を取り消せます。

## 6. ストアのスキンを複製して編集する

ストアのカードや3D詳細で「複製して編集」を選ぶと、スキンメーカーでコピーを開けます。腕の型と元のピクセルを引き継ぎ、3Dで手描きしたり、同意してAIで部分修正したりできます。元の作品は上書きしません。編集結果はPNGで保存でき、名前と公開への同意を入力すると別の作品としてストアに登録できます。複製しただけでは公開されません。公開後にさらに編集した場合も、新しい作品として登録します。コピーの取り消しは元の作品に影響しません。

コピーの公開は複製後24時間以内、元の作品が公開中の場合に行えます。公開と取り消しの操作キーはこの画面だけに保持します。複製や手編集はAI利用枠を使いません。AI部分修正は生成と共通の利用上限に数えます。コピーの公開は1日5作品、1分に1作品までで、サイト全体の上限もあります。
