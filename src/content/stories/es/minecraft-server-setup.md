---
title: 'Cómo configurar un servidor gratuito de Minecraft: Java, Bedrock y Realms'
description: Guía para configurar un servidor gratuito de Minecraft y comparar Java Edition, Bedrock Edition y Realms, con la preparación y las comprobaciones de seguridad necesarias antes de abrirlo.
translationOf: minecraft-server-setup
sourceHash: sha256:30b94a023a3c9ff5ae3649658ba90041f0cde631114a7f6d34f52fcf8e90249c
date: 2026-08-08T10:00:00+09:00
tags:
  - Minecraft
  - Servidor de Minecraft
  - Primeros pasos
author: Gui
---

Hay varias formas de jugar a Minecraft con amigos: usar la misma red local, ejecutar un servidor dedicado en tu propio PC o usar Realms. La opción adecuada depende de la edición de todos los jugadores y del mantenimiento que estés dispuesto a asumir.

Lo primero que debes saber es que un servidor gratuito significa que el software del servidor es gratuito. El juego de Minecraft, el ordenador, la electricidad, la conexión a Internet, las copias de seguridad y las actualizaciones no pasan a ser gratuitos. Esta guía se centra en alojar el software oficial en tu propio PC.

## Resumen: elige según los jugadores y la edición

| Método                               | Cómo entender el coste                                                      | Quién puede entrar                     | Ideal para                                             |
| ------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| Jugar en la misma red                | Sin cuota adicional de servidor                                             | La misma casa o LAN                    | Probarlo primero durante poco tiempo                   |
| Servidor dedicado de Java Edition    | El software oficial es gratuito; PC, red y electricidad aparte              | Jugadores de Java Edition              | Aprender la configuración y la gestión en PC           |
| Servidor dedicado de Bedrock Edition | El software oficial es gratuito; se necesita un sistema y un PC compatibles | Jugadores de Bedrock Edition           | Jugar con amigos de móviles o consolas                 |
| Realms                               | Servicio de suscripción; algunas cuentas pueden recibir una prueba gratuita | Miembros invitados de la misma edición | Evitar el mantenimiento del PC y el reenvío de puertos |

Java Edition y Bedrock Edition son ediciones distintas, y normalmente sus jugadores no pueden entrar directamente en el mismo servidor. Comprueba no solo si todos usan PC, móvil o consola, sino también si todos están jugando con Java o Bedrock.

## Preparativos antes de configurar el servidor

### 1. Comprueba la edición de todos

Java Edition está disponible para PC con Windows, macOS y Linux. Bedrock Edition está disponible en PC con Windows, móviles, consolas y otros dispositivos compatibles. En Windows puedes tener acceso a las dos ediciones, pero iniciar la edición equivocada impedirá entrar en el servidor previsto.

### 2. Elige el PC anfitrión

El PC que ejecuta el servidor dedicado hace avanzar el mundo. Si entra en suspensión o se detiene el proceso del servidor, los amigos conectados no podrán seguir jugando. Decide de antemano quién se encargará del espacio libre, la memoria, la red, las actualizaciones y las copias de seguridad.

### 3. Decide quién puede conectarse

Si todos están en la misma LAN, no necesitas exponer el servidor a Internet. Invitar a amigos que están en otro lugar puede requerir configurar el reenvío de puertos del router y el firewall. Por seguridad, prueba primero en tu PC y en la red local antes de ampliar el acceso.

## Cómo configurar un servidor gratuito de Java Edition

Java Edition tiene un Java Edition Server oficial. El software de la página oficial de descarga solo funciona con Java Edition y necesita un entorno Java compatible que pueda utilizarse desde la línea de comandos.

### Pasos básicos

1. Crea una carpeta vacía y descarga el archivo`.jar` del servidor de Java desde la página oficial.
2. Cambia el nombre del archivo descargado por uno sencillo, como `server.jar`. Si conservas el nombre original, sustituye el nombre en los comandos siguientes.
3. Confirma que Java está disponible.

```text
java -version
```

4. Abre la carpeta del servidor en una línea de comandos e inicia el servidor una vez.

```text
java -jar server.jar nogui
```

5. Lee el archivo`eula.txt` creado durante el primer inicio. Cambia su valor a`eula=true` solo si aceptas su contenido y, después, inicia de nuevo el servidor.
6. Usa`server.properties` para configurar el modo de juego, la dificultad y una lista de jugadores permitidos.
7. Haz primero una prueba con `localhost` o con una dirección de la misma LAN y confirma que el mundo se guarda correctamente.

La versión del servidor y la de los clientes deben ser compatibles. Antes de actualizar, copia la carpeta del mundo y detén el servidor. Así se reduce el riesgo de errores de conexión o daños en el mundo.

## Cómo configurar un servidor gratuito de Bedrock Edition

Bedrock Edition tiene un Bedrock Dedicated Server oficial. La página oficial ofrece descargas para Windows o Linux. Es un software distinto del`.jar` de Java, así que elige el paquete de Bedrock cuando tus amigos usen Bedrock Edition.

### Pasos básicos

1. Descarga Bedrock Dedicated Server desde la página oficial a una carpeta vacía.
2. Extrae el archivo ZIP y lee la guía incluida. El paquete oficial incluye instrucciones de instalación y uso.
3. Inicia el servidor con el ejecutable o el comando correspondiente a tu sistema operativo. Los archivos de mundo necesarios se crean al iniciarlo.
4. Comprueba la configuración del mundo y la lista de jugadores permitidos en`server.properties`. Si quieres mantenerlo privado, consulta en la guía incluida opciones como`allow-list=true`.
5. Empieza conectando un cliente de Bedrock en la misma LAN y confirma la versión y el método de conexión.

El entorno oficial de Bedrock Dedicated Server está pensado para Windows o Linux. Aunque los móviles o las consolas puedan conectarse, la configuración de la cuenta y los requisitos del servicio en línea de cada dispositivo pueden afectar a la conexión. Un cliente de Java Edition no puede entrar directamente en un servidor exclusivo de Bedrock.

## ¿Realms es un servidor gratuito?

Realms es el servidor privado oficial de Minecraft alojado en la nube. El propietario no tiene que mantener el juego abierto para que el mundo esté disponible y solo pueden entrar los miembros invitados. Reduce el trabajo de gestionar un PC doméstico, el reenvío de puertos y las actualizaciones del software del servidor.

Sin embargo, Realms es un servicio de suscripción y no es gratuito para siempre. Algunas cuentas que cumplen los requisitos pueden recibir una prueba gratuita de 30 días, pero la información oficial explica que la suscripción se renueva automáticamente al terminar la prueba si no se cancela. Antes de suscribirte, comprueba la edición, el plan, el límite de jugadores simultáneos y las condiciones de renovación.

Realms también se separa por edición: los jugadores de Java entran en un Realm de Java y los jugadores de Bedrock entran en un Realm de Bedrock. Realms no permite el juego cruzado entre las dos ediciones.

## ¿Qué método deberías elegir?

- Para una prueba rápida en casa o en la misma LAN, el multijugador del juego es la opción más sencilla.
- Para jugadores de Java en PC que quieran aprender la configuración y la gestión, elige un servidor dedicado de Java.
- Para amigos que usen dispositivos Bedrock, considera Bedrock Dedicated Server.
- Si te importa más tener acceso permanente que el coste y quieres reducir el mantenimiento, Realms es más sencillo, pero no es gratuito.

Si eliges un servidor doméstico para evitar las cuotas de alojamiento, decide quién lo reiniciará cuando se detenga y dónde se guardará la copia del mundo. Planificarlo evita muchos problemas después de empezar.

## Comprueba estos puntos antes de abrir el servidor

- Haz copias de seguridad periódicas del mundo y confirma que puedes restaurarlo.
- Da permisos de operador o administrador solo a quienes los necesiten.
- Si juegas con amigos, usa una lista de permitidos en lugar de abrir el servidor a todo el mundo.
- Configura el router y el firewall solo cuando realmente necesites acceso externo.
- Comprueba las versiones compatibles y las copias de seguridad antes de actualizar el juego o el software del servidor.
- No compartas direcciones IP, contraseñas ni datos de administración más allá de lo necesario.

Consulta los requisitos y las descargas más recientes en la [página oficial de descarga del servidor de Java](https://www.minecraft.net/en-us/download/server), la [guía de configuración del servidor de Java](https://help.minecraft.net/hc/en-us/articles/360058525452-How-to-Setup-a-Minecraft-Java-Edition-Server), la [página de descarga del servidor de Bedrock](https://www.minecraft.net/en-us/download/server/bedrock), la [información sobre Dedicated Server](https://help.minecraft.net/hc/en-us/articles/4408873961869-Minecraft-Dedicated-and-Featured-Servers-FAQ-), la [página oficial de Realms](https://www.minecraft.net/en-us/realms) y la [comparación entre Java y Bedrock](https://www.minecraft.net/en-us/article/java-or-bedrock-edition).
