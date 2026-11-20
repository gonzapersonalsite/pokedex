---
title: Las páginas de la lista, desde el índice de tipos
date: 2026-11-20
phase: none
---
**Objetivo y dueño:** producto, a petición del dueño, que pidió cerrar el
frente del peso de las respuestas de detalle «si lo recomiendas» y dio carta
blanca para decidir. Fuera de fase: no hay ninguna abierta. Cierra
`#pokedex-detail-responses-are-heavy` con `#list-pages-build-from-the-type-index`.

**Qué cambió.**

- `src/entities/pokemon/model.ts`: `PokemonSummary` es lo que muestra una
  tarjeta y `Pokemon` lo extiende con lo que muestra el detalle;
  `officialArtworkUrl`, `buildTypeIndex`, `summarizeListedPokemon` y
  `summarizePokemon` son funciones puras con sus tests en `model.test.ts`.
- `src/features/pokemon/model/typeIndex.ts`: `typeResourceQuery`, la consulta
  de un tipo que comparten el filtro y el índice; `loadTypeIndex`, que lee el
  índice de la caché o lo arma; y `summarizeListedPage`, que construye las
  tarjetas de una página y cae al detalle solo para un Pokémon que el índice
  no conoce.
- `usePokemonList.ts` y `usePokemonListByType.ts` dejan de pedir un detalle por
  Pokémon; la semilla de la primera página es de resúmenes, y
  `usePokemonListByType.ts` usa `idFromUrl` de la entidad en vez de una copia.
- `useTypes.ts` comparte su consulta como `typesQuery`.
- `PokemonCard.tsx` recibe un `PokemonSummary` y pone el hueco «No image»
  cuando la imagen falla al cargar.

**Cómo se verificó.**

- `usePokemonList.test.ts` se vio fallar contra el código anterior: la página 2
  y la lista por tipo llegaban con detalles completos y la ilustración del
  detalle (3 fallos). Con el cambio, en verde.
- Defectos inyectados, cada uno visto en rojo y deshecho: el orden por slot
  invertido en `buildTypeIndex` (3 fallos), el error de imagen ignorado en
  `PokemonCard.tsx` (1), un índice que no conoce a nadie (6) y una forma sin
  ilustración fuera de `POKEMON_WITHOUT_ARTWORK` (3).
- En Chrome sin cabeza, contra el servidor de desarrollo y PokeAPI real:
  264 tarjetas en 11 páginas con 0 peticiones de detalle; el filtro Dragon,
  117 tarjetas, todas de ese tipo, sin ninguna petición nueva; el modal pidió
  su detalle, su especie, su tipo y su cadena evolutiva; la consola, limpia.
- Lo medido contra PokeAPI está en `#list-pages-build-from-the-type-index`.
- `python verify.py`: en verde, en la cifra que dice el commit que lo entrega.

**Pendiente.** Nada de esta parte.
