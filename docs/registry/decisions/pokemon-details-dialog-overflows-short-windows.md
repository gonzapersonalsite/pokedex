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

Decidido por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados»), verificado en
`#2026-11-24-interface-decisions-closed-before-redesign` y cubierto por
`DialogViewport.test.tsx`, `dialogViewport.test.ts`, `PokemonModal.test.tsx` y
`Credits.test.tsx`.

## Refutación

En contra: encoger permanentemente la carcasa para que quepa en cualquier ventana baja
cambia proporciones visuales pensadas para escritorio. Se mantiene: desplazar el propio
`DialogViewport` conserva el diseño actual con mínimo cambio visual y deja todos los
controles alcanzables; cualquier cambio estético de la carcasa espera al rediseño
(`#choices-of-look-wait-for-the-visual-redesign`).
