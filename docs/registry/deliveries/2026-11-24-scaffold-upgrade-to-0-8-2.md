---
title: Actualización a agentic-scaffold 0.8.2
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** actualización del motor de `agentic-scaffold` al nivel actual del
catálogo, siguiendo `#2026-11-24-scaffold-upgrade-to-0-8-1`. Lleva el motor del commit
`80d58c7` (versión `0.8.1`) al commit `43ae5a7` (`HEAD` del catálogo, versión `0.8.2`),
sin tocar el producto ni abrir fases nuevas.

**Qué cambió.**

- **Lo que tomó la herramienta (plan `0dff86632caa`, cero pendientes manuales):**
  `tools/launcher/dev.ps1` (corrige el rechazo en PowerShell cuando se pide una etiqueta
  desconocida, separando `if (...) { return ... }` del `return` final) y
  `tools/launcher/dev.sh` (redirección de salida de `emit-plan` a fichero para mostrar la
  causa del rechazo antes de comprobar `$RC`); reescribió `tools/board/MANIFEST.txt`
  (versión `0.8.2` y sellos actualizados) y `tools/board/components.txt`. Otros 25
  ficheros del motor estaban al día.
- **Componentes (`layer:react-vite` y `stack:react-fsd`, commit `2e152c6`):** al día en
  todas sus piezas compartidas; se conservan los parches locales y ficheros del producto
  (`kept`) declarados en el registro de componentes.
- **Conciliación manual:** ninguna (`0` ficheros pendientes).

**Verificación:**

- `.\dev.cmd verify -- no-such-gate` imprimió `RESULT: etiquetas desconocidas -> no-such-gate`
  con la lista de 9 puertas y salió con código `1`, sin errores de sintaxis en PowerShell.
- `.\dev.cmd verify` pasa en verde las `9` puertas hasta estabilizar los índices del
  tablero (`RESULT: BOARD_OK, sin cambios`).
