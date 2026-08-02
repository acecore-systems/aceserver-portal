---
title: 'Comandos de Minecraft Bedrock: visión nocturna, teletransporte y tiempo'
description: Ejemplos prácticos de comandos de Minecraft Bedrock para visión nocturna, teletransporte, tiempo, clima y objetos, con los puntos que conviene revisar antes.
translationOf: minecraft-bedrock-commands
sourceHash: sha256:48a7cedb3fac3a470591186fe2fb1eded8cd39dd32231454d324d338c962218b
date: 2026-08-02T14:00:00+09:00
tags:
  - Minecraft
  - Minecraft Bedrock
  - Comandos
author: Gui
---

Los comandos de Minecraft Bedrock sirven para cambiar la hora o el clima, moverse a coordenadas y probar un mundo. Esta guía reúne ejemplos básicos para un mundo personal o uno en el que tengas permisos de administración.

Los servidores públicos pueden prohibir los comandos a cualquier persona que no sea administradora. Lee siempre las reglas del servidor antes de probar allí un ejemplo de este artículo.

## Antes de empezar

Para usar muchos comandos en Bedrock debes activar los trucos en el mundo y comprobar que tienes los permisos necesarios. Al activar los trucos no podrás conseguir logros en ese mundo, así que decide con cuidado.

Si no sabes qué escribir, empieza en el chat con:

```mcfunction
/help
```

Al añadir un nombre de comando, por ejemplo /help effect, puedes ver la sintaxis disponible en el juego actual. Las actualizaciones de Bedrock pueden cambiar la sintaxis disponible, por lo que las sugerencias del juego y /help deben ser tu comprobación final.

## Comandos de uso frecuente

### Poner la hora de día

```mcfunction
/time set day
```

Úsalo cuando llegue la noche o quieras revisar una construcción con luz. También puedes elegir horas como noon cuando aparezcan entre las sugerencias.

### Despejar el clima

```mcfunction
/weather clear
```

Este ejemplo detiene la lluvia o las tormentas para mejorar la visibilidad. Los comandos de clima afectan a todo el mundo, así que avisa primero a otras personas en un mundo compartido.

### Cambiar tu propio modo de juego

```mcfunction
/gamemode creative @s
```

@s significa la persona que ejecuta el comando. Sustituye creative por survival para volver. Haz una copia de seguridad de un mundo importante antes de realizar cambios grandes.

### Teletransportarte a coordenadas

```mcfunction
/tp @s 0 80 0
```

Esto te mueve a X=0, Y=80, Z=0. Comprueba antes que el destino no esté hueco ni sea peligroso, especialmente al teletransportarte bajo tierra o a gran altura.

### Darte un objeto

```mcfunction
/give @s torch 64
```

Este ejemplo te entrega 64 antorchas. Consulta los ID de objetos y las cantidades en las sugerencias de entrada. Es útil al preparar herramientas en un mundo de pruebas o de aventura.

### Aplicar visión nocturna ilimitada

```mcfunction
/effect @s night_vision infinite 0 true
```

Usa este ejemplo para revisar cuevas o construcciones oscuras. El true final oculta las partículas. Para quitar el efecto, usa:

```mcfunction
/effect @s clear night_vision
```

## Si un comando no funciona

1. Comprueba que los trucos estén activados en un mundo personal o que tengas permisos de administración.
2. Revisa la sintaxis actual con /help seguido del nombre del comando y con las sugerencias del chat.
3. No copies sin cambios una guía de Java Edition. Java y Bedrock pueden tener sintaxis y condiciones distintas para el mismo objetivo.
4. En un servidor público, sigue primero las reglas y la guía de ese servidor.

## Pruébalos uno por uno

Los comandos son potentes porque pueden cambiar un mundo de inmediato. Empieza en un mundo de pruebas con copia de seguridad y prueba de uno en uno cambios fáciles de entender, como la hora, el clima y la visión nocturna.

Consulta la [introducción a comandos de Bedrock en Microsoft Learn](https://learn.microsoft.com/en-us/minecraft/creator/documents/commandsintroduction?view=minecraft-bedrock-stable), la [referencia de comandos](https://learn.microsoft.com/en-us/minecraft/creator/commands/?view=minecraft-bedrock-stable) y la [referencia del comando effect](https://learn.microsoft.com/en-us/minecraft/creator/commands/commands/effect?view=minecraft-bedrock-stable) para ver la sintaxis y los permisos.
