---
title: Como entrar em servidores externos de Minecraft Bedrock pelo Switch | Guia do BedrockConnect
description: Um guia passo a passo para usar o BedrockConnect e entrar, pelo Minecraft no Nintendo Switch, em servidores Bedrock externos, incluindo DNS, dados do servidor e notas para entrar no Aceserver.
translationOf: minecraft-bedrockconnect-switch
sourceHash: sha256:65a6717569d120bd04069ebe6cada6b31d2b374e35962d1f6554496ff011ab7e
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - Edição Bedrock
  - Nintendo Switch
  - Primeiros passos
author: Gui
---

Se você quiser entrar, pelo Minecraft Bedrock Edition no Nintendo Switch, em um servidor que não esteja entre os servidores em destaque oficiais, pode usar o BedrockConnect. O método direciona o DNS do Switch para o BedrockConnect e usa um servidor em destaque como entrada para abrir uma lista de servidores Bedrock.

Este guia explica o fluxo para entrar pelo Switch em um servidor Bedrock externo, como o Aceserver. Os endereços e as portas variam de acordo com o servidor, portanto confira sempre as informações mais recentes nas instruções oficiais de cada servidor.

O BedrockConnect não é um recurso oficial do Minecraft ou da Nintendo. É um projeto gratuito e de código aberto, mas leia o [README oficial no GitHub](https://github.com/Pugmatt/BedrockConnect) antes de usar e não utilize aplicativos ou downloads de repositórios fora do projeto oficial.

## O que o BedrockConnect permite fazer

O Minecraft no Switch não oferece a lista usual para adicionar diretamente servidores externos arbitrários. O BedrockConnect usa o DNS e um servidor em destaque como entrada para abrir uma tela onde o servidor de destino pode ser informado.

1. Altere o DNS do Switch para o BedrockConnect.
2. Abra um servidor em destaque compatível pela aba “Servidores” do Minecraft.
3. Informe o endereço e a porta do servidor de destino no BedrockConnect.
4. Passe do BedrockConnect para o servidor de destino.

Alterar o DNS não é suficiente se o destino não aceitar a Bedrock Edition. Os valores de DNS e as telas podem mudar no futuro, então priorize as instruções mais recentes do [README oficial do BedrockConnect](https://github.com/Pugmatt/BedrockConnect) em vez dos valores deste artigo.

## O que preparar antes de começar

- Um Nintendo Switch capaz de executar o Minecraft Bedrock Edition
- Minecraft e uma conta Microsoft prontos para jogar online
- O endereço e a porta Bedrock publicados pelo servidor de destino
- As configurações de rede atuais, para poder restaurar o DNS do Switch depois

Para entrar no Aceserver, confira primeiro as informações atuais no [Portal do Aceserver](/pt/) e no [Discord oficial](https://discord.gg/acsv). A [WIKI do Aceserver](https://asv-wiki.acecore.net) é a fonte para informações que mudam, como regras e vinculação ao Discord depois da entrada.

## Passo 1: Configure o DNS do Switch manualmente

1. Abra “Configurações do sistema” no Switch, escolha “Internet” e abra “Configurações de Internet”.
2. Selecione a rede conectada e abra “Alterar configurações”.
3. Altere “Configurações de DNS” de “Automático” para “Manual”.
4. Informe os valores atuais listados no README oficial do BedrockConnect. Em 6 de agosto de 2026, a orientação lista:
   - DNS primário: `104.238.130.180`
   - DNS secundário: `8.8.8.8`

5. Salve as configurações e execute o teste de conexão.

Essa configuração vale para a conexão de rede do Switch. Quando terminar de usar o BedrockConnect, volte à mesma tela e defina as configurações de DNS como “Automático”.

## Passo 2: Abra o BedrockConnect pelo Minecraft

1. Inicie o Minecraft e entre com a sua conta Microsoft.
2. Abra “Jogar” e selecione a aba “Servidores”.
3. Entre em um destes servidores em destaque:
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

O README oficial do BedrockConnect lista esses servidores como compatíveis com o redirecionamento por DNS. Quando a conexão funcionar, você verá a lista de servidores do BedrockConnect em vez do servidor em destaque normal.

Se o servidor em destaque normal abrir, confira os valores de DNS e tente outro servidor compatível. Reiniciar o jogo ou a conexão de rede também pode ajudar.

## Passo 3: Adicione o servidor de destino

Quando a tela do BedrockConnect aparecer, adicione o servidor externo da seguinte forma.

1. Selecione `Connect to a Server`.
2. Informe o domínio ou endereço IP do destino em `Server Address`.
3. Informe em `Server Port` a porta Bedrock publicada pelo servidor de destino. Alguns servidores usam `19132`, mas siga sempre as instruções do próprio servidor.
4. Informe um nome fácil de reconhecer em `Display Name`. Esse campo é opcional.
5. Ative `Add to server list` se quiser pular a digitação na próxima vez.
6. Selecione o botão de envio para iniciar a conexão.

Para alterar uma entrada salva, abra `Manage Server List`, selecione `Edit a Server` e escolha o servidor que deseja editar.

## Entrando no Aceserver

O Aceserver é um servidor público de Minecraft que aceita jogadores de Java Edition e Bedrock Edition. Porém, o endereço e a porta informados no BedrockConnect podem mudar conforme a operação.

Verifique nesta ordem:

1. Confira as informações mais recentes no [Portal do Aceserver](/pt/).
2. Confirme o endereço e a porta atuais no [Discord oficial](https://discord.gg/acsv).
3. Informe esses valores em `Server Address` e `Server Port` no BedrockConnect.
4. Depois de entrar, consulte a [WIKI do Aceserver](https://asv-wiki.acecore.net) para ver as regras e qualquer vinculação necessária ao Discord.

Não reutilize um endereço IP de uma postagem antiga ou de uma captura de tela. Se o endereço tiver mudado ou o servidor estiver em manutenção, siga o anúncio no Discord oficial.

## Solução de problemas

### A lista do BedrockConnect não aparece

- Confirme que as configurações de DNS do Switch estão em “Manual”.
- Confira se não há erros no DNS primário e secundário.
- Consulte os valores de DNS mais recentes no README oficial do BedrockConnect.
- Tente abrir o BedrockConnect por outro servidor em destaque compatível.
- Reinicie o Minecraft e a conexão de rede do Switch.

### A lista aparece, mas o destino não conecta

- Confirme que `Server Address` corresponde às instruções atuais do servidor.
- Confirme que `Server Port` é a porta Bedrock, e não uma porta da Java Edition.
- Confirme que o destino aceita jogadores da Bedrock Edition.
- Consulte as instruções oficiais para verificar manutenção ou restrições de acesso.

### Restaurar as configurações originais

Abra a rede conectada em “Configurações do sistema” → “Internet” → “Configurações de Internet”, defina as configurações de DNS como “Automático” e salve.

## Observações importantes

O BedrockConnect não adiciona um recurso à lista oficial de servidores. É um serviço externo que usa DNS para abrir a lista do BedrockConnect por meio de um servidor em destaque. Atualizações do jogo ou mudanças no serviço podem fazer o processo deixar de funcionar.

O README oficial do BedrockConnect informa que aplicativos móveis não oficiais com o mesmo nome não estão associados ao projeto. Se um aplicativo pedir para instalar software ou informar dados da conta, compare-o com as instruções do [GitHub oficial](https://github.com/Pugmatt/BedrockConnect).

## Resumo

O método DNS do BedrockConnect pode ajudar jogadores do Switch a entrar em servidores externos de Minecraft Bedrock. Configure o DNS, abra o BedrockConnect por um servidor em destaque compatível e informe o endereço e a porta de destino.

Ao entrar no Aceserver, use as informações mais recentes do [Portal do Aceserver](/pt/), do [Discord oficial](https://discord.gg/acsv) e da [WIKI do Aceserver](https://asv-wiki.acecore.net), em vez de um valor fixo antigo.

## Referências

- [README oficial do BedrockConnect no GitHub](https://github.com/Pugmatt/BedrockConnect)
- [Portal oficial do Aceserver](/pt/)
- [WIKI do Aceserver](https://asv-wiki.acecore.net)
- [Guia de conexão do Switch a servidores externos usado como referência](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
