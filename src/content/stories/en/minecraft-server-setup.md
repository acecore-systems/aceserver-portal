---
title: 'How to set up a free Minecraft server: Java, Bedrock, and Realms'
description: Learn how to set up a free Minecraft server and compare Java Edition, Bedrock Edition, and Realms, including preparation and safety checks before opening it.
translationOf: minecraft-server-setup
sourceHash: sha256:9eaa80125eb59a16522825e0b1d143164c770eb9fc326800990adedfd0044cb1
date: 2026-08-08T10:00:00+09:00
tags:
  - Minecraft
  - Minecraft server
  - Getting started
author: Gui
image: /uploads/stories/minecraft-server-setup-hero.webp
imageAlt: Three blocky adventurers looking over three paths leading to a village, a server, and a cloud gateway
---

There are several ways to play Minecraft with friends: use the same local network, run a dedicated server on your own PC, or use Realms. The right choice depends on everyone's edition and how much maintenance you are willing to handle.

The first thing to understand is that a free server means the server software itself is free. It does not make the Minecraft game, computer, electricity, internet connection, backups, or updates free. This guide focuses on hosting the official software on your own PC.

## The short answer: choose by players and edition

| Method                           | How to think about cost                                              | Who can join                        | Best for                                         |
| -------------------------------- | -------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| Play on the same network         | No additional server fee                                             | The same home or LAN                | Trying it briefly first                          |
| Java Edition dedicated server    | Official software is free; PC, network, and electricity are separate | Java Edition players                | Learning PC setup and operations                 |
| Bedrock Edition dedicated server | Official software is free; a supported OS and PC are required        | Bedrock Edition players             | Playing with friends on phones or consoles       |
| Realms                           | Subscription service; some eligible accounts may see a free trial    | Invited members on the same edition | Avoiding home-PC maintenance and port forwarding |

Java Edition and Bedrock Edition are separate editions, and players normally cannot join the same server directly. Check not only whether everyone uses a PC, phone, or console, but also whether everyone is using Java or Bedrock.

![A block-style comparison of Java Edition, Bedrock Edition, and Realms shown as a PC, mobile and console devices, and a cloud world](/uploads/stories/minecraft-server-setup-comparison.webp)

## Prepare before you set up the server

### 1. Check everyone's edition

Java Edition is for Windows, macOS, and Linux PCs. Bedrock Edition is available on Windows PCs, phones, consoles, and other supported devices. Windows may give you access to both editions, but launching the wrong edition will prevent you from joining the intended server.

### 2. Choose the host PC

The PC running the dedicated server moves the world forward. If it sleeps or the server process stops, friends connected to it cannot keep playing. Decide in advance who will handle free disk space, memory, network access, updates, and backups.

### 3. Decide who can connect

If everyone is on the same LAN, you do not need to expose the server to the internet. Inviting friends from elsewhere may require router port forwarding and firewall changes. For safety, test on your own PC and local network before widening access.

![A home PC preparing server files while friends connect to a shared block-built world](/uploads/stories/minecraft-server-setup-guide.webp)

## How to set up a free Java Edition server

Java Edition has an official Java Edition Server. The software on the official download page is only for Java Edition, and it needs a compatible Java environment that can be used from the command line.

### Basic steps

1. Create an empty folder and download the Java server `.jar` file from the official page.
2. Rename the downloaded file to an easy name such as `server.jar`. If you keep the original name, replace the name in the commands below.
3. Confirm that Java is available.

```text
java -version
```

4. Open the server folder in a command line and start the server once.

```text
java -jar server.jar nogui
```

5. Read the `eula.txt` created on the first launch. Only change it to `eula=true` if you agree to its contents, then start the server again.
6. Use `server.properties` to configure the game mode, difficulty, and an allow-list for players.
7. First test with `localhost` or an address on the same LAN, and confirm that the world is saved correctly.

The server version and the clients' versions must be compatible. Before updating, copy the world folder and stop the server. This reduces the risk of connection errors or world damage.

## How to set up a free Bedrock Edition server

Bedrock Edition has an official Bedrock Dedicated Server. The official page provides downloads for Windows or Linux. It is separate from the Java `.jar` software, so choose the Bedrock package when your friends use Bedrock Edition.

### Basic steps

1. Download Bedrock Dedicated Server from the official page into an empty folder.
2. Extract the ZIP file and read the included guide. The official package includes installation and usage instructions.
3. Start the server with the executable or command for your operating system. The required world files are created when it starts.
4. Check `server.properties` for world settings and the player allow-list. If you want to keep the server private, check the included guide for settings such as `allow-list=true`.
5. Start with a Bedrock client on the same LAN and confirm the version and connection method.

The official Bedrock Dedicated Server environment is for Windows or Linux. Even when phones or consoles can join, each device's account settings and online-service requirements may affect the connection. A Java Edition client cannot directly join a Bedrock-only server.

## Is Realms a free server?

Realms is Minecraft's official private cloud-hosted server. The owner does not need to keep the game running for the world to be available, and only invited members can join. It reduces the need to manage a home PC, port forwarding, and server software updates.

However, Realms is a subscription service and is not permanently free. Eligible accounts may be offered a 30-day free trial, but the official guidance explains that the subscription renews automatically after the trial unless it is cancelled. Before subscribing, check the edition, plan, simultaneous player limit, and renewal terms.

Realms is also separated by edition: Java players join a Java Realm, and Bedrock players join a Bedrock Realm. Realms is not a way to enable cross-play between the two editions.

## Which method should you choose?

- For a quick test at home or on the same LAN, in-game multiplayer is the simplest option.
- For Java players on PCs who want to learn setup and operations, choose a Java dedicated server.
- For friends using Bedrock devices, consider Bedrock Dedicated Server.
- If always-on access matters more than cost and you want less maintenance, Realms is easier to understand, but it is not free.

If you choose a home server to avoid hosting fees, decide who will restart it when it stops and where the world will be backed up. That planning prevents many problems after you begin.

## Related guides

- Before you run a server, read [how to play Minecraft with friends](/en/stories/minecraft-play-with-friends/) to choose between your own world, Realms, and a public server.
- If your group mixes Java and Bedrock and wants a public server that accepts both, see [whether Java and Bedrock can play together](/en/stories/minecraft-java-bedrock-crossplay/).
- If a player cannot join after setup, use [what to check when you cannot join a Minecraft server](/en/stories/minecraft-server-cannot-join/) to separate player-side and server-side conditions.

## Check these points before opening the server

![A block-style image of backups, access control, and invited friends preparing a private server](/uploads/stories/minecraft-server-setup-safety.webp)

- Back up the world regularly and confirm that you can restore it.
- Give operator or administrator permissions only to people who need them.
- If you are playing with friends, use an allow-list instead of opening the server to everyone.
- Configure the router and firewall only when external access is actually needed.
- Check compatible versions and backups before updating the game or server software.
- Do not share IP addresses, passwords, or administration details more widely than necessary.

Check the latest requirements and downloads in the official [Java server download page](https://www.minecraft.net/en-us/download/server), [Java server setup guide](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server), [Bedrock server download page](https://www.minecraft.net/en-us/download/server/bedrock), [Dedicated Server guidance](https://help.minecraft.net/hc/en-us/articles/4408873961869-Minecraft-Dedicated-and-Featured-Servers-FAQ-), [official Realms page](https://www.minecraft.net/en-us/realms), and [Java and Bedrock comparison](https://www.minecraft.net/en-us/article/java-or-bedrock-edition).
