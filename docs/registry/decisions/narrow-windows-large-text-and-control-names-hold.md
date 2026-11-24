---
title: La interfaz escala en rem, envuelve la cabecera en estrecho y nombra cada control
state: confirmed
date: 2026-11-24
domain: interface
phase: none
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

Decidido por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados») y verificado en
`#2026-11-24-interface-decisions-closed-before-redesign`.

## Refutación

En contra: mantener tamaños en `px` para etiquetas pequeñas del 404 impide que escalen con
la preferencia del lector; usar textos genéricos en tarjetas acorta el DOM pero vuelve
indistinguibles los botones en un lector de pantalla. Se mantiene: la escala relativa y los
nombres explícitos no alteran la estética base y evitan regresiones al rediseñar
(`#choices-of-look-wait-for-the-visual-redesign`).
