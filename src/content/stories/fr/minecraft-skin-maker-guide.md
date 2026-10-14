---
title: 'Utiliser le créateur de skins Minecraft | Texte, images, édition 3D et PNG'
description: 'Créez une nouvelle skin avec du texte et une image facultative, choisissez Classic ou Slim, vérifiez en 3D et sauvegardez un PNG 64×64. Vous pouvez aussi charger votre propre PNG de 64×64 et le modifier à la main sans utiliser l’IA.'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-cover-v2.webp
imageAlt: 'Illustration de mannequins en blocs blancs et d’une palette représentant la création de skins. Ce n’est pas un résultat généré.'
relatedStories: [aceserver-beginners-guide]
translationOf: minecraft-skin-maker-guide
sourceHash: sha256:53f8e1662fe56ef7d93fab2aba9733911a0240d614d35e416b2b41624217ccc2
lastUpdated: 2026-10-14T12:00:00+09:00
---

Le [créateur de skins](/fr/skin-maker/) génère de nouvelles skins Minecraft à partir de texte et d’une image facultative. Vérifiez en 3D et sauvegardez un PNG 64×64. Vous pouvez aussi charger votre propre PNG de 64×64 et le modifier à la main sans utiliser l’IA.

Pour commencer, choisissez le modèle des bras et décrivez brièvement les vêtements et couleurs afin de créer un skin. Avant d’utiliser le PNG enregistré, consultez le [guide officiel sur les skins et leur changement](https://www.minecraft.net/en-us/article/what-is-minecraft-skin) pour vérifier l’importation d’images sur votre édition et appareil. Vous pouvez enregistrer et utiliser le PNG sans le publier dans la boutique.

## 1. Choisir les bras et décrire le style

Classic utilise des bras de 4px, Slim de 3px. Décrivez couleurs ou vêtements. L’image facultative accepte PNG, JPEG ou WebP jusqu’à 5 MB. Après génération, utilisez « Modifier votre skin » pour choisir une partie, une face et une couche, puis dessiner ou remplir les pixels. Pour une modification IA, choisissez un rectangle, la face visible ou une partie et acceptez d’envoyer le skin actuel et les instructions. Les pixels extérieurs sont conservés. Les modifications manuelles et IA peuvent être annulées et rétablies. Dessiner n’envoie rien à l’IA. Les modifications partagent les limites de génération.

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">Différence entre les bras Classic et Slim</strong><span>Ces schémas montrent la largeur des bras, pas des skins générés. Choisissez dans le jeu le même modèle que lors de la création.</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="Bras de 4px de large" width="240" height="300" loading="lazy" decoding="async"/><span>Bras de 4px de large</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="Bras de 3px de large" width="240" height="300" loading="lazy" decoding="async"/><span>Bras de 3px de large</span></li></ol></figure>

Peignez directement sur le modèle 3D avec le crayon. Faites glisser avec le bouton droit ou sur le fond pour tourner et utilisez la molette pour zoomer. Sur écran tactile, choisissez « Tourner / zoomer ». « Afficher uniquement la partie sélectionnée » permet de modifier l’intérieur des bras. La couche externe est masquée pendant la retouche de la base. Utilisez la face 2D sélectionnée pour les détails.

### Partir de votre propre PNG

Choisissez la modification de votre propre skin dans le panneau de saisie à gauche, réglez le choix commun Classic ou Slim selon votre skin, puis chargez un PNG de 64×64 de 1 MB maximum. Le passage entre ce mode et la création avec IA conserve les saisies et les modifications en cours. La couche de base doit être opaque ; l’ancien format 64×32 est refusé. Les PNG en niveaux de gris et les couches externes partiellement transparentes sont acceptés.

Le chargement réussi d’un nouveau fichier remplace le skin actuel et son historique d’annulation : enregistrez d’abord en PNG les travaux à conserver. Un échec de chargement préserve le skin et l’historique. Le chargement et la retouche manuelle se font dans le navigateur, sans envoi à l’IA. Les retouches partielles par IA nécessitent un consentement et une exécution distincts. Les étapes de génération suivantes concernent le mode de création avec IA.

## 2. Consentir et attendre

Confirmez vos droits et le consentement avant l’envoi. Texte et images sont transmis au fournisseur configuré : OpenAI API ou Cloudflare Workers AI. N’incluez aucune donnée personnelle ou secrète. La génération peut prendre quelques minutes ou être empêchée par les limites/la congestion ; suivez les messages affichés.

## 3. Vérifier en 3D

Examinez face, dos et côtés. Faites glisser pour tourner, activez la rotation automatique ou la couche extérieure. L’IA peut différer de votre intention ; vérifiez bras et raccords des vêtements avant de sauvegarder.

Activez la grille pour voir les limites des pixels sur le modèle 3D. Elle suit la rotation, les couches et la forme Slim. Ce repère d’édition ne figure pas dans le PNG enregistré.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">Du choix du point de départ à l’enregistrement</strong><span>La génération par IA et le chargement de votre PNG sont deux points de départ. Vérifiez les retouches avant d’enregistrer dans les deux cas.</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>Générer avec IA ou charger votre PNG</strong><span>La génération exige les droits d’utilisation et le consentement à l’IA. Votre PNG est chargé dans le navigateur.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>Vérifier tous les côtés en 3D</strong><span>Examinez l’avant, l’arrière, les côtés, les bras et les contours des vêtements.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>Enregistrer le PNG 64×64</strong><span>Enregistrez avant de fermer la page, puis importez avec le même modèle dans le jeu.</span></li></ol></figure>

## 4. Sauvegarder et importer dans le jeu

Téléchargez avec « Sauvegarder le PNG 64×64 » puis utilisez l’import de skin personnalisée du jeu. Choisissez le même modèle Classic ou Slim. Méthode et compatibilité varient selon édition et appareil ; aucune compatibilité universelle n’est garantie. Le site ne conserve ni le texte saisi ni l’image de référence. Les skins non publiées sont perdues à la fermeture de la page ; sauvegardez donc le PNG avant.

## 5. Publier les skins de votre choix dans la boutique

Après la génération, nommez votre skin et acceptez que chacun puisse la télécharger et l’utiliser gratuitement pour la publier dans la [Boutique de skins](/fr/skin-maker/store/). La publication est facultative ; seuls le nom et la skin générée sont conservés. Vous pouvez la retirer dans les 24 heures suivant la génération tant que cette page de génération reste ouverte.

Charger votre propre PNG ne permet pas de le publier dans la boutique. Remplacer un skin généré ou une copie de la boutique par un nouveau PNG supprime aussi l’accès aux anciennes commandes de publication et de retrait.

## 6. Copier et modifier un skin de la boutique

Choisissez « Copier et modifier » sur une carte ou dans sa vue 3D pour ouvrir une copie dans le créateur. Le type de bras et les pixels sont conservés. Dessinez en 3D ou consentez à une modification partielle par IA. L’original n’est jamais écrasé. Enregistrez le PNG ou saisissez un nom et consentez à publier un skin distinct. Copier ne publie rien automatiquement. Modifier après publication crée une nouvelle œuvre. Retirer la copie n’affecte pas l’original.

Publiez dans les 24 heures suivant la copie, tant que l’original est public. Les clés de publication et de retrait restent uniquement sur cette page. Copier et modifier à la main ne consomment pas d’IA. Les modifications par IA partagent les limites de génération. Les copies sont limitées à cinq publications par jour et une par minute, avec un plafond pour le site.
