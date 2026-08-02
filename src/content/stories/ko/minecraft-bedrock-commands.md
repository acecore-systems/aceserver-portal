---
title: 'Minecraft Bedrock 명령어: 야간 투시, 텔레포트, 시간 설정 예시'
description: Minecraft Bedrock에서 자주 쓰는 야간 투시, 텔레포트, 시간, 날씨, 아이템 지급 명령어의 입력 예시와 사용 전 확인 사항을 정리합니다.
translationOf: minecraft-bedrock-commands
sourceHash: sha256:48a7cedb3fac3a470591186fe2fb1eded8cd39dd32231454d324d338c962218b
date: 2026-08-02T14:00:00+09:00
tags:
  - Minecraft
  - Minecraft Bedrock
  - 명령어
author: Gui
---

Minecraft Bedrock 명령어는 시간과 날씨를 바꾸고, 좌표로 이동하며, 월드를 테스트할 때 유용합니다. 이 글은 개인 월드 또는 관리 권한이 있는 월드에서 쓸 수 있는 기본 입력 예시를 정리합니다.

공개 서버에서는 관리자 이외의 명령어 사용을 금지할 수 있습니다. 공개 서버에서 이 글의 예시를 시도하기 전에 반드시 해당 서버의 규칙을 확인하세요.

## 시작 전에 확인할 것

Bedrock에서 많은 명령어를 쓰려면 월드의 치트를 활성화하고 필요한 권한을 확인해야 합니다. 치트를 활성화하면 그 월드에서는 도전 과제를 획득할 수 없으므로 신중하게 결정하세요.

무엇을 입력해야 할지 모르겠다면 채팅에서 먼저 다음을 실행합니다.

```mcfunction
/help
```

/help effect처럼 명령어 이름을 뒤에 붙이면 현재 게임에서 사용할 수 있는 문법을 확인할 수 있습니다. Bedrock 업데이트로 문법이 바뀔 수 있으므로 게임 내 입력 제안과 /help를 최종 확인으로 사용하세요.

## 자주 쓰는 명령어

### 시간을 낮으로 설정하기

```mcfunction
/time set day
```

밤이 되었거나 밝은 시간에 건축물을 확인하고 싶을 때 사용합니다. 입력 제안에 나타나면 noon 같은 시간도 선택할 수 있습니다.

### 날씨를 맑게 하기

```mcfunction
/weather clear
```

이 예시는 비나 뇌우를 멈춰 시야를 확보합니다. 날씨 명령어는 월드 전체에 영향을 주므로 멀티플레이 월드에서는 다른 사람에게 먼저 알리는 것이 좋습니다.

### 자신의 게임 모드 바꾸기

```mcfunction
/gamemode creative @s
```

@s는 명령어를 실행한 자신을 뜻합니다. 돌아가려면 creative를 survival로 바꾸세요. 중요한 월드에서 큰 변경을 하기 전에는 백업을 만드세요.

### 지정 좌표로 텔레포트하기

```mcfunction
/tp @s 0 80 0
```

이 명령어는 자신을 X=0, Y=80, Z=0으로 이동시킵니다. 특히 지하나 높은 곳으로 이동할 때는 목적지가 비어 있거나 위험하지 않은지 먼저 확인하세요.

### 자신에게 아이템 주기

```mcfunction
/give @s torch 64
```

이 예시는 자신에게 횃불 64개를 줍니다. 아이템 ID와 수량은 입력 제안으로 확인할 수 있습니다. 테스트 월드나 모험 월드에서 도구를 준비할 때 유용합니다.

### 무제한 야간 투시 적용하기

```mcfunction
/effect @s night_vision infinite 0 true
```

어두운 동굴이나 건축물을 확인할 때 쓰는 예시입니다. 마지막 true는 파티클을 숨깁니다. 효과를 제거하려면 다음을 사용합니다.

```mcfunction
/effect @s clear night_vision
```

## 명령어가 작동하지 않을 때

1. 개인 월드에서 치트가 활성화되어 있는지 또는 관리 권한이 있는지 확인합니다.
2. /help 뒤에 명령어 이름을 붙이고 채팅 제안을 보며 현재 문법을 확인합니다.
3. Java Edition 안내를 그대로 복사하지 마세요. Java와 Bedrock은 같은 목적이라도 문법과 사용 조건이 다를 수 있습니다.
4. 공개 서버에서는 그 서버의 규칙과 안내를 먼저 따릅니다.

## 하나씩 테스트해 보세요

명령어는 월드 상태를 즉시 바꿀 수 있어 강력합니다. 백업한 테스트 월드에서 시간, 날씨, 야간 투시처럼 영향 범위를 이해하기 쉬운 변경부터 하나씩 시도하는 것을 권합니다.

문법과 권한은 [Microsoft Learn의 Bedrock 명령어 입문](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable), [명령어 참조](https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable), [effect 명령어 참조](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/effect?view=minecraft-bedrock-stable)에서 확인할 수 있습니다.
