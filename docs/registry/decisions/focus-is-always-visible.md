---
title: El foco del teclado siempre se ve
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**El foco del teclado siempre se ve.** Un control al que se le quita el
contorno del navegador (`outline-hidden`) recibe a cambio un anillo de
`focus:ring` o `focus-visible:ring` en la misma clase; los demás conservan el
contorno del navegador. La única excepción es el `main`, que solo recibe el
foco desde el enlace de saltar al contenido y no es un control.

Propuesta por el agente, en `#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0 y F1 están hechas y el rediseño visual todavía no tiene fase.

**Confirmada por delegación del dueño**, que en un turno posterior, con la
refutación de abajo escrita, delegó su revisión: «si son correctas las decisiones por mi apruebalas y no las dejes en provisionales»
(`#2026-11-24-interface-decisions-confirmed-by-the-owner`).

## Refutación

En contra: ningún test lo sostiene, y una clase nueva con `outline-hidden` y
sin anillo pasaría todas las puertas; además, mezclar el contorno del navegador
y anillos propios da dos aspectos de foco distintos en la misma pantalla, y
`focus:` (no `focus-visible:`) enseña el anillo también al pulsar con el ratón.
Se mantiene porque lo que pide la regla es que el foco se vea, y hoy se ve en
cada control recorrido; unificar su aspecto es una elección estética que
espera a `#choices-of-look-wait-for-the-visual-redesign`. Si el riesgo de
regresión pesa, la salida es un test como el de los tamaños de texto.
