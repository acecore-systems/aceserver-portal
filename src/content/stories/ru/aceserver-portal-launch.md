---
title: Портал Aceserver открыт
description: Мы собрали в одной точке входа информацию перед подключением, которая раньше была распределена между Discord, Wiki, видео и картами миров.
translationOf: aceserver-portal-launch
sourceHash: sha256:7135f8b1e68e3bdb744b643f856f26305e2d1e25296653417993ddf4cdd9e1c0
date: 2026-06-07T10:00:00+09:00
tags:
  - Объявление
  - Портал
author: Gui
image: /uploads/stories/aceserver-portal-launch.webp
imageAlt: Главная страница портала Aceserver на фоне города Minecraft
lastUpdated: '2026-10-06T13:52:45+09:00'
---

Мы открыли официальный портал Aceserver — бесплатного публичного сервера Minecraft, к которому может присоединиться любой желающий.

На Aceserver можно играть как с Java Edition, так и с Bedrock Edition. Портал объединяет в одной точке обзор сервера, инструкции по входу, видео, карты миров и ссылки на Wiki.

## Вся информация перед подключением в одной точке

До входа на Aceserver хочется проверить несколько вещей: что это за сервер, как присоединиться, какие миры доступны и где находятся правила и подробности. Когда информация распределена между Discord, Wiki, видео и картами миров, новому посетителю трудно понять, с чего начать.

Поэтому мы спроектировали портал как понятный вход к уже существующим источникам информации, а не как их замену.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-aceserver-portal-launch">
<figcaption><strong id="diagram-aceserver-portal-launch">Портал связывает официальную информацию по целям</strong><span>Портал собирает точки входа, но не заменяет исходные источники. Перед подключением проверьте актуальные официальные инструкции.</span></figcaption>
<ol class="article-diagram__nodes">
<li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 10 12 3l9 7M5 10v11h14V10M9 21v-7h6v7"/></svg></span><strong>Начать с портала</strong><span>Посмотреть обзор и выбрать нужную информацию.</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/></svg></span><strong>Видео и карты миров</strong><span>Узнать об атмосфере и посмотреть представленные миры.</span></li>
<li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7"/></svg></span><strong>WIKI и Discord</strong><span>Открыть подробные инструкции по участию и правила.</span></li>
</ol></figure>

## Видео, карты миров и Wiki остаются связанными

Главная страница кратко знакомит с сервером и способом подключения, а затем ведёт к видео и картам каждого мира. Постоянно обновляемая информация, например правила и особенности игры, остаётся в Wiki; портал сосредоточен на упорядочивании входных маршрутов.

## Структура, которую можно продолжать обновлять

Портал — статический сайт на Astro и Tailwind CSS v4. Тексты страниц и настройки сайта можно обновлять через Sveltia CMS, поэтому объявления и маршруты удаётся пересматривать без изменения кода.

Подробности разработки и эксплуатации приведены в [кейсе Acecore Systems](https://systems.acecore.net/ru/works/#case-aceserver-portal).

Актуальные инструкции по входу доступны на [главной странице портала Aceserver](/ru/).
