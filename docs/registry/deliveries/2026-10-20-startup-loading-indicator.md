---
title: Indicador accesible de carga inicial en index.html desde react-fsd-template
date: 2026-10-20
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo y superficie HTML inicial, a
petición del dueño. `templates` actualizó `react-fsd-template` en el commit
`27df3cf` para que `index.html` incluya dentro de `<div id="root">` un
indicador de arranque accesible (`.app-startup`) y `tooling/agent-files/shell.ts`
escriba en él `SITE_NAME` y compruebe el `<progress>` indeterminado; este
repositorio lo incorpora con `upgrade.py` desde `771371a`.

**Qué cambió.**

- **`stack:react-fsd`**: toma `tooling/agent-files/shell.ts` y
  `tooling/agent-files/shell.test.ts`, y actualiza `tools/board/components.txt`
  al commit `27df3cf` de `templates`.
- **En `index.html`, estilos, build y tests de la aplicación:** `index.html`
  añade `<meta name="color-scheme" content="light dark" />`, script pre-pintado
  síncrono de tema (`pokedex-theme`, clase `.dark`, `data-theme` y
  `colorScheme`) y carga no bloqueante de Google Fonts (`media="print"` promovido
  a `media="all"` al cargar), el `<style>` incrustado de `.app-startup`, el
  bloque `<noscript>` y `<main class="app-startup">` con
  `<p class="app-startup-brand">Pokédex</p>` y
  `<progress aria-label="Loading Pokédex"></progress>` dentro de
  `<div id="root">`. `src/shared/utils/themeContext.ts` sincroniza
  `document.documentElement.style.colorScheme`, `src/app/index.css` añade
  `font-size-adjust: from-font` y condiciona las animaciones continuas a
  `@media (prefers-reduced-motion: no-preference)`,
  `src/features/pokemon/ui/PokemonCard.tsx` y `PokemonModal.tsx` declaran
  dimensiones intrínsecas (`width`, `height`, `decoding="async"`), y
  `vite.config.ts` separa los chunks de vendors (`react-vendor`, `query-vendor`,
  `ui-vendor`). `src/pages/pokedex/ui/PokedexPage.test.ts` monta la página sobre
  el `<div id="root">` de `index.html` y comprueba el script pre-pintado y que
  React sustituye `.app-startup`.

**Cómo se verificó.** Se vio fallar `tooling/agent-files/shell.test.ts` (2
fallos) al quitar `replaceBrand(SITE_NAME)` en `shell.ts`, y
`src/pages/pokedex/ui/PokedexPage.test.ts` (1 fallo) al forzar `colorScheme =
'light'` en `applyTheme`, y se deshicieron con la edición inversa.
`python verify.py` pasó sus 9 puertas en verde.

**Pendiente.** Nada.
