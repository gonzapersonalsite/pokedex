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

Decidido por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados»), verificado en
`#2026-11-24-interface-decisions-closed-before-redesign` y cubierto por `motion.test.ts`,
`scroll.test.ts`, `PokemonModal.test.tsx` y `PokedexPage.test.ts`.

## Refutación

En contra: proteger solo las transiciones cortas de Tailwind dejaba activas animaciones
continuas CSS y el desplazamiento suave en JavaScript. Se mantiene: unificar hojas CSS,
clases y llamadas de scroll asegura coherencia real bajo movimiento reducido sin alterar el
comportamiento por defecto.
