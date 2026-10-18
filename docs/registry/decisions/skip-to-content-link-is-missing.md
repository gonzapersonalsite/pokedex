---
title: Falta el enlace para saltar al contenido principal
state: resolved
date: 2026-10-19
phase: F1
---
**Falta el enlace para saltar al contenido principal.** `portafolio` lo tiene
(`<a href="#main-content" class="skip-link">`) y la Pokédex no: quien navega con
teclado cruza el buscador, sus botones y el cambio de tema antes de llegar a la
lista en cada carga (WCAG 2.4.1, saltar bloques). El destino ya existe:
`<main id="main-content">` en `src/pages/pokedex/ui/PokedexPage.tsx`.

Es el reverso de volver arriba (`#return-to-top-is-a-link-to-root-shown-past-400px`):
los dos son enlaces de navegación a un ancla, uno al empezar la página y otro
para regresar. Queda abierto hasta que el dueño decida si entra como parte de F1.

2026-10-19: resuelta; el dueño lo encargó como F1.2 y se entregó en
`#2026-10-19-skip-to-content-link`.
