---
title: Actualización a agentic-scaffold 0.3.3, con las piezas en conflicto conciliadas
date: 2026-10-19
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo, a petición del dueño.
`templates` publicó `agentic-scaffold` 0.3.3 y endureció la capa `react-vite` y
el stack `react-fsd` en el commit `16f1953` (etiqueta `agentic-scaffold-v0.3.3`);
este repositorio lo toma con `upgrade.py` desde `39bead6`.

**Qué cambió.**

- **Motor**, de 0.3.2 a 0.3.3: toma `tools/board/components.py`,
  `tools/board/test_board.py`, `tools/guards/junit.py` y `verify.py`, y reescribe
  `tools/board/MANIFEST.txt` y `tools/board/components.txt`. `verify.py`
  rechaza una fila de puerta que encadena comandos fuera de comillas dobles
  (`|`, `||`, un `&` suelto, `;`, un salto de línea) y dice exactamente qué mata
  su vigilante; `junit.py` admite `--forbid-skipped` y nunca da por verde un
  informe en el que no corrió ningún test.
- **`layer:react-vite`**: toma la skill `react-fsd-maintainer` y la fila
  `tests` de `gates.txt`, que ahora lleva `--forbid-skipped`: la puerta queda en
  rojo con cualquier caso que el informe de Vitest dé por saltado.
- **`stack:react-fsd`**: toma `eslint-fsd-gaps.js` (los límites de las capas
  también sobre `import.meta.glob`) y `eslint.config.test.ts` (los casos de las
  reglas nuevas y la comprobación contra los proyectos reales de
  `vite.config.ts`), y añade `eslint-tests.js` (ningún test con `skip` o `todo`
  en sus opciones, y ni `.spec`, ni historias, ni un test donde Vitest no lo
  busca).
- **Dos piezas que cambiaron aquí y en la plantilla**, conciliadas a mano. Para
  que el plan corriera, el commit anterior las dejó como del producto
  (`--keep`); ahora llevan lo de la plantilla y vuelven a su componente
  (`--done`), con su base en `16f1953` y lo propio de este repositorio como
  cambio local:
  - `eslint.config.js`: el de la plantilla, que se fusionó sin choques con lo de
    aquí: el alias leído de `tsconfig.json` y `dev-dist` entre lo ignorado.
  - `docs/ARCHITECTURE.md`: el de la plantilla con lo de aquí (el alias en
    `tsconfig.json`, los estilos con TailwindCSS y la descripción de su propio
    cliente HTTP). No entra el párrafo de la plantilla sobre una respuesta fuera
    de 2xx, que describe el cliente de la plantilla y no el de este repositorio.
- **En los ficheros de arranque**, como pide el CHANGELOG: el proyecto `app` de
  `vite.config.ts` busca solo `src/**/*.test.{ts,tsx}` (antes también
  `.spec`), con un comentario que dice dónde se declara un proyecto nuevo. No
  había ningún `.spec` ni historias, y `site.ts`, la portada y su texto
  alternativo en `index.html` son de este producto.
- **A mano, de lo pendiente del plan:** `AGENTS.md` toma el alcance exacto del
  vigilante, la regla de una fila un comando, y los tres estándares que la capa
  reescribió (`lint`, todo test corre con `--forbid-skipped`, y la portada y su
  texto alternativo de `index.html`); `gates.txt` toma la cabecera nueva. Las
  referencias de sus filas siguen como se midieron.

**Cómo se verificó.** `upgrade.py` planificó `ecd9fdd48533` sin problemas tras el
`--keep`, `--apply` lo escribió y `--done` cerró las dos piezas, `AGENTS.md` y
`gates.txt`. `pnpm run lint` queda limpio y `eslint.config.test.ts` pasa sus 207
casos; `python -I verify.py` pasó sus 9 puertas, y otra vez con el mismo
veredicto y sin cambiar ningún fichero.

**Pendiente.** Nada.
