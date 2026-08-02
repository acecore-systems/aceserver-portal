---
title: 'Minecraft 基岩版命令：夜视、传送和时间设置示例'
description: 整理 Minecraft 基岩版常用命令，包括夜视、传送、时间、天气和给予物品的输入示例及注意事项。
translationOf: minecraft-bedrock-commands
sourceHash: sha256:48a7cedb3fac3a470591186fe2fb1eded8cd39dd32231454d324d338c962218b
date: 2026-08-02T14:00:00+09:00
tags:
  - Minecraft
  - Minecraft 基岩版
  - 命令
author: Gui
---

Minecraft 基岩版命令可用于改变时间和天气、移动到指定坐标，以及测试世界。本指南整理了适用于个人世界或你拥有管理权限的世界的基本输入示例。

公开服务器可能只允许管理员使用命令。在公开服务器尝试本文示例前，请务必先阅读该服务器的规则。

## 开始前请确认

要在基岩版中使用许多命令，需要为世界启用作弊，并确认自己拥有所需权限。启用作弊后，该世界将无法获得成就，请谨慎决定。

如果不知道该输入什么，先在聊天栏执行：

```mcfunction
/help
```

在后面加上命令名，例如 /help effect，可以查看当前游戏中可用的语法。基岩版更新后可用语法可能变化，因此请以游戏内输入建议和 /help 作为最终确认。

## 常用命令

### 将时间设为白天

```mcfunction
/time set day
```

夜晚来临或想在明亮环境中检查建筑时可使用。也可以从输入建议中选择 noon 等时间。

### 将天气设为晴天

```mcfunction
/weather clear
```

此示例会停止下雨或雷暴，让视野更清晰。天气命令会影响整个世界，在多人世界中应先告知其他玩家。

### 更改自己的游戏模式

```mcfunction
/gamemode creative @s
```

@s 指执行命令的自己。要切回生存模式，将 creative 改为 survival。对重要世界进行较大操作前，请先备份。

### 传送到指定坐标

```mcfunction
/tp @s 0 80 0
```

此示例会将你移动到 X=0、Y=80、Z=0。请先确认目的地下方不是空洞或危险区域，尤其是在地下或高空传送时。

### 给自己物品

```mcfunction
/give @s torch 64
```

此示例会给自己64个火把。可通过输入建议确认物品ID和数量，适合在测试世界或冒险地图中准备工具。

### 无限时长夜视

```mcfunction
/effect @s night_vision infinite 0 true
```

可用于检查黑暗的洞穴或建筑。最后的 true 会隐藏粒子效果。要移除夜视，请使用：

```mcfunction
/effect @s clear night_vision
```

## 命令无法运行时的检查顺序

1. 确认个人世界已启用作弊，或你拥有管理权限。
2. 使用 /help 加命令名，以及聊天栏建议，确认当前语法。
3. 不要直接照抄 Java 版教程。Java 版和基岩版即使目标相同，语法和使用条件也可能不同。
4. 在公开服务器中，优先遵循该服务器的规则和说明。

## 请逐项测试

命令很强大，因为它们可以立即改变世界状态。建议先在已备份的测试世界中，逐项尝试时间、天气、夜视等影响范围容易理解的命令。

有关语法和权限，请查看 [Microsoft Learn 的基岩版命令入门](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable)、[命令参考](https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable) 和 [effect 命令参考](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/effect?view=minecraft-bedrock-stable)。
