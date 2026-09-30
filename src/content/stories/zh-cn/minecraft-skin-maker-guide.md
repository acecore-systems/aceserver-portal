---
title: '皮肤制作器使用指南：文字、图片生成与3D检查'
description: '从文字和可选图片生成Minecraft新皮肤，选择Classic或Slim，查看3D效果并保存64×64 PNG。'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-guide.webp
imageAlt: '手臂类型、文字与可选图片、3D检查、PNG保存的操作流程图，并非生成结果示例。'
relatedStories: [aceserver-beginners-guide]
translationOf: minecraft-skin-maker-guide
sourceHash: sha256:54b374de27985de659ceacaa5efb2164ff06b342258ca708f4583bc11aaf7b8b
---

[皮肤制作器](/zh-cn/skin-maker/)可用文字和可选参考图片生成Minecraft新皮肤，随后查看3D效果并保存64×64 PNG。

## 1. 选择手臂类型与外观

Classic手臂为4px，Slim为3px。用文字描述颜色、服装等。参考图可选，支持PNG、JPEG、WebP，最大5 MB。工具用于新生成，不是编辑已有皮肤。

## 2. 同意处理并等待生成

发送前确认图片使用权及AI处理同意。文字和图片会发送到配置中的OpenAI API或Cloudflare Workers AI。不要输入个人信息或秘密。生成可能需要几分钟，也可能因用量限制或拥堵失败，请查看屏幕提示。

## 3. 检查3D效果

查看正面、背面和左右侧，拖动旋转，可切换自动旋转和外层显示。AI输出可能与预期不同，保存前检查手臂及服装接缝。

## 4. 保存并在游戏中导入

通过“保存64×64 PNG”下载，在游戏的自定义皮肤导入功能中使用，并选择相同Classic或Slim类型。不同版本和设备的导入方式与支持范围不同，不能保证通用兼容。网站不保存文字、图片或皮肤，关闭页面会清空工作内容，请先保存PNG。
