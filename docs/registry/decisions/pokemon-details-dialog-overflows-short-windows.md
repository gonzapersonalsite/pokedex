---
title: La ficha de un Pokémon no cabe en una ventana baja y su contenedor no se desplaza
state: open
date: 2026-11-24
domain: interface
phase: none
---
**La ficha de un Pokémon no cabe en una ventana baja y su contenedor no se
desplaza.** `PokemonModal` centra su panel en un contenedor fijo a la ventana
que no desplaza su contenido. La pantalla interior se limita al 58 % del alto de
la ventana y la carcasa que la rodea no se encoge, así que un panel más alto
que la ventana se recorta por igual arriba y abajo, y lo recortado no se
alcanza de ningún modo.

**Lo medido**, en Chrome sobre el servidor de desarrollo, con una ficha ya
cargada. El recorte es el mismo arriba que abajo:

| Ventana, en px CSS | Alto del panel | Recorte | Qué queda fuera |
|---|---|---|---|
| 1280 × 800 | 824 | 12 | El borde de la carcasa |
| 1366 × 650 | 737 | 44 | Parte de las luces de arriba y el borde de abajo |
| 640 × 400, que es 1280 × 800 con el zoom al 200 % | 592 | 96 | 36 de los 48 px del botón de cerrar de la carcasa, y la flecha de abajo de la cruceta entera |
| 390 × 664 | 714 | 25 | El borde de la carcasa |
| 320 × 640 | 700 | 30 | El borde de la carcasa |
| 1280 × 800 con la letra del navegador en 24 px | 996 | 98 | 14 de los 72 px del botón de cerrar de la carcasa, y la flecha de abajo entera |

En todas esas ventanas siguen a la vista el aspa de cerrar y las flechas de
anterior y siguiente de la pantalla interior, y Escape cierra: no se pierde
ninguna función, porque los botones de la carcasa las repiten. Lo que sí se
pierde es el foco del teclado, que al llegar a un botón recortado deja de
verse. A 320 px de ancho, además, la fila de abajo de la carcasa no cabe: el
botón de cerrar se estrecha a 27 px, las luces pisan la cruceta, y las flechas
de la pantalla tapan parte de los tipos.

El límite `sm:max-h-safe` de esa pantalla no hace nada: `max-h-safe` es una
clase de la hoja global, no una utilidad de Tailwind, y la variante no se
genera. A 1280 × 800 el límite que se aplica es el del 58 %, 464 px.

**Qué hay que decidir.** Cómo se comporta la ficha cuando no cabe. Tres
caminos, sin elegir:

- Que el contenedor se desplace: es el cambio menor y lo recortado pasa a
  alcanzarse, pero la ficha deja de verse entera y, donde hoy sobresale 12 px,
  pasa a empezar arriba y a pedir desplazamiento.
- Que el panel nunca sea más alto que la ventana y la pantalla interior ocupe
  lo que quede: todo sigue a la vista, a costa de rehacer las medidas de la
  carcasa.
- Que la carcasa se simplifique en una ventana baja o estrecha.

El agente recomienda el segundo: es el único que deja todos los controles a
la vista sin añadir un segundo desplazamiento dentro de un diálogo que ya
tiene el de su pantalla.

**Por qué sigue abierta.** Cualquiera de los tres cambia el aspecto de la
ficha en ventanas corrientes, y eso lo decide el dueño; la parte que lo
encontró, `#2026-11-24-design-guide-and-interface-corrections`, no podía
cambiar la composición. No cae en ninguna fase: las del plan están hechas y no
hay ninguna abierta. Se cierra cuando, en las ventanas de la tabla, todo
control de la ficha queda a la vista o se alcanza, y el foco del teclado no
cae nunca fuera de la ventana.
