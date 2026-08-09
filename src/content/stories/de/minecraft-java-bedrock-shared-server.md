---
title: 'Eigenen Java-Server mit Bedrock teilen: sichere Crossplay-Konfiguration'
description: Erfahre, wie du Bedrock-Freunde mit Geyser und Floodgate sicher auf deinen Java-Server einlädst, einen kostenlosen Hoster auswählst und die Einstellungen vor der Freigabe prüfst.
translationOf: minecraft-java-bedrock-shared-server
sourceHash: sha256:3833220449e5e234dbc90a3d476f482020cd41a53cfa88b5bb377f3c11a807b5
date: 2026-08-09T10:00:00+09:00
tags:
  - Minecraft
  - Java Edition
  - Bedrock Edition
  - Crossplay
  - Kostenloser Server
  - Geyser
author: Gui
image: /uploads/stories/minecraft-java-bedrock-shared-server-hero.webp
imageAlt: Drei Personen mit PC, Tablet und Handheld-Konsole blicken auf dasselbe kleine Block-Serverhaus, das von blauen Verbindungslinien und einem Schildsymbol erleuchtet wird
---

Wenn du Freunde auf Bedrock von Telefonen, Tablets, Windows oder Konsolen auf deinen eigenen Java-Server einladen möchtest, ist ein Java-Server mit Geyser und Floodgate eine praktische Option. Geyser überbrückt Bedrock-Verbindungen zum Java-Server, während Floodgate dem Server hilft, Bedrock-Konten sicher zu erkennen.

Wichtig ist, die Java-Kontoauthentifizierung nicht nur für Bedrock-Freunde abzuschalten. Dieser Leitfaden beginnt mit aktivierter Java-Authentifizierung und einem Server nur für Eingeladene. Steuerung und einige Funktionen sind in Java und Bedrock nicht vollständig gleich, deshalb sollten beide Gerätetypen vor der Freigabe getestet werden.

Wenn ihr noch entscheidet, wie Freunde mit unterschiedlichen Geräten zusammen spielen sollen, lest auch [wie man Minecraft mit Freunden spielt](/de/stories/minecraft-play-with-friends/).

## Kurz gesagt: Einen Server mit Java + Geyser + Floodgate teilen

Für einen selbst verwalteten Java-Server ist eine klare Konfiguration Paper, das Plugins unterstützt, mit Geyser und Floodgate auf demselben Server.

- Java-Freunde treten über den TCP-Endpunkt des Java-Servers bei.
- Bedrock-Freunde treten über den UDP-Endpunkt bei, an dem Geyser lauscht.
- Floodgate erlaubt Bedrock-Freunden den Beitritt als Bedrock-Konten, ohne zusätzlich ein Java-Edition-Konto kaufen zu müssen.
- Belasse online-mode des Java-Servers auf true.

Damit wird einem Java-Server ein Bedrock-Verbindungspfad hinzugefügt. Java-Clients können damit nicht direkt einem reinen Bedrock-Server beitreten, und Java- sowie Bedrock-Realms werden dadurch nicht verbunden.

Wenn ihr prüfen müsst, ob ein bestehender Server beide Editionen akzeptiert, lest [können Java und Bedrock zusammen spielen?](/de/stories/minecraft-java-bedrock-crossplay/).

### Das zuerst prüfen

- Stelle einen PC bereit, der einen Java-Server ausführen kann, oder einen Hoster mit Server-Plugin-Unterstützung.
- Stelle sicher, dass alle sich rechtmäßig bei der Edition anmelden können, die sie besitzen.
- Gleiche unterstützte Java- und Bedrock-Versionen, installierte Plugins und Ressourcenpakete ab.
- Konsolen können eigene Regeln für benutzerdefinierte Servereinträge haben. Verwende keine DNS-Änderungen als Umgehung, sondern prüfe die offiziellen Hinweise für Gerät und Hoster.

## Eine kostenlose Startmöglichkeit wählen

Ein kostenloser Server bedeutet, dass die Serversoftware oder ein kostenloser Hostingtarif keine Nutzungsgebühr kostet. Minecraft selbst, der Host-PC, Strom und Internet, Sicherungen und Aktualisierungsarbeit werden dadurch nicht kostenlos.

| Aufbau                                   | Einordnung der Zusatzkosten                                  | So werden entfernte Freunde eingeladen                                          | Bedingungen für einen sicheren Start                                                                      | Hauptgrenze                                                                |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Heimserver, nur LAN                      | Die Serversoftware ist kostenlos                             | Keine entfernten Personen einladen; nur zu Hause oder im selben Netzwerk testen | Keine Freigabe im Router erstellen                                                                        | Freunde außerhalb des Hauses können nicht beitreten                        |
| Heimserver, Internetzugriff              | Software ist kostenlos; PC, Internet und Strom sind getrennt | Nur Java-TCP und Geyser-UDP bei Bedarf freigeben                                | Zuerst Allowlist, Systemfirewall und Sicherungen einrichten                                               | Router, IPv6 und Updates werden selbst verwaltet                           |
| Beispiel für kostenlosen Hoster: Aternos | Bedingungen des kostenlosen Tarifs beachten                  | Die vom Hoster angezeigte Adresse und den Port verwenden                        | Paper, Geyser und Floodgate nach offiziellen Hoster-Anweisungen installieren und eine Allowlist verwenden | Kapazität, Laufzeitbedingungen und unterstützte Plugins können sich ändern |
| Realms                                   | Abonnement                                                   | Einladungen verwenden                                                           | Offizielle Einladungs- und Kontosteuerung verwenden                                                       | Nicht für Java-zu-Bedrock-Crossplay gedacht                                |

Wenn du unsicher bist, zu Hause Ports zu öffnen, bestätige die Konfiguration zuerst im LAN oder beginne mit einem kostenlosen Hoster, der externe Adresse und Port verwaltet. Zum Zeitpunkt der Erstellung empfiehlt die offizielle Aternos-Anleitung Paper und beschreibt die automatische Installation und Konfiguration von Floodgate beim Installieren von Geyser. Wenn sich das Panel oder die Richtlinie geändert hat, gilt die aktuelle offizielle Anleitung.

Für einen grundlegenden Vergleich kostenloser Java-, Bedrock- und Realms-Optionen lest auch [wie man einen kostenlosen Minecraft-Server erstellt](/de/stories/minecraft-server-setup/).

## Die Verbindungsstruktur verstehen

Java und Bedrock erreichen den Server in unterschiedlichen Netzwerkformaten. Bei Geyser und Floodgate auf einem Paper-Server hat jede Verbindung eine eigene Aufgabe.

| Wer verbindet sich | Ziel                                                              | Transport                         | Aufgabe auf Serverseite                      |
| ------------------ | ----------------------------------------------------------------- | --------------------------------- | -------------------------------------------- |
| Java-Freunde       | Java-Serveradresse und Port                                       | TCP                               | Paper nimmt die Verbindung direkt an         |
| Bedrock-Freunde    | Derselbe Hostname und der für Geyser bereitgestellte Bedrock-Port | UDP                               | Geyser wandelt die Verbindung für Paper um   |
| Administration     | Serverkonsole oder Hoster-Panel                                   | Nicht öffentlicher Verwaltungsweg | Verwaltet Allowlist, Sicherungen und Updates |

Bei einem Heimserver sind die üblichen Ports Java TCP 25565 und Geyser UDP 19132, ein Hoster kann jedoch andere Nummern zuweisen. Teile Bedrock-Freunden den im Panel angezeigten Geyser-UDP-Port mit und lasse sie nicht vermuten, dass es 19132 sein muss.

Der UDP-Port von Geyser kann nicht mit Voice-Chat, Query oder einem anderen UDP-Dienst geteilt werden. Wenn später eine Funktion ergänzt wird, erzwinge keine Wiederverwendung desselben Ports, sondern prüfe die offizielle Dokumentation und die Portzuweisung des Hosters.

![Ein Java-Spieler am PC verbindet sich direkt mit einem geschützten Serverhaus, während Bedrock-Spieler mit Tablet, Telefon und Handheld über eine blaue Brücke dasselbe Haus erreichen](/uploads/stories/minecraft-java-bedrock-shared-server-topology.webp)

_Java erreicht Paper direkt; Bedrock erreicht zuerst Geyser, das die Verbindung an denselben Paper-Server weitergibt._

## Schritt 1: Paper, Geyser und Floodgate installieren

1. Wähle Paper oder eine andere Java-Serversoftware mit Unterstützung für serverseitige Plugins. Ein Vanilla-Java-Server allein kann keine Plugins aus der Bukkit-Familie laden.
2. Beziehe Geyser und Floodgate aus der offiziellen Geyser-Distribution oder dem offiziellen Add-on-Panel des Hosters, jeweils in einer zum Server passenden Version. Verwende keine Dateien unbekannter Herkunft.
3. Starte den Server einmal und bestätige in der Konsole, dass Geyser und Floodgate beide geladen wurden.
4. In einer Paper-Plugin-Konfiguration kann Geyser das Java-Ziel und die Floodgate-Authentifizierung automatisch erkennen. Prüfe die offizielle Einrichtung und die hosterspezifische Anleitung, bevor du eine Konfiguration von Hand änderst.

MODs, die nur auf dem Client installiert werden müssen, können für Bedrock-Clients über Geyser nicht funktionieren. Teste installierte MODs, Plugins und Ressourcenpakete mit einer kleinen Gruppe in beiden Editionen, bevor du alle einlädst.

## Schritt 2: Vor der Veröffentlichung sichere Standardwerte setzen

Aktiviere zuerst Java-Authentifizierung und Allowlist in Paper server.properties. Bezeichnungen können je nach Serverversion oder Hoster-Panel abweichen, daher solltest du den aktuellen Wert vor der Änderung prüfen.

| Einstellung       | Empfohlener Wert | Grund                                                  |
| ----------------- | ---------------- | ------------------------------------------------------ |
| online-mode       | true             | Authentifiziert Java-Verbindungen mit Minecraft-Konten |
| white-list        | true             | Hält nicht eingeladene Personen fern                   |
| enforce-whitelist | true             | Entfernt Spieler, die nicht auf der Allowlist stehen   |
| enable-rcon       | false            | Legt keine ungenutzte Fernkonsole offen                |
| enable-query      | false            | Fügt keinen ungenutzten Query-Listener hinzu           |

Füge Java-Freunde der normalen Allowlist hinzu. Für Bedrock-Freunde verwendest du den Floodgate-Allowlist-Befehl mit dem tatsächlichen Gamertag der Person. Führe zum Beispiel **/fwhitelist add gamertag** in der Administrationskonsole aus. Rate keinen Namenspräfix, um die gewöhnliche Allowlist zu verwenden, und lasse die Allowlist beim Test nicht ausgeschaltet.

Gib Administratorrechte nur Menschen, die sie wirklich benötigen. Verteile weder die vollständige Serverkonfiguration noch Floodgate-Schlüsseldateien oder Anmeldedaten des Hosters an Freunde. Erstelle vor Einstellungs-, Plugin- und Spielupdates eine Sicherung und prüfe die Wiederherstellung.

![Eine verwaltende Person prüft neben einem Schild eine Zulassungsliste, zwei schmale blaue Wege führen durch eine Mauer zu einem Serverhaus und eine separate Verwaltungstür bleibt verschlossen](/uploads/stories/minecraft-java-bedrock-shared-server-safe-settings.webp)

_Nur die nach dem Test bestätigten Java- und Geyser-Wege werden erlaubt; der Verwaltungsweg bleibt für das Internet geschlossen._

## Schritt 3: Nur benötigten Datenverkehr schrittweise freigeben

Führe Verbindungstests durch, bevor du einen externen Zugriff öffnest.

1. Tritt dem Paper-Server vom Host-PC oder von einem Java-Client im selben LAN bei.
2. Tritt über Geyser von einem Bedrock-Client im selben LAN über den UDP-Port bei.
3. Prüfe in beiden Editionen Allowlist, Spawn, Kisten, Chat und Weltspeicherung.
4. Erst wenn entfernte Freunde Zugriff brauchen, erlaube den Java-TCP-Port und den Geyser-UDP-Port einzeln in Systemfirewall und Router.
5. Teste mit einem Freund auf der Allowlist aus einem anderen Netzwerk. Der Geyser connectiontest kann ebenfalls das Ziel bestätigen.

Du brauchst keine DMZ, keine Weiterleitung aller Ports, keine deaktivierte Firewall und keine Internetfreigabe für Steuerpanel oder RCON. Wenn der Host über IPv6 erreichbar ist, gehe nicht davon aus, dass IPv4-Weiterleitungsregeln ihn schützen; bestätige, dass die Systemfirewallregel auch für IPv6 gilt.

![Links testen Spieler mit PC und Tablet bei einem geschützten Serverhaus, dann prüft eine verwaltende Person an einem Tor ein Schild, bevor sich rechts ein entfernter Freund verbindet](/uploads/stories/minecraft-java-bedrock-shared-server-staged-test.webp)

_Teste zuerst beide Editionen im LAN und prüfe den Zugriff danach mit einem zugelassenen Freund in einem anderen Netzwerk._

Wenn die Verbindung nach diesen Tests weiterhin nicht gelingt, erweitert die öffentliche Freigabe nicht. Mit [was zu prüfen ist, wenn man einem Minecraft-Server nicht beitreten kann](/de/stories/minecraft-server-cannot-join/) lassen sich Edition, Version, Konto und Netzwerk der Reihe nach eingrenzen.

## Prüfungen beim Start mit einem kostenlosen Hoster

Dieselben Grundsätze für den öffentlichen Umfang gelten bei einem kostenlosen Hoster. Du musst keine Portweiterleitung im Heimrouter einrichten, musst aber Hoster-Konto, Allowlist und Panelzugriff weiterhin schützen.

1. Erstelle nach der offiziellen Anleitung des Hosters einen Java-Paper-Server.
2. Füge Geyser über das offizielle Add-on-Panel hinzu und bestätige, dass Floodgate installiert ist.
3. Prüfe nach dem Start die Java- und Bedrock-Adresse sowie den Port auf dem Connect-Bildschirm des Hosters.
4. Bestätige die Authentifizierungs- und Allowlist-Einstellungen aus Schritt 2, bevor du Verbindungsdaten einzeln an Freunde weitergibst.
5. Wenn eine neue Bedrock-Version erscheint, prüfe die offiziellen Hinweise von Hoster und Geyser auf ein notwendiges Geyser-Update.

Laufzeitbedingungen, Sicherungsumfang, unterstützte Add-ons und der Umgang mit Dienststopps eines kostenlosen Tarifs unterscheiden sich nach Anbieter und können sich ändern. Bewahre eine wichtige Welt nicht nur beim Hoster auf, sondern sichere sie auch anderswo mit einer durch Bedingungen und Panel erlaubten Methode.

## Nicht empfohlene Einstellungen

- Setze online-mode nicht nur für Bedrock auf false. Die offizielle Geyser-FAQ bezeichnet den Offline-Modus ohne Floodgate als gefährlich und nicht unterstützt.
- Veröffentliche den Server nicht mit deaktivierter Allowlist, auch nicht für einen einmaligen Test. Verwende die Floodgate-Allowlist-Funktion für Bedrock-Spieler.
- Nutze nicht DMZ, Weiterleitung aller Ports, eine deaktivierte Firewall oder automatische UPnP-Freigabe, anstatt die Ursache eines Verbindungsproblems zu ermitteln.
- Aktiviere RCON, Query, PROXY protocol oder ein externes Verwaltungspanel nicht vorsorglich. Ziehe sie nur in Betracht, wenn du die nötige Konfiguration verstehst und die Freigabe begrenzen kannst.
- Führe keine unbekannten Plugins, keine Plugins zur Umgehung der Authentifizierung und keine ungeprüfte vollständig geteilte Konfiguration aus.

## Checkliste vor dem Einladen von Freunden

- Java- und Bedrock-Clients können in einem echten Test beitreten, verlassen und erneut beitreten.
- Der Java-Server hat online-mode auf true und eine aktivierte Allowlist.
- Java-Namen und Bedrock-Gamertags über Floodgate stehen jeweils auf der richtigen Allowlist.
- Nur Java-TCP und Geyser-UDP sind im Internet erreichbar; RCON, Query und Panel sind nicht öffentlich.
- Jeder Freund erhält einzeln Adresse, Port und unterstützte Version seiner Edition.
- Es gibt eine aktuelle Sicherung, und die Wiederherstellung wurde vor Updates geprüft.

Wenn diese Punkte bestätigt sind, können Java- und Bedrock-Freunde in derselben Welt spielen, während Authentifizierung und öffentliche Grenze geschützt bleiben.

## Offizielle Quellen

- [Geyser-Einrichtung](https://geysermc.org/wiki/geyser/setup/)
- [Geyser-FAQ](https://geysermc.org/wiki/geyser/faq/)
- [Floodgate-Allowlist-Funktion](https://geysermc.org/wiki/floodgate/features/)
- [Paper server.properties-Referenz](https://docs.papermc.io/paper/reference/server-properties/)
- [Aternos-Geyser-Anleitung](https://support.aternos.org/hc/en-us/articles/360051047631-Allow-Bedrock-players-on-your-Java-server-with-Geyser)
- [Minecraft-Vergleich von Java und Bedrock](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)
