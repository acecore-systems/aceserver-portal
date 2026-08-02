---
title: 'Minecraft-Bedrock-Befehle: Nachtsicht, Teleport und Zeit'
description: Praktische Beispiele für Minecraft-Bedrock-Befehle zu Nachtsicht, Teleportation, Zeit, Wetter und Gegenständen sowie wichtige Prüfungen vor der Nutzung.
translationOf: minecraft-bedrock-commands
sourceHash: sha256:48a7cedb3fac3a470591186fe2fb1eded8cd39dd32231454d324d338c962218b
date: 2026-08-02T14:00:00+09:00
tags:
  - Minecraft
  - Minecraft Bedrock
  - Befehle
author: Gui
---

Minecraft-Bedrock-Befehle helfen dabei, Zeit oder Wetter zu ändern, zu Koordinaten zu wechseln und eine Welt zu testen. Dieser Leitfaden sammelt grundlegende Eingabebeispiele für eine persönliche Welt oder eine Welt, in der du Verwaltungsrechte hast.

Öffentliche Server können Befehle für alle außer Administratoren verbieten. Lies immer die Regeln des Servers, bevor du dort ein Beispiel aus diesem Artikel ausprobierst.

## Vor dem Start

Um viele Befehle in Bedrock zu verwenden, musst du Cheats für die Welt aktivieren und die nötigen Rechte besitzen. Wenn Cheats aktiviert sind, können in dieser Welt keine Erfolge erzielt werden. Triff diese Entscheidung daher bewusst.

Wenn du nicht weißt, was du eingeben sollst, beginne im Chat mit:

```mcfunction
/help
```

Wenn du einen Befehlsnamen ergänzt, zum Beispiel /help effect, siehst du die im aktuellen Spiel verfügbare Syntax. Bedrock-Updates können die verfügbare Syntax ändern. Nutze daher die Vorschläge im Spiel und /help als letzte Kontrolle.

## Häufig verwendete Befehle

### Zeit auf Tag setzen

```mcfunction
/time set day
```

Nutze dies, wenn die Nacht beginnt oder du einen Bau bei hellem Licht prüfen möchtest. Du kannst auch Zeiten wie noon wählen, wenn sie in den Vorschlägen erscheinen.

### Wetter auf klar setzen

```mcfunction
/weather clear
```

Dieses Beispiel beendet Regen oder Gewitter und verbessert die Sicht. Wetterbefehle wirken auf die ganze Welt, daher solltest du andere Spieler in einer gemeinsamen Welt vorher informieren.

### Den eigenen Spielmodus ändern

```mcfunction
/gamemode creative @s
```

@s bezeichnet die Person, die den Befehl ausführt. Ersetze creative durch survival, um zurückzuwechseln. Sichere eine wichtige Welt, bevor du größere Änderungen vornimmst.

### Zu Koordinaten teleportieren

```mcfunction
/tp @s 0 80 0
```

Dies bewegt dich zu X=0, Y=80, Z=0. Prüfe vorher, dass das Ziel nicht hohl oder gefährlich ist, besonders bei Teleportation unter die Erde oder in große Höhe.

### Dir einen Gegenstand geben

```mcfunction
/give @s torch 64
```

Dieses Beispiel gibt dir 64 Fackeln. Prüfe Gegenstands-IDs und Mengen über die Eingabevorschläge. Das ist nützlich, wenn du Werkzeuge in einer Test- oder Abenteuerwelt vorbereitest.

### Unbegrenzte Nachtsicht anwenden

```mcfunction
/effect @s night_vision infinite 0 true
```

Nutze dieses Beispiel, um dunkle Höhlen oder Bauten zu prüfen. Das abschließende true blendet Partikel aus. Um den Effekt zu entfernen, nutze:

```mcfunction
/effect @s clear night_vision
```

## Wenn ein Befehl nicht funktioniert

1. Prüfe, ob Cheats in einer persönlichen Welt aktiv sind oder du Verwaltungsrechte hast.
2. Prüfe die aktuelle Syntax mit /help plus Befehlsname und mit den Chatvorschlägen.
3. Kopiere einen Java-Edition-Leitfaden nicht unverändert. Java und Bedrock können für dasselbe Ziel unterschiedliche Syntax und Bedingungen haben.
4. Folge auf einem öffentlichen Server zuerst den Regeln und Hinweisen dieses Servers.

## Probiere sie einzeln aus

Befehle sind mächtig, weil sie eine Welt sofort verändern können. Beginne in einer gesicherten Testwelt und probiere leicht verständliche Änderungen wie Zeit, Wetter und Nachtsicht einzeln aus.

Syntax und Rechte findest du in der [Microsoft-Learn-Einführung zu Bedrock-Befehlen](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable), der [Befehlsreferenz](https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable) und der [Referenz zum Befehl effect](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/effect?view=minecraft-bedrock-stable).
