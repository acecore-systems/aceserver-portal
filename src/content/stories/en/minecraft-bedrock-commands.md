---
title: 'Minecraft Bedrock commands: examples for night vision, teleporting, and time'
description: A practical set of Minecraft Bedrock command examples for night vision, teleporting, time, weather, and giving items, with the checks to make first.
translationOf: minecraft-bedrock-commands
sourceHash: sha256:48a7cedb3fac3a470591186fe2fb1eded8cd39dd32231454d324d338c962218b
date: 2026-08-02T14:00:00+09:00
tags:
  - Minecraft
  - Minecraft Bedrock
  - Commands
author: Gui
---

Minecraft Bedrock commands are useful for changing the time or weather, moving to coordinates, and testing a world. This guide covers basic examples for a personal world or a world where you have management permission.

Public servers may prohibit commands for everyone except their administrators. Always read that server's rules before trying an example from this article there.

## Before you start

To use many commands in Bedrock, enable cheats for the world and make sure you have the needed permissions. Enabling cheats prevents achievements in that world, so make that choice deliberately.

If you are unsure what to type, start in chat with:

```mcfunction
/help
```

Adding a command name, such as /help effect, shows the syntax available in the current game. Bedrock can change available syntax through updates, so use the in-game suggestions and /help as your final check.

## Frequently used commands

### Set the time to day

```mcfunction
/time set day
```

Use this when night arrives or when you want to inspect a build in daylight. You can also choose times such as noon when they appear in the input suggestions.

### Clear the weather

```mcfunction
/weather clear
```

This example stops rain or thunderstorms so you can see clearly. Weather commands affect the whole world, so tell other players first in a shared world.

### Change your own game mode

```mcfunction
/gamemode creative @s
```

@s means the person who runs the command. Replace creative with survival to switch back. Back up an important world before making large changes.

### Teleport to coordinates

```mcfunction
/tp @s 0 80 0
```

This moves you to X=0, Y=80, Z=0. Check that the destination is not hollow or dangerous first, especially when moving underground or high above ground.

### Give yourself an item

```mcfunction
/give @s torch 64
```

This gives yourself 64 torches. Check item IDs and quantities through the input suggestions. It is useful when preparing tools in a test or adventure world.

### Apply unlimited night vision

```mcfunction
/effect @s night_vision infinite 0 true
```

Use this example to inspect dark caves or builds. The final true hides particles. Remove the effect with:

```mcfunction
/effect @s clear night_vision
```

## If a command does not work

1. Check that cheats are enabled in a personal world, or that you have management permission.
2. Check the current syntax with /help followed by the command name and with chat suggestions.
3. Do not copy a Java Edition guide unchanged. Java and Bedrock can use different syntax and conditions for the same goal.
4. On a public server, follow that server's rules and guidance first.

## Try them one by one

Commands are powerful because they can change a world immediately. Start with a backed-up test world and try easy-to-understand changes, such as time, weather, and night vision, one at a time.

For syntax and permissions, see the [Microsoft Learn introduction to Bedrock commands](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable), the [command reference](https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable), and the [effect command reference](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/effect?view=minecraft-bedrock-stable).
