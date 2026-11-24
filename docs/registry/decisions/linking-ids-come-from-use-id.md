---
title: Un identificador que une dos elementos sale de useId
state: provisional
date: 2026-11-24
domain: interface
phase: none
criterion: Se confirma cuando el dueño relea esta refutación con el trabajo delante y lo diga en un turno posterior.
---
**Un identificador que une dos elementos sale de `useId`.** El buscador con
su lista y cada opción, y el pie de créditos con su título: dos en la misma
página no comparten ninguno. Quedan fijos los que nombran un sitio único de la
página: el `main`, destino del enlace de saltar, la cabecera y el contenedor
raíz, destino de volver arriba.

Propuesta por el agente, en `#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0 y F1 están hechas y el rediseño visual todavía no tiene fase.

## Refutación

En contra: hoy la página monta un solo buscador y un solo pie, así que el
cambio protege de un caso que no ocurre, y los ids generados son más difíciles
de leer en el inspector y no sirven de ancla en una URL. Se mantiene porque el
coste es nulo, porque los tests montan dos para comprobarlo y porque los ids
que sí hacen de ancla siguen fijos.
