---
title: Enlace para saltar al contenido en la Pokédex
date: 2026-10-19
phase: F1
---
**Objetivo y dueño:** producto; parte 2 de F1 (F1.2), encargada por el dueño.
Cierra `#skip-to-content-link-is-missing`. Forma y cifra:
`#skip-link-focuses-main-clear-of-the-sticky-header`.

**Qué cambió.**

- `src/pages/pokedex/ui/SkipToContent.tsx`: el enlace «Skip to content», fuera
  de la vista hasta recibir el foco, por encima del header y por debajo del
  modal, sin transición con `prefers-reduced-motion` y oculto al imprimir.
- `src/pages/pokedex/ui/PokedexPage.tsx`: el enlace es el primer hijo de la
  página; el `main` toma el id de `MAIN_CONTENT_ID`, `tabIndex={-1}` y
  `scroll-mt-40`.
- `src/pages/pokedex/ui/PokedexPage.test.ts`: un test exige que el enlace sea lo
  primero enfocable de la página y que su destino sea un `main` que acepta el
  foco.

**Cómo se verificó.**

- Cambiar `tabIndex={-1}` por `tabIndex={undefined}` en el `main` dejó el test en
  rojo, y apuntar el enlace al header (`targetId="top"`) también. Las dos sondas
  se deshicieron con la edición inversa.
- `python verify.py` sobre `74e44f1` (F1.1): 9 puertas, 0 en rojo. Al terminar:
  el veredicto que cita el resumen derivado.

**Pendiente.** Nada de esta parte.
