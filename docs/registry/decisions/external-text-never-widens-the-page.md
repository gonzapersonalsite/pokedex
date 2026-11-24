---
title: Lo que viene de fuera no ensancha la página
state: provisional
date: 2026-11-24
domain: interface
phase: none
criterion: Se confirma cuando el dueño relea esta refutación con el trabajo delante y lo diga en un turno posterior.
---
**Lo que viene de fuera no ensancha la página.** Un nombre de PokeAPI cambia
sus guiones por espacios y, si aun así no cabe, se parte dentro de su
elemento (`break-words`); la ruta desconocida de la pantalla 404 se parte por
cualquier carácter (`break-all`); un aviso nunca es más ancho que la ventana.

Propuesta por el agente, en `#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0 y F1 están hechas y el rediseño visual todavía no tiene fase.

## Refutación

En contra: partir una palabra a mitad deja nombres como «crabomi-nable» en
dos líneas, más feos que un recorte con puntos suspensivos, y `break-all`
parte también rutas cortas donde no hacía falta. Se mantiene porque un recorte
esconde parte del nombre o de la ruta, que es justo lo que se quiere leer, y
porque un desplazamiento horizontal a 320 px rompe toda la página; solo los
nombres de doce letras o más sin guion se parten con la letra por defecto.
