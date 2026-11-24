---
title: El movimiento reducido cubre animaciones CSS, spinners y desplazamientos por código
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Toda animación continua, transición de utilidad y desplazamiento por código respeta
`prefers-reduced-motion`.** Las animaciones de `src/app/index.css` (`.led-blink-blue`) se
declaran bajo la consulta `no-preference`, las clases de utilidad usan `motion-safe:` o
`motion-reduce:transition-none`, y todo `scrollTo` o `scrollBy` toma el comportamiento de
`preferredScrollBehavior`.

- **Animaciones y transiciones verificadas.** `motion.test.ts` rechaza cualquier animación o
  transición fuera de esa guarda en hojas de estilo, componentes e `index.html`.
- **Desplazamiento controlado.** `scrollToTop`, el retorno desde 404 en `PokedexPage` y la
  cruceta de `PokemonModal` consultan `preferredScrollBehavior` para usar desplazamiento
  suave o instantáneo según la preferencia del lector (`scroll.test.ts`).

Propuesto por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados»), en
`#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0
y F1 están hechas y el rediseño visual todavía no tiene fase. Se verificó en
`#2026-11-24-interface-decisions-closed-before-redesign` y cubierto por `motion.test.ts`,
`scroll.test.ts`, `PokemonModal.test.tsx` y `PokedexPage.test.ts`.

**Confirmada por delegación del dueño**, que en un turno posterior, con la
refutación de abajo escrita, delegó su revisión: «si son correctas las decisiones por mi apruebalas y no las dejes en provisionales»
(`#2026-11-24-interface-decisions-confirmed-by-the-owner`).

## Refutación

En contra: `motion-reduce:transition-none` también quita transiciones que no
son movimiento (un cambio de color o de opacidad), que pedir menos movimiento
no obliga a quitar; y `motion.test.ts` busca clases y declaraciones con
expresiones regulares, así que una clase montada por partes en tiempo de
ejecución, o una animación con la Web Animations API, se le escaparían. Se
mantiene porque quitar también los fundidos es lo más simple de verificar y
nadie lo ha echado en falta, y porque hoy ningún código anima por script; si
alguno llega, su guarda entra con él.
