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
sourceHash: sha256:417830da11a893bd01fad6116a244c4a149a4cf163397414588057a87b317f1d
lastUpdated: 2026-10-07
---

[스킨 메이커](/ko/skin-maker/)는 글과 선택 참고 이미지로 새 Minecraft 스킨을 만듭니다. 결과를 3D로 확인하고 64×64 PNG로 저장할 수 있습니다.

## 1. 팔 형태와 이미지 선택

Classic은 4px, Slim은 3px 팔입니다. 색상과 옷 등을 글로 설명합니다. 참고 이미지는 선택 사항이며 PNG·JPEG·WebP, 최대 5 MB입니다. 생성 후 “스킨 편집”에서 부위·면·레이어를 선택하고 펜이나 채우기로 수정할 수 있습니다. AI 수정은 사각형·현재 면·부위를 선택한 뒤 현재 스킨과 지시 전송에 동의하고 실행합니다. 영역 밖 픽셀은 유지되며 수동 편집과 AI 수정 모두 실행 취소와 다시 실행을 지원합니다. 수동 편집은 AI로 전송하지 않습니다. AI 수정은 생성과 이용 한도를 공유합니다.

<figure class="article-diagram article-diagram--skin-arms" data-layout="choices" data-tone="amber" data-count="2" aria-labelledby="diagram-skin-arms"><figcaption><strong id="diagram-skin-arms">Classic과 Slim의 팔 차이</strong><span>팔의 가로 폭을 나타낸 도식입니다. 생성된 스킨의 예시가 아닙니다. 게임에서도 제작할 때와 같은 모델을 선택합니다.</span></figcaption><ol class="article-diagram__nodes"><li><strong>Classic</strong><img src="/uploads/stories/skin-arm-classic-diagram.svg" alt="팔 너비 4px" width="240" height="300" loading="lazy" decoding="async"/><span>팔 너비 4px</span></li><li><strong>Slim</strong><img src="/uploads/stories/skin-arm-slim-diagram.svg" alt="팔 너비 3px" width="240" height="300" loading="lazy" decoding="async"/><span>팔 너비 3px</span></li></ol></figure>

펜으로 3D 모델에 직접 그릴 수 있습니다. 오른쪽 버튼이나 빈 공간을 드래그하면 회전하고, 휠로 확대합니다. 터치 화면에서는 “회전 / 확대”를 선택하세요. “선택한 부위만 표시”로 팔 안쪽도 편집할 수 있습니다. 기본 레이어 편집 시 외부 레이어를 숨깁니다. 세밀한 조정에는 선택한 2D 면을 사용하세요.

## 2. 동의하고 생성 기다리기

보내기 전 이미지 사용 권리와 AI 처리 동의를 확인합니다. 글과 이미지는 설정된 OpenAI API 또는 Cloudflare Workers AI로 전송됩니다. 개인정보나 비밀을 넣지 마세요. 생성에 몇 분 걸리거나 사용 제한·혼잡으로 실패할 수 있으므로 화면 안내를 확인합니다.

## 3. 3D 결과 확인

앞·뒤·양옆을 확인하고 드래그로 회전합니다. 자동 회전과 외부 레이어도 전환할 수 있습니다. AI 결과가 의도와 다를 수 있으니 저장 전 팔과 옷 경계도 확인하세요.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-skin-check-save"><figcaption><strong id="diagram-skin-check-save">생성부터 저장까지의 확인 순서</strong><span>생성에는 동의가 필요합니다. 생성 후에도 외형을 확인한 뒤 저장합니다.</span></figcaption><ol class="article-diagram__nodes"><li><span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 17 9-12 5 4-10 11H4Z"/><path d="m12 8 5 4M4 20l1-3"/></svg></span><strong>글과 선택 이미지로 생성</strong><span>전송 전에 사용 권리와 AI 처리 동의를 확인합니다.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10v10M2 7l10 5 10-5"/></svg></span><strong>3D로 모든 방향 확인</strong><span>앞, 뒤, 좌우와 팔·옷의 경계를 살펴봅니다.</span></li><li><span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 2h13l5 5v15H2V2Zm2 0v7h12V3M6 22V13h12v9"/></svg></span><strong>64×64 PNG 저장</strong><span>페이지를 닫기 전에 저장하고 같은 모델로 게임에 불러옵니다.</span></li></ol></figure>

## 4. 저장하고 게임에 불러오기

“64×64 PNG 저장”으로 내려받고 게임의 사용자 스킨 불러오기 기능을 사용합니다. 게임에서도 같은 Classic·Slim 형태를 고릅니다. 기기와 버전마다 지원과 방법이 달라 모든 환경을 보장하지 않습니다. 사이트는 입력한 글과 참고 이미지를 저장하지 않습니다. 공개하지 않은 스킨은 페이지를 닫으면 사라지므로 PNG를 먼저 저장하세요.

## 5. 원하는 스킨을 스토어에 공개하기

생성 후 스킨에 이름을 붙이고 누구나 무료로 내려받아 사용할 수 있다는 데 동의하면 [스킨 스토어](/ko/skin-maker/store/)에 공개할 수 있습니다. 공개는 선택 사항이며 이름과 생성된 스킨만 저장됩니다. 생성 후 24시간 이내에 이 생성 화면을 열어 둔 동안에는 공개를 취소할 수 있습니다.

## 6. 스토어 스킨을 복사하여 편집하기

스토어 카드나 3D 상세 화면에서 “복사하여 편집”을 선택하면 제작 도구에서 복사본을 엽니다. 팔 유형과 원래 픽셀을 유지합니다. 3D에서 직접 그리거나 동의 후 AI로 부분 수정할 수 있습니다. 원본은 덮어쓰지 않습니다. 편집한 PNG를 저장하거나 이름과 공개 동의를 입력하여 별도의 스킨으로 공개하세요. 복사만으로 자동 공개되지 않습니다. 공개 후 다시 편집하면 새 작품으로 등록됩니다. 복사본을 취소해도 원본에는 영향이 없습니다.

원본이 공개 상태일 때 복사 후 24시간 이내에 공개할 수 있습니다. 공개 및 취소 키는 이 페이지에만 유지됩니다. 복사와 수동 편집은 AI 한도를 사용하지 않습니다. AI 수정은 생성과 공통 한도를 사용합니다. 복사본 공개는 하루 5개, 1분에 1개까지이며 사이트 전체 한도도 있습니다.
