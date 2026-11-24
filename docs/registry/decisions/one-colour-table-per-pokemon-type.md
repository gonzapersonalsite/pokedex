---
title: El color de un tipo sale de una sola tabla y el tipo lleva siempre su nombre
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**El color de un tipo sale de una sola tabla, y el tipo lleva siempre su
nombre escrito.** `getTypeBadgeClass` da la clase de cada tipo a la tarjeta,
los filtros, la ficha y la pantalla 404, así que un tipo se ve igual en todas
partes; el color ayuda a reconocerlo, pero el nombre es lo que lo dice.

Propuesta por el agente, en `#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0 y F1 están hechas y el rediseño visual todavía no tiene fase.

**Confirmada por delegación del dueño**, que en un turno posterior, con la
refutación de abajo escrita, delegó su revisión: «si son correctas las decisiones por mi apruebalas y no las dejes en provisionales»
(`#2026-11-24-interface-decisions-confirmed-by-the-owner`).

## Refutación

En contra: hoy `normal`, `steel` y el color por defecto comparten
`bg-slate-600`, y varios tipos tienen tonos muy cercanos, así que el color no
basta para distinguirlos. Se mantiene porque la regla es la tabla única y el
nombre siempre visible, no un color distinto por tipo; qué color lleva cada
uno es paleta, y espera a `#choices-of-look-wait-for-the-visual-redesign`.
