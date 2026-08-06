---
title: Se connecter à des serveurs Minecraft Bedrock externes depuis la Switch | Guide BedrockConnect
description: Guide pas à pas pour utiliser BedrockConnect afin de rejoindre depuis Minecraft sur Nintendo Switch des serveurs Bedrock externes, avec le DNS, les informations du serveur et les notes pour Aceserver.
translationOf: minecraft-bedrockconnect-switch
sourceHash: sha256:65a6717569d120bd04069ebe6cada6b31d2b374e35962d1f6554496ff011ab7e
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - Édition Bedrock
  - Nintendo Switch
  - Premiers pas
author: Gui
---

Pour rejoindre depuis Minecraft Bedrock Edition sur Nintendo Switch un serveur qui ne fait pas partie des serveurs partenaires officiels, vous pouvez utiliser BedrockConnect. La méthode dirige le DNS de la Switch vers BedrockConnect, puis utilise un serveur partenaire comme point d’entrée vers une liste de serveurs Bedrock.

Ce guide présente le parcours pour rejoindre depuis la Switch un serveur Bedrock externe comme Aceserver. Les adresses et les ports varient selon les serveurs : consultez toujours les informations les plus récentes publiées dans leurs instructions officielles.

BedrockConnect n’est pas une fonction officielle de Minecraft ou de Nintendo. C’est un projet libre et gratuit, mais lisez le [README officiel sur GitHub](https://github.com/Pugmatt/BedrockConnect) avant de l’utiliser et n’utilisez pas d’applications ou de téléchargements provenant de dépôts extérieurs au projet officiel.

## Ce que permet BedrockConnect

Minecraft sur Switch ne propose pas la liste habituelle permettant d’ajouter directement des serveurs externes arbitraires. BedrockConnect utilise le DNS et un serveur partenaire comme point d’entrée pour ouvrir une page où saisir le serveur de destination.

1. Modifiez les réglages DNS de la Switch pour utiliser BedrockConnect.
2. Ouvrez un serveur partenaire compatible depuis l’onglet « Serveurs » de Minecraft.
3. Saisissez l’adresse et le port du serveur de destination dans BedrockConnect.
4. Passez de BedrockConnect au serveur de destination.

Modifier le DNS ne suffit pas si le serveur de destination ne prend pas en charge Bedrock Edition. Les valeurs DNS et les écrans peuvent changer, alors privilégiez les instructions récentes du [README officiel de BedrockConnect](https://github.com/Pugmatt/BedrockConnect).

## À préparer avant de commencer

- Une Nintendo Switch capable d’exécuter Minecraft Bedrock Edition
- Minecraft et un compte Microsoft prêts pour le jeu en ligne
- L’adresse et le port Bedrock publiés par le serveur de destination
- Les réglages réseau actuels afin de pouvoir restaurer le DNS de la Switch

Pour rejoindre Aceserver, consultez d’abord les informations actuelles sur le [Portail Aceserver](/fr/) et le [Discord officiel](https://discord.gg/acsv). La [WIKI Aceserver](https://asv-wiki.acecore.net) fait référence pour les informations évolutives, comme les règles et la liaison Discord après l’arrivée.

## Étape 1 : configurer manuellement le DNS de la Switch

1. Ouvrez les « Paramètres de la console », choisissez « Internet », puis « Paramètres Internet ».
2. Sélectionnez le réseau connecté et ouvrez « Modifier les paramètres ».
3. Passez les « Paramètres DNS » de « Automatique » à « Manuel ».
4. Saisissez les valeurs actuelles indiquées dans le README officiel de BedrockConnect. Au 6 août 2026, le guide indique :
   - DNS primaire : `104.238.130.180`
   - DNS secondaire : `8.8.8.8`

5. Enregistrez les réglages et lancez le test de connexion.

Ce réglage s’applique à la connexion réseau de la Switch. Après avoir utilisé BedrockConnect, revenez au même écran et repassez les paramètres DNS en « Automatique ».

## Étape 2 : ouvrir BedrockConnect depuis Minecraft

1. Lancez Minecraft et connectez-vous avec votre compte Microsoft.
2. Ouvrez « Jouer » et sélectionnez l’onglet « Serveurs ».
3. Rejoignez l’un de ces serveurs partenaires :
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

Le README officiel de BedrockConnect indique que ces serveurs sont compatibles avec la redirection DNS. Si la connexion réussit, la liste des serveurs BedrockConnect s’affiche à la place du serveur partenaire habituel.

Si le serveur partenaire normal s’ouvre, vérifiez les valeurs DNS et essayez un autre serveur compatible. Redémarrer le jeu ou la connexion réseau peut aussi aider.

## Étape 3 : ajouter le serveur de destination

Lorsque l’écran BedrockConnect apparaît, ajoutez le serveur externe comme suit.

1. Sélectionnez `Connect to a Server`.
2. Saisissez le domaine ou l’adresse IP de destination dans `Server Address`.
3. Saisissez dans `Server Port` le port Bedrock publié par le serveur de destination. Certains serveurs utilisent `19132`, mais suivez toujours leurs propres instructions.
4. Saisissez un nom facile à reconnaître dans `Display Name`. Ce champ est facultatif.
5. Activez `Add to server list` si vous souhaitez éviter de saisir à nouveau les informations.
6. Sélectionnez le bouton d’envoi pour commencer la connexion.

Pour modifier une entrée enregistrée, ouvrez `Manage Server List`, choisissez `Edit a Server`, puis sélectionnez le serveur à modifier.

## Rejoindre Aceserver

Aceserver est un serveur Minecraft public qui accepte les joueurs Java Edition et Bedrock Edition. Cependant, l’adresse et le port saisis dans BedrockConnect peuvent changer selon l’exploitation du serveur.

Vérifiez les informations dans cet ordre :

1. Consultez les informations d’accès récentes sur le [Portail Aceserver](/fr/).
2. Confirmez l’adresse et le port actuels dans le [Discord officiel](https://discord.gg/acsv).
3. Saisissez ces valeurs dans `Server Address` et `Server Port` de BedrockConnect.
4. Après votre arrivée, consultez la [WIKI Aceserver](https://asv-wiki.acecore.net) pour les règles et toute liaison Discord nécessaire.

Ne réutilisez pas une adresse IP provenant d’un ancien article ou d’une capture d’écran. Si l’adresse a changé ou si le serveur est en maintenance, suivez l’annonce du Discord officiel.

## Dépannage

### La liste BedrockConnect ne s’affiche pas

- Vérifiez que les paramètres DNS de la Switch sont en mode « Manuel ».
- Vérifiez les éventuelles erreurs de saisie du DNS primaire et secondaire.
- Consultez les dernières valeurs DNS dans le README officiel de BedrockConnect.
- Essayez d’ouvrir BedrockConnect depuis un autre serveur partenaire compatible.
- Redémarrez Minecraft et la connexion réseau de la Switch.

### La liste apparaît mais la destination ne se connecte pas

- Vérifiez que `Server Address` correspond aux instructions actuelles du serveur.
- Vérifiez que `Server Port` est le port Bedrock et non celui de Java Edition.
- Confirmez que le serveur de destination accepte les joueurs Bedrock Edition.
- Consultez les instructions officielles pour vérifier une maintenance ou une restriction d’accès.

### Restaurer les réglages d’origine

Ouvrez le réseau connecté dans « Paramètres de la console » → « Internet » → « Paramètres Internet », repassez les paramètres DNS en « Automatique » et enregistrez.

## Points importants

BedrockConnect n’ajoute pas de fonction à la liste officielle des serveurs. C’est un service externe qui utilise le DNS pour ouvrir la liste BedrockConnect depuis un serveur partenaire. Une mise à jour du jeu ou un changement du service peut rendre cette procédure inutilisable.

Le README officiel de BedrockConnect précise que les applications mobiles non officielles portant le même nom ne sont pas liées au projet. Si une application vous demande d’installer un logiciel ou de saisir des informations de compte, comparez-la aux instructions du [GitHub officiel](https://github.com/Pugmatt/BedrockConnect).

## Résumé

La méthode DNS de BedrockConnect peut aider les joueurs Switch à rejoindre des serveurs Minecraft Bedrock externes. Configurez le DNS, ouvrez BedrockConnect depuis un serveur partenaire compatible, puis saisissez l’adresse et le port de destination.

Pour rejoindre Aceserver, utilisez les informations à jour du [Portail Aceserver](/fr/), du [Discord officiel](https://discord.gg/acsv) et de la [WIKI Aceserver](https://asv-wiki.acecore.net), plutôt qu’une ancienne valeur de connexion fixe.

## Références

- [README officiel de BedrockConnect sur GitHub](https://github.com/Pugmatt/BedrockConnect)
- [Portail officiel Aceserver](/fr/)
- [WIKI Aceserver](https://asv-wiki.acecore.net)
- [Guide de connexion Switch à un serveur externe utilisé comme référence](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
