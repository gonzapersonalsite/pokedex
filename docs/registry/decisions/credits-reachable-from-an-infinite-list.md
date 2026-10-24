---
title: La firma y la atribución legal se alcanzan con un botón de créditos en una lista infinita
state: provisional
date: 2026-10-24
phase: none
---
**La firma y la atribución legal se alcanzan con un botón de créditos que abre
un diálogo, además del footer semántico al final de la página.** El dueño
eligió esta opción entre las que le puso el agente; no la dictó. La lista de
Pokémon no cambia de comportamiento: sigue siendo scroll infinito.

**Forma.**

- Un botón flotante `Credits` abajo a la izquierda, separado de `Back to top`,
  que ya ocupa la esquina derecha. Es visible en todas las rutas de la página,
  también en la 404, y respeta `--safe-bottom` y `--safe-left`.
- Abre un diálogo de Headless UI, la misma librería que usa la ficha de un
  Pokémon. El diálogo tiene título accesible, cierre por botón, `Escape` y
  clic fuera; el foco vuelve al botón al cerrar.
- El contenido vive en un único componente (`CreditsContent`) y lo comparten el
  diálogo y el footer. El footer conserva el landmark y el diálogo es el camino
  alcanzable cuando la lista no tiene fin.
- El contenido nombra al autor y su rol (`Gonzalo Martínez García`, Full Stack
  Developer), enlaza al portafolio, GitHub y el correo, atribuye los datos y
  sprites a PokéAPI, declara que Pokémon es una marca de Nintendo, Game Freak y
  Creatures, aclara que es un proyecto no oficial y añade el copyright.
- El contacto es el Gmail personal (`gonzalomartinezg2001@gmail.com`), no
  `support@gonzaloapps.es`: Pokedex es una app de currículum y evaluación, no
  una app comercial. Lo decidió el dueño al separar los dos canales.
- El texto va en inglés por `#product-ui-text-is-english`.
- El código vive en `src/pages/pokedex/ui/Credits.tsx` porque solo lo usa esta
  página (`docs/ARCHITECTURE.md`, «Dónde va el código nuevo»). No añade
  dependencias: usa Headless UI, ya instalado, y la `Button` compartida.
- No abre fase: es una parte de presentación y créditos legales que no cambia
  el modelo, la navegación ni la lista. Cae fuera de F1, ya cerrada.

## Refutación

- **Evidencia en contra:** un botón flotante añade un control fijo que puede
  tapar contenido; un footer al final es más discreto; y un botón `Load more` o
  paginación daría un final real, con el footer siempre alcanzable.
- **Lo que se mantiene y por qué:** Smashing Magazine recomienda integrar un
  *footer reveal* con scroll infinito y avisa de que el footer al final se
  vuelve inalcanzable; Nielsen Norman Group documenta que el scroll infinito
  rompe la expectativa de la barra y que la paginación da un final claro. El
  footer al final, solo, deja la atribución legal sin camino real; `Load more`
  cambia la experiencia central de la página y no se ha pedido. El botón es el
  cambio menor que hace alcanzable el contenido legal sin tocar la lista. Si el
  dueño prefiere un final real, se revisa con `Load more`.

2026-10-24: queda provisional hasta que el dueño vea el botón y el diálogo
funcionando; entonces se confirma o se cambia.
