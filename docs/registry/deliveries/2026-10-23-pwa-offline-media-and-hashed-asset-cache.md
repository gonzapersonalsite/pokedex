---
title: Medios locales offline y caché inmutable de los assets de pokedex
date: 2026-10-23
phase: none
---
**Objetivo y dueño:** producto; endurecimiento post-F1 de la PWA, encargado por
el dueño a partir de la auditoría de caching del 2026-10-23. Fuera de fase: F0 y
F1 están DONE y no hay fase abierta.

**Qué cambió.**

- `vercel.json`: `/assets/(.*)` pasa a `public, max-age=31536000, immutable`
  porque Vite ya les pone hash. El HTML, `sw.js` y el manifest siguen con el
  default de Vercel, `max-age=0`.
- `vite.config.ts`: el precache incluye ahora los 24 `pokemon/*-256.webp` y
  excluye `og-cover.png`, que solo leen los crawlers. Añade la ruta
  `local-media` con `StaleWhileRevalidate` para `/pokemon/` y `/sounds/`, con
  64 entradas y 30 días.
- `public/sounds/pokedexOn.mp3` sustituye a `pokedexOn.wav`; `PokemonModal.tsx`
  apunta al MP3. El WAV se elimina.
- `tooling/hosting/vercelConfig.test.ts`: cruza la cabecera de `/assets` con
  `vercel.json` para que no vuelva al default en silencio.

**Cifras.** El WAV pasó de 532.996 a 20.812 bytes (MP3 128 kbps). El precache
del build queda en 39 entradas y 828,89 KiB: salen los 248 KB de `og-cover` y
entran los 256,8 KB de las 24 tarjetas de 256 px. Las variantes completas y los
sonidos se cachean al usarse.

**Cómo se verificó.**

- Al arrancar, `python verify.py` sobre `b9cf660`: 9 puertas, 0 en rojo.
- El test nuevo se vio fallar al devolver `/assets` a
  `public, max-age=0, must-revalidate`: 1 fallo, esperado
  `public, max-age=31536000, immutable`. Se deshizo con la edición inversa.
- `pnpm run build` generó `sw.js` con 39 entradas y 828,89 KiB; la lista no
  contiene `og-cover.png`, contiene los 24 `pokemon/*-256.webp` y registra
  `local-media` con `StaleWhileRevalidate`.
- `python verify.py` al terminar: 9 puertas, 0 en rojo.

**Pendiente.** La reducción del payload de detalles de PokeAPI queda abierta en
`#pokedex-detail-responses-are-heavy`.
