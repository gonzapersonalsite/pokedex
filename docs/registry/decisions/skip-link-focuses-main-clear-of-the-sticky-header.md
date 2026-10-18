---
title: Saltar al contenido lleva el foco al main y deja sitio al header fijo
state: confirmed
date: 2026-10-19
phase: F1
---
**Saltar al contenido lleva el foco al `main` y deja sitio al header fijo.** El
dueño encargó el enlace; la forma la propone el agente y replica la del layout
público de `portafolio`.

**Forma.**

- Es lo primero que se alcanza con Tab. Está fuera de la vista hasta que recibe
  el foco y queda por encima del header (`z-40` frente a `z-20`) y por debajo
  del modal (`z-50`).
- El `main` lleva `tabIndex={-1}`: sin él, en algunos navegadores el ancla
  mueve el scroll pero el foco se queda en el enlace, y el siguiente Tab vuelve
  a la cabecera.
- El `main` lleva `scroll-mt-40` (160 px) para que el header fijo no tape el
  principio del contenido; en móvil el header ocupa dos filas. Con la página
  arriba, ese margen es mayor que la distancia al `main` y el salto no la mueve:
  solo entra el foco.
- El id del destino se escribe una vez (`MAIN_CONTENT_ID` en `PokedexPage.tsx`) y
  el enlace lo recibe por prop.

**Refutación.** En contra: 160 px no salen de medir el header, sino de estimar sus
dos filas en móvil; en escritorio deja un hueco de unos 80 px sobre los filtros
cuando se salta desde media página. Medir el header en tiempo de ejecución lo
ajustaría al píxel, a costa de un observador de tamaño solo para esto. Se
mantiene: el hueco solo aparece al usar el enlace desde abajo, y la cifra se
cambia en una clase si el dueño lo pide.

2026-10-19: confirmada; el dueño la aprobó tras verla funcionando, con la
refutación delante.
