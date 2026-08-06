---
title: 如何在Switch上连接Minecraft基岩版外部服务器｜BedrockConnect使用指南
description: 介绍如何在Nintendo Switch版Minecraft中使用BedrockConnect连接外部基岩版服务器，包括DNS设置、服务器信息填写以及加入Aceserver时需要确认的事项。
translationOf: minecraft-bedrockconnect-switch
sourceHash: sha256:65a6717569d120bd04069ebe6cada6b31d2b374e35962d1f6554496ff011ab7e
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - 基岩版
  - Nintendo Switch
  - 入门
author: Gui
---

如果想在Nintendo Switch版Minecraft基岩版中加入官方特色服务器以外的服务器，可以使用BedrockConnect。这个方法会把Switch的DNS指向BedrockConnect，再通过Minecraft的特色服务器打开基岩版服务器列表。

本文介绍如何从Switch连接到Aceserver等外部基岩版服务器。每个服务器的地址和端口都可能不同，请始终以各服务器的官方说明为准。

BedrockConnect不是Minecraft或Nintendo的官方功能。它是免费的开源项目，但使用前请阅读[官方GitHub README](https://github.com/Pugmatt/BedrockConnect)，不要使用官方仓库以外的同名应用或下载文件。

## BedrockConnect可以做什么

Switch版Minecraft没有通常意义上的自定义外部服务器列表。BedrockConnect利用DNS和特色服务器作为入口，打开填写目标服务器的页面。

1. 将Switch的DNS设置改为BedrockConnect。
2. 在Minecraft的“服务器”标签中打开兼容的特色服务器。
3. 在BedrockConnect页面填写目标服务器的地址和端口。
4. 从BedrockConnect转入目标服务器。

如果目标服务器不支持基岩版，仅修改DNS也无法加入。DNS数值和页面可能会在将来变化，因此请优先查看[BedrockConnect官方README](https://github.com/Pugmatt/BedrockConnect)的最新说明。

## 开始前需要准备什么

- 可以运行Minecraft基岩版的Nintendo Switch
- 已准备好进行在线游戏的Minecraft和Microsoft账户
- 目标服务器公开的基岩版地址和端口
- 当前网络设置，以便稍后恢复Switch的DNS

如果要加入Aceserver，请先在[Aceserver门户](/zh-cn/)和[官方Discord](https://discord.gg/acsv)确认当前参加说明。规则以及加入后的Discord绑定等会变化的信息，以[Aceserver WIKI](https://asv-wiki.acecore.net)为准。

## 步骤1：手动设置Switch的DNS

1. 打开Switch“设置”，进入“互联网”，选择“互联网设置”。
2. 选择当前连接的网络，打开“更改设置”。
3. 将“DNS设置”从“自动”改为“手动”。
4. 填写BedrockConnect官方README列出的当前数值。截至2026年8月6日，说明中的数值为：
   - 首选DNS：`104.238.130.180`
   - 备用DNS：`8.8.8.8`

5. 保存设置并运行连接测试。

这个设置会作用于Switch的网络连接。使用完BedrockConnect后，可以回到相同页面，将DNS设置改回“自动”。

## 步骤2：从Minecraft打开BedrockConnect

1. 启动Minecraft，并使用Microsoft账户登录。
2. 打开“游戏”，选择“服务器”标签。
3. 连接以下任意一个特色服务器：
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

BedrockConnect官方README将这些服务器列为支持DNS重定向的特色服务器。连接成功后，应当看到BedrockConnect服务器列表，而不是普通的特色服务器页面。

如果仍然进入普通特色服务器，请检查DNS数值，并尝试其他兼容服务器。重启游戏或网络连接也可能有所帮助。

## 步骤3：添加目标服务器

显示BedrockConnect页面后，可以按以下步骤添加外部服务器。

1. 选择`Connect to a Server`。
2. 在`Server Address`中填写目标服务器的域名或IP地址。
3. 在`Server Port`中填写目标服务器公开的基岩版端口。部分服务器使用`19132`，但请始终以目标服务器说明为准。
4. 在`Display Name`中填写便于识别的名称。此项为可选项。
5. 如果希望下次省略输入，请打开`Add to server list`。
6. 选择提交按钮开始连接。

要修改已保存的信息，请打开`Manage Server List`，选择`Edit a Server`，然后选择需要编辑的服务器。

## 加入Aceserver

Aceserver是同时接受Java版和基岩版玩家的公开Minecraft服务器。不过，填写到BedrockConnect中的地址和端口可能会随运营情况变化。

请按以下顺序确认：

1. 在[Aceserver门户](/zh-cn/)查看最新参加说明。
2. 在[官方Discord](https://discord.gg/acsv)确认当前地址和端口。
3. 将这些信息填写到BedrockConnect的`Server Address`和`Server Port`。
4. 加入后，在[Aceserver WIKI](https://asv-wiki.acecore.net)查看规则和可能需要的Discord绑定。

不要直接使用旧博客或截图中的IP地址。如果地址已经变化或服务器正在维护，请以官方Discord公告为准。

## 无法连接时的处理方法

### 没有显示BedrockConnect列表

- 确认Switch的DNS设置为“手动”。
- 确认首选DNS和备用DNS没有输入错误。
- 查看BedrockConnect官方README中的最新DNS数值。
- 尝试从其他兼容的特色服务器打开BedrockConnect。
- 重启Minecraft和Switch的网络连接。

### 列表显示了，但无法连接目标服务器

- 确认`Server Address`与当前服务器说明一致。
- 确认`Server Port`是基岩版端口，而不是Java版端口。
- 确认目标服务器接受基岩版玩家。
- 查看官方说明，确认是否存在维护或访问限制。

### 恢复原来的设置

在Switch“设置”→“互联网”→“互联网设置”中打开当前网络，将DNS设置改为“自动”并保存。

## 使用时的注意事项

BedrockConnect不会给官方服务器列表添加功能，而是通过DNS从特色服务器打开BedrockConnect列表的外部服务。游戏更新或服务变化可能会使这个方法失效。

BedrockConnect官方README说明，同名的非官方移动应用与项目无关。如果某个应用要求安装软件或输入账户信息，请与[官方GitHub](https://github.com/Pugmatt/BedrockConnect)中的说明进行对照。

## 总结

使用BedrockConnect的DNS方法，Switch玩家可以尝试加入外部Minecraft基岩版服务器。设置DNS后，从兼容的特色服务器打开BedrockConnect，再填写目标服务器的地址和端口即可。

加入Aceserver时，请以[Aceserver门户](/zh-cn/)、[官方Discord](https://discord.gg/acsv)和[Aceserver WIKI](https://asv-wiki.acecore.net)的最新说明为准，不要依赖旧的固定连接信息。

## 参考链接

- [BedrockConnect官方GitHub README](https://github.com/Pugmatt/BedrockConnect)
- [Aceserver官方门户](/zh-cn/)
- [Aceserver WIKI](https://asv-wiki.acecore.net)
- [参考的Switch外部服务器连接说明](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
