---
title: La primera visita guarda el tema del sistema como si se hubiera elegido
state: open
date: 2026-11-24
domain: interface
phase: none
---
**La primera visita guarda el tema del sistema como si se hubiera elegido.**
`readInitialTheme` toma el tema guardado y, si no hay ninguno, el del sistema.
`applyTheme` lo guarda cada vez que lo aplica, también la primera, cuando nadie
ha pulsado nada. Desde esa visita manda lo guardado: un cambio del esquema del
sistema ya no se sigue, y solo el botón de la cabecera cambia el tema.

**Lo visto**, en Chrome sobre el servidor de desarrollo. Con el almacenamiento
vacío y el sistema en oscuro, la página sale oscura y deja guardado el tema
oscuro; al volver con el sistema en claro, sigue oscura. Al revés ocurre lo
mismo: la primera visita en claro deja la página clara aunque el sistema pase
después a oscuro. El botón cambia el tema y lo guarda, como se espera.

**Qué hay que decidir.** Si la Pokédex sigue al sistema hasta que la persona
elija, y entonces solo se guarda al pulsar el botón, o si fijar el tema en la
primera visita es lo que se quiere. El script de `index.html` y
`ThemeProvider` ya distinguen lo guardado de lo que dice el sistema; lo que no
distinguen es quién lo guardó.

El agente recomienda seguir al sistema hasta que alguien elija: es lo que
espera quien tiene el sistema en automático y ve cambiar de esquema al resto
de sus aplicaciones al anochecer.

**Por qué sigue abierta.** Es comportamiento del producto y nadie lo ha
decidido; la parte que lo encontró,
`#2026-11-24-design-guide-and-interface-corrections`, enuncia en `DESIGN.md` lo
que el código hace hoy y no lo cambia. No cae en ninguna fase: las del plan
están hechas y no hay ninguna abierta. Se cierra con la decisión; si es seguir
al sistema, cuando una visita que no toca el botón no deje nada guardado.
