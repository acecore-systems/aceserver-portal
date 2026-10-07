---
title: '皮肤制作器使用指南：文字、图片生成与3D检查'
description: '从文字和可选图片生成Minecraft新皮肤，选择Classic或Slim，查看3D效果并保存64×64 PNG。'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-cover-v2.webp
imageAlt: '用白色方块人偶和调色板表现皮肤制作的说明插画，并非生成结果实例。'
relatedStories: [aceserver-beginners-guide]
translationOf: minecraft-skin-maker-guide
sourceHash: sha256:417830da11a893bd01fad6116a244c4a149a4cf163397414588057a87b317f1d
lastUpdated: 2026-10-07
---

[皮肤制作器](/zh-cn/skin-maker/)可用文字和可选参考图片生成Minecraft新皮肤，随后查看3D效果并保存64×64 PNG。

## 1. 选择手臂类型与外观

Classic手臂为4px，Slim为3px。用文字描述颜色、服装等。参考图可选，支持PNG、JPEG、WebP，最大5 MB。生成后可在“编辑皮肤”中选择部位、面和图层，用画笔或填充修改像素。AI修改可选择矩形、当前面或部位，同意发送当前皮肤和修改指示后执行。范围外的像素保持不变。手动和AI修改均支持撤销与重做。手动绘制不会发送给AI。AI修改与生成共用次数限制。

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">Classic与Slim的手臂区别</strong><span>示意图用于说明手臂宽度，并非生成皮肤的实例。 在游戏中也请选择与创建时相同的模型。</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="手臂宽4px" width="240" height="300" loading="lazy" decoding="async"/><span>手臂宽4px</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="手臂宽3px" width="240" height="300" loading="lazy" decoding="async"/><span>手臂宽3px</span></li></ol></figure>

可以用画笔直接在3D模型上绘制。右键拖动或拖动空白处可旋转，滚轮可缩放。触屏请选择“旋转 / 缩放”。“只显示选中的部位”可方便地编辑手臂内侧。编辑基础图层时会隐藏外层。精细调整也可以使用选中的2D面。

## 2. 同意处理并等待生成

发送前确认图片使用权及AI处理同意。文字和图片会发送到配置中的OpenAI API或Cloudflare Workers AI。不要输入个人信息或秘密。生成可能需要几分钟，也可能因用量限制或拥堵失败，请查看屏幕提示。

## 3. 检查3D效果

查看正面、背面和左右侧，拖动旋转，可切换自动旋转和外层显示。AI输出可能与预期不同，保存前检查手臂及服装接缝。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">从生成到保存的检查顺序</strong><span>生成需要同意。生成后先检查外观，再保存。</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>用文字和可选图片生成</strong><span>发送前确认使用权和AI处理同意。</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>从各方向检查3D</strong><span>查看正面、背面、左右以及手臂和服装交界。</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>保存64×64 PNG</strong><span>关闭页面前保存，在游戏中使用相同模型导入。</span></li></ol></figure>

## 4. 保存并在游戏中导入

通过“保存64×64 PNG”下载，在游戏的自定义皮肤导入功能中使用，并选择相同Classic或Slim类型。不同版本和设备的导入方式与支持范围不同，不能保证通用兼容。网站不保存输入文字或参考图片。未公开的皮肤会在关闭页面后丢失，请先保存PNG。

## 5. 将喜欢的作品公开到商店

生成后，为皮肤命名并同意任何人都可以免费下载和使用，即可公开到[皮肤商店](/zh-cn/skin-maker/store/)。公开是可选的，只保存名称和生成的皮肤。在生成后24小时内，只要此生成页面仍然打开，就可以取消公开。

## 6. 复制并编辑商店的皮肤

在商店卡片或3D详情中选择“复制并编辑”，即可在皮肤制作工具中打开副本。保留原有手臂类型和像素，可以在3D中手绘，或同意后使用AI局部修改。不会覆盖原作品。编辑后的PNG可下载；输入名称并同意公开后，可以作为独立作品发布。仅复制不会自动公开。发布后继续编辑也会创建新作品。撤回副本不影响原作品。

原作品仍公开时，可在复制后24小时内发布副本。发布和撤回的操作密钥仅保存在此页面。复制和手动编辑不占用AI额度，AI修改与生成共用额度。副本每天最多发布5个，每分钟1个，网站总额度也有限制。
