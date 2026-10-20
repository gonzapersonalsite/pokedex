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
- **En `index.html` y tests de la aplicación:** `index.html` añade
  `<meta name="color-scheme" content="light dark" />`, el `<style>` incrustado
  de `.app-startup`, el bloque `<noscript>` y `<main class="app-startup">` con
  `<p class="app-startup-brand">Pokédex</p>` y
  `<progress aria-label="Loading Pokédex"></progress>` dentro de
  `<div id="root">`. `src/pages/pokedex/ui/PokedexPage.test.ts` monta la página
  sobre el `<div id="root">` de `index.html` y comprueba que React sustituye
  `.app-startup`.

**Cómo se verificó.** Se vio fallar `tooling/agent-files/shell.test.ts` (2
fallos) al quitar `replaceBrand(SITE_NAME)` en `shell.ts`, y se deshizo con la
edición inversa. `python verify.py` pasó sus 9 puertas en verde.

**Pendiente.** Nada.
