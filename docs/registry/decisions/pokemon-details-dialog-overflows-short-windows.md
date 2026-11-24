---
title: El diálogo de detalles y créditos se desplaza en ventanas bajas sin recortar sus controles
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Los diálogos (`PokemonModal` y `CreditsDialog`) se montan dentro de `DialogViewport`, que
hace de `DialogPanel` con desplazamiento propio dentro del visor.** Al centrar su hijo con
`m-auto`, una ventana más baja que el panel o con zoom al 200 % permite desplazarse por
toda la carcasa sin recortar sus controles ni mover el documento que queda detrás.

- **Transiciones sin barra pasajera.** `.dialog-viewport` mantiene `overflow: hidden auto` y
  pasa a `overflow: hidden` mientras dura `data-transition` (`dialogViewport.test.ts`).
- **Cierre desde el fondo fuera del panel.** Pulsar el fondo solo cierra el diálogo cuando
  tanto `onPointerDown` como `onClick` caen sobre el fondo desnudo y nunca sobre la barra
  de desplazamiento (`isOnScrollbarOf`, `DialogViewport.test.tsx`).
- **Botones accesibles en pantalla estrecha.** En `PokemonModal`, la barra fija superior y
  el área desplazable con margen de scroll evitan que la barra tape controles, y la fila
  inferior de botones envuelve en ventanas estrechas (`PokemonModal.test.tsx`).

Propuesto por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados»), en
`#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0
y F1 están hechas y el rediseño visual todavía no tiene fase. Se verificó en
`#2026-11-24-interface-decisions-closed-before-redesign` y cubierto por
`DialogViewport.test.tsx`, `dialogViewport.test.ts`, `PokemonModal.test.tsx` y
`Credits.test.tsx`.

**Confirmada por delegación del dueño**, que en un turno posterior, con la
refutación de abajo escrita, delegó su revisión: «si son correctas las decisiones por mi apruebalas y no las dejes en provisionales»
(`#2026-11-24-interface-decisions-confirmed-by-the-owner`).

## Refutación

En contra: desplazar todo el visor mueve también la carcasa y su cruceta, así
que en una ventana baja los controles de la parte de abajo quedan fuera de la
vista hasta que se baja, y el diálogo se lee como una página larga en vez de
como un aparato. Encoger la carcasa lo evitaría, a costa de cambiar sus
proporciones. Se mantiene porque nada queda recortado ni fuera de alcance, el
teclado lleva cada control a la vista (`scroll-pt-14` deja libre la barra
fija), y cambiar las proporciones es aspecto y espera a
`#choices-of-look-wait-for-the-visual-redesign`.
