---
title: Cómo conectarse a servidores externos de Minecraft Bedrock desde Switch | Guía de BedrockConnect
description: Guía paso a paso para usar BedrockConnect y conectarse desde Minecraft en Nintendo Switch a servidores Bedrock externos, con la configuración DNS y las notas para entrar en Aceserver.
translationOf: minecraft-bedrockconnect-switch
sourceHash: sha256:65a6717569d120bd04069ebe6cada6b31d2b374e35962d1f6554496ff011ab7e
date: 2026-08-06T10:00:00+09:00
tags:
  - Minecraft
  - Edición Bedrock
  - Nintendo Switch
  - Primeros pasos
author: Gui
---

Si quieres entrar desde Minecraft Bedrock Edition en Nintendo Switch a un servidor que no sea uno de los servidores destacados oficiales, puedes usar BedrockConnect. El método dirige el DNS de Switch a BedrockConnect y utiliza un servidor destacado como entrada para abrir una lista de servidores Bedrock.

Esta guía explica el proceso para conectarse desde Switch a un servidor Bedrock externo como Aceserver. Las direcciones y los puertos cambian según el servidor, así que consulta siempre la información más reciente en las instrucciones oficiales de cada servidor.

BedrockConnect no es una función oficial de Minecraft ni de Nintendo. Es un proyecto gratuito y de código abierto, pero lee el [README oficial de GitHub](https://github.com/Pugmatt/BedrockConnect) antes de usarlo y no utilices aplicaciones ni descargas de repositorios ajenos al proyecto oficial.

## Qué permite hacer BedrockConnect

Minecraft en Switch no ofrece la lista habitual para añadir directamente servidores externos arbitrarios. BedrockConnect utiliza el DNS y un servidor destacado como entrada para abrir una pantalla donde se puede introducir el servidor de destino.

1. Cambia la configuración DNS de Switch a BedrockConnect.
2. Abre un servidor destacado compatible desde la pestaña «Servidores» de Minecraft.
3. Introduce la dirección y el puerto del servidor de destino en BedrockConnect.
4. Pasa de BedrockConnect al servidor de destino.

Cambiar el DNS no basta si el servidor de destino no admite Bedrock Edition. Los valores DNS y las pantallas pueden cambiar en el futuro, así que da prioridad a las instrucciones más recientes del [README oficial de BedrockConnect](https://github.com/Pugmatt/BedrockConnect).

## Qué necesitas antes de empezar

- Una Nintendo Switch capaz de ejecutar Minecraft Bedrock Edition
- Minecraft y una cuenta Microsoft preparada para jugar en línea
- La dirección y el puerto Bedrock publicados por el servidor de destino
- La configuración de red actual para poder restaurar después el DNS de Switch

Para entrar en Aceserver, consulta primero la información actual en el [Portal de Aceserver](/es/) y el [Discord oficial](https://discord.gg/acsv). La [WIKI de Aceserver](https://asv-wiki.acecore.net) es la referencia para la información que cambia, como las reglas y la vinculación con Discord después de entrar.

## Paso 1: Configura manualmente el DNS de Switch

1. Abre «Configuración de la consola», entra en «Internet» y abre «Configuración de Internet».
2. Selecciona la red conectada y abre «Cambiar configuración».
3. Cambia «Configuración de DNS» de «Automático» a «Manual».
4. Introduce los valores actuales indicados en el README oficial de BedrockConnect. A fecha del 6 de agosto de 2026, la guía indica:
   - DNS primario: `104.238.130.180`
   - DNS secundario: `8.8.8.8`

5. Guarda la configuración y ejecuta la prueba de conexión.

Este ajuste se aplica a la conexión de red de Switch. Cuando termines de usar BedrockConnect, vuelve a la misma pantalla y cambia la configuración de DNS a «Automático».

## Paso 2: Abre BedrockConnect desde Minecraft

1. Inicia Minecraft e inicia sesión con tu cuenta Microsoft.
2. Abre «Jugar» y selecciona la pestaña «Servidores».
3. Entra en uno de estos servidores destacados:
   - Mineville
   - Lifeboat
   - Enchanted
   - Galaxite
   - The Hive

El README oficial de BedrockConnect indica que estos servidores son compatibles con la redirección DNS. Si la conexión funciona, verás la lista de servidores de BedrockConnect en lugar del servidor destacado normal.

Si se abre el servidor destacado normal, comprueba los valores DNS y prueba con otro servidor compatible. También puede ayudar reiniciar el juego o la conexión de red.

## Paso 3: Añade el servidor de destino

Cuando aparezca la pantalla de BedrockConnect, añade el servidor externo de esta forma.

1. Selecciona `Connect to a Server`.
2. Escribe el dominio o la dirección IP del servidor de destino en `Server Address`.
3. Escribe en `Server Port` el puerto Bedrock publicado por el servidor de destino. Algunos servidores usan `19132`, pero sigue siempre sus propias instrucciones.
4. Escribe un nombre reconocible en `Display Name`. Es opcional.
5. Activa `Add to server list` si quieres omitir la entrada la próxima vez.
6. Selecciona el botón de envío para empezar a conectar.

Para cambiar una entrada guardada, abre `Manage Server List`, selecciona `Edit a Server` y elige el servidor que quieres editar.

## Entrar en Aceserver

Aceserver es un servidor público de Minecraft que acepta jugadores de Java Edition y Bedrock Edition. Sin embargo, la dirección y el puerto que se introducen en BedrockConnect pueden cambiar según la operación.

Comprueba lo siguiente en este orden:

1. Consulta la información más reciente en el [Portal de Aceserver](/es/).
2. Confirma la dirección y el puerto actuales en el [Discord oficial](https://discord.gg/acsv).
3. Introduce esos valores en `Server Address` y `Server Port` de BedrockConnect.
4. Después de entrar, consulta la [WIKI de Aceserver](https://asv-wiki.acecore.net) para conocer las reglas y cualquier vinculación necesaria con Discord.

No reutilices una dirección IP de una entrada antigua de blog o una captura de pantalla. Si la dirección ha cambiado o el servidor está en mantenimiento, sigue el anuncio del Discord oficial.

## Solución de problemas

### No aparece la lista de BedrockConnect

- Comprueba que la configuración DNS de Switch está en «Manual».
- Comprueba que no haya errores al escribir el DNS primario y secundario.
- Consulta los valores DNS más recientes en el README oficial de BedrockConnect.
- Prueba a abrir BedrockConnect desde otro servidor destacado compatible.
- Reinicia Minecraft y la conexión de red de Switch.

### Aparece la lista, pero no se conecta al destino

- Comprueba que `Server Address` coincide con las instrucciones actuales del servidor.
- Comprueba que `Server Port` sea el puerto Bedrock y no el de Java Edition.
- Confirma que el servidor de destino acepta jugadores de Bedrock Edition.
- Consulta las instrucciones oficiales para comprobar si hay mantenimiento o restricciones de acceso.

### Restaurar la configuración original

Abre la red conectada en «Configuración de la consola» → «Internet» → «Configuración de Internet», cambia la configuración DNS a «Automático» y guarda.

## Notas importantes

BedrockConnect no añade una función a la lista oficial de servidores. Es un servicio externo que usa DNS para abrir la lista de BedrockConnect desde un servidor destacado. Las actualizaciones del juego o los cambios del servicio pueden hacer que el proceso deje de funcionar.

El README oficial de BedrockConnect indica que las aplicaciones móviles no oficiales con el mismo nombre no están asociadas con el proyecto. Si una aplicación te pide instalar software o introducir información de la cuenta, compárala con las instrucciones del [GitHub oficial](https://github.com/Pugmatt/BedrockConnect).

## Resumen

El método DNS de BedrockConnect puede ayudar a los jugadores de Switch a entrar en servidores Minecraft Bedrock externos. Configura el DNS, abre BedrockConnect desde un servidor destacado compatible y escribe la dirección y el puerto de destino.

Para entrar en Aceserver, utiliza la información más reciente del [Portal de Aceserver](/es/), el [Discord oficial](https://discord.gg/acsv) y la [WIKI de Aceserver](https://asv-wiki.acecore.net), no un valor fijo antiguo.

## Referencias

- [README oficial de BedrockConnect en GitHub](https://github.com/Pugmatt/BedrockConnect)
- [Portal oficial de Aceserver](/es/)
- [WIKI de Aceserver](https://asv-wiki.acecore.net)
- [Guía de conexión desde Switch a servidores externos usada como referencia](https://www.radical-dreamer.com/game/minecraft_bedrockconnect/)
