---
title: El buscador es un combobox que no saca el foco del campo
state: confirmed
date: 2026-11-24
domain: interface
phase: none
---
**El buscador es un combobox con su lista de sugerencias, y el foco no sale
del campo.** El campo señala la opción activa con `aria-activedescendant`;
las flechas la mueven, Intro la elige y Escape cierra la lista. Las
sugerencias no son paradas del tabulador, y la lista se cierra cuando el foco
sale del campo (`onBlur`); pulsar una sugerencia no le quita el foco al campo
(`preventDefault` al pulsar), así que el clic la elige.

Propuesta por el agente, en `#2026-11-24-design-guide-aligned-with-code-and-template`. Su fase es `none`: F0 y F1 están hechas y el rediseño visual todavía no tiene fase.

**Confirmada por delegación del dueño**, que en un turno posterior, con la
refutación de abajo escrita, delegó su revisión: «si son correctas las decisiones por mi apruebalas y no las dejes en provisionales»
(`#2026-11-24-interface-decisions-confirmed-by-the-owner`).

## Refutación

En contra: cerrar la lista en cuanto el campo pierde el foco la cierra
también cuando se cambia de ventana y se vuelve, y quien usa un lector de
pantalla en modo exploración puede querer recorrer las opciones con sus
propias teclas, que el lector resuelve por el árbol de accesibilidad y no por
el tabulador. Se mantiene porque es el patrón de combobox con lista de
WAI-ARIA, porque una lista abierta sin foco tapaba la página sin forma de
cerrarla con el teclado, y porque al volver al campo la lista se abre otra vez
si hay texto. No se ha probado con un lector de pantalla.
