---
title: 'Cómo compartir tu servidor Java con Bedrock: configuración segura de juego cruzado'
description: Aprende a invitar de forma segura a amistades de Bedrock a tu propio servidor Java con Geyser y Floodgate, elegir un host gratuito y revisar la configuración antes de abrirlo.
translationOf: minecraft-java-bedrock-shared-server
sourceHash: sha256:35250c41cb4dcc95e1ffec68e5830d5c959c37619e0e7c6ef021568eecfdffb8
date: 2026-08-09T10:00:00+09:00
tags:
  - Minecraft
  - Edición Java
  - Edición Bedrock
  - Juego cruzado
  - Servidor gratuito
  - Geyser
author: Gui
image: /uploads/stories/minecraft-java-bedrock-shared-server-hero.webp
imageAlt: Tres personas con un PC, una tableta y una consola portátil miran una misma pequeña casa-servidor de bloques iluminada por líneas azules y un emblema de escudo
---

Para invitar a tu propio servidor Java a amistades que usan Bedrock en móviles, tabletas, Windows o consolas, una opción práctica es instalar Geyser y Floodgate en el servidor Java. Geyser conecta las comunicaciones de Bedrock con el servidor Java, mientras Floodgate permite identificar las cuentas de Bedrock de forma segura.

Lo importante es no desactivar la autenticación de cuentas Java solo para admitir amistades de Bedrock. Esta guía parte de un servidor con autenticación Java y acceso solo por invitación. Los controles y algunas funciones no son idénticos en Java y Bedrock, así que hay que probar ambos tipos de dispositivo antes de abrir el servidor.

## Resumen: comparte un servidor con Java + Geyser + Floodgate

Para un servidor Java administrado por ti, una configuración clara es usar Paper, que admite complementos, e instalar Geyser y Floodgate en el mismo servidor.

- Las amistades de Java entran por el punto TCP del servidor Java.
- Las amistades de Bedrock entran por el punto UDP donde escucha Geyser.
- Floodgate permite que las amistades de Bedrock entren como cuentas Bedrock sin comprar además una cuenta de Java Edition.
- Mantén online-mode del servidor Java en true.

Este método añade una ruta de conexión Bedrock a un servidor Java. No permite que clientes Java entren directamente en un servidor solo Bedrock ni conecta entre sí Realms de Java y Bedrock.

### Comprueba esto primero

- Prepara un PC que pueda ejecutar un servidor Java o un host compatible con complementos de servidor.
- Asegúrate de que cada persona pueda iniciar sesión legítimamente en la edición que posee.
- Alinea las versiones compatibles de Java y Bedrock, los complementos instalados y los paquetes de recursos.
- Las consolas pueden tener reglas específicas para introducir servidores personalizados. No uses soluciones de cambio de DNS; consulta la guía oficial del dispositivo y del host.

## Elige una forma de empezar gratis

Un servidor gratuito significa que el software del servidor o un plan de alojamiento gratuito no cobra una tarifa de uso. No hace gratuitos Minecraft, el PC anfitrión, la electricidad e internet, las copias de seguridad ni el trabajo de actualización.

| Configuración                         | Cómo entender el coste adicional                                | Cómo invitar a amistades remotas                                     | Condiciones para empezar con seguridad                                                                 | Limitación principal                                                          |
| ------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Servidor en casa, solo LAN            | El software es gratuito                                         | No invites a personas remotas; prueba solo en casa o en la misma red | No crees exposición en el router                                                                       | Las amistades fuera de casa no pueden entrar                                  |
| Servidor en casa, acceso por internet | El software es gratuito; PC, internet y electricidad van aparte | Permite solo TCP de Java y UDP de Geyser cuando sea necesario        | Configura antes una lista de acceso, el cortafuegos del sistema y copias                               | Debes gestionar router, IPv6 y actualizaciones                                |
| Ejemplo de host gratuito: Aternos     | Sigue las condiciones del plan gratuito                         | Usa la dirección y el puerto que muestre el host                     | Instala Paper, Geyser y Floodgate según las instrucciones oficiales del host y usa una lista de acceso | Capacidad, condiciones de actividad y complementos compatibles pueden cambiar |
| Realms                                | Suscripción                                                     | Usa invitaciones                                                     | Usa los controles oficiales de invitación y cuenta                                                     | No sirve para juego cruzado entre Java y Bedrock                              |

Si no estás seguro de abrir puertos en casa, primero confirma la configuración en una LAN o empieza con un host gratuito que gestione la dirección y el puerto externos. Al redactar este artículo, Aternos recomienda Paper en su guía oficial y explica la instalación y configuración automática de Floodgate al instalar Geyser. Si su panel o política cambió, sigue la guía oficial vigente.

## Comprende la estructura de conexión

Java y Bedrock llegan al servidor en formatos de red distintos. Con Geyser y Floodgate en un servidor Paper, cada conexión cumple una función diferente.

| Quién se conecta     | Destino                                                               | Transporte                 | Función del servidor                                  |
| -------------------- | --------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------- |
| Amistades de Java    | Dirección y puerto del servidor Java                                  | TCP                        | Paper acepta la conexión directamente                 |
| Amistades de Bedrock | El mismo nombre de host y el puerto Bedrock proporcionado para Geyser | UDP                        | Geyser convierte la conexión para Paper               |
| Administración       | Consola del servidor o panel del host                                 | Ruta de gestión no pública | Gestiona la lista de acceso, copias y actualizaciones |

En un servidor doméstico, los puertos habituales son TCP 25565 para Java y UDP 19132 para Geyser, pero un host puede asignar otros números. Indica a las amistades de Bedrock el puerto UDP de Geyser que muestre el panel; no les pidas que supongan que es 19132.

El puerto UDP de Geyser no se puede compartir con chat de voz, Query u otro servicio UDP. Al añadir una función más tarde, no fuerces la reutilización del puerto; comprueba la documentación oficial y la asignación del host.

![Un jugador de Java con PC se conecta directamente a una casa de servidor protegida, mientras jugadores de Bedrock con tableta, teléfono y consola portátil cruzan un puente azul hasta la misma casa](/uploads/stories/minecraft-java-bedrock-shared-server-topology.webp)

_Java llega directamente a Paper; Bedrock llega primero a Geyser, que lo entrega al mismo servidor Paper._

## Paso 1: instala Paper, Geyser y Floodgate

1. Elige Paper u otro software de servidor Java compatible con complementos del lado del servidor. Un servidor Java vanilla por sí solo no puede cargar complementos de la familia Bukkit.
2. Obtén Geyser y Floodgate desde la distribución oficial de Geyser o el panel oficial de complementos de tu host, con versiones que coincidan con el servidor. No uses archivos de origen desconocido.
3. Inicia el servidor una vez y confirma en la consola que se cargaron Geyser y Floodgate.
4. En una configuración de complementos Paper, Geyser puede detectar automáticamente el destino Java y la autenticación Floodgate. Consulta la configuración oficial y la guía específica del host antes de editar a mano.

Los MOD que solo necesitan instalarse en el cliente no pueden funcionar para clientes Bedrock que entran mediante Geyser. Antes de invitar a todas las personas, prueba MOD, complementos y paquetes de recursos con un grupo pequeño en ambas ediciones.

## Paso 2: establece valores seguros antes de publicar

Primero activa la autenticación Java y la lista de acceso en server.properties de Paper. Las etiquetas pueden diferir según la versión del servidor o el panel del host, así que revisa el valor actual antes de cambiarlo.

| Ajuste            | Valor recomendado | Motivo                                             |
| ----------------- | ----------------- | -------------------------------------------------- |
| online-mode       | true              | Autentica conexiones Java con cuentas de Minecraft |
| white-list        | true              | Mantiene fuera a personas no invitadas             |
| enforce-whitelist | true              | Expulsa a quienes no estén en la lista de acceso   |
| enable-rcon       | false             | No expone una consola remota sin usar              |
| enable-query      | false             | No añade un listener de consulta sin usar          |

Añade a las amistades de Java a la lista de acceso normal. Para Bedrock, usa el comando de lista de Floodgate con el gamertag real de la persona. Por ejemplo, ejecuta **/fwhitelist add gamertag** desde la consola de administración. No adivines un prefijo de usuario para usar la lista normal, ni dejes la lista desactivada durante las pruebas.

Da privilegios administrativos solo a quien realmente los necesite. No distribuyas a amistades la configuración completa, los archivos de clave de Floodgate ni los datos de acceso del host. Haz una copia antes de cambiar ajustes o actualizar complementos y el juego, y comprueba que puedes restaurarla.

![Una persona administradora revisa una lista de acceso junto a un escudo, dos rutas azules estrechas atraviesan un muro hacia una casa de servidor y una puerta administrativa aparte permanece cerrada](/uploads/stories/minecraft-java-bedrock-shared-server-safe-settings.webp)

_Solo se permiten las rutas de Java y Geyser confirmadas tras las pruebas; la ruta de administración permanece cerrada a internet._

## Paso 3: expón solo el tráfico necesario por etapas

Haz pruebas de conexión antes de abrir cualquier acceso externo.

1. Entra al servidor Paper desde el PC anfitrión o un cliente Java de la misma LAN.
2. Entra mediante Geyser desde un cliente Bedrock de la misma LAN usando el puerto UDP.
3. En ambas ediciones, revisa la lista de acceso, el punto de aparición, cofres, chat y guardado del mundo.
4. Solo cuando amistades remotas necesiten acceso, permite de forma individual el puerto TCP de Java y el puerto UDP de Geyser en el cortafuegos y el router.
5. Prueba con una amistad incluida en la lista desde otra red. connectiontest de Geyser también puede ayudar a confirmar el destino.

No necesitas una DMZ, reenvío de todos los puertos, un cortafuegos desactivado ni publicar el panel de control o RCON en internet. Si el host es accesible por IPv6, no supongas que las reglas de reenvío IPv4 lo protegen; confirma que el cortafuegos del sistema también se aplique a IPv6.

![Jugadores con PC y tableta prueban junto a una casa de servidor protegida a la izquierda, y después una persona administradora comprueba un escudo en una puerta antes de que se conecte una amistad remota a la derecha](/uploads/stories/minecraft-java-bedrock-shared-server-staged-test.webp)

_Primero prueba ambas ediciones en la LAN y después confirma el acceso con una amistad incluida en la lista desde otra red._

## Comprobaciones al empezar con un host gratuito

Los mismos principios de alcance público se aplican a un host gratuito. No tienes que crear redirección de puertos en el router doméstico, pero debes proteger la cuenta del host, la lista de acceso y el acceso al panel.

1. Crea un servidor Java Paper siguiendo las instrucciones oficiales del host.
2. Añade Geyser desde el panel oficial de complementos y confirma que Floodgate está instalado.
3. Después de iniciar el servidor, revisa la dirección y el puerto de Java y Bedrock que aparecen en la pantalla Connect del host.
4. Confirma los ajustes de autenticación y lista de acceso del paso 2 antes de compartir los datos de conexión de forma individual.
5. Cuando se publique una versión nueva de Bedrock, consulta las guías oficiales del host y de Geyser para saber si se necesita actualizar Geyser.

Las condiciones de actividad, la cobertura de copias, los complementos admitidos y el manejo de interrupciones de un plan gratuito dependen de cada proveedor y pueden cambiar. No guardes un mundo importante solo en el host: crea una copia en otro lugar mediante un método permitido por los términos y el panel.

## Ajustes que no se recomiendan

- No establezcas online-mode en false solo para dejar entrar a Bedrock. La FAQ oficial de Geyser considera peligroso y no compatible el modo offline sin Floodgate.
- No publiques el servidor con la lista de acceso desactivada, ni siquiera para una sola prueba. Usa la función de lista de Floodgate para jugadores Bedrock.
- No uses una DMZ, reenvío de todos los puertos, cortafuegos desactivado ni exposición automática UPnP en vez de encontrar la causa de un problema de conexión.
- No habilites RCON, Query, PROXY protocol ni un panel de gestión externo por si acaso. Considéralos solo si entiendes la configuración necesaria y puedes limitar la exposición.
- No ejecutes complementos desconocidos, complementos que evaden autenticación ni una configuración completa compartida sin revisarla.

## Lista antes de invitar a amistades

- Clientes Java y Bedrock pueden entrar, salir y volver a entrar en una prueba real.
- El servidor Java tiene online-mode en true y una lista de acceso activa.
- Los nombres Java y los gamertags Bedrock mediante Floodgate están cada uno en la lista correcta.
- Solo Java TCP y Geyser UDP están expuestos a internet; RCON, Query y el panel no son públicos.
- Cada amistad recibe la dirección, el puerto y la versión compatible de su edición.
- Hay una copia actual y se comprobó el método de restauración antes de actualizar.

Cuando se confirman estos puntos, amistades de Java y Bedrock pueden empezar a jugar en el mismo mundo sin perder la autenticación ni el límite de exposición pública.

## Referencias oficiales

- [Configuración de Geyser](https://geysermc.org/wiki/geyser/setup/)
- [FAQ de Geyser](https://geysermc.org/wiki/geyser/faq/)
- [Función de lista de acceso de Floodgate](https://geysermc.org/wiki/floodgate/features/)
- [Referencia de server.properties de Paper](https://docs.papermc.io/paper/reference/server-properties/)
- [Guía de Geyser de Aternos](https://support.aternos.org/hc/en-us/articles/360051047631-Allow-Bedrock-players-on-your-Java-server-with-Geyser)
- [Comparación de Java y Bedrock de Minecraft](https://www.minecraft.net/en-us/article/java-or-bedrock-edition)
