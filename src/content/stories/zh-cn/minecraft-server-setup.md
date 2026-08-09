---
title: 如何搭建免费的 Minecraft 服务器：Java、基岩版与 Realms 的区别
description: 介绍如何搭建免费的 Minecraft 服务器，并比较 Java 版、基岩版和 Realms，包括准备工作与开放服务器前的安全检查。
translationOf: minecraft-server-setup
sourceHash: sha256:1d0155c2bfc03563a83d164bde21d3becb20f0f64d2ba85763512ad9c025b903
date: 2026-08-08T10:00:00+09:00
tags:
  - Minecraft
  - Minecraft服务器
  - 入门
author: Gui
image: /uploads/stories/minecraft-server-setup-hero.webp
imageAlt: 三名方块风格的冒险者眺望通往村庄、服务器和云端入口的三条道路
---

和朋友一起玩 Minecraft 有几种方式：使用同一个局域网、在自己的电脑上运行专用服务器，或者使用 Realms。选择哪种方式，取决于所有人的版本，以及你愿意承担多少维护工作。

首先要理解的是，免费服务器通常表示服务器软件本身可以免费使用。Minecraft 游戏本体、电脑、电费、网络、备份和更新并不会因此免费。本文以在自己的电脑上运行官方软件为中心进行说明。

如果队伍中有 Switch 或手机玩家，在决定参加方式前，可先阅读[如何与朋友一起玩 Minecraft](/zh-cn/stories/minecraft-play-with-friends/)，确认版本和账户条件。

## 简单结论：根据玩家和版本来选择

| 方法               | 如何理解费用                                   | 谁可以加入                   | 适合的情况                     |
| ------------------ | ---------------------------------------------- | ---------------------------- | ------------------------------ |
| 在同一个网络中游玩 | 不需要额外的服务器费用                         | 同一家庭或同一局域网中的玩家 | 想先短时间试用                 |
| Java 版专用服务器  | 官方软件免费，电脑、网络和电费另计             | Java 版玩家                  | 想学习电脑设置和运营           |
| 基岩版专用服务器   | 官方软件免费，但需要受支持的系统和电脑         | 基岩版玩家                   | 想和使用手机或主机的朋友一起玩 |
| Realms             | 订阅服务，部分符合条件的账号可能会看到免费试用 | 同一版本中的受邀成员         | 不想维护家用电脑或设置端口转发 |

Java 版和基岩版是不同的版本，玩家通常不能直接加入同一个服务器。除了确认大家使用电脑、手机还是主机，也要确认所有人使用的是 Java 版还是基岩版。

![用电脑、手机和主机设备以及云端世界表现 Java 版、基岩版和 Realms 区别的方块风格比较图](/uploads/stories/minecraft-server-setup-comparison.webp)

## 搭建服务器前的准备

### 1. 确认所有人的版本

Java 版适用于 Windows、macOS 和 Linux 电脑。基岩版则可用于 Windows 电脑、手机、主机和其他受支持的设备。Windows 可能同时拥有两个版本，但启动了错误的版本就无法加入目标服务器。

### 2. 选择主机电脑

运行专用服务器的电脑负责推进世界。如果电脑进入睡眠状态，或者服务器进程停止，已连接的朋友也无法继续游玩。请提前决定谁负责磁盘空间、内存、网络、更新和备份。

### 3. 决定谁可以连接

如果所有人都在同一个局域网中，就不需要把服务器开放到互联网。邀请其他地方的朋友时，可能需要设置路由器端口转发和防火墙。为了安全，先在自己的电脑和局域网中测试，再扩大访问范围。

![在家用电脑准备服务器文件、朋友连接到共享方块世界的步骤示意图](/uploads/stories/minecraft-server-setup-guide.webp)

## 如何搭建免费的 Java 版服务器

Java 版提供了官方 Java Edition Server。官方下载页面中的软件只适用于 Java 版，并且需要可以从命令行使用的兼容 Java 环境。

### 基本步骤

1. 创建一个空文件夹，并从官方页面下载 Java 服务器`.jar`文件。
2. 将下载的文件改成容易记住的名称，例如`server.jar`。如果保留原始名称，请替换下面命令中的文件名。
3. 确认 Java 可以使用。

```text
java -version
```

4. 在命令行中打开服务器文件夹，先启动一次服务器。

```text
java -jar server.jar nogui
```

5. 阅读首次启动时创建的`eula.txt`。只有在同意其内容时，才将它改为`eula=true`，然后再次启动服务器。
6. 使用`server.properties`设置游戏模式、难度和玩家允许列表。
7. 先使用`localhost`或同一局域网中的地址进行测试，并确认世界能够正确保存。

服务器版本必须与客户端版本兼容。更新前请复制世界文件夹并停止服务器，这样可以降低连接错误或世界损坏的风险。

## 如何搭建免费的基岩版服务器

基岩版提供了官方 Bedrock Dedicated Server。官方下载页面提供 Windows 或 Linux 文件。它与 Java 的`.jar`软件不同，所以朋友使用基岩版时应选择基岩版安装包。

### 基本步骤

1. 从官方页面下载 Bedrock Dedicated Server 到空文件夹中。
2. 解压 ZIP 文件并阅读其中的指南。官方安装包包含安装和使用说明。
3. 使用适合操作系统的可执行文件或命令启动服务器。所需的世界文件会在启动时创建。
4. 检查`server.properties`中的世界设置和玩家允许列表。如果只想让朋友加入，请在随附指南中确认`allow-list=true`等设置。
5. 先使用同一局域网中的基岩版客户端连接，确认版本和连接方法。

官方 Bedrock Dedicated Server 的运行环境是 Windows 或 Linux。即使手机或主机可以加入，每台设备的账号设置和在线服务条件也可能影响连接。Java 版客户端不能直接加入仅限基岩版的服务器。

## Realms 是免费服务器吗？

Realms 是 Minecraft 官方的私有云服务器。所有者不需要一直运行游戏，世界也可以保持可用，只有受邀成员能够加入。它可以减少家用电脑管理、端口转发和服务器软件更新的工作。

不过，Realms 是订阅服务，并不是永久免费的。符合条件的账号可能会获得 30 天免费试用，但官方说明试用结束后会自动续订，除非提前取消。订阅前请确认版本、套餐、同时在线人数上限和续订条件。

Realms 也按版本区分：Java 玩家加入 Java Realm，基岩版玩家加入基岩版 Realm。Realms 不能用来实现两个版本之间的跨版本联机。

## 应该选择哪种方法？

- 只想在家里或同一局域网中快速测试时，游戏内多人游戏最简单。
- 如果是使用电脑的 Java 玩家，并且想学习设置和运营，可以选择 Java 专用服务器。
- 如果朋友使用基岩版设备，可以考虑 Bedrock Dedicated Server。
- 如果更重视随时可用而不是费用，并希望减少维护工作，Realms 更容易上手，但它不是免费的。

如果为了避免托管费用而选择家用服务器，请决定服务器停止后由谁重启，以及世界备份到哪里。提前安排好这些事项，开始游玩后会少遇到很多问题。

## 开放服务器前请检查

![表现备份、访问控制和仅限受邀朋友加入的安全方块风格示意图](/uploads/stories/minecraft-server-setup-safety.webp)

- 定期备份世界，并确认可以恢复。
- 只给需要的人授予管理员或运营者权限。
- 和朋友游玩时使用允许列表，不要把服务器开放给所有人。
- 只有确实需要外部访问时，才设置路由器和防火墙。
- 更新游戏或服务器软件前，确认兼容版本并完成备份。
- 不要在没有必要的情况下公开 IP 地址、密码或管理信息。

最新的条件和下载文件请查看官方的 [Java 服务器下载页面](https://www.minecraft.net/en-us/download/server)、[Java 服务器设置指南](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server)、[基岩版服务器下载页面](https://www.minecraft.net/en-us/download/server/bedrock)、[Dedicated Server 说明](https://help.minecraft.net/hc/en-us/articles/4408873961869-Minecraft-Dedicated-and-Featured-Servers-FAQ-)、[Realms 官方页面](https://www.minecraft.net/en-us/realms)以及 [Java 版与基岩版比较](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)。
