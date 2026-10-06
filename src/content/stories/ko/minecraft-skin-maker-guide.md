---
title: '스킨 메이커 사용법: 글·이미지로 만들고 3D로 확인'
description: '글과 선택 참고 이미지로 새 Minecraft 스킨을 만들고 Classic·Slim 선택, 3D 확인, 64×64 PNG 저장을 진행하는 안내입니다.'
date: 2026-09-30T21:15:00+09:00
author: Gui
tags: [Minecraft, Aceserver, Skin Maker]
image: /uploads/stories/minecraft-skin-maker-cover-v2.webp
imageAlt: '흰색 블록 마네킹과 팔레트로 스킨 제작을 표현한 설명용 그림. 생성 결과의 예시가 아닙니다.'
relatedStories: [aceserver-beginners-guide]
translationOf: minecraft-skin-maker-guide
sourceHash: sha256:fe34610835abbf50b5d0bf33f7222c06525fdaa5a148c518fc4c9e36244aa7f8
lastUpdated: 2026-10-06T08:52:00+09:00
---

[스킨 메이커](/ko/skin-maker/)는 글과 선택 참고 이미지로 새 Minecraft 스킨을 만듭니다. 결과를 3D로 확인하고 64×64 PNG로 저장할 수 있습니다.

## 1. 팔 형태와 이미지 선택

Classic은 4px, Slim은 3px 팔입니다. 색상과 옷 등을 글로 설명합니다. 참고 이미지는 선택 사항이며 PNG·JPEG·WebP, 최대 5 MB입니다. 기존 스킨 편집이 아닌 새 스킨 생성 도구입니다.

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">Classic과 Slim의 팔 차이</strong><span>팔의 가로 폭을 나타낸 도식입니다. 생성된 스킨의 예시가 아닙니다. 게임에서도 제작할 때와 같은 모델을 선택합니다.</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="팔 너비 4px" width="240" height="300" loading="lazy" decoding="async"/><span>팔 너비 4px</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="팔 너비 3px" width="240" height="300" loading="lazy" decoding="async"/><span>팔 너비 3px</span></li></ol></figure>

## 2. 동의하고 생성 기다리기

보내기 전 이미지 사용 권리와 AI 처리 동의를 확인합니다. 글과 이미지는 설정된 OpenAI API 또는 Cloudflare Workers AI로 전송됩니다. 개인정보나 비밀을 넣지 마세요. 생성에 몇 분 걸리거나 사용 제한·혼잡으로 실패할 수 있으므로 화면 안내를 확인합니다.

## 3. 3D 결과 확인

앞·뒤·양옆을 확인하고 드래그로 회전합니다. 자동 회전과 외부 레이어도 전환할 수 있습니다. AI 결과가 의도와 다를 수 있으니 저장 전 팔과 옷 경계도 확인하세요.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">생성부터 저장까지의 확인 순서</strong><span>생성에는 동의가 필요합니다. 생성 후에도 외형을 확인한 뒤 저장합니다.</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>글과 선택 이미지로 생성</strong><span>전송 전에 사용 권리와 AI 처리 동의를 확인합니다.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>3D로 모든 방향 확인</strong><span>앞, 뒤, 좌우와 팔·옷의 경계를 살펴봅니다.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>64×64 PNG 저장</strong><span>페이지를 닫기 전에 저장하고 같은 모델로 게임에 불러옵니다.</span></li></ol></figure>

## 4. 저장하고 게임에 불러오기

“64×64 PNG 저장”으로 내려받고 게임의 사용자 스킨 불러오기 기능을 사용합니다. 게임에서도 같은 Classic·Slim 형태를 고릅니다. 기기와 버전마다 지원과 방법이 달라 모든 환경을 보장하지 않습니다. 사이트는 글·이미지·스킨을 저장하지 않으며 페이지를 닫으면 작업이 사라지므로 PNG를 먼저 저장하세요.
