---
title: How to Join External Minecraft Bedrock Servers from Switch | BedrockConnect Guide
description: A step-by-step guide to using BedrockConnect to join external Bedrock servers from Minecraft on Nintendo Switch, including DNS settings, server details, and notes for joining Aceserver.
translationOf: minecraft-bedrockconnect-switch
sourceHash: sha256:65a6717569d120bd04069ebe6cada6b31d2b374e35962d1f6554496ff011ab7e
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - Bedrock Edition
  - Nintendo Switch
  - Getting started
author: Gui
---

If you want to join a server outside Minecraft's featured servers from Minecraft Bedrock Edition on Nintendo Switch, you can use BedrockConnect. The process points the Switch DNS to BedrockConnect, then uses a featured server as the entry point to open a list of Bedrock servers.

This guide explains the flow for joining an external Bedrock server such as Aceserver from Switch. Server addresses and ports differ by server, so always check the latest information in each server's official instructions.

BedrockConnect is not an official Minecraft or Nintendo feature. It is a free open-source project, but read the [official GitHub README](https://github.com/Pugmatt/BedrockConnect) before using it, and do not use apps or downloads from repositories outside the official project.

## What BedrockConnect Does

Minecraft on Switch does not provide the usual server list for directly adding arbitrary external servers. BedrockConnect uses DNS and a featured server as an entry point to open a screen where you can enter the destination server.

1. Change the Switch DNS settings to BedrockConnect.
2. Open a compatible featured server from Minecraft's "Servers" tab.
3. Enter the destination server address and port in BedrockConnect.
4. Move from BedrockConnect to the destination server.

Changing DNS is not enough if the destination does not support Bedrock Edition. DNS values and screens may change in the future, so prefer the latest instructions in the [BedrockConnect official README](https://github.com/Pugmatt/BedrockConnect) over the values in this article.

## What You Need Before Starting

- A Nintendo Switch that can run Minecraft Bedrock Edition
- Minecraft and a Microsoft account ready for online play
- The Bedrock server address and port published by the destination server
- The current network settings, so you can restore the Switch DNS later

To join Aceserver, first check the current joining information on the [Aceserver Portal](/en/) and [official Discord](https://discord.gg/acsv). Treat the [Aceserver WIKI](https://asv-wiki.acecore.net) as the source for changing information such as rules and Discord linking after joining.

## Step 1: Set the Switch DNS Manually

1. Open Switch "System Settings", choose "Internet", and open "Internet Settings".
2. Select the connected network and open "Change Settings".
3. Change "DNS Settings" from "Automatic" to "Manual".
4. Enter the current values listed in the BedrockConnect official README. As of August 6, 2026, the guide lists:
   - Primary DNS: `104.238.130.180`
   - Secondary DNS: `8.8.8.8`

5. Save the settings and run the connection test.

This setting applies to the Switch network connection. When you finish using BedrockConnect, return to the same screen and set DNS Settings back to "Automatic".

## Step 2: Open BedrockConnect from Minecraft

1. Start Minecraft and sign in with your Microsoft account.
2. Open "Play" and select the "Servers" tab.
3. Join one of these featured servers:
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

The BedrockConnect official README lists these as featured servers compatible with DNS redirection. When the connection succeeds, you should see the BedrockConnect server list instead of the normal featured server.

If the normal featured server opens instead, check the DNS values and try another compatible server. Restarting the game or the network connection may also help.

## Step 3: Add the Destination Server

When the BedrockConnect screen appears, add the external server as follows.

1. Select `Connect to a Server`.
2. Enter the destination domain or IP address in `Server Address`.
3. Enter the Bedrock port published by the destination server in `Server Port`. Some servers use `19132`, but always follow the server's own instructions.
4. Enter a recognizable name in `Display Name`. This is optional.
5. Turn on `Add to server list` if you want to skip the input next time.
6. Select the submit button to start connecting.

To change a saved entry, open `Manage Server List`, choose `Edit a Server`, and select the server you want to edit.

## Joining Aceserver

Aceserver is a public Minecraft server that accepts players from both Java Edition and Bedrock Edition. However, the address and port entered into BedrockConnect may change with operations.

Check the following in order:

1. Check the latest joining information on the [Aceserver Portal](/en/).
2. Confirm the current address and port in the [official Discord](https://discord.gg/acsv).
3. Enter those values in BedrockConnect's `Server Address` and `Server Port`.
4. After joining, check the [Aceserver WIKI](https://asv-wiki.acecore.net) for rules and any required Discord linking.

Do not reuse an IP address from an old blog post or screenshot. If the address has changed or the server is under maintenance, follow the official Discord announcement.

## Troubleshooting

### The BedrockConnect List Does Not Appear

- Check that Switch DNS Settings is set to "Manual".
- Check for typing mistakes in the primary and secondary DNS values.
- Check the latest DNS values in the BedrockConnect official README.
- Try opening BedrockConnect through another compatible featured server.
- Restart the Minecraft and Switch network connection.

### The List Appears but the Destination Does Not Connect

- Check that `Server Address` matches the current server instructions.
- Check that `Server Port` is the Bedrock port, not a Java Edition port.
- Confirm that the destination accepts Bedrock Edition players.
- Check the official instructions for maintenance or access restrictions.

### Restoring the Original Settings

Open the connected network under Switch "System Settings" → "Internet" → "Internet Settings", set DNS Settings to "Automatic", and save.

## Important Notes

BedrockConnect does not add a feature to the official server list. It is an external service that uses DNS to open the BedrockConnect list through a featured server. Game updates or service changes may make this process stop working.

The BedrockConnect official README says that unofficial mobile apps with the same name are not associated with the project. If an app asks you to install software or enter account information, compare it with the instructions in the [official GitHub](https://github.com/Pugmatt/BedrockConnect).

## Summary

The DNS method in BedrockConnect can help Switch players join external Minecraft Bedrock servers. Set the DNS, open BedrockConnect through a compatible featured server, then enter the destination address and port.

When joining Aceserver, use the latest information from the [Aceserver Portal](/en/), [official Discord](https://discord.gg/acsv), and [Aceserver WIKI](https://asv-wiki.acecore.net) instead of an old fixed connection value.

## References

- [BedrockConnect official GitHub README](https://github.com/Pugmatt/BedrockConnect)
- [Aceserver official Portal](/en/)
- [Aceserver WIKI](https://asv-wiki.acecore.net)
- [The Switch external-server connection guide used as a reference](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
