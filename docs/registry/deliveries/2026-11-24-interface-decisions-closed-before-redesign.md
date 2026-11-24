---
title: Cierre de decisiones abiertas de interfaz antes del rediseño visual
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** cierre completo de las decisiones abiertas de interfaz en Pokédex bajo
delegación del dueño («aborda primero esas cosas que me comentas que has dejado en cada
proyecto», «No quiero deuda de ningun tipo», «Dejo a tu preferencia recomendados»), antes
de actualizar el andamio y previo al rediseño visual posterior. Continúa sobre lo dejado en
`#2026-11-24-design-guide-and-interface-corrections`.

**Qué se cerró y verificó:**

- **Tema en primera visita (`#first-visit-stores-the-system-theme-as-a-choice`).**
  Confirmado con `themeContext.ts`, `ThemeProvider.tsx`, `ThemeProvider.test.tsx`,
  `themeContext.test.ts` y `PokedexPage.test.ts`: no se escribe nada en `localStorage`
  hasta elegir un tema distinto al del sistema, responde a `storage` entre pestañas y
  tolera `SecurityError` o valores inválidos.
- **Diálogos y scroll en ventanas bajas (`#pokemon-details-dialog-overflows-short-windows`).**
  Confirmado con `DialogViewport.tsx`, `PokemonModal.tsx`, `Credits.tsx` y `index.css`:
  `.dialog-viewport` hace de `DialogPanel` con `m-auto` en su hijo, ignora pulsaciones en
  la barra de scroll (`isOnScrollbarOf`) o arrastres que salen del panel, y mantiene los
  controles alcanzables. En comprobación en vivo sobre `http://127.0.0.1:5391` en Chrome a
  `390x664` y `320x640` (con letra de `16` y `24` px), ambos botones `Previous Pokémon` y
  `Next Pokémon` quedan bajo el puntero sin quedar tapados tras bajar al fondo y hacer
  `scrollIntoView` (`covered: false`).
- **Movimiento reducido completo (`#reduced-motion-covers-only-part-of-the-animations`).**
  Confirmado con `motion.test.ts`, `scroll.ts`, `scroll.test.ts`, `index.css`,
  `Button.tsx`, `PokemonCard.tsx`, `PokemonModal.tsx` y `NotFoundSection.tsx`: CSS bajo
  `no-preference`, utilidades protegidas con `motion-safe:`/`motion-reduce:` y scrolls por
  `preferredScrollBehavior`.
- **Escala tipográfica, estrechez y nombres (`#narrow-windows-large-text-and-control-names-hold`).**
  Confirmado con `textSizes.test.ts` (con `vite.config.ts` incluyendo `src/app/index.css`),
  `PokedexPage.tsx` (envoltura en cabecera y vuelta desde favoritos con «All»), `useId` en
  `SearchBar` y `CreditsFooter`, y nombres por Pokémon en `PokemonCard`.
- **Aspecto visual aplazado (`#choices-of-look-wait-for-the-visual-redesign`).** Registrado
  como `postponed` a la espera de que el dueño abra el rediseño visual.

**Comprobación por mutación y puertas:**

- Cada familia de cambio se comprobó inyectando defectos equivalentes y viendo fallar
  `.\dev.cmd verify -- tests` (lotes `2`, `3`, `4`, más los mutantes aislados de vuelta con
  «All» en `PokedexPage.tsx` y retirada de `motion-reduce:transition-none` en
  `PokemonModal.tsx`; todos salieron con código `1` antes de deshacerse).
- `DESIGN.md` actualizado para reflejar todas las decisiones cerradas y dejar fuera solo el
  aspecto visual aplazado y las comprobaciones aún pendientes (Safari, lector de pantalla,
  teléfono físico, aplicación instalada y contraste medido por herramienta).
