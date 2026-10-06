---
title: Aceserver Portal 正式上线
description: 将原本分散在 Discord、Wiki、视频和世界地图中的加入前信息，整理到一个统一入口。
translationOf: aceserver-portal-launch
sourceHash: sha256:7135f8b1e68e3bdb744b643f856f26305e2d1e25296653417993ddf4cdd9e1c0
date: 2026-06-07T10:00:00+09:00
tags:
  - 公告
  - Portal
author: Gui
image: /uploads/stories/aceserver-portal-launch.webp
imageAlt: 以 Minecraft 城镇为背景的 Aceserver Portal 首页
lastUpdated: '2026-10-06T13:52:45+09:00'
---

我们上线了人人都可参加的免费 Minecraft 公共服务器“Aceserver”的官方 Portal。

Aceserver 支持 Java 版和基岩版玩家。此次 Portal 将服务器简介、加入指南、视频、世界地图和 Wiki 入口汇总到同一个起点。

## 把加入前需要的信息集中到一个入口

加入 Aceserver 前，需要确认的信息不止一项：这是怎样的服务器、如何加入、有哪些世界，以及到哪里查看规则和详细说明。如果这些信息分散在 Discord、Wiki、视频和世界地图中，初次来访的人往往难以判断第一步该去哪里。

因此，我们没有取代现有的信息来源，而是把 Portal 设计成一个可以清晰前往各处的入口。

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-aceserver-portal-launch">
<figcaption><strong id="diagram-aceserver-portal-launch">门户连接不同用途的官方信息</strong><span>门户汇总各信息来源的入口，但不取代原有页面。加入前请查看最新官方指南。</span></figcaption>
<ol class="article-diagram__nodes">
<li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 10 12 3l9 7M5 10v11h14V10M9 21v-7h6v7"/></svg></span><strong>从门户开始</strong><span>先了解服务器概况，再按目的选择要看的信息。</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/></svg></span><strong>视频与世界地图</strong><span>通过视频了解氛围，并查找公开展示的世界。</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7"/></svg></span><strong>WIKI与Discord</strong><span>继续查看加入方式、规则等详细指南。</span></li>
</ol></figure>

## 不让视频、世界地图与 Wiki 彼此割裂

首页会简要说明服务器概况和加入方式，并引导访客前往视频和各个世界地图。玩法和规则等会持续更新的信息仍由 Wiki 维护，Portal 则专注于整理入口。

## 可以持续更新的结构

Portal 是使用 Astro 和 Tailwind CSS v4 构建的静态网站。页面正文与网站设置可通过 Sveltia CMS 更新，因此无需修改代码也能调整公告和访问路径。

制作与运维方面的详情收录在 [Acecore Systems 案例](https://systems.acecore.net/zh-cn/works/#case-aceserver-portal)中。

当前加入指南可从 [Aceserver Portal 首页](/zh-cn/)查看。
