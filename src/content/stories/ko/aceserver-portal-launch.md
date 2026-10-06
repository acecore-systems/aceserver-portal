---
title: Aceserver Portal을 공개했습니다
description: Discord, Wiki, 동영상, 월드 맵에 나뉘어 있던 참가 전 정보를 하나의 입구로 정리했습니다.
translationOf: aceserver-portal-launch
sourceHash: sha256:7135f8b1e68e3bdb744b643f856f26305e2d1e25296653417993ddf4cdd9e1c0
date: 2026-06-07T10:00:00+09:00
tags:
  - 공지
  - 포털
author: Gui
image: /uploads/stories/aceserver-portal-launch.webp
imageAlt: Minecraft 거리 풍경을 배경으로 한 Aceserver Portal의 첫 화면
lastUpdated: '2026-10-06T13:52:45+09:00'
---

누구나 참가할 수 있는 무료 공개 Minecraft 서버 ‘Aceserver’의 공식 Portal을 공개했습니다.

Aceserver는 Java Edition과 Bedrock Edition 모두에서 플레이할 수 있습니다. 이번 Portal에서는 서버 소개, 참가 안내, 동영상, 월드 맵, Wiki로 가는 길을 하나의 입구에 모았습니다.

## 참가 전에 필요한 정보를 하나의 입구로

Aceserver에 참가하기 전에는 확인하고 싶은 정보가 여러 가지 있습니다. 어떤 서버인지, 어떻게 참가하는지, 어떤 월드가 있는지, 규칙과 자세한 내용은 어디에서 확인하는지 등입니다. 정보가 Discord, Wiki, 동영상, 월드 맵으로 나뉘어 있으면 처음 방문한 사람은 어디서 시작해야 할지 고르기 어렵습니다.

그래서 기존 정보원을 대체하지 않고, 각 정보로 헤매지 않고 이동할 수 있는 입구로 Portal을 설계했습니다.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-aceserver-portal-launch">
<figcaption><strong id="diagram-aceserver-portal-launch">포털에서 목적에 맞는 공식 정보로</strong><span>포털은 여러 정보의 입구를 모으지만 원래 안내를 대체하지 않습니다. 참여 전 최신 공식 안내를 확인하세요.</span></figcaption>
<ol class="article-diagram__nodes">
<li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 10 12 3l9 7M5 10v11h14V10M9 21v-7h6v7"/></svg></span><strong>포털에서 시작하기</strong><span>전체 소개와 참여 입구를 보고 필요한 정보를 고릅니다.</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/></svg></span><strong>동영상·월드 맵</strong><span>동영상으로 분위기를 알고 공개된 월드를 찾아봅니다.</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7"/></svg></span><strong>WIKI·Discord</strong><span>참여 방법과 규칙 등 자세한 안내를 확인합니다.</span></li>
</ol></figure>

## 동영상, 월드 맵, Wiki를 서로 단절시키지 않기

첫 화면에서는 서버 소개와 참가 방법을 짧게 알리고 동영상과 각 월드 맵으로 이동할 수 있게 했습니다. 플레이 방법과 규칙처럼 계속 바뀌는 정보는 Wiki에서 안내하고, Portal은 입구를 정리하는 역할에 집중합니다.

## 계속 갱신할 수 있는 구성

Portal은 Astro와 Tailwind CSS v4로 만든 정적 사이트입니다. 페이지 본문과 사이트 설정은 Sveltia CMS에서 갱신할 수 있어 코드를 수정하지 않고도 공지와 이동 경로를 조정할 수 있습니다.

제작과 운영에 관한 자세한 내용은 [Acecore Systems 사례](https://systems.acecore.net/ko/works/#case-aceserver-portal)에 실었습니다.

현재 참가 안내는 [Aceserver Portal 첫 화면](/ko/)에서 확인할 수 있습니다.
