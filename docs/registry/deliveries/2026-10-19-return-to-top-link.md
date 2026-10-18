---
title: Enlace para volver arriba en la lista de la Pokédex
date: 2026-10-19
phase: F1
---
**Objetivo y dueño:** producto; parte 1 de F1 (F1.1), encargada por el dueño.
Forma y cifra: `#return-to-top-is-a-link-to-root-shown-past-400px`.

**Qué cambió.**

- `src/pages/pokedex/model/useScrolledPast.ts`: la regla pura `isScrolledPast` y
  el hook `useScrolledPast`, que se suscribe al scroll de la ventana con un
  listener pasivo vía `useSyncExternalStore`; la página solo se vuelve a pintar
  cuando la respuesta cambia, no en cada píxel.
- `src/pages/pokedex/ui/ReturnToTop.tsx`: el enlace al contenedor raíz, fijo abajo a la
  derecha respetando las zonas seguras de la PWA instalada, por debajo del modal
  (`z-30` frente a `z-50`), sin transición con `prefers-reduced-motion` y oculto
  al imprimir. Montado en `PokedexPage.tsx` tras el `<main>`.
- `src/shared/test/scrollWindow.ts`: ayuda de test, porque jsdom no hace scroll.
- Tests al lado: `useScrolledPast.test.ts` y `ReturnToTop.test.ts`.

**Cómo se verificó.**

- Invertir la comparación de `isScrolledPast` (`>` por `<`) dejó en rojo 4 de los
  5 tests nuevos. El test de desuscripción no lo cazaba: la primera versión era
  vacía (un hook desmontado nunca se actualiza) y se reescribió para exigir que se
  quite el mismo listener que se puso. Desuscribir de `resize` en lugar de
  `scroll` lo dejó en rojo. Las dos sondas se deshicieron con la edición inversa.
- `python verify.py` al arrancar, sobre `1782aa6`: 9 puertas, 0 en rojo. Al
  terminar: el veredicto que cita el resumen derivado.

**Pendiente.** El enlace para saltar al contenido
(`#skip-to-content-link-is-missing`) y el idioma de los textos de la interfaz
(`#product-ui-text-language-is-undecided`), los dos abiertos para que decida el
dueño.
