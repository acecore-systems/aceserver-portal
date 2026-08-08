---
title: 'So richtest du einen kostenlosen Minecraft-Server ein: Java, Bedrock und Realms'
description: Erfahre, wie du einen kostenlosen Minecraft-Server einrichtest und Java Edition, Bedrock Edition und Realms vergleichst, einschließlich Vorbereitung und Sicherheitsprüfungen vor der Freigabe.
translationOf: minecraft-server-setup
sourceHash: sha256:afa899b3869f47a601fe078603ce00dec388e0a974bb6c2a1bb61b2c6659f1a4
date: 2026-08-08T10:00:00+09:00
tags:
  - Minecraft
  - Minecraft-Server
  - Erste Schritte
author: Gui
image: /uploads/stories/minecraft-server-setup-hero.webp
imageAlt: Drei blockartige Abenteurer blicken auf drei Wege zu einem Dorf, einem Server und einem Cloud-Gateway
---

Es gibt mehrere Möglichkeiten, mit Freunden Minecraft zu spielen: Ihr könnt dasselbe lokale Netzwerk verwenden, einen eigenen dedizierten Server auf eurem PC betreiben oder Realms nutzen. Die passende Wahl hängt von der Edition aller Spieler und davon ab, wie viel Wartung du übernehmen möchtest.

Wichtig ist zuerst: Ein kostenloser Server bedeutet, dass die Serversoftware kostenlos ist. Das Minecraft-Spiel, der Computer, Strom, Internetverbindung, Backups und Updates werden dadurch nicht kostenlos. Dieser Leitfaden konzentriert sich darauf, die offizielle Software auf dem eigenen PC zu hosten.

## Kurz gesagt: Nach Spielern und Edition auswählen

| Methode                                | Kosten richtig einordnen                                                     | Wer kann beitreten?                      | Geeignet für                                         |
| -------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| Im selben Netzwerk spielen             | Keine zusätzliche Servergebühr                                               | Dasselbe Zuhause oder LAN                | Einen kurzen Test zu Beginn                          |
| Dedizierter Server für Java Edition    | Offizielle Software kostenlos; PC, Netzwerk und Strom kommen separat hinzu   | Spieler der Java Edition                 | PC-Einrichtung und Betrieb lernen                    |
| Dedizierter Server für Bedrock Edition | Offizielle Software kostenlos; unterstütztes System und PC erforderlich      | Spieler der Bedrock Edition              | Mit Freunden auf Handys oder Konsolen spielen        |
| Realms                                 | Abonnement; einige berechtigte Konten können einen kostenlosen Test erhalten | Eingeladene Mitglieder derselben Edition | Wartung des Heim-PCs und Portweiterleitung vermeiden |

Java Edition und Bedrock Edition sind unterschiedliche Editionen. Normalerweise können ihre Spieler nicht direkt demselben Server beitreten. Prüfe daher nicht nur, ob alle PC, Handy oder Konsole verwenden, sondern auch, ob alle Java oder Bedrock spielen.

![Ein Vergleich im Blockstil von Java Edition, Bedrock Edition und Realms mit einem PC, Mobil- und Konsolengeräten sowie einer Cloud-Welt](/uploads/stories/minecraft-server-setup-comparison.webp)

## Vorbereitung vor der Servereinrichtung

### 1. Edition aller Spieler prüfen

Java Edition ist für PCs mit Windows, macOS und Linux verfügbar. Bedrock Edition gibt es für Windows-PCs, Handys, Konsolen und weitere unterstützte Geräte. Unter Windows hast du möglicherweise Zugriff auf beide Editionen, aber mit der falschen Edition kannst du dem gewünschten Server nicht beitreten.

### 2. Host-PC auswählen

Der PC, auf dem der dedizierte Server läuft, hält die Welt am Laufen. Wenn er in den Energiesparmodus wechselt oder der Serverprozess endet, können verbundene Freunde nicht weiterspielen. Lege vorher fest, wer sich um freien Speicher, Arbeitsspeicher, Netzwerk, Updates und Backups kümmert.

### 3. Zugriffsbereich festlegen

Wenn alle im selben LAN sind, musst du den Server nicht im Internet veröffentlichen. Freunde an einem anderen Ort einzuladen kann Portweiterleitung am Router und Änderungen an der Firewall erfordern. Teste aus Sicherheitsgründen zuerst auf deinem PC und im lokalen Netzwerk, bevor du den Zugriff erweiterst.

![Ein Heim-PC bereitet Serverdateien vor, während Freunde sich mit einer gemeinsamen Blockwelt verbinden](/uploads/stories/minecraft-server-setup-guide.webp)

## Einen kostenlosen Java-Edition-Server einrichten

Für Java Edition gibt es einen offiziellen Java Edition Server. Die Software auf der offiziellen Downloadseite ist nur für Java Edition geeignet und benötigt eine kompatible Java-Umgebung, die über die Kommandozeile verwendet werden kann.

### Grundlegende Schritte

1. Erstelle einen leeren Ordner und lade die`.jar`-Datei des Java-Servers von der offiziellen Seite herunter.
2. Benenne die heruntergeladene Datei einfach um, zum Beispiel in `server.jar`. Wenn du den ursprünglichen Namen beibehältst, ersetze den Dateinamen in den folgenden Befehlen.
3. Prüfe, ob Java verfügbar ist.

```text
java -version
```

4. Öffne den Serverordner in einer Kommandozeile und starte den Server einmal.

```text
java -jar server.jar nogui
```

5. Lies die beim ersten Start erstellte`eula.txt`. Ändere sie nur dann in`eula=true`, wenn du ihrem Inhalt zustimmst, und starte den Server anschließend erneut.
6. Konfiguriere in`server.properties` den Spielmodus, den Schwierigkeitsgrad und eine Liste zugelassener Spieler.
7. Teste zuerst mit `localhost` oder einer Adresse im selben LAN und prüfe, ob die Welt korrekt gespeichert wird.

Die Serverversion und die Versionen der Clients müssen kompatibel sein. Kopiere vor einem Update den Weltordner und stoppe den Server. So sinkt das Risiko von Verbindungsfehlern oder einer beschädigten Welt.

## Einen kostenlosen Bedrock-Edition-Server einrichten

Für Bedrock Edition gibt es einen offiziellen Bedrock Dedicated Server. Auf der offiziellen Seite werden Dateien für Windows oder Linux angeboten. Die Software ist getrennt von der Java`.jar`-Software. Wähle daher das Bedrock-Paket, wenn deine Freunde Bedrock Edition verwenden.

### Grundlegende Schritte

1. Lade Bedrock Dedicated Server von der offiziellen Seite in einen leeren Ordner herunter.
2. Entpacke die ZIP-Datei und lies die enthaltene Anleitung. Das offizielle Paket enthält Installations- und Nutzungshinweise.
3. Starte den Server mit der für dein Betriebssystem passenden ausführbaren Datei oder dem passenden Befehl. Die benötigten Weltdateien werden beim Start angelegt.
4. Prüfe in`server.properties` die Welteinstellungen und die Liste zugelassener Spieler. Wenn der Server privat bleiben soll, findest du in der enthaltenen Anleitung Einstellungen wie`allow-list=true`.
5. Verbinde zunächst einen Bedrock-Client im selben LAN und prüfe Version und Verbindungsmethode.

Die offizielle Umgebung für Bedrock Dedicated Server ist Windows oder Linux. Auch wenn Handys oder Konsolen beitreten können, können Kontoeinstellungen und Anforderungen des Onlinedienstes je nach Gerät die Verbindung beeinflussen. Ein Java-Edition-Client kann einem reinen Bedrock-Server nicht direkt beitreten.

## Ist Realms ein kostenloser Server?

Realms ist der offizielle private Cloud-Server von Minecraft. Der Besitzer muss das Spiel nicht geöffnet lassen, damit die Welt verfügbar bleibt, und nur eingeladene Mitglieder können beitreten. Dadurch entfällt ein Teil der Verwaltung eines Heim-PCs, der Portweiterleitung und der Server-Updates.

Realms ist jedoch ein Abonnement und nicht dauerhaft kostenlos. Berechtigte Konten können eine kostenlose 30-Tage-Testphase erhalten, aber laut den offiziellen Informationen verlängert sich das Abonnement nach der Testphase automatisch, wenn es nicht gekündigt wird. Prüfe vor dem Abschluss Edition, Tarif, gleichzeitige Spielerzahl und Verlängerungsbedingungen.

Realms ist ebenfalls nach Edition getrennt: Java-Spieler treten einem Java-Realm bei und Bedrock-Spieler einem Bedrock-Realm. Realms ermöglicht kein Crossplay zwischen den beiden Editionen.

## Welche Methode solltest du wählen?

- Für einen schnellen Test zu Hause oder im selben LAN ist der Multiplayer im Spiel am einfachsten.
- Für Java-Spieler am PC, die Einrichtung und Betrieb lernen möchten, eignet sich ein dedizierter Java-Server.
- Für Freunde mit Bedrock-Geräten kommt Bedrock Dedicated Server infrage.
- Wenn ständige Verfügbarkeit wichtiger ist als der Preis und du weniger Wartung möchtest, ist Realms einfacher, aber nicht kostenlos.

Wenn du einen Heimserver wählst, um Hostinggebühren zu vermeiden, lege fest, wer ihn nach einem Ausfall neu startet und wo die Welt gesichert wird. Diese Planung verhindert viele Probleme nach dem Start.

## Diese Punkte vor dem Öffnen des Servers prüfen

![Eine Illustration im Blockstil zu Backups, Zugriffskontrolle und eingeladenen Freunden, die einen privaten Server vorbereiten](/uploads/stories/minecraft-server-setup-safety.webp)

- Sichere die Welt regelmäßig und prüfe, ob du sie wiederherstellen kannst.
- Vergib Operator- oder Administratorrechte nur an Personen, die sie benötigen.
- Verwende beim Spielen mit Freunden eine Zulassungsliste, statt den Server für alle zu öffnen.
- Konfiguriere Router und Firewall nur, wenn externer Zugriff tatsächlich nötig ist.
- Prüfe vor einem Update des Spiels oder der Serversoftware kompatible Versionen und Backups.
- Teile IP-Adressen, Passwörter und Verwaltungsinformationen nicht weiter als nötig.

Die aktuellen Voraussetzungen und Downloads findest du auf der offiziellen [Downloadseite für Java-Server](https://www.minecraft.net/en-us/download/server), im [Einrichtungsleitfaden für Java-Server](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server), auf der [Downloadseite für Bedrock-Server](https://www.minecraft.net/en-us/download/server/bedrock), in den [Informationen zu Dedicated Servern](https://help.minecraft.net/hc/en-us/articles/4408873961869-Minecraft-Dedicated-and-Featured-Servers-FAQ-), auf der [offiziellen Realms-Seite](https://www.minecraft.net/en-us/realms) und im [Vergleich von Java und Bedrock](https://www.minecraft.net/en-us/article/java-or-bedrock-edition).
