---
title: El movimiento reducido solo alcanza a una parte de las animaciones
state: open
date: 2026-11-24
domain: interface
phase: none
---
**El movimiento reducido solo alcanza a una parte de las animaciones.** Quien
pide menos movimiento a su sistema deja de ver unas animaciones de la Pokédex
y sigue viendo otras, sin que nada diga cuáles tenían que respetarlo.

**Lo que ya lo respeta.** Los tres bucles propios de `src/app/index.css` (la
carga que se balancea, el barrido de la pantalla de la ficha y el pulso de sus
botones), el giro del indicador de arranque de `index.html`, y
las transiciones del enlace de saltar al contenido, de volver arriba y del
botón de créditos.

**Lo que no.**

- La entrada y la salida de la ficha en `PokemonModal`: un segundo de
  desplazamiento, escala y giro al abrir.
- La luz azul de la carcasa, que late sin fin.
- El destello de las dos luces de la carcasa al cambiar de Pokémon.
- Los desplazamientos suaves: al volver a la lista desde la pantalla 404, al
  cambiar de Pokémon dentro de la ficha y con la cruceta.

Esto sale de leer el código. No se ha mirado en un navegador con la
preferencia activada.

**Qué hay que decidir.** Si toda animación de la interfaz respeta la
preferencia o si alguna es parte del producto y se queda. El agente recomienda
que la respeten todas: la entrada de la ficha gira y escala un panel que ocupa
casi toda la ventana, que es el tipo de movimiento que esa preferencia existe
para evitar.

**Por qué sigue abierta.** La parte que lo encontró,
`#2026-11-24-design-guide-and-interface-corrections`, no tenía encargo de
cambiar el movimiento. No cae en ninguna fase: las del plan están hechas y no
hay ninguna abierta. Se cierra con la decisión; si es respetarla en todo,
cuando con la preferencia activada la ficha aparezca sin girar ni desplazarse,
ninguna luz lata y los desplazamientos sean instantáneos.
