---
title: Las respuestas de detalle de PokeAPI pesan demasiado por página
state: open
date: 2026-10-23
phase: none
---
**Las respuestas de detalle de PokeAPI pesan demasiado por página.** Una
respuesta de `/pokemon/{id}` mide entre 276 y 659 KB; una página de 24 detalles
suma entre 6,6 y 15,8 MB, más unos 2,8 MB de arte remoto. La auditoría de
caching del 2026-10-23 la deja fuera de esta parte porque reducirla exige una
decisión de producto: bajar el tamaño de página, usar GraphQL o cachear el arte
remoto. Cae fuera de fase: F0 y F1 están DONE y no hay fase abierta. Criterio
para cerrarla: una página posterior a la primera no supera el presupuesto de
datos que fije el dueño.
