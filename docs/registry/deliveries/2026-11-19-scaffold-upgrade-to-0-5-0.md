---
title: Actualización a agentic-scaffold 0.5.0 y parches de las herramientas de React
date: 2026-11-19
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo, a petición del dueño.
`templates` publicó `agentic-scaffold` 0.5.0 en el commit `0bb820d`, con lo que
clayfarer aprendió, y la plantilla de React tomó los parches de noviembre. Este
repositorio lo toma con `upgrade.py` desde `d94a2b3`.

**Qué cambió.**

- **Motor**, de 0.4.0 a 0.5.0: toma `verify.py`, `tools/board/board.py`,
  `tools/board/test_board.py`, `tools/board/pre_push.py`,
  `tools/board/README.md` y `docs/registry/README.md`, y reescribe
  `tools/board/MANIFEST.txt` y `tools/board/components.txt`. Con él, una puerta
  en rojo enseña toda su salida; una segunda verificación sobre el mismo árbol
  sale con 3 sin correr ninguna puerta; una provisional declara su `phase` y su
  `criterion`; una fase hecha no deja nada suyo vivo; un plan tiene una sola
  fase en curso; y las fases de un frente se ordenan por la línea de su plan.
- **A mano, de lo pendiente del plan:** `AGENTS.md` y la skill
  `audit-before-commit` toman el diff de la plantilla tal cual: la verificación
  completa es la del hook de push, antes de un commit se pasan las puertas que
  el cambio puede mover, el cerrojo por árbol, y lo provisional con su fase y
  su criterio. `README.md` es del producto: su línea de puertas dice la misma
  cadencia.
- **La provisional de los créditos** (`#credits-reachable-from-an-infinite-list`)
  declara su `criterion`, que es lo que su cuerpo ya decía: el dueño ve el
  botón y el diálogo funcionando; entonces se confirma, o se cambia por un final
  real con `Load more`. Sigue provisional: confirmarla es del dueño.
- **Herramientas de React**, a las versiones de la plantilla: pnpm 12.21.0,
  `vite` 8.3.8, `vitest` 5.1.1, `eslint` 10.15.0, `prettier` 3.10.1,
  `@vitejs/plugin-react` 6.3.0, `typescript-eslint` 8.73.0 y
  `eslint-plugin-react-refresh` 0.5.8. `@types/node` sigue en 26.6.6, la versión
  propia de este repositorio. El lockfile se regeneró con los scripts de
  instalación desactivados; entran los mismos siete paquetes que en el de la
  plantilla (la variante WebAssembly de rolldown y su runtime, todos
  opcionales), sin scripts de instalación.

**Cómo se verificó.** El árbol de partida estaba limpio y al día con su remoto.
`upgrade.py` planificó `6e0a776929f7` sin conflictos, `--apply` lo escribió y
`--done` cerró `AGENTS.md`, `README.md` y la skill. Después, `python verify.py`
pasó sus 9 puertas sin cambiar el veredicto, con `board: tests` en 775 checks y
0 fallos y `board: documents` en 25 comprobaciones y 0 hallazgos.

**Pendiente.** La versión 0.6.0 del andamio, que porta cómo clayfarer reescribe y
retira sus registros, volverá a pasar por este repositorio.
