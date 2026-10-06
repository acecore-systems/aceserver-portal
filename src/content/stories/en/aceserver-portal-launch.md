---
title: We Launched the Aceserver Portal
description: We brought the pre-join information that had been split across Discord, the Wiki, videos, and world maps together into one clear entry point.
translationOf: aceserver-portal-launch
sourceHash: sha256:7135f8b1e68e3bdb744b643f856f26305e2d1e25296653417993ddf4cdd9e1c0
date: 2026-06-07T10:00:00+09:00
tags:
  - Announcement
  - Portal
author: Gui
image: /uploads/stories/aceserver-portal-launch.webp
imageAlt: The Aceserver Portal homepage shown over a Minecraft cityscape
lastUpdated: '2026-10-06T13:52:45+09:00'
---

We launched the official portal for Aceserver, a free public Minecraft server that anyone can join.

Aceserver is open to both Java Edition and Bedrock Edition players. The portal brings the server overview, joining information, videos, world maps, and Wiki links together into one entry point.

## One Entry Point for the Information You Need Before Joining

There are several things people may want to check before joining Aceserver: what kind of server it is, how to join, which worlds are available, and where to find the rules and further details. When that information is split across Discord, the Wiki, videos, and world maps, first-time visitors can find it hard to choose their first step.

We therefore designed the portal as a clear entrance connecting the existing information sources, rather than replacing them.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-aceserver-portal-launch">
<figcaption><strong id="diagram-aceserver-portal-launch">The portal connects official information by purpose</strong><span>The portal brings entry points together; each official page remains the source for its guidance. Check current details before joining.</span></figcaption>
<ol class="article-diagram__nodes">
<li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 10 12 3l9 7M5 10v11h14V10M9 21v-7h6v7"/></svg></span><strong>Start at the portal</strong><span>Review the overview and choose what you need to find.</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/></svg></span><strong>Videos and world maps</strong><span>Get a feel for the server and browse the worlds presented.</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7"/></svg></span><strong>WIKI and Discord</strong><span>Open detailed guidance on joining and rules.</span></li>
</ol></figure>

## Keeping Videos, World Maps, and the Wiki Connected

The homepage gives a short introduction to the server and how to join, then guides visitors to videos and the maps for each world. Information that continues to change, such as play instructions and rules, remains on the Wiki, while the portal concentrates on organizing the entry points.

## A Structure That Can Keep Being Updated

The portal is a static site built with Astro and Tailwind CSS v4. Page copy and site settings can be updated through Sveltia CMS, so announcements and navigation can be reviewed without editing code.

Production and operational details are available in the [Acecore Systems case study](https://systems.acecore.net/en/works/#case-aceserver-portal).

See the current joining information on the [Aceserver Portal homepage](/en/).
