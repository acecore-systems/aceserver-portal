---
title: 'Skin Maker verwenden: Text, Bilder und 3D-Prüfung'
description: 'Neue Minecraft-Skins aus Text und optionalem Bild erstellen, Classic oder Slim wählen, in 3D prüfen und als 64×64-PNG speichern.'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-cover-v2.webp
imageAlt: 'Illustration weißer Blockfiguren und einer Farbpalette als Symbol für die Skin-Erstellung. Kein generiertes Skin-Beispiel.'
relatedStories: [aceserver-beginners-guide]
translationOf: minecraft-skin-maker-guide
sourceHash: sha256:330d43691471ce0ea01b3a5dafd7e46b4c63468dce23d2728bbde663336b6daf
lastUpdated: 2026-10-06T19:18:00+09:00
---

Der [Skin Maker](/de/skin-maker/) erstellt neue Minecraft-Skins aus Text und optionalem Referenzbild. Prüfen Sie das Ergebnis in 3D und speichern Sie ein 64×64-PNG.

## 1. Armtyp und Aussehen wählen

Classic hat 4px-Arme, Slim 3px-Arme. Beschreiben Sie Farben oder Kleidung. Optionale Bilder: PNG, JPEG oder WebP bis 5 MB. Das Werkzeug erzeugt neue Skins; es bearbeitet keinen vorhandenen Skin.

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">Unterschied zwischen Classic- und Slim-Armen</strong><span>Die Skizzen zeigen die Armbreite, keine generierten Skins. Wählen Sie im Spiel dasselbe Modell wie bei der Erstellung.</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="Arme sind 4px breit" width="240" height="300" loading="lazy" decoding="async"/><span>Arme sind 4px breit</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="Arme sind 3px breit" width="240" height="300" loading="lazy" decoding="async"/><span>Arme sind 3px breit</span></li></ol></figure>

## 2. Zustimmen und warten

Bestätigen Sie Bildrechte und Verarbeitung vor dem Senden. Text und Bilder gehen an den konfigurierten Anbieter OpenAI API oder Cloudflare Workers AI. Keine persönlichen oder geheimen Daten eingeben. Erzeugung kann Minuten dauern oder durch Grenzen/Auslastung scheitern; beachten Sie die Anzeige.

## 3. In 3D prüfen

Prüfen Sie Vorderseite, Rücken und Seiten. Ziehen zum Drehen; automatische Drehung und äußere Schicht lassen sich umschalten. KI-Ergebnisse können abweichen; prüfen Sie Arme und Kleidungsübergänge vor dem Speichern.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">Prüfschritte von der Generierung bis zum Speichern</strong><span>Die Generierung erfordert Zustimmung. Prüfen Sie das Ergebnis vor dem Speichern.</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>Mit Text und optionalem Bild erstellen</strong><span>Bestätigen Sie Nutzungsrechte und Zustimmung zur KI-Verarbeitung vor dem Senden.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>Alle Seiten in 3D prüfen</strong><span>Prüfen Sie Vorderseite, Rückseite, Seiten, Arme und Kleidungskanten.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>64×64-PNG speichern</strong><span>Speichern Sie vor dem Schließen der Seite und importieren Sie mit demselben Spielmodell.</span></li></ol></figure>

## 4. Speichern und im Spiel importieren

Laden Sie über „64×64-PNG speichern“ herunter und nutzen Sie den eigenen Skin-Import im Spiel. Wählen Sie dort dasselbe Classic-/Slim-Modell. Import und Unterstützung hängen von Edition und Gerät ab; universelle Kompatibilität ist nicht zugesichert. Die Website speichert weder Ihren Eingabetext noch das Referenzbild. Unveröffentlichte Skins gehen beim Schließen der Seite verloren; speichern Sie daher zuerst das PNG.

## 5. Ausgewählte Skins im Store veröffentlichen

Geben Sie dem Skin nach der Erstellung einen Namen und stimmen Sie dem kostenlosen Download und der Nutzung durch alle zu, um ihn im [Skin-Store](/de/skin-maker/store/) zu veröffentlichen. Die Veröffentlichung ist freiwillig; gespeichert werden nur der Name und der generierte Skin. Sie können die Veröffentlichung innerhalb von 24 Stunden nach der Erstellung zurücknehmen, solange diese Erstellungsseite geöffnet bleibt.
