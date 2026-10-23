---
title: Reutilizar los detalles en favoritos y retirar el sondeo de audio
date: 2026-10-23
phase: none
---
**Objetivo y dueño:** producto; limpieza post-F1 encargada por el dueño a partir
de la auditoría de caching del 2026-10-23. Fuera de fase: F0 y F1 están DONE y
no hay fase abierta.

**Qué cambió.**

- `useFavoritePokemon.ts`: los favoritos usan `useQueries` con la misma clave
  `['pokemon', 'details', id]` que `usePokemonDetails`, así que reutilizan la
  caché de TanStack en vez de pedir otra vez cada detalle completo.
  `PokemonList.tsx` consume el hook y deja de importar `useQuery`,
  `pokemonApi` y `mapPokemonFromApi`.
- `useAudio.ts`: fuera el `setInterval` de un segundo, el estado `isReady` y
  `checkReady`, que no tenían consumidor. La inicialización y la reproducción
  siguen igual.
- `react-window` sale de `package.json` y `pnpm-lock.yaml`: no se importaba en
  ningún fichero.
- `useFavoritePokemon.test.ts`: cubre la reutilización de caché, la petición
  solo de los favoritos ausentes y la lista vacía.

**Cómo se verificó.**

- Al arrancar la parte, tras A, `python verify.py`: 9 puertas, 0 en rojo.
- El test de favoritos se vio fallar al cambiar la clave a
  `['pokemon', 'favorite-details', id]`: 2 fallos, porque el detalle cacheado
  dejaba de reutilizarse. Se deshizo con la edición inversa.
- `python verify.py` al terminar: 9 puertas, 0 en rojo.

**Pendiente.** El payload de las páginas de lista sigue abierto en
`#pokedex-detail-responses-are-heavy`.
