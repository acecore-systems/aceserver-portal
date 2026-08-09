---
title: '무료 마인크래프트 서버 만드는 방법: Java, 베드락, Realms의 차이'
description: 무료 마인크래프트 서버를 만드는 방법을 소개하고, Java Edition·Bedrock Edition·Realms의 차이와 준비 사항, 공개 전 보안 점검을 설명합니다.
translationOf: minecraft-server-setup
sourceHash: sha256:1d0155c2bfc03563a83d164bde21d3becb20f0f64d2ba85763512ad9c025b903
date: 2026-08-08T10:00:00+09:00
tags:
  - Minecraft
  - 마인크래프트 서버
  - 시작하기
author: Gui
image: /uploads/stories/minecraft-server-setup-hero.webp
imageAlt: 마을·서버·클라우드 게이트웨이로 이어지는 세 갈래 길을 바라보는 블록 스타일 모험가 세 명
---

친구와 마인크래프트를 플레이하는 방법은 여러 가지입니다. 같은 로컬 네트워크를 사용하거나, 자신의 PC에서 전용 서버를 실행하거나, Realms를 사용할 수 있습니다. 적합한 방법은 모두가 사용하는 에디션과 감당할 수 있는 관리 작업의 양에 따라 달라집니다.

먼저 무료 서버라는 말은 서버 소프트웨어 자체를 무료로 사용할 수 있다는 뜻입니다. 마인크래프트 게임, 컴퓨터, 전기, 인터넷 연결, 백업과 업데이트까지 무료가 되는 것은 아닙니다. 이 글에서는 자신의 PC에서 공식 소프트웨어를 호스팅하는 방법을 중심으로 설명합니다.

그룹에 Switch나 스마트폰 플레이어가 있다면 참여 방법을 정하기 전에 [친구와 마인크래프트를 함께 플레이하는 방법](/ko/stories/minecraft-play-with-friends/)에서 에디션과 계정 조건을 확인하세요.

## 결론: 플레이어와 에디션에 맞춰 선택하기

| 방법                      | 비용을 이해하는 방법                                          | 참여할 수 있는 사람              | 적합한 경우                                            |
| ------------------------- | ------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| 같은 네트워크에서 플레이  | 추가 서버 이용료 없음                                         | 같은 집 또는 같은 LAN의 플레이어 | 먼저 짧게 시험해 보고 싶은 경우                        |
| Java Edition 전용 서버    | 공식 소프트웨어는 무료지만 PC·네트워크·전기 비용은 별도       | Java Edition 플레이어            | PC 설정과 운영을 배우고 싶은 경우                      |
| Bedrock Edition 전용 서버 | 공식 소프트웨어는 무료지만 지원되는 OS와 PC 필요              | Bedrock Edition 플레이어         | 휴대폰이나 콘솔을 사용하는 친구와 플레이하고 싶은 경우 |
| Realms                    | 구독 서비스이며 일부 대상 계정에는 무료 체험이 표시될 수 있음 | 같은 에디션의 초대된 멤버        | 집의 PC 관리와 포트 포워딩을 피하고 싶은 경우          |

Java Edition과 Bedrock Edition은 서로 다른 에디션이므로, 일반적으로 같은 서버에 직접 접속할 수 없습니다. 모두가 PC·휴대폰·콘솔 중 무엇을 사용하는지만이 아니라 Java인지 Bedrock인지도 확인해야 합니다.

![PC, 모바일과 콘솔 기기, 클라우드 세계로 표현한 Java Edition·Bedrock Edition·Realms의 블록 스타일 비교 이미지](/uploads/stories/minecraft-server-setup-comparison.webp)

## 서버를 설정하기 전 준비

### 1. 모두의 에디션 확인

Java Edition은 Windows·macOS·Linux PC에서 사용할 수 있습니다. Bedrock Edition은 Windows PC, 휴대폰, 콘솔 및 기타 지원 기기에서 사용할 수 있습니다. Windows에서 두 에디션을 모두 이용할 수 있는 경우에도 잘못된 에디션을 실행하면 원하는 서버에 접속할 수 없습니다.

### 2. 호스트 PC 선택

전용 서버를 실행하는 PC가 월드를 계속 진행시킵니다. PC가 절전 모드에 들어가거나 서버 프로세스가 중지되면 접속 중인 친구도 계속 플레이할 수 없습니다. 디스크 여유 공간, 메모리, 네트워크, 업데이트와 백업을 누가 담당할지 미리 정하세요.

### 3. 접속할 사람 결정

모두 같은 LAN에 있다면 서버를 인터넷에 공개할 필요가 없습니다. 다른 장소의 친구를 초대하려면 라우터의 포트 포워딩과 방화벽 변경이 필요할 수 있습니다. 안전을 위해 먼저 자신의 PC와 로컬 네트워크에서 테스트한 후 접속 범위를 넓히세요.

![집의 PC에서 서버 파일을 준비하고 친구들이 공유 블록 세계에 접속하는 과정을 보여 주는 이미지](/uploads/stories/minecraft-server-setup-guide.webp)

## 무료 Java Edition 서버 만드는 방법

Java Edition에는 공식 Java Edition Server가 있습니다. 공식 다운로드 페이지의 소프트웨어는 Java Edition 전용이며, 명령줄에서 사용할 수 있는 호환 Java 환경이 필요합니다.

### 기본 순서

1. 빈 폴더를 만들고 공식 페이지에서 Java 서버`.jar` 파일을 다운로드합니다.
2. 다운로드한 파일을 `server.jar`처럼 기억하기 쉬운 이름으로 바꿉니다. 원래 이름을 유지한다면 아래 명령의 파일명을 바꾸세요.
3. Java를 사용할 수 있는지 확인합니다.

```text
java -version
```

4. 명령줄에서 서버 폴더를 열고 서버를 한 번 실행합니다.

```text
java -jar server.jar nogui
```

5. 최초 실행 때 만들어지는`eula.txt`를 읽습니다. 내용을 동의하는 경우에만`eula=true`로 바꾸고 서버를 다시 실행하세요.
6. `server.properties`에서 게임 모드, 난이도와 플레이어 허용 목록을 설정합니다.
7. 먼저 `localhost` 또는 같은 LAN의 주소로 접속을 테스트하고 월드가 제대로 저장되는지 확인합니다.

서버 버전과 클라이언트 버전은 호환되어야 합니다. 업데이트하기 전에는 월드 폴더를 복사하고 서버를 중지하세요. 이렇게 하면 접속 오류나 월드 손상 위험을 줄일 수 있습니다.

## 무료 Bedrock Edition 서버 만드는 방법

Bedrock Edition에는 공식 Bedrock Dedicated Server가 있습니다. 공식 페이지에서 Windows 또는 Linux용 파일을 받을 수 있습니다. Java`.jar` 소프트웨어와는 별개이므로 친구들이 Bedrock Edition을 사용한다면 Bedrock 패키지를 선택하세요.

### 기본 순서

1. 공식 페이지에서 Bedrock Dedicated Server를 빈 폴더로 다운로드합니다.
2. ZIP 파일의 압축을 풀고 함께 제공되는 가이드를 읽습니다. 공식 패키지에는 설치와 사용 방법이 포함되어 있습니다.
3. 운영 체제에 맞는 실행 파일 또는 명령으로 서버를 시작합니다. 필요한 월드 파일은 시작할 때 만들어집니다.
4. `server.properties`에서 월드 설정과 플레이어 허용 목록을 확인합니다. 비공개로 유지하려면 함께 제공되는 가이드에서`allow-list=true`와 같은 설정을 확인하세요.
5. 같은 LAN의 Bedrock 클라이언트로 먼저 접속하여 버전과 접속 방법을 확인합니다.

공식 Bedrock Dedicated Server의 실행 환경은 Windows 또는 Linux입니다. 휴대폰이나 콘솔에서 접속할 수 있더라도 기기별 계정 설정과 온라인 서비스 조건이 접속에 영향을 줄 수 있습니다. Java Edition 클라이언트는 Bedrock 전용 서버에 직접 접속할 수 없습니다.

## Realms는 무료 서버인가요?

Realms는 Minecraft의 공식 비공개 클라우드 서버입니다. 소유자가 게임을 계속 실행하지 않아도 월드를 이용할 수 있고, 초대된 멤버만 접속할 수 있습니다. 집의 PC 관리, 포트 포워딩과 서버 소프트웨어 업데이트 작업을 줄여 줍니다.

하지만 Realms는 구독 서비스이며 영구적으로 무료인 것은 아닙니다. 조건을 충족하는 계정에는 30일 무료 체험이 제공될 수 있지만, 공식 안내에 따르면 체험이 끝난 뒤 취소하지 않으면 구독이 자동 갱신됩니다. 구독 전에 에디션, 요금제, 동시 플레이어 제한과 갱신 조건을 확인하세요.

Realms도 에디션별로 나뉩니다. Java 플레이어는 Java Realm에, Bedrock 플레이어는 Bedrock Realm에 접속합니다. Realms는 두 에디션 사이의 크로스플레이를 가능하게 하는 방법이 아닙니다.

## 어떤 방법을 선택해야 하나요?

- 집이나 같은 LAN에서 빠르게 테스트하려면 게임 내 멀티플레이가 가장 간단합니다.
- PC의 Java 플레이어가 설정과 운영을 배우고 싶다면 Java 전용 서버를 선택하세요.
- 친구들이 Bedrock 기기를 사용한다면 Bedrock Dedicated Server를 고려하세요.
- 비용보다 항상 접속 가능한 상태와 적은 관리 작업이 중요하다면 Realms가 쉽지만 무료는 아닙니다.

호스팅 비용을 아끼기 위해 집의 서버를 선택한다면 서버가 멈췄을 때 누가 다시 시작할지, 월드를 어디에 백업할지 정하세요. 시작하기 전에 계획하면 플레이를 시작한 뒤의 문제를 많이 줄일 수 있습니다.

## 서버를 공개하기 전에 확인할 항목

![백업, 접근 제어, 초대한 친구만 참여하는 안전한 개인 서버 준비를 보여 주는 블록 스타일 이미지](/uploads/stories/minecraft-server-setup-safety.webp)

- 월드를 정기적으로 백업하고 복원할 수 있는지 확인합니다.
- 운영자 또는 관리자 권한은 필요한 사람에게만 줍니다.
- 친구들과만 플레이한다면 서버를 모두에게 공개하지 말고 허용 목록을 사용합니다.
- 외부 접속이 실제로 필요할 때만 라우터와 방화벽을 설정합니다.
- 게임이나 서버 소프트웨어를 업데이트하기 전에 호환 버전과 백업을 확인합니다.
- IP 주소, 비밀번호와 관리 정보를 필요한 범위보다 넓게 공유하지 않습니다.

최신 요구 사항과 다운로드는 공식 [Java 서버 다운로드 페이지](https://www.minecraft.net/en-us/download/server), [Java 서버 설정 가이드](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server), [Bedrock 서버 다운로드 페이지](https://www.minecraft.net/en-us/download/server/bedrock), [Dedicated Server 안내](https://help.minecraft.net/hc/en-us/articles/4408873961869-Minecraft-Dedicated-and-Featured-Servers-FAQ-), [Realms 공식 페이지](https://www.minecraft.net/en-us/realms), [Java와 Bedrock 비교](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)에서 확인하세요.
