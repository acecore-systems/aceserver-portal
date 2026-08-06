---
title: Von der Switch aus mit externen Minecraft-Bedrock-Servern verbinden | BedrockConnect-Leitfaden
description: Eine Schritt-für-Schritt-Anleitung für BedrockConnect, um Minecraft auf der Nintendo Switch mit externen Bedrock-Servern zu verbinden, einschließlich DNS, Serverdaten und Hinweisen zum Beitritt zu Aceserver.
translationOf: minecraft-bedrockconnect-switch
sourceHash: sha256:65a6717569d120bd04069ebe6cada6b31d2b374e35962d1f6554496ff011ab7e
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - Bedrock Edition
  - Nintendo Switch
  - Erste Schritte
author: Gui
---

Wenn du Minecraft Bedrock Edition auf der Nintendo Switch mit einem Server außerhalb der offiziellen Featured-Server verbinden möchtest, kannst du BedrockConnect verwenden. Dabei wird der DNS der Switch auf BedrockConnect verwiesen, und ein Featured-Server dient als Einstieg in eine Liste von Bedrock-Servern.

Diese Anleitung beschreibt den Weg von der Switch zu einem externen Bedrock-Server wie Aceserver. Adressen und Ports unterscheiden sich je nach Server. Prüfe deshalb immer die aktuellen Informationen in den offiziellen Anleitungen des jeweiligen Servers.

BedrockConnect ist keine offizielle Funktion von Minecraft oder Nintendo. Das Projekt ist kostenlos und quelloffen, aber lies vor der Nutzung das [offizielle GitHub-README](https://github.com/Pugmatt/BedrockConnect) und verwende keine Apps oder Downloads aus fremden Repositories.

## Was BedrockConnect ermöglicht

Minecraft auf der Switch bietet keine übliche Serverliste, in der beliebige externe Server direkt eingetragen werden können. BedrockConnect nutzt DNS und einen Featured-Server als Einstieg, um eine Eingabemaske für den Zielserver zu öffnen.

1. Ändere die DNS-Einstellungen der Switch auf BedrockConnect.
2. Öffne auf der Registerkarte „Server“ von Minecraft einen kompatiblen Featured-Server.
3. Gib Adresse und Port des Zielservers in BedrockConnect ein.
4. Wechsle von BedrockConnect zum Zielserver.

Eine DNS-Änderung reicht nicht aus, wenn der Zielserver Bedrock Edition nicht unterstützt. DNS-Werte und Bildschirme können sich ändern. Bevorzuge daher die aktuellen Hinweise im [offiziellen BedrockConnect-README](https://github.com/Pugmatt/BedrockConnect).

## Was du vorbereiten solltest

- Eine Nintendo Switch, auf der Minecraft Bedrock Edition läuft
- Minecraft und ein Microsoft-Konto, die für Online-Spiele bereit sind
- Die vom Zielserver veröffentlichte Bedrock-Adresse und den Port
- Die aktuellen Netzwerkeinstellungen, damit du den DNS der Switch später zurücksetzen kannst

Wenn du Aceserver beitreten möchtest, prüfe zuerst die aktuellen Beitrittsinformationen im [Aceserver-Portal](/de/) und im [offiziellen Discord](https://discord.gg/acsv). Für veränderliche Informationen wie Regeln und die Discord-Verknüpfung nach dem Beitritt ist das [Aceserver-WIKI](https://asv-wiki.acecore.net) maßgeblich.

## Schritt 1: DNS der Switch manuell festlegen

1. Öffne die „Systemeinstellungen“ der Switch, wähle „Internet“ und öffne „Interneteinstellungen“.
2. Wähle das verbundene Netzwerk und öffne „Einstellungen ändern“.
3. Ändere „DNS-Einstellungen“ von „Automatisch“ auf „Manuell“.
4. Gib die aktuellen Werte aus dem offiziellen BedrockConnect-README ein. Am 6. August 2026 nennt die Anleitung:
   - Primärer DNS: `104.238.130.180`
   - Sekundärer DNS: `8.8.8.8`

5. Speichere die Einstellungen und führe den Verbindungstest aus.

Diese Einstellung gilt für die Netzwerkverbindung der Switch. Wenn du BedrockConnect nicht mehr verwendest, stelle die DNS-Einstellungen auf demselben Bildschirm wieder auf „Automatisch“.

## Schritt 2: BedrockConnect in Minecraft öffnen

1. Starte Minecraft und melde dich mit deinem Microsoft-Konto an.
2. Öffne „Spielen“ und wähle die Registerkarte „Server“.
3. Trete einem dieser Featured-Server bei:
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

Das offizielle BedrockConnect-README führt diese Server als mit DNS-Weiterleitung kompatible Featured-Server auf. Wenn die Verbindung funktioniert, sollte die BedrockConnect-Serverliste statt des normalen Featured-Servers erscheinen.

Wenn stattdessen der normale Featured-Server geöffnet wird, prüfe die DNS-Werte und versuche einen anderen kompatiblen Server. Ein Neustart des Spiels oder der Netzwerkverbindung kann ebenfalls helfen.

## Schritt 3: Zielserver hinzufügen

Wenn der BedrockConnect-Bildschirm erscheint, kannst du den externen Server so hinzufügen.

1. Wähle `Connect to a Server`.
2. Trage die Domain oder IP-Adresse des Zielservers in `Server Address` ein.
3. Trage in `Server Port` den vom Zielserver angegebenen Bedrock-Port ein. Manche Server verwenden `19132`, aber folge immer den eigenen Anweisungen des Servers.
4. Gib in `Display Name` einen leicht erkennbaren Namen ein. Das Feld ist optional.
5. Aktiviere `Add to server list`, wenn du die Eingabe beim nächsten Mal überspringen möchtest.
6. Wähle die Schaltfläche zum Absenden, um die Verbindung zu starten.

Um einen gespeicherten Eintrag zu ändern, öffne `Manage Server List`, wähle `Edit a Server` und anschließend den zu bearbeitenden Server.

## Aceserver beitreten

Aceserver ist ein öffentlicher Minecraft-Server, der Spieler aus Java Edition und Bedrock Edition akzeptiert. Die in BedrockConnect eingegebene Adresse und der Port können sich jedoch durch den laufenden Betrieb ändern.

Prüfe die Angaben in dieser Reihenfolge:

1. Prüfe die aktuellen Beitrittsinformationen im [Aceserver-Portal](/de/).
2. Bestätige die aktuelle Adresse und den Port im [offiziellen Discord](https://discord.gg/acsv).
3. Trage diese Werte in BedrockConnect bei `Server Address` und `Server Port` ein.
4. Lies nach dem Beitritt im [Aceserver-WIKI](https://asv-wiki.acecore.net) die Regeln und eine eventuell erforderliche Discord-Verknüpfung.

Verwende keine IP-Adresse aus einem alten Blogbeitrag oder Screenshot erneut. Wenn sich die Adresse geändert hat oder der Server gewartet wird, folge der Ankündigung im offiziellen Discord.

## Fehlerbehebung

### Die BedrockConnect-Liste erscheint nicht

- Prüfe, ob die DNS-Einstellungen der Switch auf „Manuell“ stehen.
- Prüfe die Eingabe des primären und sekundären DNS auf Tippfehler.
- Prüfe die aktuellen DNS-Werte im offiziellen BedrockConnect-README.
- Versuche, BedrockConnect über einen anderen kompatiblen Featured-Server zu öffnen.
- Starte Minecraft und die Netzwerkverbindung der Switch neu.

### Die Liste erscheint, aber die Verbindung zum Ziel scheitert

- Prüfe, ob `Server Address` mit den aktuellen Serverhinweisen übereinstimmt.
- Prüfe, ob `Server Port` der Bedrock-Port und nicht ein Java-Edition-Port ist.
- Bestätige, dass der Zielserver Bedrock-Spieler akzeptiert.
- Prüfe die offiziellen Hinweise auf Wartung oder Zugangsbeschränkungen.

### Ursprüngliche Einstellungen wiederherstellen

Öffne das verbundene Netzwerk unter „Systemeinstellungen“ → „Internet“ → „Interneteinstellungen“, stelle die DNS-Einstellungen auf „Automatisch“ und speichere.

## Wichtige Hinweise

BedrockConnect ergänzt keine Funktion der offiziellen Serverliste. Es ist ein externer Dienst, der DNS verwendet, um die BedrockConnect-Liste über einen Featured-Server zu öffnen. Spielupdates oder Änderungen am Dienst können dazu führen, dass das Verfahren nicht mehr funktioniert.

Das offizielle BedrockConnect-README weist darauf hin, dass inoffizielle mobile Apps mit demselben Namen nicht zum Projekt gehören. Wenn eine App die Installation von Software oder Kontodaten verlangt, vergleiche sie mit den Anweisungen im [offiziellen GitHub](https://github.com/Pugmatt/BedrockConnect).

## Zusammenfassung

Mit der DNS-Methode von BedrockConnect können Switch-Spieler versuchen, externen Minecraft-Bedrock-Servern beizutreten. Stelle den DNS ein, öffne BedrockConnect über einen kompatiblen Featured-Server und gib die Zieladresse sowie den Port ein.

Für Aceserver solltest du die aktuellen Informationen aus dem [Aceserver-Portal](/de/), dem [offiziellen Discord](https://discord.gg/acsv) und dem [Aceserver-WIKI](https://asv-wiki.acecore.net) verwenden, nicht einen alten festen Verbindungswert.

## Referenzen

- [Offizielles BedrockConnect-README auf GitHub](https://github.com/Pugmatt/BedrockConnect)
- [Offizielles Aceserver-Portal](/de/)
- [Aceserver-WIKI](https://asv-wiki.acecore.net)
- [Als Referenz verwendete Anleitung für externe Server von der Switch](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
