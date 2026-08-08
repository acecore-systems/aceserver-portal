---
title: 'Como configurar um servidor gratuito de Minecraft: Java, Bedrock e Realms'
description: Aprenda a configurar um servidor gratuito de Minecraft e compare Java Edition, Bedrock Edition e Realms, incluindo os preparativos e as verificações de segurança antes de abri-lo.
translationOf: minecraft-server-setup
sourceHash: sha256:0dcea0b86790d9dc2e5e923a5cd0dd2366dd614b67457bde953f8504bec00a01
date: 2026-08-08T10:00:00+09:00
tags:
  - Minecraft
  - Servidor de Minecraft
  - Primeiros passos
author: Gui
image: /uploads/stories/minecraft-server-setup-hero.webp
imageAlt: Três aventureiros em estilo de blocos observam três caminhos que levam a uma vila, a um servidor e a uma entrada na nuvem
---

Há várias formas de jogar Minecraft com amigos: usar a mesma rede local, executar um servidor dedicado no seu próprio PC ou usar Realms. A escolha certa depende da edição de todos os jogadores e do quanto de manutenção você aceita fazer.

A primeira coisa a entender é que servidor gratuito significa que o software do servidor é gratuito. O jogo Minecraft, o computador, a eletricidade, a conexão de internet, os backups e as atualizações continuam sendo responsabilidades separadas. Este guia se concentra em hospedar o software oficial no seu próprio PC.

## Resumo: escolha pelos jogadores e pela edição

| Método                               | Como entender o custo                                                          | Quem pode entrar                   | Ideal para                                           |
| ------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------- |
| Jogar na mesma rede                  | Sem taxa adicional de servidor                                                 | A mesma casa ou LAN                | Fazer um teste curto primeiro                        |
| Servidor dedicado da Java Edition    | O software oficial é gratuito; PC, rede e eletricidade são separados           | Jogadores da Java Edition          | Aprender configuração e operação no PC               |
| Servidor dedicado da Bedrock Edition | O software oficial é gratuito; é necessário um sistema e um PC compatíveis     | Jogadores da Bedrock Edition       | Jogar com amigos de celulares ou consoles            |
| Realms                               | Serviço por assinatura; algumas contas elegíveis podem receber um teste grátis | Membros convidados da mesma edição | Evitar manutenção no PC e redirecionamento de portas |

Java Edition e Bedrock Edition são edições diferentes, e normalmente os jogadores não podem entrar diretamente no mesmo servidor. Verifique não apenas se todos usam PC, celular ou console, mas também se todos estão usando Java ou Bedrock.

![Comparação em estilo de blocos entre Java Edition, Bedrock Edition e Realms, representados por um PC, dispositivos móveis e consoles, e um mundo na nuvem](/uploads/stories/minecraft-server-setup-comparison.webp)

## Prepare-se antes de configurar o servidor

### 1. Confira a edição de todos

Java Edition está disponível para PCs com Windows, macOS e Linux. Bedrock Edition está disponível em PCs com Windows, celulares, consoles e outros dispositivos compatíveis. No Windows, você pode ter acesso às duas edições, mas iniciar a edição errada impedirá a entrada no servidor escolhido.

### 2. Escolha o PC anfitrião

O PC que executa o servidor dedicado mantém o mundo funcionando. Se ele entrar em suspensão ou o processo do servidor parar, os amigos conectados não poderão continuar jogando. Decida antes quem cuidará do espaço livre, da memória, da rede, das atualizações e dos backups.

### 3. Decida quem pode se conectar

Se todos estiverem na mesma LAN, não será necessário expor o servidor à internet. Convidar amigos de outro local pode exigir o redirecionamento de portas do roteador e alterações no firewall. Por segurança, teste primeiro no seu PC e na rede local antes de ampliar o acesso.

![Um PC doméstico prepara os arquivos do servidor enquanto amigos se conectam a um mundo de blocos compartilhado](/uploads/stories/minecraft-server-setup-guide.webp)

## Como configurar um servidor gratuito da Java Edition

Java Edition tem um Java Edition Server oficial. O software da página oficial de download funciona apenas com Java Edition e precisa de um ambiente Java compatível que possa ser usado pela linha de comando.

### Passos básicos

1. Crie uma pasta vazia e baixe o arquivo`.jar` do servidor Java na página oficial.
2. Renomeie o arquivo baixado para um nome simples, como `server.jar`. Se mantiver o nome original, substitua o nome nos comandos abaixo.
3. Confirme que o Java está disponível.

```text
java -version
```

4. Abra a pasta do servidor em uma linha de comando e inicie o servidor uma vez.

```text
java -jar server.jar nogui
```

5. Leia o arquivo`eula.txt` criado no primeiro início. Altere para`eula=true` somente se concordar com o conteúdo e depois inicie o servidor novamente.
6. Use`server.properties` para configurar o modo de jogo, a dificuldade e uma lista de jogadores permitidos.
7. Faça primeiro um teste com `localhost` ou com um endereço da mesma LAN e confirme que o mundo é salvo corretamente.

A versão do servidor e as versões dos clientes precisam ser compatíveis. Antes de atualizar, copie a pasta do mundo e pare o servidor. Isso reduz o risco de erros de conexão ou danos ao mundo.

## Como configurar um servidor gratuito da Bedrock Edition

Bedrock Edition tem um Bedrock Dedicated Server oficial. A página oficial oferece downloads para Windows ou Linux. Ele é separado do software`.jar` do Java, então escolha o pacote Bedrock quando seus amigos usarem Bedrock Edition.

### Passos básicos

1. Baixe o Bedrock Dedicated Server da página oficial para uma pasta vazia.
2. Extraia o arquivo ZIP e leia o guia incluído. O pacote oficial inclui instruções de instalação e uso.
3. Inicie o servidor com o executável ou comando correspondente ao seu sistema operacional. Os arquivos de mundo necessários são criados ao iniciar.
4. Confira as configurações do mundo e a lista de jogadores permitidos em`server.properties`. Se quiser manter o servidor privado, consulte o guia incluído para opções como`allow-list=true`.
5. Comece conectando um cliente Bedrock na mesma LAN e confirme a versão e o método de conexão.

O ambiente oficial do Bedrock Dedicated Server é destinado a Windows ou Linux. Mesmo que celulares ou consoles possam entrar, as configurações da conta e os requisitos de serviço online de cada dispositivo podem afetar a conexão. Um cliente da Java Edition não pode entrar diretamente em um servidor exclusivo de Bedrock.

## Realms é um servidor gratuito?

Realms é o servidor privado oficial de Minecraft hospedado na nuvem. O proprietário não precisa manter o jogo aberto para que o mundo fique disponível, e somente membros convidados podem entrar. Isso reduz a necessidade de administrar um PC doméstico, redirecionar portas e atualizar o software do servidor.

No entanto, Realms é um serviço por assinatura e não é permanentemente gratuito. Contas elegíveis podem receber um teste grátis de 30 dias, mas as informações oficiais explicam que a assinatura é renovada automaticamente ao fim do teste se não for cancelada. Antes de assinar, confira a edição, o plano, o limite de jogadores simultâneos e as condições de renovação.

Realms também é separado por edição: jogadores Java entram em um Realm Java, e jogadores Bedrock entram em um Realm Bedrock. Realms não permite cross-play entre as duas edições.

## Qual método você deve escolher?

- Para um teste rápido em casa ou na mesma LAN, o modo multijogador do jogo é a opção mais simples.
- Para jogadores Java no PC que querem aprender configuração e operação, escolha um servidor dedicado Java.
- Para amigos que usam dispositivos Bedrock, considere o Bedrock Dedicated Server.
- Se o acesso permanente for mais importante que o custo e você quiser menos manutenção, Realms é mais simples, mas não é gratuito.

Se escolher um servidor doméstico para evitar taxas de hospedagem, decida quem irá reiniciá-lo quando parar e onde o mundo será salvo. Planejar isso evita muitos problemas depois do início.

## Confira estes pontos antes de abrir o servidor

![Imagem em estilo de blocos sobre backups, controle de acesso e amigos convidados preparando um servidor privado](/uploads/stories/minecraft-server-setup-safety.webp)

- Faça backups regulares do mundo e confirme que é possível restaurá-lo.
- Dê permissões de operador ou administrador apenas a quem precisa delas.
- Se estiver jogando com amigos, use uma lista de permitidos em vez de abrir o servidor para todos.
- Configure o roteador e o firewall somente quando o acesso externo for realmente necessário.
- Verifique as versões compatíveis e os backups antes de atualizar o jogo ou o software do servidor.
- Não compartilhe endereços IP, senhas ou detalhes administrativos além do necessário.

Confira os requisitos e downloads mais recentes na [página oficial de download do servidor Java](https://www.minecraft.net/en-us/download/server), no [guia de configuração do servidor Java](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server), na [página de download do servidor Bedrock](https://www.minecraft.net/en-us/download/server/bedrock), nas [informações sobre Dedicated Server](https://help.minecraft.net/hc/en-us/articles/4408873961869-Minecraft-Dedicated-and-Featured-Servers-FAQ-), na [página oficial do Realms](https://www.minecraft.net/en-us/realms) e na [comparação entre Java e Bedrock](https://www.minecraft.net/en-us/article/java-or-bedrock-edition).
