---
title: Actualización a agentic-scaffold 0.8.1 y auditoría sobre el árbol de trabajo
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo; mantenimiento del andamio
encargado por el dueño para dejar cada repositorio consumidor en consonancia
con su plantilla. Lleva el motor de 0.7.0 (commit `d086d1e` del catálogo, la
entrega `#2026-11-22-scaffold-upgrade-to-0-7-0`) a 0.8.1 (commit `80d58c7`),
con los componentes `layer:react-vite` y `stack:react-fsd` registrados en
`2e152c6`, cuyas piezas el catálogo no cambió. No abre ni cierra ninguna fase
ni tramo, y no toca el producto. Palabras del dueño en el encargo: «Lanza un
sub-agente por proyecto que remedie de forma correcta y deje actualizado y
commit y push en cada repo final».

**Qué cambió.**

- **Lo que tomó la herramienta (plan `ce908805c7b9`, sin rechazos ni
  conflictos):** `docs/ACTUALIZAR.md`, `tools/board/components.py`,
  `tools/board/instantiate.py` y `tools/board/test_board.py`, que la plantilla
  cambió y la instancia no; reescribió `tools/board/MANIFEST.txt` (versión
  0.8.1 y los cuatro sellos) y `tools/board/components.txt` (la leyenda gana
  la clave `delivered` y `applied` pasa a `80d58c7`). Otros 23 ficheros del
  motor estaban al día: no se añadió ni se quitó ninguno.
- **Componentes:** las 23 piezas y líneas de `layer:react-vite` estaban al
  día. De `stack:react-fsd`, 14 al día; se dejaron con su parche local, porque
  la plantilla no los cambió, `docs/ARCHITECTURE.md`, `eslint.config.js` y
  cuatro ficheros de `tooling/agent-files/` (`shell.ts`, `vitePlugin.ts` y sus
  tests); y siguen siendo del producto (`kept`) el cliente HTTP con su test y
  `vitest.setup.ts`. Los dos componentes siguen registrados en `2e152c6`.
- **Qué trae el motor:** 0.8.0 enseña a `instantiate.py` y a `components.py`
  las guías que un starter entrega como documento del producto; 0.8.1 corrige
  la lectura de `root = true` al fusionar un `.editorconfig`. Ninguna de las
  dos cosas escribe nada en una instancia ya creada.
- **Conciliado a mano y cerrado con `--done`, los dos pendientes del plan:**
  - `AGENTS.md`, regla dura 3. El párrafo de la instancia era el del andamio
    0.7.0 sin adaptar, así que queda como el de 0.8.1: la auditoría es del
    árbol de trabajo (`git status --short`, `git diff` y cada fichero nuevo
    entero), el trabajo verificado se deja sin preparar, y preparar con
    `git add` es parte de commitear, con la autorización y confirmado por
    `git diff --cached --stat`. Lo que la capa escribió en el contrato y hoy
    es de la instancia (las seis viñetas del §3, la fila de
    `docs/ARCHITECTURE.md` en el §4 y la línea de `react-fsd-maintainer` en el
    §9) no se tocó: sigue siendo la única diferencia con el contrato de 0.8.1.
  - `.agents/skills/audit-before-commit/SKILL.md`. Era byte a byte la de
    0.7.0 y queda byte a byte la de 0.8.1: los pasos auditan el árbol de
    trabajo y gana el noveno, preparar por nombre de ruta con la autorización.
    La línea de su índice en el §9 del contrato no cambia.
- **Redacción antigua:** `git grep` de la auditoría de lo preparado ya no la
  encuentra; `git diff --cached` solo queda como la confirmación tras
  `git add`, en el contrato y en la skill.
- **Las correcciones del starter React (commit `781300f` del catálogo) no se
  portan, porque el producto no conserva el código de la muestra.** El
  catálogo las pide «where the product still has the sample's code», y aquí
  no existe ninguno de sus ficheros: ni la hoja global de la muestra, ni el
  elemento de tarea, ni el formulario de alta, ni la página de inicio; el
  único CSS del producto es `src/app/index.css`. Lo que el código propio hace
  en esos tres frentes se miró en el código, sin navegador, y no se cambió:
  - *Tamaño de letra de la raíz.* Ni `src/app/index.css` ni el estilo de
    arranque de `index.html` fijan un tamaño en `html` o `:root`; los tamaños
    son los de Tailwind, en `rem`. Tres textos de
    `src/pages/pokedex/ui/NotFoundSection.tsx` van en píxeles
    (`text-[10px]` y `text-[11px]`, líneas 62, 126 y 183) y no siguen el
    tamaño que elija el lector.
  - *Texto que escribe el usuario.* Solo la búsqueda. Fuera del propio campo
    se pinta en «Result for …» (`src/pages/pokedex/ui/PokedexPage.tsx`, línea
    554), sin regla de corte, y solo cuando la búsqueda encontró un Pokémon,
    así que la acota un nombre o un número real. La ruta de una dirección
    desconocida sí lleva `break-all` en `NotFoundSection.tsx`.
  - *Ids de formulario.* `pokemon-search`, `search-suggestions` y
    `search-option-<id>` en `PokedexPage.tsx` y `credits-title` en
    `src/pages/pokedex/ui/Credits.tsx` son fijos; cada componente se monta una
    vez en la página, así que hoy no se repiten.

  Ninguno se registra como hueco: no se vio fallar nada, y cambiarlos es
  comportamiento del producto, que decide el dueño.
- **Lo que no entra, a propósito:** ninguna guía de diseño ni fila para ella.
  El catálogo dice que un producto anterior no la recibe al actualizarse y
  que escribirla es decisión del dueño. Tampoco cambia ninguna imagen,
  lockfile ni versión de dependencia: `Dockerfile`, `compose.yaml`,
  `tools/stack.txt`, `package.json`, `pnpm-lock.yaml`,
  `tools/board/scaffold.json` y `tools/board/Dockerfile.scaffold` quedan como
  estaban.

**Cómo se verificó.**

- Al arrancar: árbol limpio e igual que el remoto en `92f1933`, commit que el
  hook `pre-push` verificó al publicarlo, así que se dio por verificado (§1
  del contrato).
- Al terminar, `.\dev.cmd verify` completo sobre el árbol con la
  actualización, sin `prepare` porque no cambió ninguna imagen ni lockfile:
  `board: tests` 830 checks y 0 fallos (811 con el motor anterior),
  `board: build` sin cambios, `board: documents` 28 comprobaciones y 0
  hallazgos, `dependencies`, `format`, `lint` y `typecheck` en verde, `tests`
  300 tests con 0 fallidos y 0 con error, y `build` en verde; 9 puertas, 0 en
  rojo. Una corrida completa tardó alrededor de un minuto, sin descargar ni
  construir nada.
- No hay test de regresión propio: el cambio es del motor, cuyos defectos
  reintroducidos conserva el catálogo, y de prosa del contrato y de la skill.
- La verificación completa de este commit es la del hook `pre-push` al
  empujarlo.

**Pendiente.** Nada de esta actualización. Decide el dueño, sin registro
abierto: si el producto quiere una guía de diseño propia, y si los tres
frentes de arriba piden algún cambio.
