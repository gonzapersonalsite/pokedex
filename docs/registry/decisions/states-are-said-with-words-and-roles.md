---
title: Un estado se dice con palabras y con su papel, no solo con un color
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**Un estado se dice con palabras y con su papel, no solo con un color.** La
carga es un `status` que dice «Loading…», un fallo de la lista es un `alert`
con su texto, un aviso es un `status` con el suyo y un filtro dice con
`aria-pressed` si está pulsado.

Propuesta por el agente, en `#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0 y F1 están hechas y el rediseño visual todavía no tiene fase.

**Confirmada por delegación del dueño**, que en un turno posterior, con la
refutación de abajo escrita, delegó su revisión: «si son correctas las decisiones por mi apruebalas y no las dejes en provisionales»
(`#2026-11-24-interface-decisions-confirmed-by-the-owner`).

## Refutación

En contra: el aviso crea su `status` a la vez que su texto, y algunos
lectores de pantalla no anuncian una región viva que aparece ya llena; y los
tres tipos de aviso (éxito, error, información) solo se distinguen por el
color cuando no llevan título. Se mantiene como regla porque las palabras y
los papeles están; que un lector los anuncie no se ha comprobado y queda en
«Cómo comprobarlo» de `DESIGN.md`.
