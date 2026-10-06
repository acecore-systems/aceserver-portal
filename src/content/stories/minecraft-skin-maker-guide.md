---
title: 'スキンメーカーの使い方｜文章・画像から作って3Dで確認'
description: 'Aceserverのスキンメーカーで、文章と任意の参考画像から新しいスキンを作り、Classic・Slimの型、3D表示、64×64 PNG保存を確認する手順を紹介します。'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-cover-v2.webp
imageAlt: '白いブロック人形と絵具パレットによるスキン作成の説明用イラスト。生成スキンの実例ではない。'
relatedStories: [aceserver-beginners-guide]
lastUpdated: 2026-10-06T08:52:00+09:00
---

文章や任意の参考画像から、Minecraft用の新しいスキンを作れる[スキンメーカー](/skin-maker/)があります。生成した見た目は3D表示で確認し、64×64 PNGとして保存できます。

## 1. 腕の型とイメージを選ぶ

Classicは4px、Slimは3pxの腕です。作りたい色や服装などを文章で書きます。参考画像は任意で、PNG・JPEG・WebP、5 MBまでです。既存のスキンを編集するモードではなく、新規生成のツールです。

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">ClassicとSlimの腕の違い</strong><span>腕の横幅を表す模式図です。生成スキンの実例ではありません。ゲーム側でも、作成時と同じ型を選びます。</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="腕の幅は4px" width="240" height="300" loading="lazy" decoding="async"/><span>腕の幅は4px</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="腕の幅は3px" width="240" height="300" loading="lazy" decoding="async"/><span>腕の幅は3px</span></li></ol></figure>

## 2. 同意して生成を待つ

入力を送る前に、画像を使う権利とAI処理への同意を確認します。文章・画像は設定中のOpenAI APIまたはCloudflare Workers AIに送られます。個人情報や秘密を含む入力は使わないでください。生成には数分かかることがあり、利用制限や混雑で生成できない場合もあります。画面の案内を確認してください。

## 3. 3D表示で確かめる

生成できたら正面・背面・左右から確認します。ドラッグで回転でき、自動回転と外側レイヤーの表示も切り替えられます。AIの出力が意図した姿になるとは限らないため、保存前に腕や服の境目なども見てください。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">生成から保存までの確認順序</strong><span>生成には同意が必要です。生成後も、見た目を確認してから保存します。</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>文章・任意画像で生成</strong><span>権利とAI処理への同意を確認して送る。</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>3Dで各方向を確認</strong><span>正面・背面・左右、腕や服の境目を見る。</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>64×64 PNGを保存</strong><span>ページを閉じる前に保存し、同じ型でゲームへ読み込む。</span></li></ol></figure>

## 4. 保存してゲーム側で読み込む

「64×64 PNGを保存」からダウンロードし、ゲーム側のカスタムスキン読み込み機能を使います。ゲームでも生成時と同じClassic・Slimの型を選びます。端末やゲームの版によって読み込み方法や対応が異なるため、使えることを一律には保証しません。サイトは文章・画像・スキンを保存せず、ページを閉じると作業内容が消えるので、必要なPNGを先に保存してください。
