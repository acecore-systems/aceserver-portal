---
title: 'How to Share Your Own Java Server with Bedrock: Safe Cross-Play Setup'
description: Learn how to safely invite Bedrock friends to your own Java server with Geyser and Floodgate, choose a free host, and check settings before opening access.
translationOf: minecraft-java-bedrock-shared-server
sourceHash: sha256:61f4cc5be0d88b01fdab4917b333d828a9483f4f9e34ec5ffb2b35a5eda2dd9c
date: 2026-08-09T10:00:00+09:00
tags:
  - Minecraft
  - Java Edition
  - Bedrock Edition
  - Cross-play
  - Free server
  - Geyser
author: Gui
image: /uploads/stories/minecraft-java-bedrock-shared-server-hero.webp
imageAlt: Three people with a PC, tablet, and handheld game device look toward one small block-built server house lit by blue connection lines and a shield emblem
---

To invite friends using Bedrock on phones, tablets, Windows, or consoles to your own Java server, a Java server with Geyser and Floodgate is a practical option. Geyser bridges Bedrock connections to the Java server, while Floodgate lets the server identify Bedrock accounts safely.

The important part is not disabling Java account authentication just to admit Bedrock friends. This guide starts with Java authentication and an invitation-only server kept in place. Java and Bedrock controls and some features are not identical, so test with both kinds of device before opening the server.

If you are still deciding how friends on different devices should play together, also see [how to play Minecraft with friends](/en/stories/minecraft-play-with-friends/).

## The short answer: share one server with Java + Geyser + Floodgate

For a Java server you manage yourself, a clear setup is Paper, which supports plugins, with Geyser and Floodgate installed on the same server.

- Java friends join through the Java server TCP endpoint.
- Bedrock friends join through the UDP endpoint where Geyser listens.
- Floodgate lets Bedrock friends join as Bedrock accounts without separately buying a Java Edition account.
- Keep the Java server online-mode set to true.

This adds a Bedrock connection path to a Java server. It does not let Java clients directly join a Bedrock-only server, and it does not connect Java and Bedrock Realms to one another.

If you need to tell whether an existing server accepts both editions, see [can Java and Bedrock play together?](/en/stories/minecraft-java-bedrock-crossplay/).

### Check these things first

- Prepare a PC that can run a Java server or a host that supports server plugins.
- Make sure everyone can sign in legitimately to the edition they own.
- Align supported Java and Bedrock versions, installed plugins, and resource packs.
- Consoles can have platform-specific custom-server entry rules. Do not use DNS-changing workarounds; check the official guidance for the device and the host instead.

## Choose a way to start for free

A free server means that the server software or a free hosting plan has no usage fee. It does not make Minecraft itself, the host PC, electricity and internet, backups, or update work free.

| Setup                        | How to think about extra cost                                       | How to invite remote friends                                           | Conditions for a safe start                                                                         | Main limitation                                               |
| ---------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Home server, LAN only        | Server software is free                                             | Do not invite remote players; test only at home or on the same network | Do not create router exposure                                                                       | Friends away from home cannot join                            |
| Home server, internet access | Server software is free; PC, internet, and electricity are separate | Allow only Java TCP and Geyser UDP where needed                        | Set an allow-list, OS firewall, and backups first                                                   | You manage router, IPv6, and updates                          |
| Example free host: Aternos   | Follow the conditions of the free plan                              | Use the address and port shown by the host                             | Install Paper, Geyser, and Floodgate through the host's official instructions and use an allow-list | Capacity, uptime conditions, and supported plugins can change |
| Realms                       | Subscription                                                        | Use invitations                                                        | Use the official invitation and account controls                                                    | It is not for Java-to-Bedrock cross-play                      |

If you are unsure about opening ports at home, first confirm the setup on a LAN, or begin with a free host that manages the external address and port. At the time this article was written, Aternos documents Paper as its recommended option and describes automatic Floodgate installation and configuration when Geyser is installed. If its panel or policy has changed, follow the current official guidance instead.

For a basic comparison of free Java, Bedrock, and Realms choices, also see [how to set up a free Minecraft server](/en/stories/minecraft-server-setup/).

## Understand the connection layout

Java and Bedrock reach the server using different network formats. With Geyser and Floodgate on one Paper server, each connection has a distinct role.

| Who connects    | Destination                                                | Transport                    | Server-side role                             |
| --------------- | ---------------------------------------------------------- | ---------------------------- | -------------------------------------------- |
| Java friends    | Java server address and port                               | TCP                          | Paper accepts the connection directly        |
| Bedrock friends | The same hostname and the Bedrock port provided for Geyser | UDP                          | Geyser converts the connection for Paper     |
| Administrator   | Server console or host control panel                       | A non-public management path | Manages the allow-list, backups, and updates |

On a home server, the usual ports are Java TCP 25565 and Geyser UDP 19132, but a host can assign different numbers. Tell Bedrock friends the UDP port shown for Geyser in the host panel; do not ask them to guess that it is 19132.

Geyser's UDP port cannot be shared with a voice-chat service, Query, or another UDP service. When adding a feature later, do not force it to reuse the same port; check the official documentation and the host's port allocation.

![A desktop Java player connects directly to a protected server house, while tablet, phone, and handheld Bedrock players cross a blue bridge to reach the same house](/uploads/stories/minecraft-java-bedrock-shared-server-topology.webp)

_Java reaches Paper directly; Bedrock first reaches Geyser, which passes it to the same Paper server._

## Step 1: install Paper, Geyser, and Floodgate

1. Choose Paper or another Java server software that supports server-side plugins. A vanilla Java server alone cannot load Bukkit-family plugins.
2. Get Geyser and Floodgate from Geyser's official distribution or the official add-on panel of your host, using versions that match the server. Do not use files from unknown sources.
3. Start the server once, then confirm in the console that both Geyser and Floodgate loaded.
4. In a Paper plugin setup, Geyser can automatically detect the Java server destination and Floodgate authentication. Check the official setup and your host-specific guidance before editing configuration by hand.

Client-only mods cannot work for Bedrock clients that join through Geyser. Before inviting everyone, test installed mods, plugins, and resource packs with a small group on both editions.

## Step 2: set safe defaults before publishing

First enable Java authentication and the allow-list in Paper's server.properties. Labels can differ by server version or host panel, so check the current value before changing it.

| Setting           | Recommended value | Why                                                    |
| ----------------- | ----------------- | ------------------------------------------------------ |
| online-mode       | true              | Authenticates Java connections with Minecraft accounts |
| white-list        | true              | Keeps uninvited people out                             |
| enforce-whitelist | true              | Removes players who are not on the allow-list          |
| enable-rcon       | false             | Does not expose an unused remote console               |
| enable-query      | false             | Does not add an unused query listener                  |

Add Java friends to the usual allow-list. For Bedrock friends, use Floodgate's allow-list command with the person's actual gamertag. In an in-game administrator chat, run **/fwhitelist add gamertag**; from the host's server console, omit the leading `/` and use **fwhitelist add gamertag**. Do not guess a username prefix and use the ordinary allow-list, and do not leave the allow-list off while testing.

Give administrator privileges only to people who truly need them. Do not distribute the complete server configuration, Floodgate key files, or host sign-in details to friends. Back up before changing settings or updating plugins and the game, and verify that you can restore the backup.

![An administrator checks an allow-list beside a shield, two narrow blue routes lead through a wall to a server house, and a separate administration door remains locked](/uploads/stories/minecraft-java-bedrock-shared-server-safe-settings.webp)

_Only the Java and Geyser paths confirmed after testing are allowed; the management path stays closed to the internet._

## Step 3: expose only the necessary traffic in stages

Run connection tests before opening any external access.

1. Join the Paper server from the host PC or a Java client on the same LAN.
2. Join through Geyser from a Bedrock client on the same LAN using the UDP port.
3. On both editions, check the allow-list, spawn, chests, chat, and world saving.
4. Only when remote friends need access, allow the Java TCP port and Geyser UDP port individually in the OS firewall and router.
5. Test with one allow-listed friend on another network. Geyser connectiontest can also help confirm the destination.

You do not need a DMZ, all-port forwarding, a disabled firewall, or internet exposure for the control panel or RCON. If the host is reachable over IPv6, do not assume IPv4 port-forwarding rules protect it; confirm the OS firewall rule applies to IPv6 as well.

![Desktop and tablet players test near a protected server house on the left, then an administrator checks a shield at a gate before one remote friend connects on the right](/uploads/stories/minecraft-java-bedrock-shared-server-staged-test.webp)

_Test both editions on the LAN first, then verify access with one allow-listed friend on another network._

If you still cannot connect after these tests, do not widen the public exposure. Use [what to check when you cannot join a Minecraft server](/en/stories/minecraft-server-cannot-join/) to isolate the edition, version, account, and network in order.

## Checks when starting with a free host

The same public-scope principles apply with a free host. You do not need to create a port-forward on a home router, but you must still protect the host account, allow-list, and control-panel access.

1. Create a Java Paper server by following the host's official instructions.
2. Add Geyser from the official add-on panel and confirm that Floodgate is installed.
3. After starting the server, check the Java and Bedrock address and port shown on the host's Connect screen.
4. Confirm the authentication and allow-list settings from Step 2 before sharing connection details individually with friends.
5. When a new Bedrock version is released, check the host and Geyser official guidance for a required Geyser update.

Free-plan uptime conditions, backup coverage, supported add-ons, and service-stop handling differ by provider and can change. Do not keep an important world only at the host: back it up elsewhere using a method permitted by the terms and the control panel.

## Do not recommend these settings

- Do not set online-mode to false just to let Bedrock players in. Geyser's official FAQ calls offline mode without Floodgate dangerous and unsupported.
- Do not publish the server with the allow-list disabled, even for a one-time test. Use Floodgate's allow-list feature for Bedrock players.
- Do not use a DMZ, all-port forwarding, disabled firewall, or automatic UPnP exposure instead of finding the cause of a connection issue.
- Do not enable RCON, Query, PROXY protocol, or an external management panel just in case. Consider them only when you understand the needed setup and can limit exposure.
- Do not run unknown plugins, authentication-bypass plugins, or a shared complete configuration without reviewing it.

## Checklist before inviting friends

- Both Java and Bedrock clients can join, leave, and rejoin in a real test.
- The Java server has online-mode set to true and an enabled allow-list.
- Java names and Bedrock gamertags through Floodgate are each on the correct allow-list.
- Only Java TCP and Geyser UDP are exposed to the internet; RCON, Query, and the management panel are not public.
- Friends receive their edition's address, port, and supported version individually.
- A current backup exists, and the restore method has been checked before updates.

Once these points are confirmed, Java and Bedrock friends can begin playing in the same world while authentication and the public boundary remain protected.

## Official references

- [Geyser setup](https://geysermc.org/wiki/geyser/setup/)
- [Geyser FAQ](https://geysermc.org/wiki/geyser/faq/)
- [Floodgate allow-list feature](https://geysermc.org/wiki/floodgate/features/)
- [Paper server.properties reference](https://docs.papermc.io/paper/reference/server-properties/)
- [Aternos Geyser guide](https://support.aternos.org/hc/en-us/articles/360051047631-Allow-Bedrock-players-on-your-Java-server-with-Geyser)
- [Minecraft Java and Bedrock comparison](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)
