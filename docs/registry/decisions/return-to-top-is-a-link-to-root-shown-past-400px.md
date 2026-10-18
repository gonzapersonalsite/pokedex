---
title: Volver arriba es un enlace al contenedor raíz que aparece pasados 400 px de scroll
state: confirmed
date: 2026-10-19
phase: F1
---
**Volver arriba es un enlace al contenedor raíz que aparece pasados 400 px de
scroll.** El dueño eligió esta opción entre las dos que le puso el agente (enlace
con salto instantáneo o botón con scroll suave); no la dictó. Replica el
comportamiento del layout público del repositorio `portafolio`.

**Forma.**

- Un enlace al ancla del contenedor raíz (`id="root"` en `index.html`), no un
  botón: funciona sin JavaScript y el navegador lleva el punto de partida del
  foco arriba sin código propio.
- El destino es el contenedor raíz y no el header (`id="top"`): el header es
  `sticky`, viaja con la ventana, y saltar a él no movería la página.
- Oculto solo a la vista y al puntero (`opacity-0`, `pointer-events-none`) y
  visible con `:focus-visible`, para que el teclado lo alcance siempre.
- El umbral de 400 px es el de `portafolio`, sin otra medición detrás.
- Vive en `src/pages/pokedex/` porque solo lo usa esa página (`docs/ARCHITECTURE.md`,
  «Dónde va el código nuevo»).

**Refutación.** En contra: el salto es brusco tras bajar mucho, y el enlace deja
el ancla en la URL, que se comparte si se copia. Un botón con
`window.scrollTo({ behavior: 'smooth' })` lo evitaría, a costa de mover el foco a
mano y de no funcionar sin JavaScript, y la animación sobre una lista muy larga
tarda. Los 400 px no salen de medir nada en esta página. Se mantiene: el salto es
lo que espera quien pulsa «volver arriba» tras un scroll largo, y la cifra se
cambia en una constante (`SHOW_AFTER_SCROLL_PX`) si el dueño pide otra.

2026-10-19: confirmada; el dueño la aprobó tras verla funcionando, con la
refutación delante.
