---
title: 'Como compartilhar seu servidor Java com Bedrock: configuração segura de cross-play'
description: Saiba como convidar com segurança amigos do Bedrock para seu próprio servidor Java usando Geyser e Floodgate, escolher uma hospedagem gratuita e verificar as configurações antes de abrir o acesso.
translationOf: minecraft-java-bedrock-shared-server
sourceHash: sha256:61f4cc5be0d88b01fdab4917b333d828a9483f4f9e34ec5ffb2b35a5eda2dd9c
date: 2026-08-09T10:00:00+09:00
tags:
  - Minecraft
  - Edição Java
  - Edição Bedrock
  - Cross-play
  - Servidor gratuito
  - Geyser
author: Gui
image: /uploads/stories/minecraft-java-bedrock-shared-server-hero.webp
imageAlt: Três pessoas com um PC, tablet e console portátil olham para a mesma pequena casa-servidor em blocos, iluminada por linhas azuis e um emblema de escudo
---

Para convidar amigos que usam Bedrock em celulares, tablets, Windows ou consoles para seu próprio servidor Java, uma opção prática é instalar Geyser e Floodgate no servidor Java. O Geyser faz a ponte das conexões Bedrock para o servidor Java, e o Floodgate permite que o servidor identifique contas Bedrock com segurança.

O importante é não desativar a autenticação das contas Java apenas para admitir amigos do Bedrock. Este guia começa com a autenticação Java e um servidor apenas para convidados mantidos ativos. Os controles e alguns recursos não são idênticos entre Java e Bedrock, portanto teste os dois tipos de dispositivo antes de abrir o servidor.

Se você ainda está decidindo como amigos em dispositivos diferentes vão jogar juntos, veja também [como jogar Minecraft com amigos](/pt/stories/minecraft-play-with-friends/).

## Resumo: compartilhe um servidor com Java + Geyser + Floodgate

Para um servidor Java que você administra, uma configuração clara é usar Paper, que aceita plugins, com Geyser e Floodgate instalados no mesmo servidor.

- Amigos de Java entram pelo ponto TCP do servidor Java.
- Amigos de Bedrock entram pelo ponto UDP em que o Geyser escuta.
- Floodgate permite que amigos de Bedrock entrem como contas Bedrock sem comprar também uma conta Java Edition.
- Mantenha online-mode do servidor Java como true.

Isto adiciona um caminho de conexão Bedrock a um servidor Java. Não permite que clientes Java entrem diretamente em um servidor apenas Bedrock e não conecta Realms Java e Bedrock entre si.

Se precisar verificar se um servidor existente aceita as duas edições, veja [Java e Bedrock podem jogar juntos?](/pt/stories/minecraft-java-bedrock-crossplay/).

### Verifique estes pontos primeiro

- Prepare um PC que possa executar um servidor Java ou uma hospedagem que aceite plugins de servidor.
- Confirme que todos podem entrar legitimamente na edição que possuem.
- Alinhe versões compatíveis de Java e Bedrock, plugins instalados e pacotes de recursos.
- Consoles podem ter regras específicas para inserir servidores personalizados. Não use soluções de troca de DNS; consulte a orientação oficial do dispositivo e da hospedagem.

## Escolha uma forma de começar gratuitamente

Um servidor gratuito significa que o software do servidor ou um plano de hospedagem gratuito não tem taxa de uso. Isso não torna gratuitos o Minecraft, o PC anfitrião, eletricidade e internet, backups ou o trabalho de atualização.

| Configuração                            | Como considerar o custo extra                                    | Como convidar amigos remotos                                        | Condições para começar com segurança                                                                   | Limitação principal                                              |
| --------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Servidor em casa, somente LAN           | O software é gratuito                                            | Não convide pessoas remotas; teste somente em casa ou na mesma rede | Não crie exposição no roteador                                                                         | Amigos fora de casa não podem entrar                             |
| Servidor em casa, acesso pela internet  | O software é gratuito; PC, internet e eletricidade são separados | Libere somente TCP do Java e UDP do Geyser quando necessário        | Configure antes uma lista de permissão, firewall do sistema e backups                                  | Você gerencia roteador, IPv6 e atualizações                      |
| Exemplo de hospedagem gratuita: Aternos | Siga as condições do plano gratuito                              | Use o endereço e a porta exibidos pela hospedagem                   | Instale Paper, Geyser e Floodgate pelas instruções oficiais da hospedagem e use uma lista de permissão | Capacidade, condições de atividade e plugins aceitos podem mudar |
| Realms                                  | Assinatura                                                       | Use convites                                                        | Use os controles oficiais de convite e conta                                                           | Não serve para cross-play entre Java e Bedrock                   |

Se você não tem segurança para abrir portas em casa, confirme primeiro a configuração em uma LAN ou comece com uma hospedagem gratuita que gerencia o endereço e a porta externos. Quando este artigo foi escrito, a orientação oficial da Aternos recomenda Paper e descreve a instalação e configuração automáticas do Floodgate quando o Geyser é instalado. Se o painel ou a política mudou, siga a orientação oficial atual.

Para uma comparação básica das opções gratuitas de Java, Bedrock e Realms, veja também [como criar um servidor Minecraft gratuito](/pt/stories/minecraft-server-setup/).

## Entenda a estrutura de conexão

Java e Bedrock chegam ao servidor em formatos de rede diferentes. Com Geyser e Floodgate em um servidor Paper, cada conexão tem uma função distinta.

| Quem se conecta   | Destino                                                    | Transporte                           | Função no servidor                                  |
| ----------------- | ---------------------------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| Amigos de Java    | Endereço e porta do servidor Java                          | TCP                                  | Paper aceita a conexão diretamente                  |
| Amigos de Bedrock | Mesmo nome de host e a porta Bedrock fornecida para Geyser | UDP                                  | Geyser converte a conexão para Paper                |
| Administração     | Console do servidor ou painel da hospedagem                | Caminho de gerenciamento não público | Gerencia lista de permissão, backups e atualizações |

Em um servidor doméstico, as portas usuais são TCP 25565 para Java e UDP 19132 para Geyser, mas uma hospedagem pode atribuir outros números. Informe aos amigos de Bedrock a porta UDP do Geyser mostrada no painel; não peça que suponham que ela é 19132.

A porta UDP do Geyser não pode ser compartilhada com chat de voz, Query ou outro serviço UDP. Ao adicionar um recurso depois, não force o reaproveitamento da porta; confira a documentação oficial e a atribuição da hospedagem.

![Um jogador de Java com PC se conecta diretamente a uma casa de servidor protegida, enquanto jogadores de Bedrock com tablet, celular e console portátil atravessam uma ponte azul até a mesma casa](/uploads/stories/minecraft-java-bedrock-shared-server-topology.webp)

_Java chega diretamente ao Paper; Bedrock chega primeiro ao Geyser, que o encaminha ao mesmo servidor Paper._

## Etapa 1: instale Paper, Geyser e Floodgate

1. Escolha Paper ou outro software de servidor Java compatível com plugins do lado do servidor. Um servidor Java vanilla sozinho não pode carregar plugins da família Bukkit.
2. Obtenha Geyser e Floodgate pela distribuição oficial do Geyser ou pelo painel oficial de complementos da hospedagem, em versões que correspondam ao servidor. Não use arquivos de origem desconhecida.
3. Inicie o servidor uma vez e confirme no console que Geyser e Floodgate foram carregados.
4. Em uma configuração de plugin Paper, Geyser pode detectar automaticamente o destino Java e a autenticação Floodgate. Consulte a configuração oficial e a orientação específica da hospedagem antes de editar manualmente.

MODs que precisam ser instalados somente no cliente não funcionam para clientes Bedrock que entram pelo Geyser. Antes de convidar todos, teste MODs, plugins e pacotes de recursos instalados com um grupo pequeno nas duas edições.

## Etapa 2: defina padrões seguros antes de publicar

Primeiro habilite a autenticação Java e a lista de permissão no server.properties do Paper. Os nomes podem mudar conforme a versão do servidor ou o painel da hospedagem, portanto confira o valor atual antes de alterar.

| Configuração      | Valor recomendado | Motivo                                               |
| ----------------- | ----------------- | ---------------------------------------------------- |
| online-mode       | true              | Autentica conexões Java com contas Minecraft         |
| white-list        | true              | Mantém pessoas não convidadas fora                   |
| enforce-whitelist | true              | Remove jogadores que não estão na lista de permissão |
| enable-rcon       | false             | Não expõe um console remoto sem uso                  |
| enable-query      | false             | Não adiciona um listener de consulta sem uso         |

Adicione amigos de Java à lista de permissão comum. Para amigos de Bedrock, use o comando de lista do Floodgate com o gamertag real da pessoa. No chat do jogo com permissão de administrador, execute **/fwhitelist add gamertag**; no console do servidor do host, omita a `/` inicial e use **fwhitelist add gamertag**. Não adivinhe um prefixo de nome para usar a lista comum e não deixe a lista desativada durante testes.

Conceda privilégios administrativos apenas a pessoas que realmente precisam deles. Não distribua a configuração completa do servidor, arquivos de chave do Floodgate ou dados de entrada da hospedagem aos amigos. Faça backup antes de mudar configurações ou atualizar plugins e o jogo, e confirme que consegue restaurá-lo.

![Uma pessoa administradora confere uma lista de permissão ao lado de um escudo, duas rotas azuis estreitas atravessam um muro até uma casa de servidor e uma porta administrativa separada permanece trancada](/uploads/stories/minecraft-java-bedrock-shared-server-safe-settings.webp)

_Somente os caminhos Java e Geyser confirmados após o teste são permitidos; o caminho de administração permanece fechado para a internet._

## Etapa 3: exponha somente o tráfego necessário em etapas

Faça testes de conexão antes de abrir qualquer acesso externo.

1. Entre no servidor Paper a partir do PC anfitrião ou de um cliente Java na mesma LAN.
2. Entre pelo Geyser a partir de um cliente Bedrock na mesma LAN usando a porta UDP.
3. Nas duas edições, confira a lista de permissão, spawn, baús, chat e salvamento do mundo.
4. Somente quando amigos remotos precisarem de acesso, libere individualmente a porta TCP do Java e a porta UDP do Geyser no firewall do sistema e no roteador.
5. Teste com um amigo da lista de permissão em outra rede. O connectiontest do Geyser também pode ajudar a confirmar o destino.

Você não precisa de DMZ, encaminhamento de todas as portas, firewall desativado nem expor o painel de controle ou RCON à internet. Se o host estiver acessível por IPv6, não suponha que regras de encaminhamento IPv4 o protegem; confirme que a regra do firewall do sistema também se aplica ao IPv6.

![Jogadores com PC e tablet testam ao lado de uma casa de servidor protegida à esquerda, e depois uma pessoa administradora confere um escudo em um portão antes de um amigo remoto se conectar à direita](/uploads/stories/minecraft-java-bedrock-shared-server-staged-test.webp)

_Primeiro teste as duas edições na LAN e depois confirme o acesso com um amigo da lista de permissão em outra rede._

Se ainda não conseguir conectar após estes testes, não amplie a exposição pública. Use [o que verificar quando não é possível entrar em um servidor Minecraft](/pt/stories/minecraft-server-cannot-join/) para separar em ordem edição, versão, conta e rede.

## Verificações ao começar com hospedagem gratuita

Os mesmos princípios de escopo público se aplicam a uma hospedagem gratuita. Não é preciso criar encaminhamento de portas no roteador doméstico, mas ainda é necessário proteger a conta da hospedagem, a lista de permissão e o acesso ao painel.

1. Crie um servidor Java Paper seguindo as instruções oficiais da hospedagem.
2. Adicione Geyser pelo painel oficial de complementos e confirme que Floodgate está instalado.
3. Depois de iniciar o servidor, confira o endereço e a porta Java e Bedrock exibidos na tela Connect da hospedagem.
4. Confirme as configurações de autenticação e lista de permissão da etapa 2 antes de compartilhar os dados de conexão individualmente.
5. Quando uma nova versão Bedrock for lançada, consulte as orientações oficiais da hospedagem e do Geyser para verificar se é necessário atualizar o Geyser.

As condições de atividade, cobertura de backups, complementos aceitos e tratamento de parada de serviço de um plano gratuito variam por provedor e podem mudar. Não mantenha um mundo importante somente na hospedagem: faça backup em outro local por um método permitido pelos termos e pelo painel.

## Configurações não recomendadas

- Não defina online-mode como false apenas para permitir Bedrock. A FAQ oficial do Geyser considera o modo offline sem Floodgate perigoso e sem suporte.
- Não publique o servidor com a lista de permissão desativada, nem para um teste único. Use o recurso de lista do Floodgate para jogadores Bedrock.
- Não use DMZ, encaminhamento de todas as portas, firewall desativado ou exposição automática por UPnP em vez de encontrar a causa de um problema de conexão.
- Não habilite RCON, Query, PROXY protocol ou painel externo de gerenciamento por precaução. Considere-os apenas quando entender a configuração necessária e puder limitar a exposição.
- Não execute plugins desconhecidos, plugins que evitam autenticação ou uma configuração completa compartilhada sem revisá-la.

## Lista antes de convidar amigos

- Clientes Java e Bedrock conseguem entrar, sair e entrar novamente em um teste real.
- O servidor Java tem online-mode como true e uma lista de permissão ativada.
- Nomes Java e gamertags Bedrock pelo Floodgate estão cada um na lista correta.
- Somente Java TCP e Geyser UDP estão expostos à internet; RCON, Query e o painel não são públicos.
- Cada amigo recebe o endereço, a porta e a versão compatível da própria edição.
- Há um backup atual e o método de restauração foi conferido antes de atualizar.

Depois que esses pontos forem confirmados, amigos de Java e Bedrock poderão começar a jogar no mesmo mundo mantendo a autenticação e o limite de exposição pública protegidos.

## Referências oficiais

- [Configuração do Geyser](https://geysermc.org/wiki/geyser/setup/)
- [FAQ do Geyser](https://geysermc.org/wiki/geyser/faq/)
- [Recurso de lista de permissão do Floodgate](https://geysermc.org/wiki/floodgate/features/)
- [Referência de server.properties do Paper](https://docs.papermc.io/paper/reference/server-properties/)
- [Guia de Geyser da Aternos](https://support.aternos.org/hc/en-us/articles/360051047631-Allow-Bedrock-players-on-your-Java-server-with-Geyser)
- [Comparação de Java e Bedrock do Minecraft](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)
