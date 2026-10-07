---
title: 'Using the Skin Maker: create from text or images and check in 3D'
description: 'Create a new Minecraft skin with text and an optional image, choose Classic or Slim, review it in 3D and save a 64×64 PNG.'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-cover-v2.webp
imageAlt: 'Illustration of blank block mannequins and a paint palette representing skin creation. Not an example of generated output.'
relatedStories: [aceserver-beginners-guide]
translationOf: minecraft-skin-maker-guide
sourceHash: sha256:417830da11a893bd01fad6116a244c4a149a4cf163397414588057a87b317f1d
lastUpdated: 2026-10-07
---

The [Skin Maker](/en/skin-maker/) creates new Minecraft skins from text and an optional reference image. Review the result in 3D and save a 64×64 PNG.

## 1. Choose an arm type and describe the look

Classic uses 4px arms; Slim uses 3px arms. Describe colors, clothing or other details in text. An optional reference can be PNG, JPEG or WebP up to 5 MB. After generation, use “Edit your skin” to choose a part, face and layer, then draw or fill pixels. For AI edits, choose a rectangle, visible face or body part, and consent to sending the current skin and instructions. Pixels outside the area stay unchanged. Both manual and AI edits support undo and redo. Drawing does not send data to AI. AI edits share the generation usage limits.

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">How Classic and Slim arms differ</strong><span>These schematics show arm width, not examples of generated skins. Choose the same model in your game as when creating the skin.</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="Arms are 4px wide" width="240" height="300" loading="lazy" decoding="async"/><span>Arms are 4px wide</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="Arms are 3px wide" width="240" height="300" loading="lazy" decoding="async"/><span>Arms are 3px wide</span></li></ol></figure>

Paint directly on the 3D model with the pencil. Right-drag or drag empty space to rotate, and scroll to zoom. On touch screens, choose “Rotate / zoom”. “Show only the selected body part” lets you reach the inside of arms. Outer layers are hidden while editing the base. Use the selected 2D face for fine adjustments.

## 2. Consent and wait for generation

Before sending, confirm your right to use the image and consent to AI processing. Text and images go to the configured OpenAI API or Cloudflare Workers AI provider. Do not include personal or secret information. Generation may take several minutes; usage limits or congestion may prevent it. Follow the on-screen status.

## 3. Review the 3D result

Check the front, back and sides. Drag to rotate and toggle automatic rotation or the outer layer. AI output may differ from your intention, so inspect arms and clothing boundaries before saving.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">Checks from generation to saving</strong><span>Generation requires consent. Review the result before saving it.</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>Generate from text and an optional image</strong><span>Confirm usage rights and consent to AI processing before sending.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>Review all sides in 3D</strong><span>Check front, back, sides, arms and clothing boundaries.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>Save the 64×64 PNG</strong><span>Save before closing the page, then import using the same game model.</span></li></ol></figure>

## 4. Save and import in your game

Download with “Save 64×64 PNG” and use your game’s custom skin import. Select the same Classic or Slim model in the game. Import methods and support vary by edition and device; universal compatibility is not guaranteed. The site does not store your prompt or reference image. Unpublished skins are lost when you close the page, so save your PNG first.

## 5. Publish selected skins to the store

After generation, give your skin a name and agree that anyone may download and use it for free to publish it in the [Skin Store](/en/skin-maker/store/). Publishing is optional; only the name and generated skin are stored. You can withdraw it within 24 hours of generation while this generation page remains open.

## 6. Copy and edit a store skin

Choose “Copy and edit” on a store card or its 3D detail to open a copy in the Skin Maker. The arm type and pixels are preserved. Draw on it in 3D or consent to a partial AI edit. The original is never overwritten. Save the edited PNG, or enter a name and consent to publish it as a separate skin. Copying alone does not publish anything. Further edits after publication create another work. Withdrawing a copy does not affect the original.

Publish a copy within 24 hours of copying while the original is still public. Publication and withdrawal keys stay only on this page. Copying and manual editing use no AI quota. AI edits share generation limits. Copied skins are limited to five publications per day and one per minute, with a site-wide cap as well.
