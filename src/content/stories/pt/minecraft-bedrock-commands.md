---
title: 'Comandos do Minecraft Bedrock: visão noturna, teleporte e horário'
description: Exemplos práticos de comandos do Minecraft Bedrock para visão noturna, teleporte, horário, clima e itens, com os pontos a conferir antes de usar.
translationOf: minecraft-bedrock-commands
sourceHash: sha256:48a7cedb3fac3a470591186fe2fb1eded8cd39dd32231454d324d338c962218b
date: 2026-08-02T14:00:00+09:00
tags:
  - Minecraft
  - Minecraft Bedrock
  - Comandos
author: Gui
---

Os comandos do Minecraft Bedrock ajudam a mudar o horário ou o clima, ir para coordenadas e testar um mundo. Este guia reúne exemplos básicos para um mundo pessoal ou um mundo no qual você tem permissão de administração.

Servidores públicos podem proibir comandos para qualquer pessoa que não seja administradora. Sempre leia as regras do servidor antes de testar ali um exemplo deste artigo.

## Antes de começar

Para usar muitos comandos no Bedrock, ative cheats no mundo e confirme que você tem as permissões necessárias. Ativar cheats impede a obtenção de conquistas naquele mundo, portanto faça essa escolha com cuidado.

Se não souber o que digitar, comece no chat com:

```mcfunction
/help
```

Ao acrescentar o nome de um comando, como /help effect, você vê a sintaxe disponível no jogo atual. Atualizações do Bedrock podem mudar a sintaxe, então use as sugestões do jogo e /help como confirmação final.

## Comandos usados com frequência

### Definir o horário como dia

```mcfunction
/time set day
```

Use quando a noite chegar ou quando quiser verificar uma construção com luz. Você também pode escolher horários como noon quando eles aparecerem nas sugestões.

### Limpar o clima

```mcfunction
/weather clear
```

Este exemplo interrompe chuva ou tempestades para melhorar a visibilidade. Comandos de clima afetam o mundo inteiro, então avise os outros jogadores antes em um mundo compartilhado.

### Mudar seu próprio modo de jogo

```mcfunction
/gamemode creative @s
```

@s indica a pessoa que executa o comando. Troque creative por survival para voltar. Faça backup de um mundo importante antes de fazer mudanças grandes.

### Teleportar para coordenadas

```mcfunction
/tp @s 0 80 0
```

Isso move você para X=0, Y=80, Z=0. Verifique antes se o destino não está oco ou perigoso, especialmente ao se teleportar para o subsolo ou para grandes alturas.

### Dar um item a si mesmo

```mcfunction
/give @s torch 64
```

Este exemplo dá 64 tochas a você. Confira IDs de itens e quantidades nas sugestões de entrada. É útil para preparar ferramentas em um mundo de testes ou de aventura.

### Aplicar visão noturna ilimitada

```mcfunction
/effect @s night_vision infinite 0 true
```

Use este exemplo para verificar cavernas ou construções escuras. O true final oculta as partículas. Para remover o efeito, use:

```mcfunction
/effect @s clear night_vision
```

## Se um comando não funcionar

1. Confirme que cheats estão ativos em um mundo pessoal ou que você tem permissão de administração.
2. Confira a sintaxe atual com /help seguido do nome do comando e com as sugestões do chat.
3. Não copie sem alterações um guia de Java Edition. Java e Bedrock podem ter sintaxe e condições diferentes para o mesmo objetivo.
4. Em um servidor público, siga primeiro as regras e orientações daquele servidor.

## Teste um de cada vez

Comandos são poderosos porque podem mudar um mundo imediatamente. Comece em um mundo de testes com backup e experimente uma mudança de cada vez, como horário, clima e visão noturna.

Para ver sintaxe e permissões, consulte a [introdução aos comandos Bedrock no Microsoft Learn](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable), a [referência de comandos](https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable) e a [referência do comando effect](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/effect?view=minecraft-bedrock-stable).
