---
title: Un estado se dice con palabras y con su papel, no solo con un color
state: provisional
date: 2026-11-24
domain: interface
phase: none
criterion: Se confirma cuando el dueño relea esta refutación con el trabajo delante y lo diga en un turno posterior.
---
**Un estado se dice con palabras y con su papel, no solo con un color.** La
carga es un `status` que dice «Loading…», un fallo de la lista es un `alert`
con su texto, un aviso es un `status` con el suyo y un filtro dice con
`aria-pressed` si está pulsado.

Propuesta por el agente, en `#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0 y F1 están hechas y el rediseño visual todavía no tiene fase.

## Refutación

En contra: el aviso crea su `status` a la vez que su texto, y algunos
lectores de pantalla no anuncian una región viva que aparece ya llena; y los
tres tipos de aviso (éxito, error, información) solo se distinguen por el
color cuando no llevan título. Se mantiene como regla porque las palabras y
los papeles están; que un lector los anuncie no se ha comprobado y queda en
«Cómo comprobarlo» de `DESIGN.md`.
