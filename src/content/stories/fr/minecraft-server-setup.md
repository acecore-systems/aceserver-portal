---
title: 'Comment configurer un serveur Minecraft gratuit : Java, Bedrock et Realms'
description: Découvrez comment configurer un serveur Minecraft gratuit et comparez Java Edition, Bedrock Edition et Realms, avec les préparatifs et les vérifications de sécurité à effectuer avant de l'ouvrir.
translationOf: minecraft-server-setup
sourceHash: sha256:9eaa80125eb59a16522825e0b1d143164c770eb9fc326800990adedfd0044cb1
date: 2026-08-08T10:00:00+09:00
tags:
  - Minecraft
  - Serveur Minecraft
  - Premiers pas
author: Gui
image: /uploads/stories/minecraft-server-setup-hero.webp
imageAlt: Trois aventuriers en blocs contemplent trois chemins menant à un village, un serveur et une passerelle cloud
---

Il existe plusieurs façons de jouer à Minecraft avec des amis : utiliser le même réseau local, exécuter un serveur dédié sur son propre PC ou utiliser Realms. Le bon choix dépend de l'édition utilisée par tout le monde et de la maintenance que vous êtes prêt à assurer.

Il faut d'abord comprendre qu'un serveur gratuit signifie que le logiciel du serveur est gratuit. Le jeu Minecraft, l'ordinateur, l'électricité, la connexion Internet, les sauvegardes et les mises à jour restent à votre charge. Ce guide se concentre sur l'hébergement du logiciel officiel sur votre propre PC.

## En bref : choisissez selon les joueurs et l'édition

| Méthode                       | Comment comprendre le coût                                                            | Qui peut rejoindre                     | Idéal pour                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| Jouer sur le même réseau      | Aucun coût de serveur supplémentaire                                                  | Le même foyer ou le même LAN           | Faire un premier essai court                                       |
| Serveur dédié Java Edition    | Le logiciel officiel est gratuit ; PC, réseau et électricité sont séparés             | Les joueurs Java Edition               | Apprendre la configuration et l'administration sur PC              |
| Serveur dédié Bedrock Edition | Le logiciel officiel est gratuit ; un système et un PC compatibles sont nécessaires   | Les joueurs Bedrock Edition            | Jouer avec des amis sur téléphone ou console                       |
| Realms                        | Service par abonnement ; certains comptes éligibles peuvent recevoir un essai gratuit | Les membres invités de la même édition | Éviter la maintenance d'un PC personnel et la redirection de ports |

Java Edition et Bedrock Edition sont deux éditions différentes, et leurs joueurs ne peuvent généralement pas rejoindre directement le même serveur. Vérifiez non seulement si chacun utilise un PC, un téléphone ou une console, mais aussi si tout le monde joue en Java ou en Bedrock.

![Comparaison en style blocs de Java Edition, Bedrock Edition et Realms représentés par un PC, des appareils mobiles et consoles, et un monde cloud](/uploads/stories/minecraft-server-setup-comparison.webp)

## Préparez-vous avant de configurer le serveur

### 1. Vérifiez l'édition de chacun

Java Edition est disponible sur les PC Windows, macOS et Linux. Bedrock Edition est disponible sur les PC Windows, les téléphones, les consoles et d'autres appareils compatibles. Sous Windows, vous pouvez avoir accès aux deux éditions, mais lancer la mauvaise édition empêchera de rejoindre le serveur prévu.

### 2. Choisissez le PC hôte

Le PC qui exécute le serveur dédié fait fonctionner le monde. S'il se met en veille ou si le processus du serveur s'arrête, les amis connectés ne pourront plus jouer. Décidez à l'avance qui s'occupera de l'espace disque, de la mémoire, du réseau, des mises à jour et des sauvegardes.

### 3. Décidez qui peut se connecter

Si tout le monde est sur le même LAN, il n'est pas nécessaire d'exposer le serveur à Internet. Inviter des amis qui se trouvent ailleurs peut demander une redirection de ports sur le routeur et des changements dans le pare-feu. Pour rester prudent, testez d'abord sur votre PC et votre réseau local avant d'élargir l'accès.

![Un PC domestique prépare les fichiers du serveur pendant que des amis se connectent à un monde en blocs partagé](/uploads/stories/minecraft-server-setup-guide.webp)

## Comment configurer un serveur gratuit Java Edition

Java Edition dispose d'un Java Edition Server officiel. Le logiciel de la page officielle de téléchargement fonctionne uniquement avec Java Edition et nécessite un environnement Java compatible utilisable depuis la ligne de commande.

### Étapes de base

1. Créez un dossier vide et téléchargez le fichier`.jar` du serveur Java depuis la page officielle.
2. Renommez le fichier téléchargé avec un nom simple, par exemple `server.jar`. Si vous conservez son nom d'origine, remplacez le nom dans les commandes ci-dessous.
3. Vérifiez que Java est disponible.

```text
java -version
```

4. Ouvrez le dossier du serveur dans une ligne de commande et démarrez le serveur une première fois.

```text
java -jar server.jar nogui
```

5. Lisez le fichier`eula.txt` créé au premier démarrage. Ne le modifiez en`eula=true` que si vous acceptez son contenu, puis redémarrez le serveur.
6. Utilisez`server.properties` pour régler le mode de jeu, la difficulté et une liste de joueurs autorisés.
7. Testez d'abord avec `localhost` ou une adresse du même LAN, puis vérifiez que le monde est correctement enregistré.

La version du serveur et celles des clients doivent être compatibles. Avant une mise à jour, copiez le dossier du monde et arrêtez le serveur. Vous réduirez ainsi le risque d'erreurs de connexion ou de dommages au monde.

## Comment configurer un serveur gratuit Bedrock Edition

Bedrock Edition dispose d'un Bedrock Dedicated Server officiel. La page officielle propose des téléchargements pour Windows ou Linux. Il s'agit d'un logiciel différent du`.jar` Java : choisissez donc le paquet Bedrock si vos amis utilisent Bedrock Edition.

### Étapes de base

1. Téléchargez Bedrock Dedicated Server depuis la page officielle dans un dossier vide.
2. Extrayez le fichier ZIP et lisez le guide fourni. Le paquet officiel contient les instructions d'installation et d'utilisation.
3. Démarrez le serveur avec l'exécutable ou la commande correspondant à votre système d'exploitation. Les fichiers du monde sont créés au démarrage.
4. Vérifiez les réglages du monde et la liste des joueurs autorisés dans`server.properties`. Pour garder le serveur privé, consultez le guide fourni pour des options comme`allow-list=true`.
5. Commencez par connecter un client Bedrock sur le même LAN et vérifiez la version ainsi que la méthode de connexion.

L'environnement officiel de Bedrock Dedicated Server est prévu pour Windows ou Linux. Même si les téléphones et les consoles peuvent rejoindre le serveur, les réglages du compte et les conditions du service en ligne de chaque appareil peuvent affecter la connexion. Un client Java Edition ne peut pas rejoindre directement un serveur réservé à Bedrock.

## Realms est-il un serveur gratuit ?

Realms est le serveur privé officiel de Minecraft hébergé dans le cloud. Le propriétaire n'a pas besoin de laisser le jeu ouvert pour que le monde reste disponible, et seuls les membres invités peuvent le rejoindre. Cela réduit le travail de gestion d'un PC personnel, de la redirection de ports et des mises à jour du logiciel serveur.

Cependant, Realms est un service par abonnement et n'est pas gratuit en permanence. Les comptes éligibles peuvent recevoir un essai gratuit de 30 jours, mais les informations officielles expliquent que l'abonnement se renouvelle automatiquement à la fin de l'essai s'il n'est pas résilié. Avant de vous abonner, vérifiez l'édition, le forfait, la limite de joueurs simultanés et les conditions de renouvellement.

Realms est également séparé par édition : les joueurs Java rejoignent un Realm Java et les joueurs Bedrock un Realm Bedrock. Realms ne permet pas le jeu multiplateforme entre les deux éditions.

## Quelle méthode choisir ?

- Pour un test rapide à la maison ou sur le même LAN, le multijoueur intégré au jeu est le plus simple.
- Pour des joueurs Java sur PC qui veulent apprendre la configuration et l'administration, choisissez un serveur dédié Java.
- Pour des amis qui utilisent des appareils Bedrock, envisagez Bedrock Dedicated Server.
- Si l'accès permanent compte davantage que le coût et que vous voulez réduire la maintenance, Realms est plus simple, mais il n'est pas gratuit.

Si vous choisissez un serveur à domicile pour éviter les frais d'hébergement, décidez qui le redémarrera s'il s'arrête et où le monde sera sauvegardé. Cette préparation évite de nombreux problèmes après le démarrage.

## Guides associés

- Avant de configurer un serveur, lisez [comment jouer à Minecraft avec des amis](/fr/stories/minecraft-play-with-friends/) pour choisir entre votre monde, Realms et un serveur public.
- Si le groupe mélange Java et Bedrock et veut un serveur public qui accepte les deux, consultez [Java et Bedrock peuvent-ils jouer ensemble ?](/fr/stories/minecraft-java-bedrock-crossplay/).
- Si un joueur ne peut pas rejoindre après la configuration, utilisez [les vérifications à faire lorsqu'on ne peut pas rejoindre un serveur Minecraft](/fr/stories/minecraft-server-cannot-join/) pour séparer les conditions côté joueur et côté serveur.

## Vérifiez ces points avant d'ouvrir le serveur

![Illustration en style blocs des sauvegardes, du contrôle d'accès et d'amis invités préparant un serveur privé](/uploads/stories/minecraft-server-setup-safety.webp)

- Sauvegardez régulièrement le monde et vérifiez que vous pouvez le restaurer.
- Donnez les permissions d'opérateur ou d'administrateur uniquement aux personnes qui en ont besoin.
- Si vous jouez entre amis, utilisez une liste d'autorisation au lieu d'ouvrir le serveur à tout le monde.
- Configurez le routeur et le pare-feu uniquement si un accès externe est réellement nécessaire.
- Vérifiez les versions compatibles et les sauvegardes avant de mettre à jour le jeu ou le logiciel serveur.
- Ne partagez pas les adresses IP, les mots de passe ou les informations d'administration plus largement que nécessaire.

Consultez les exigences et téléchargements les plus récents sur la [page officielle de téléchargement du serveur Java](https://www.minecraft.net/en-us/download/server), le [guide de configuration du serveur Java](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server), la [page de téléchargement du serveur Bedrock](https://www.minecraft.net/en-us/download/server/bedrock), les [informations sur Dedicated Server](https://help.minecraft.net/hc/en-us/articles/4408873961869-Minecraft-Dedicated-and-Featured-Servers-FAQ-), la [page officielle de Realms](https://www.minecraft.net/en-us/realms) et la [comparaison entre Java et Bedrock](https://www.minecraft.net/en-us/article/java-or-bedrock-edition).
