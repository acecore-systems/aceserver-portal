---
title: Switch에서 Minecraft 베드락 외부 서버에 접속하는 방법 | BedrockConnect 가이드
description: Nintendo Switch의 Minecraft에서 BedrockConnect를 사용해 외부 베드락 서버에 접속하는 방법을 설명합니다. DNS 설정, 서버 정보 입력, Aceserver 접속 시 확인할 내용을 정리했습니다.
translationOf: minecraft-bedrockconnect-switch
sourceHash: sha256:65a6717569d120bd04069ebe6cada6b31d2b374e35962d1f6554496ff011ab7e
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - 베드락 에디션
  - Nintendo Switch
  - 시작 가이드
author: Gui
---

Nintendo Switch의 Minecraft 베드락 에디션에서 공식 추천 서버가 아닌 서버에 참여하고 싶다면 BedrockConnect를 사용할 수 있습니다. Switch의 DNS를 BedrockConnect로 지정한 뒤, 추천 서버를 입구로 이용해 베드락 서버 목록을 여는 방식입니다.

이 글에서는 Switch에서 Aceserver 같은 외부 베드락 서버에 접속하는 흐름을 설명합니다. 서버 주소와 포트는 서버마다 다르므로 각 서버의 공식 안내에서 최신 정보를 확인하세요.

BedrockConnect는 Minecraft나 Nintendo의 공식 기능이 아닙니다. 무료 오픈 소스 프로젝트이지만 사용하기 전에 [공식 GitHub README](https://github.com/Pugmatt/BedrockConnect)를 확인하고, 공식 저장소가 아닌 곳의 앱이나 다운로드는 사용하지 마세요.

## BedrockConnect로 할 수 있는 일

Switch의 Minecraft에는 임의의 외부 서버를 직접 추가하는 일반적인 서버 목록이 없습니다. BedrockConnect는 DNS와 추천 서버를 입구로 사용해 목적지 서버를 입력하는 화면을 엽니다.

1. Switch의 DNS 설정을 BedrockConnect로 변경합니다.
2. Minecraft의 “서버” 탭에서 호환되는 추천 서버를 엽니다.
3. BedrockConnect 화면에서 목적지 서버 주소와 포트를 입력합니다.
4. BedrockConnect에서 목적지 서버로 이동합니다.

목적지 서버가 베드락 에디션을 지원하지 않으면 DNS를 바꾸는 것만으로는 접속할 수 없습니다. DNS 값과 화면은 나중에 변경될 수 있으므로 이 글의 값보다 [BedrockConnect 공식 README](https://github.com/Pugmatt/BedrockConnect)의 최신 안내를 우선하세요.

## 시작 전에 준비할 것

- Minecraft 베드락 에디션을 실행할 수 있는 Nintendo Switch
- 온라인 플레이가 가능한 Minecraft와 Microsoft 계정
- 목적지 서버가 공개한 베드락 주소와 포트
- 나중에 Switch의 DNS를 되돌릴 수 있도록 현재 네트워크 설정

Aceserver에 접속하려면 먼저 [Aceserver 포털](/ko/)과 [공식 Discord](https://discord.gg/acsv)에서 현재 참가 안내를 확인하세요. 규칙과 참가 후 Discord 연동처럼 바뀔 수 있는 정보는 [Aceserver WIKI](https://asv-wiki.acecore.net)를 기준으로 삼습니다.

## 1단계: Switch DNS를 수동으로 설정하기

1. Switch의 “설정”을 열고 “인터넷”에서 “인터넷 설정”을 선택합니다.
2. 연결된 네트워크를 선택하고 “설정 변경”을 엽니다.
3. “DNS 설정”을 “자동”에서 “수동”으로 변경합니다.
4. BedrockConnect 공식 README에 표시된 현재 값을 입력합니다. 2026년 8월 6일 기준 안내 값은 다음과 같습니다.
   - 기본 DNS: `104.238.130.180`
   - 보조 DNS: `8.8.8.8`

5. 설정을 저장하고 연결 테스트를 실행합니다.

이 설정은 Switch 네트워크 연결에 적용됩니다. BedrockConnect 사용이 끝나면 같은 화면에서 DNS 설정을 “자동”으로 되돌리세요.

## 2단계: Minecraft에서 BedrockConnect 열기

1. Minecraft를 실행하고 Microsoft 계정으로 로그인합니다.
2. “플레이”를 열고 “서버” 탭을 선택합니다.
3. 다음 추천 서버 중 하나에 접속합니다.
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

BedrockConnect 공식 README는 이 서버들을 DNS 리디렉션에 호환되는 추천 서버로 안내합니다. 접속이 성공하면 일반 추천 서버 대신 BedrockConnect 서버 목록이 표시됩니다.

일반 추천 서버가 열리면 DNS 값을 확인하고 다른 호환 서버로 시도하세요. 게임이나 네트워크 연결을 다시 시작하면 도움이 될 수도 있습니다.

## 3단계: 목적지 서버 추가하기

BedrockConnect 화면이 표시되면 다음 순서로 외부 서버를 추가합니다.

1. `Connect to a Server`를 선택합니다.
2. `Server Address`에 목적지 도메인 또는 IP 주소를 입력합니다.
3. `Server Port`에 목적지 서버가 안내한 베드락 포트를 입력합니다. 일부 서버는 `19132`를 사용하지만, 항상 해당 서버의 안내를 따르세요.
4. `Display Name`에 알아보기 쉬운 이름을 입력합니다. 선택 사항입니다.
5. 다음에 입력을 생략하려면 `Add to server list`를 켭니다.
6. 제출 버튼을 선택해 접속을 시작합니다.

저장된 항목을 수정하려면 `Manage Server List`를 열고 `Edit a Server`를 선택한 다음 수정할 서버를 고릅니다.

## Aceserver에 접속하기

Aceserver는 Java Edition과 베드락 에디션 양쪽의 플레이어를 받는 공개 Minecraft 서버입니다. 다만 BedrockConnect에 입력하는 주소와 포트는 운영 상황에 따라 바뀔 수 있습니다.

다음 순서로 확인하세요.

1. [Aceserver 포털](/ko/)에서 최신 참가 정보를 확인합니다.
2. [공식 Discord](https://discord.gg/acsv)에서 현재 주소와 포트를 확인합니다.
3. 해당 값을 BedrockConnect의 `Server Address`와 `Server Port`에 입력합니다.
4. 접속 후 [Aceserver WIKI](https://asv-wiki.acecore.net)에서 규칙과 필요한 Discord 연동을 확인합니다.

오래된 블로그 글이나 스크린샷의 IP 주소를 그대로 사용하지 마세요. 주소가 변경되었거나 점검 중이라면 공식 Discord 공지를 따르세요.

## 접속되지 않을 때

### BedrockConnect 목록이 표시되지 않음

- Switch DNS 설정이 “수동”인지 확인합니다.
- 기본 DNS와 보조 DNS를 잘못 입력하지 않았는지 확인합니다.
- BedrockConnect 공식 README에서 최신 DNS 값을 확인합니다.
- 다른 호환 추천 서버를 통해 BedrockConnect를 열어 봅니다.
- Minecraft와 Switch 네트워크 연결을 다시 시작합니다.

### 목록은 표시되지만 목적지에 접속되지 않음

- `Server Address`가 현재 서버 안내와 일치하는지 확인합니다.
- `Server Port`가 Java Edition 포트가 아닌 베드락 포트인지 확인합니다.
- 목적지 서버가 베드락 플레이어를 받는지 확인합니다.
- 점검 또는 접근 제한이 없는지 공식 안내를 확인합니다.

### 원래 설정으로 되돌리기

Switch의 “설정” → “인터넷” → “인터넷 설정”에서 연결된 네트워크를 열고 DNS 설정을 “자동”으로 바꾼 뒤 저장합니다.

## 사용 시 주의사항

BedrockConnect는 공식 서버 목록에 기능을 추가하지 않습니다. DNS를 이용해 추천 서버에서 BedrockConnect 목록을 여는 외부 서비스입니다. 게임 업데이트나 서비스 변경으로 이 방법이 작동하지 않을 수 있습니다.

BedrockConnect 공식 README는 같은 이름의 비공식 모바일 앱이 프로젝트와 관련이 없다고 안내합니다. 앱이 소프트웨어 설치나 계정 정보 입력을 요구한다면 [공식 GitHub](https://github.com/Pugmatt/BedrockConnect)의 안내와 비교하세요.

## 정리

BedrockConnect의 DNS 방식으로 Switch에서 외부 Minecraft 베드락 서버에 접속할 수 있습니다. DNS를 설정하고 호환되는 추천 서버에서 BedrockConnect를 연 뒤 목적지 주소와 포트를 입력하면 됩니다.

Aceserver에 접속할 때는 오래된 고정 접속 정보 대신 [Aceserver 포털](/ko/), [공식 Discord](https://discord.gg/acsv), [Aceserver WIKI](https://asv-wiki.acecore.net)의 최신 안내를 사용하세요.

## 참고 링크

- [BedrockConnect 공식 GitHub README](https://github.com/Pugmatt/BedrockConnect)
- [Aceserver 공식 포털](/ko/)
- [Aceserver WIKI](https://asv-wiki.acecore.net)
- [참고한 Switch 외부 서버 접속 안내](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
