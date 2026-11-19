---
title: Las respuestas de detalle de PokeAPI pesan demasiado por página
state: open
date: 2026-10-23
domain: pokeapi
phase: none
---
**Las respuestas de detalle de PokeAPI pesan demasiado por página.** Una
respuesta de `/pokemon/{id}` mide entre 276 y 659 KB; una página de 24 detalles
suma entre 6,6 y 15,8 MB, más unos 2,8 MB de arte remoto, como midió la
auditoría de caching de `#2026-10-23-favorites-reuse-details-and-audio-cleanup`.
Reducirlo exige una decisión de producto: bajar el tamaño de página, usar
GraphQL o cachear el arte remoto. No cae en ninguna fase del plan, que no
tiene ninguna abierta. Se cierra cuando una página posterior a la primera no
supera el presupuesto de datos que fije el dueño.
