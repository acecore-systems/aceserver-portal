---
title: 如何让 Java 版与基岩版共用自己的服务器：安全跨平台设置
description: 介绍如何通过 Geyser 与 Floodgate 安全地邀请基岩版朋友加入自己的 Java 版服务器，并说明免费主机的选择和公开前检查。
translationOf: minecraft-java-bedrock-shared-server
sourceHash: sha256:3833220449e5e234dbc90a3d476f482020cd41a53cfa88b5bb377f3c11a807b5
date: 2026-08-09T10:00:00+09:00
tags:
  - Minecraft
  - Java 版
  - 基岩版
  - 跨平台游玩
  - 免费服务器
  - Geyser
author: Gui
image: /uploads/stories/minecraft-java-bedrock-shared-server-hero.webp
imageAlt: 三名使用电脑、平板和掌机的人望向同一座小型方块服务器屋，屋上亮着蓝色连接线和盾牌标志
---

如果想邀请使用手机、平板、Windows 或游戏机基岩版的朋友加入自己的 Java 版服务器，可以在 Java 版服务器中安装 Geyser 与 Floodgate。Geyser 负责把基岩版连接桥接到 Java 版服务器，Floodgate 则让服务器能安全识别基岩版账号。

关键是不应为了让基岩版朋友加入而关闭 Java 版的账号认证。本文从保留 Java 版认证、只允许受邀者加入的状态开始说明。Java 版与基岩版的操作和部分功能并不完全相同，公开前必须用两种设备实际测试。

如果还在决定不同设备的朋友怎样一起玩，也可先阅读[如何和朋友一起玩 Minecraft](/zh-cn/stories/minecraft-play-with-friends/)。

## 结论：Java 服务器 + Geyser + Floodgate 可以共用

对于自行管理的 Java 版服务器，较清楚的方案是在支持插件的 Paper 中同时安装 Geyser 与 Floodgate。

- Java 版朋友通过 Java 服务器的 TCP 接入点加入。
- 基岩版朋友通过 Geyser 监听的 UDP 接入点加入。
- Floodgate 让基岩版朋友以基岩版账号加入，无需另外购买 Java 版账号。
- Java 服务器的 online-mode 应保持为 true。

这种方法是在 Java 服务器中增加基岩版连接路径。它不能让 Java 客户端直接进入仅基岩版服务器，也不能把 Java 版与基岩版 Realms 互相连接。

如果要判断已经存在的服务器是否同时接受两种版本，可参阅[Java 版和基岩版能一起玩吗？](/zh-cn/stories/minecraft-java-bedrock-crossplay/)了解判断方法。

### 开始前的确认事项

- 准备能运行 Java 服务器的电脑，或支持服务器插件的主机。
- 确认所有人都能用自己拥有的版本正常登录。
- 统一可支持的 Java 版与基岩版版本、已安装插件和资源包。
- 游戏机的自定义服务器输入规则可能因平台而异。不要使用修改 DNS 等绕过方式，应确认设备和主机的官方说明。

## 选择免费开始的方案

免费服务器是指服务器软件或免费主机方案没有使用费，并不代表 Minecraft 本体、主机电脑、电力和网络、备份或更新工作都是免费的。

| 方案                   | 额外费用的理解方式                   | 如何邀请远程朋友                       | 安全开始的条件                                            | 主要限制                         |
| ---------------------- | ------------------------------------ | -------------------------------------- | --------------------------------------------------------- | -------------------------------- |
| 家用服务器，仅 LAN     | 服务器软件免费                       | 不邀请远程玩家，只在家中或同一网络测试 | 不创建路由器公开设置                                      | 外出的朋友无法加入               |
| 家用服务器，开放互联网 | 服务器软件免费；电脑、网络和电力另计 | 仅按需开放 Java TCP 和 Geyser UDP      | 先设置白名单、系统防火墙和备份                            | 路由器、IPv6 和更新要自行管理    |
| 免费主机示例：Aternos  | 遵守免费方案条件                     | 使用主机显示的地址和端口               | 按主机官方步骤安装 Paper、Geyser、Floodgate，并使用白名单 | 容量、运行条件和支持插件可能变化 |
| Realms                 | 订阅服务                             | 使用邀请功能                           | 使用官方邀请和账号控制                                    | 不用于 Java 与基岩版跨平台游玩   |

若不确定如何安全地在家中开放端口，先在 LAN 内验证，或从由主机管理外部地址和端口的免费主机开始会更稳妥。本文撰写时，Aternos 的官方指南推荐 Paper，并说明安装 Geyser 时会自动安装和设置 Floodgate。若其面板或政策已经改变，应以当时的官方指南为准。

如需比较 Java、基岩版与 Realms 的免费开服基本选择，也可阅读[如何搭建免费的 Minecraft 服务器](/zh-cn/stories/minecraft-server-setup/)。

## 理解连接结构

Java 版和基岩版通过不同的网络格式到达服务器。在同一台 Paper 服务器安装 Geyser 与 Floodgate 后，各连接的角色如下。

| 连接者      | 连接目标                                 | 通信             | 服务器端角色              |
| ----------- | ---------------------------------------- | ---------------- | ------------------------- |
| Java 版朋友 | Java 服务器地址和端口                    | TCP              | Paper 直接接受连接        |
| 基岩版朋友  | 相同主机名以及为 Geyser 提供的基岩版端口 | UDP              | Geyser 将连接转换给 Paper |
| 管理员      | 服务器控制台或主机控制面板               | 不公开的管理路径 | 管理白名单、备份和更新    |

家用服务器通常使用 Java TCP 25565 和 Geyser UDP 19132，但主机可能分配不同的端口。应把管理面板中显示给 Geyser 的 UDP 端口告诉基岩版朋友，不要让他们猜测端口一定是 19132。

Geyser 的 UDP 端口不能与语音聊天、Query 或其他 UDP 服务共用。之后增加功能时，不要强行复用同一端口；应确认官方文档和主机的端口分配。

![左侧的 Java 版电脑玩家直接连接受保护的服务器小屋，右侧的手机、平板和掌机基岩版玩家通过蓝色桥梁连接同一小屋](/uploads/stories/minecraft-java-bedrock-shared-server-topology.webp)

_Java 版直接到达 Paper；基岩版先到达 Geyser，再被转交给同一台 Paper 服务器。_

## 步骤1：安装 Paper、Geyser 和 Floodgate

1. 选择 Paper 或其他支持服务器端插件的 Java 服务器软件。仅使用原版 Java 服务器无法加载 Bukkit 系列插件。
2. 从 Geyser 官方发行渠道或主机的官方插件页面获取与服务器版本匹配的 Geyser 和 Floodgate，不要使用来源不明的文件。
3. 先启动一次服务器，并在控制台确认 Geyser 与 Floodgate 都已加载。
4. 在 Paper 插件方案中，Geyser 有时能自动识别 Java 服务器目标和 Floodgate 认证。在手动修改配置前，先阅读官方设置步骤和主机专用说明。

仅需安装在客户端的 MOD 不能供通过 Geyser 加入的基岩版客户端使用。邀请所有人前，应让小范围玩家在两个版本中测试已安装的 MOD、插件和资源包。

## 步骤2：公开前设置安全默认值

先在 Paper 的 server.properties 中启用 Java 版认证与白名单。不同服务器版本或主机面板的名称可能不同，修改前请确认当前值。

| 设置              | 推荐值 | 原因                              |
| ----------------- | ------ | --------------------------------- |
| online-mode       | true   | 用 Minecraft 账号认证 Java 版连接 |
| white-list        | true   | 阻止未受邀请者加入                |
| enforce-whitelist | true   | 让不在白名单中的玩家退出          |
| enable-rcon       | false  | 不公开未使用的远程控制台          |
| enable-query      | false  | 不增加未使用的查询监听            |

将 Java 版朋友添加到普通白名单。对于基岩版朋友，应使用 Floodgate 的白名单命令并填写本人实际的游戏标签。例如在管理员控制台运行 **/fwhitelist add gamertag**。不要猜测用户名的前缀后改用普通白名单，也不要在测试时让白名单保持关闭。

只向真正需要的人授予管理员权限。不要把完整服务器配置、Floodgate 密钥文件或主机登录信息发给朋友。更改设置、更新插件或游戏前应备份，并确认能够恢复。

![管理员在盾牌旁检查白名单，两条狭窄的蓝色路线穿过围墙通向服务器小屋，独立的管理门保持上锁](/uploads/stories/minecraft-java-bedrock-shared-server-safe-settings.webp)

_只允许测试后确认的 Java 与 Geyser 两条路径；管理路径不对互联网开放。_

## 步骤3：分阶段只公开必要通信

在开放任何外部访问之前先完成连接测试。

1. 从主机电脑或同一 LAN 的 Java 客户端加入 Paper 服务器。
2. 从同一 LAN 的基岩版客户端用 UDP 端口经由 Geyser 加入。
3. 在两个版本中检查白名单、出生点、箱子、聊天和世界保存。
4. 只有远程朋友需要加入时，才在系统防火墙和路由器中分别允许 Java TCP 端口和 Geyser UDP 端口。
5. 使用另一网络中的一名已在白名单中的朋友测试。Geyser 的 connectiontest 也可帮助确认连接目标。

不需要 DMZ、全部端口转发、关闭防火墙，也不需要把控制面板或 RCON 暴露到互联网。若主机可通过 IPv6 访问，不要以为 IPv4 的端口转发规则已足够；还要确认系统防火墙规则同样适用于 IPv6。

![左侧的电脑和平板玩家在受保护服务器小屋附近测试，管理员在大门旁确认盾牌后，右侧一名远程朋友连接](/uploads/stories/minecraft-java-bedrock-shared-server-staged-test.webp)

_先在 LAN 中测试两个版本，再让另一网络中的一名已在白名单中的朋友确认。_

如果按此顺序测试后仍无法连接，请不要扩大公开范围；可用[无法加入 Minecraft 服务器时的确认](/zh-cn/stories/minecraft-server-cannot-join/)依次排查版本、游戏版本、账号和网络。

## 使用免费主机时的检查

使用免费主机时，公开范围的原则也相同。虽然不需要在家用路由器创建端口转发，但仍要保护主机账号、白名单和控制面板访问。

1. 按主机官方步骤创建 Java 版 Paper 服务器。
2. 从官方插件页面添加 Geyser，并确认 Floodgate 已安装。
3. 启动后，查看主机 Connect 页面显示的 Java 版和基岩版地址、端口。
4. 在单独把连接信息告诉朋友之前，确认步骤2中的认证和白名单设置。
5. 当发布新的基岩版版本时，查看主机和 Geyser 的官方说明，确认是否需要更新 Geyser。

不同提供商的免费方案运行条件、备份范围、支持的插件和服务停止处理都不同，也可能变化。重要世界不要只保存在主机上；请用符合服务条款和控制面板规定的方法备份到其他位置。

## 不建议的设置

- 不要只为让基岩版玩家加入就把 online-mode 设为 false。Geyser 官方 FAQ 将没有 Floodgate 的离线模式视为危险且不受支持。
- 不要即使只测试一次也在白名单关闭的状态下公开服务器。应使用 Floodgate 的白名单功能添加基岩版玩家。
- 不要因为尚未找出连接问题，就使用 DMZ、全部端口转发、关闭防火墙或自动 UPnP 公开。
- 不要为了以防万一而启用 RCON、Query、PROXY protocol 或外部管理面板。只有理解所需结构并能限制公开范围时才考虑。
- 不要直接运行来源不明的插件、绕过认证的插件，或未经检查的完整共享配置。

## 邀请朋友前的检查清单

- Java 版和基岩版客户端都已在实际测试中成功加入、退出并再次加入。
- Java 服务器的 online-mode 为 true，且白名单已启用。
- Java 名称和通过 Floodgate 的基岩版游戏标签分别已加入正确的白名单。
- 对互联网公开的只有 Java TCP 和 Geyser UDP；RCON、Query 和管理面板没有公开。
- 已分别向朋友提供其版本对应的地址、端口和支持版本。
- 已有最新备份，并在更新前确认恢复方法。

确认这些项目后，即使朋友使用 Java 版和基岩版混合的设备，也能在保持认证和公开边界的同时进入同一个世界。

## 官方资料

- [Geyser 设置](https://geysermc.org/wiki/geyser/setup/)
- [Geyser FAQ](https://geysermc.org/wiki/geyser/faq/)
- [Floodgate 白名单功能](https://geysermc.org/wiki/floodgate/features/)
- [Paper server.properties 参考](https://docs.papermc.io/paper/reference/server-properties/)
- [Aternos Geyser 指南](https://support.aternos.org/hc/en-us/articles/360051047631-Allow-Bedrock-players-on-your-Java-server-with-Geyser)
- [Minecraft Java 版与基岩版比较](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)
