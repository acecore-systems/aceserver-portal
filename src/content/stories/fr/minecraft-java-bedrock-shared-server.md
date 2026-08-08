---
title: 'Comment partager son serveur Java avec Bedrock : configuration de cross-play sûre'
description: Découvrez comment inviter en sécurité des amis sur Bedrock sur votre propre serveur Java avec Geyser et Floodgate, choisir un hébergement gratuit et vérifier les réglages avant l'ouverture.
translationOf: minecraft-java-bedrock-shared-server
sourceHash: sha256:be5e56c5292dcd3c8237abf288858e53f9b89961567c14c10c2b91c316a152f1
date: 2026-08-09T10:00:00+09:00
tags:
  - Minecraft
  - Édition Java
  - Édition Bedrock
  - Cross-play
  - Serveur gratuit
  - Geyser
author: Gui
image: /uploads/stories/minecraft-java-bedrock-shared-server-hero.webp
imageAlt: Trois personnes avec un PC, une tablette et une console portable regardent une même petite maison-serveur en blocs éclairée de lignes bleues et d'un emblème de bouclier
---

Pour inviter sur votre serveur Java des amis qui utilisent Bedrock sur téléphone, tablette, Windows ou console, installer Geyser et Floodgate sur le serveur Java est une option pratique. Geyser fait le pont entre les connexions Bedrock et le serveur Java, tandis que Floodgate permet au serveur d'identifier les comptes Bedrock de façon sûre.

L'important est de ne pas désactiver l'authentification des comptes Java simplement pour accepter des amis Bedrock. Ce guide part d'un serveur qui conserve l'authentification Java et l'accès sur invitation. Les commandes et certaines fonctions ne sont pas identiques entre Java et Bedrock : testez donc les deux types d'appareils avant d'ouvrir le serveur.

## En bref : partagez un serveur avec Java + Geyser + Floodgate

Pour un serveur Java que vous gérez, une configuration simple consiste à utiliser Paper, qui prend en charge les plugins, avec Geyser et Floodgate installés sur le même serveur.

- Les amis sur Java se connectent au point TCP du serveur Java.
- Les amis sur Bedrock se connectent au point UDP écouté par Geyser.
- Floodgate permet aux amis Bedrock de rejoindre comme comptes Bedrock sans acheter en plus un compte Java Edition.
- Conservez online-mode du serveur Java à true.

Cette méthode ajoute un chemin de connexion Bedrock à un serveur Java. Elle ne permet pas aux clients Java de rejoindre directement un serveur réservé à Bedrock et elle ne relie pas les Realms Java et Bedrock entre eux.

### Vérifiez ces points d'abord

- Préparez un PC capable d'exécuter un serveur Java ou un hébergeur compatible avec les plugins serveur.
- Vérifiez que chacun peut se connecter légitimement à l'édition qu'il possède.
- Alignez les versions Java et Bedrock prises en charge, les plugins installés et les packs de ressources.
- Les consoles peuvent avoir des règles propres pour saisir un serveur personnalisé. N'utilisez pas de contournement par changement de DNS : consultez plutôt les indications officielles de l'appareil et de l'hébergeur.

## Choisir une façon de commencer gratuitement

Un serveur gratuit signifie que le logiciel serveur ou une offre d'hébergement gratuite ne facture pas de droit d'utilisation. Cela ne rend pas gratuits Minecraft, le PC hôte, l'électricité et la connexion, les sauvegardes ou le travail de mise à jour.

| Configuration                         | Comment considérer le coût supplémentaire                          | Comment inviter des amis distants                                                         | Conditions pour commencer en sécurité                                                                                       | Limite principale                                                               |
| ------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Serveur à la maison, LAN seulement    | Le logiciel serveur est gratuit                                    | N'invitez pas de personnes distantes ; testez seulement à la maison ou sur le même réseau | Ne créez pas d'exposition sur le routeur                                                                                    | Les amis hors de la maison ne peuvent pas rejoindre                             |
| Serveur à la maison, accès internet   | Le logiciel est gratuit ; PC, internet et électricité sont séparés | N'autorisez que le TCP Java et l'UDP Geyser lorsque c'est nécessaire                      | Configurez d'abord une liste d'autorisation, le pare-feu système et les sauvegardes                                         | Vous gérez routeur, IPv6 et mises à jour                                        |
| Exemple d'hébergeur gratuit : Aternos | Respectez les conditions de l'offre gratuite                       | Utilisez l'adresse et le port affichés par l'hébergeur                                    | Installez Paper, Geyser et Floodgate selon les instructions officielles de l'hébergeur et utilisez une liste d'autorisation | Capacité, conditions de disponibilité et plugins pris en charge peuvent changer |
| Realms                                | Abonnement                                                         | Utilisez les invitations                                                                  | Utilisez les contrôles officiels d'invitation et de compte                                                                  | Ce n'est pas destiné au cross-play Java vers Bedrock                            |

Si vous n'êtes pas sûr d'ouvrir des ports chez vous, validez d'abord la configuration sur un LAN ou commencez avec un hébergeur gratuit qui gère l'adresse et le port externes. Au moment de la rédaction, la documentation officielle d'Aternos recommande Paper et décrit l'installation et la configuration automatiques de Floodgate lors de l'installation de Geyser. Si son panneau ou ses règles ont changé, suivez les indications officielles actuelles.

## Comprendre l'architecture de connexion

Java et Bedrock atteignent le serveur avec des formats réseau différents. Avec Geyser et Floodgate sur un serveur Paper, chaque connexion a un rôle distinct.

| Qui se connecte | Destination                                        | Transport                    | Rôle côté serveur                                                 |
| --------------- | -------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| Amis Java       | Adresse et port du serveur Java                    | TCP                          | Paper accepte directement la connexion                            |
| Amis Bedrock    | Même nom d'hôte et port Bedrock fourni pour Geyser | UDP                          | Geyser convertit la connexion pour Paper                          |
| Administration  | Console du serveur ou panneau de l'hébergeur       | Chemin de gestion non public | Gère la liste d'autorisation, les sauvegardes et les mises à jour |

Sur un serveur à domicile, les ports usuels sont TCP 25565 pour Java et UDP 19132 pour Geyser, mais un hébergeur peut attribuer d'autres numéros. Donnez aux amis Bedrock le port UDP Geyser indiqué par le panneau, sans leur demander de supposer qu'il s'agit de 19132.

Le port UDP de Geyser ne peut pas être partagé avec un chat vocal, Query ou un autre service UDP. Lorsque vous ajoutez une fonction plus tard, ne forcez pas la réutilisation du même port : vérifiez la documentation officielle et l'attribution de l'hébergeur.

## Étape 1 : installer Paper, Geyser et Floodgate

1. Choisissez Paper ou un autre logiciel de serveur Java qui prend en charge les plugins côté serveur. Un serveur Java vanilla seul ne peut pas charger les plugins de la famille Bukkit.
2. Obtenez Geyser et Floodgate depuis la distribution officielle de Geyser ou le panneau officiel de modules de votre hébergeur, dans des versions compatibles avec le serveur. N'utilisez pas de fichiers de provenance inconnue.
3. Démarrez une fois le serveur et confirmez dans la console que Geyser et Floodgate sont tous les deux chargés.
4. Dans une configuration de plugins Paper, Geyser peut détecter automatiquement la destination Java et l'authentification Floodgate. Consultez la configuration officielle et le guide propre à l'hébergeur avant toute modification manuelle.

Les MOD qui ne nécessitent une installation que côté client ne peuvent pas fonctionner pour les clients Bedrock qui rejoignent via Geyser. Avant d'inviter tout le groupe, testez les MOD, plugins et packs de ressources installés avec un petit groupe sur les deux éditions.

## Étape 2 : définir des valeurs sûres avant la publication

Activez d'abord l'authentification Java et la liste d'autorisation dans server.properties de Paper. Les libellés peuvent varier selon la version du serveur ou le panneau de l'hébergeur ; vérifiez donc la valeur actuelle avant de la modifier.

| Réglage           | Valeur recommandée | Raison                                                         |
| ----------------- | ------------------ | -------------------------------------------------------------- |
| online-mode       | true               | Authentifie les connexions Java avec les comptes Minecraft     |
| white-list        | true               | Empêche les personnes non invitées d'entrer                    |
| enforce-whitelist | true               | Exclut les joueurs qui ne sont pas sur la liste d'autorisation |
| enable-rcon       | false              | N'expose pas une console distante inutilisée                   |
| enable-query      | false              | N'ajoute pas d'écoute Query inutilisée                         |

Ajoutez les amis Java à la liste d'autorisation habituelle. Pour les amis Bedrock, utilisez la commande de liste Floodgate avec le gamertag réel de la personne. Par exemple, exécutez **/fwhitelist add gamertag** depuis la console d'administration. Ne devinez pas un préfixe de nom pour utiliser la liste habituelle et ne laissez pas la liste désactivée pendant les tests.

Ne donnez des privilèges d'administration qu'aux personnes qui en ont réellement besoin. Ne distribuez pas la configuration complète du serveur, les fichiers de clé Floodgate ou les identifiants de l'hébergeur à vos amis. Sauvegardez avant de modifier les réglages ou de mettre à jour les plugins et le jeu, et vérifiez que la restauration fonctionne.

## Étape 3 : n'exposer que le trafic nécessaire, progressivement

Effectuez les tests de connexion avant d'ouvrir un accès externe.

1. Rejoignez le serveur Paper depuis le PC hôte ou un client Java sur le même LAN.
2. Rejoignez via Geyser depuis un client Bedrock sur le même LAN en utilisant le port UDP.
3. Dans les deux éditions, vérifiez la liste d'autorisation, le point d'apparition, les coffres, le chat et la sauvegarde du monde.
4. Seulement lorsque des amis distants ont besoin d'un accès, autorisez séparément le port TCP Java et le port UDP Geyser dans le pare-feu système et le routeur.
5. Testez avec un ami inscrit sur la liste, depuis un autre réseau. Le connectiontest de Geyser peut aussi confirmer la destination.

Vous n'avez pas besoin d'une DMZ, du transfert de tous les ports, d'un pare-feu désactivé ou d'une exposition internet du panneau de contrôle ou de RCON. Si l'hôte est joignable en IPv6, ne supposez pas que les règles de transfert IPv4 le protègent : vérifiez que la règle du pare-feu système s'applique aussi à IPv6.

## Vérifications avec un hébergeur gratuit

Les mêmes principes de périmètre public s'appliquent à un hébergeur gratuit. Vous n'avez pas à créer de redirection de ports sur le routeur domestique, mais vous devez toujours protéger le compte d'hébergement, la liste d'autorisation et l'accès au panneau.

1. Créez un serveur Java Paper en suivant les instructions officielles de l'hébergeur.
2. Ajoutez Geyser depuis le panneau officiel de modules et confirmez que Floodgate est installé.
3. Après le démarrage, vérifiez l'adresse et le port Java et Bedrock affichés sur l'écran Connect de l'hébergeur.
4. Confirmez les réglages d'authentification et de liste d'autorisation de l'étape 2 avant de transmettre individuellement les informations de connexion.
5. Lorsqu'une nouvelle version de Bedrock sort, consultez les guides officiels de l'hébergeur et de Geyser pour savoir si une mise à jour de Geyser est nécessaire.

Les conditions de disponibilité, la couverture des sauvegardes, les modules pris en charge et la gestion des arrêts de service d'une offre gratuite diffèrent selon les fournisseurs et peuvent évoluer. Ne conservez pas un monde important uniquement chez l'hébergeur : sauvegardez-le aussi ailleurs par une méthode autorisée par les conditions et le panneau.

## Réglages à ne pas recommander

- Ne réglez pas online-mode sur false uniquement pour faire entrer Bedrock. La FAQ officielle de Geyser considère le mode hors ligne sans Floodgate comme dangereux et non pris en charge.
- Ne publiez pas le serveur avec la liste d'autorisation désactivée, même pour un essai unique. Utilisez la fonction de liste Floodgate pour les joueurs Bedrock.
- N'utilisez pas une DMZ, le transfert de tous les ports, un pare-feu désactivé ou une exposition automatique par UPnP au lieu d'identifier la cause d'un problème de connexion.
- N'activez pas RCON, Query, PROXY protocol ou un panneau de gestion externe au cas où. Envisagez-les seulement si vous comprenez la configuration nécessaire et pouvez limiter l'exposition.
- N'exécutez pas de plugins inconnus, de plugins qui contournent l'authentification ou une configuration complète partagée sans l'examiner.

## Liste avant d'inviter des amis

- Les clients Java et Bedrock peuvent rejoindre, quitter et rejoindre de nouveau lors d'un test réel.
- Le serveur Java a online-mode à true et une liste d'autorisation active.
- Les noms Java et les gamertags Bedrock via Floodgate figurent chacun dans la bonne liste.
- Seuls Java TCP et Geyser UDP sont exposés à internet ; RCON, Query et le panneau ne sont pas publics.
- Chaque ami reçoit individuellement l'adresse, le port et la version compatible de son édition.
- Une sauvegarde récente existe et la méthode de restauration a été vérifiée avant les mises à jour.

Après confirmation de ces points, des amis Java et Bedrock peuvent commencer à jouer dans le même monde en conservant l'authentification et la limite d'exposition publique.

## Références officielles

- [Configuration de Geyser](https://geysermc.org/wiki/geyser/setup/)
- [FAQ de Geyser](https://geysermc.org/wiki/geyser/faq/)
- [Fonction de liste d'autorisation Floodgate](https://geysermc.org/wiki/floodgate/features/)
- [Référence server.properties de Paper](https://docs.papermc.io/paper/reference/server-properties/)
- [Guide Geyser d'Aternos](https://support.aternos.org/hc/en-us/articles/360051047631-Allow-Bedrock-players-on-your-Java-server-with-Geyser)
- [Comparaison Minecraft Java et Bedrock](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)
