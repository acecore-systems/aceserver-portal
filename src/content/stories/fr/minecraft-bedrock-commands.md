---
title: 'Commandes Minecraft Bedrock : vision nocturne, téléportation et heure'
description: Exemples pratiques de commandes Minecraft Bedrock pour la vision nocturne, la téléportation, l'heure, la météo et les objets, avec les vérifications à faire avant usage.
translationOf: minecraft-bedrock-commands
sourceHash: sha256:48a7cedb3fac3a470591186fe2fb1eded8cd39dd32231454d324d338c962218b
date: 2026-08-02T14:00:00+09:00
tags:
  - Minecraft
  - Minecraft Bedrock
  - Commandes
author: Gui
---

Les commandes de Minecraft Bedrock permettent de modifier l'heure ou la météo, de se déplacer vers des coordonnées et de tester un monde. Ce guide rassemble des exemples de base pour un monde personnel ou un monde dans lequel vous avez une autorisation d'administration.

Les serveurs publics peuvent réserver les commandes à leurs administrateurs. Lisez toujours les règles du serveur avant d'y essayer un exemple de cet article.

## Avant de commencer

Pour utiliser de nombreuses commandes dans Bedrock, activez les cheats pour le monde et vérifiez que vous avez les autorisations nécessaires. L'activation des cheats empêche les succès dans ce monde ; faites ce choix en connaissance de cause.

Si vous ne savez pas quoi saisir, commencez dans le chat par :

```mcfunction
/help
```

En ajoutant le nom d'une commande, par exemple /help effect, vous affichez la syntaxe disponible dans le jeu actuel. Les mises à jour de Bedrock peuvent modifier cette syntaxe ; utilisez donc les suggestions du jeu et /help comme vérification finale.

## Commandes fréquentes

### Régler l'heure sur le jour

```mcfunction
/time set day
```

Utilisez cette commande lorsque la nuit arrive ou pour examiner une construction en pleine lumière. Vous pouvez aussi choisir des heures comme noon lorsqu'elles apparaissent dans les suggestions.

### Dégager la météo

```mcfunction
/weather clear
```

Cet exemple arrête la pluie ou les orages afin d'améliorer la visibilité. Les commandes de météo affectent le monde entier ; prévenez donc les autres joueurs dans un monde partagé.

### Changer votre propre mode de jeu

```mcfunction
/gamemode creative @s
```

@s désigne la personne qui exécute la commande. Remplacez creative par survival pour revenir en arrière. Sauvegardez un monde important avant de réaliser de grands changements.

### Se téléporter à des coordonnées

```mcfunction
/tp @s 0 80 0
```

Cette commande vous déplace à X=0, Y=80, Z=0. Vérifiez d'abord que la destination n'est ni creuse ni dangereuse, surtout pour une téléportation sous terre ou en hauteur.

### Vous donner un objet

```mcfunction
/give @s torch 64
```

Cet exemple vous donne 64 torches. Vérifiez les identifiants et quantités d'objets dans les suggestions de saisie. C'est utile pour préparer des outils dans un monde de test ou d'aventure.

### Appliquer une vision nocturne illimitée

```mcfunction
/effect @s night_vision infinite 0 true
```

Utilisez cet exemple pour examiner des grottes ou des constructions sombres. Le true final masque les particules. Pour retirer l'effet, utilisez :

```mcfunction
/effect @s clear night_vision
```

## Si une commande ne fonctionne pas

1. Vérifiez que les cheats sont activés dans un monde personnel ou que vous avez une autorisation d'administration.
2. Vérifiez la syntaxe actuelle avec /help suivi du nom de la commande et avec les suggestions du chat.
3. Ne copiez pas sans changement un guide Java Edition. Java et Bedrock peuvent avoir une syntaxe et des conditions différentes pour le même objectif.
4. Sur un serveur public, suivez d'abord les règles et les indications de ce serveur.

## Testez-les une par une

Les commandes sont puissantes, car elles peuvent modifier un monde immédiatement. Commencez dans un monde de test sauvegardé et essayez une modification à la fois, comme l'heure, la météo ou la vision nocturne.

Pour la syntaxe et les autorisations, consultez l'[introduction aux commandes Bedrock de Microsoft Learn](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable), la [référence des commandes](https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable) et la [référence de la commande effect](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/effect?view=minecraft-bedrock-stable).
