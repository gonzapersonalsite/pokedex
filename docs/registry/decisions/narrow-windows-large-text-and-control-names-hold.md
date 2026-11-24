---
title: La interfaz escala en rem, envuelve la cabecera en estrecho y nombra cada control
state: provisional
date: 2026-11-24
domain: interface
phase: none
criterion: Se confirma cuando el dueño relea esta refutación con el trabajo delante y lo diga en un turno posterior.
---
**Todo tamaño de texto va en `rem`, la cabecera y los filtros envuelven sin solaparse, y
cada control se identifica sin ambigüedad.**

- **Tipografía relativa en `rem`.** Ni la aplicación ni `NotFoundSection` fijan tamaños de
  texto en `px`; `textSizes.test.ts` (con el árbol CSS incluido en `vite.config.ts`)
  rechaza cualquier tamaño en píxeles en el código, CSS o `index.html`.
- **Cabecera y filtros en ventana estrecha con texto grande.** El encabezado usa `flex-wrap`
  y los filtros de tipo se ajustan cuando coinciden 320 px y texto de 24 px sin tapar el
  título; pulsar «All» desde favoritos vuelve al listado completo coherente con
  `aria-pressed` (`PokedexPage.test.ts`).
- **Nombres únicos e identificadores por instancia.** Cada botón de favorito en
  `PokemonCard` incluye el nombre del Pokémon (`PokemonCard.test.tsx`), cada botón de la
  carcasa de `PokemonModal` tiene su `aria-label`, y `SearchBar` y `CreditsFooter`
  generan sus identificadores con `useId`.

Propuesto por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados»); pasa a confirmada cuando el dueño relea esta
refutación (`#2026-11-24-design-guide-aligned-with-code-and-template`). Su fase es `none`: F0
y F1 están hechas y el rediseño visual todavía no tiene fase. Se verificó en
`#2026-11-24-interface-decisions-closed-before-redesign`.

## Refutación

En contra: con la letra en 24 px y 320 px de ancho la cabecera pasa a dos o
tres filas y ocupa buena parte de la pantalla, porque es fija; y los nombres
que incluyen el del Pokémon («Add Pikachu to favorites») alargan lo que un
lector de pantalla lee en cada tarjeta. Se mantiene porque lo que se pide es
que nada se solape ni se tape y que cada control se distinga de los demás, y
eso se cumple; cuánto ocupa la cabecera fija en una pantalla así es una
cuestión de aspecto para el rediseño.
