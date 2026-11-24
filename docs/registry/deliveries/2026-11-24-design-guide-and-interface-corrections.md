---
title: Guía de diseño de la interfaz y correcciones que un navegador enseñó
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** producto, por encargo del dueño, que pidió «dejar
correcto y final sin deudas y bien implementado» lo que el catálogo entrega
sobre diseño de interfaz: la guía `DESIGN.md` que el starter `react-fsd` trae
desde agentic-scaffold 0.8.0 y las correcciones de su ejemplo que apliquen
aquí. Sus palabras llegaron transcritas por el agente que lanzó esta parte.
Responde a lo que `#2026-11-24-scaffold-upgrade-to-0-8-1` dejó a su decisión.
No abre ni cierra ninguna fase. Fuera de la parte: cambiar el aspecto (paleta,
tipografía, composición), añadir dependencias y tocar el motor.

**Qué cambió.**

- **`DESIGN.md`, nuevo y del producto.** Para quién es la interfaz, las
  decisiones que el código ya cumple con su porqué y su fichero, lo que sigue
  abierto, dónde está hecho y cómo se comprueba. Queda declarado `live` en
  `tools/board/documents.txt`, con su fila en el §4 de `AGENTS.md` (la misma
  que el starter da a un producto nuevo) y un enlace desde `README.md`.
- **Los tres tamaños de texto en píxeles pasan a `rem`.** En
  `src/pages/pokedex/ui/NotFoundSection.tsx`, `text-[10px]` es ahora
  `text-[0.625rem]` y los dos `text-[11px]`, `text-[0.6875rem]`. La fila que
  lleva el número y los tipos de cada Pokémon de esa pantalla gana
  `flex-wrap`: al crecer el texto de los tipos, a 320 px con la letra en 24 px
  la página pasaba a medir 326.
- **Los identificadores que unen dos elementos salen de `useId()`.** En
  `src/pages/pokedex/ui/PokedexPage.tsx`, el campo de búsqueda, su lista y cada
  opción (antes `pokemon-search`, `search-suggestions` y
  `search-option-<id>`); en `src/pages/pokedex/ui/Credits.tsx`, el título del
  pie (antes `credits-title`). `SearchBar` se exporta para poder montar dos en
  un test. Se quedan fijos `main-content`, destino del enlace de saltar, y
  `top`, el de la cabecera, que es única por página y que
  `#return-to-top-is-a-link-to-root-shown-past-400px` nombra.
- **Un aviso no es más ancho que la ventana.** En `src/shared/ui/Toast.tsx`,
  `max-w-full` no acotaba nada, porque su contenedor toma el ancho del propio
  aviso; pasa a `max-w-[calc(100vw-2rem)]`.
- **El nombre de la ficha se parte si no cabe.** El título de
  `src/features/pokemon/ui/PokemonModal.tsx` gana `break-words`, como ya tenía
  el de la tarjeta.
- **Tests nuevos:** `src/app/textSizes.test.ts`, y un caso en
  `src/pages/pokedex/ui/Credits.test.tsx` y otro en
  `src/pages/pokedex/ui/PokedexPage.test.ts`. La suite pasa de 300 a 304.
- **Tres decisiones abiertas**, abajo en «Pendiente».

**Cómo se vio fallar cada test.** Con el código corregido en verde, se repuso
cada defecto con la edición inversa, se corrió la puerta `tests` (304 tests, 3
fallidos) y se deshizo:

- Los tres tamaños en píxeles de vuelta:
  `never_sizes_text_in_pixels_so_it_follows_the_font_size_of_the_browser`
  falló con «expected [ …(3) ] to deeply equal []», y la lista nombraba
  `../pages/pokedex/ui/NotFoundSection.tsx: text-[10px]` y dos veces
  `text-[11px]`.
- El id fijo del pie de vuelta: «labels each footer with a heading of its own
  when a page holds two» falló con «expected 1 to be 2».
- Los tres ids fijos del buscador de vuelta:
  `keeps_the_ids_of_two_search_bars_on_one_page_apart` falló con «expected 3
  to be 6».

**Qué se midió en un navegador.** Chrome 157.0.8103.79 sin cabeza, con un
perfil vacío, por el protocolo de DevTools, contra `.\dev.cmd start` y PokeAPI
real. Ventanas de 1280 × 800, 320 × 640 y 640 × 400 a doble densidad (el zoom
al 200 % de la primera), en claro y en oscuro, y la letra por defecto en 16 y
en 24 px; para medidas sueltas, también 390 × 664, 360 × 740 y 1366 × 650.

- **Pantallas y esquemas.** La lista (24 tarjetas), el filtro Fire, los
  favoritos vacíos, las sugerencias, una búsqueda de 80 caracteres sin
  resultado, el resultado de `zygarde-10-power-construct`, su ficha, los
  créditos y una ruta desconocida de 120 caracteres sin espacios: 0 px de
  desplazamiento horizontal en las cuatro combinaciones de ancho y esquema, y
  ningún id repetido. El tema siguió al sistema emulado en cada carga con el
  almacenamiento vacío.
- **Letra en 24 px, a 1280 de ancho.** Todo texto crece una vez y media:
  16 → 24, 14 → 21, 12 → 18, 18 → 27, 20 → 30 y 24 → 36 px, en la lista, la
  ficha, los créditos y la 404. Antes del cambio, los tres textos de la 404 se
  quedaban en 10, 11 y 11 px; ahora miden 15, 16,5 y 16,5 px. Con la letra en
  16 px miden lo mismo que antes, y sus cajas también: 23 × 19, 24,2 × 16,5 y
  47,5 × 20,5 px. Una carga en oscuro dio 44,9 px de ancho en la tercera, con
  el mismo tamaño de letra: se atribuye, sin haberlo comprobado, a que la
  fuente Outfit llega o no a tiempo.
- **El aviso.** A 320 px, su borde izquierdo estaba en −16 px y ahora en 16;
  con la letra en 24 px su texto empezaba en −126 px (−56 a 390 px de ancho) y
  ahora en 82. A 1280 px sigue midiendo 320 de ancho.
- **El título de la ficha con un nombre de una sola palabra,
  `crabominable`.** Con la letra en 24 px medía 237 px en una caja de 154 (a
  390 de ancho) y la pantalla de la ficha se desplazaba de lado, 261 px en
  202; ahora se parte y la pantalla mide 202 en 202. A 320 px con la letra en
  16 sobresalía 2 px sin verse y ahora baja su última letra a otra línea: es
  el único cambio a la vista con la letra por defecto, y solo lo sufren los
  nombres de doce letras o más sin guion.
- **La fila de la 404.** A 320 px con la letra en 24, 326 px de página antes
  de `flex-wrap` y 320 después; con la letra en 16, a 320 y a 1280 px, el
  número y los tipos siguen en la misma línea en las seis tarjetas.
- **Teclado**, con teclas reales y sin ratón, en claro y en oscuro: 30 paradas
  desde arriba (saltar al contenido, el campo, Search, el tema, instalar, los
  veinte filtros y las primeras tarjetas) y los 13 controles de la ficha; en
  los créditos, solo en claro, sus 5 controles. Todas con `:focus-visible` y
  con un anillo o con el contorno del navegador. Intro en el enlace de saltar
  llevó el foco al `main`; flecha abajo e Intro eligieron una sugerencia; el
  foco no salió de la ficha y Escape lo devolvió al botón que la abrió, igual
  que en los créditos.
- **Consola y red.** Con teclas y clics reales, ningún error ni aviso. Las
  únicas peticiones que no terminaron fueron las que la propia aplicación
  cancela al cambiar de vista (`net::ERR_ABORTED`), y los únicos 404, los de
  las dos búsquedas que se hicieron para verlos. Dos avisos son del método y
  no del producto: el de `AudioContext`, que solo sale cuando el clic lo da un
  script, y el de una imagen precargada sin usar en una ruta desconocida, que
  solo da el servidor de desarrollo, porque el 404.html del build no lleva esa
  precarga (`tooling/agent-files/shell.ts`).

**Lo que no se hizo, y por qué.**

- **La ficha en ventanas bajas, el tema de la primera visita y el movimiento
  reducido** se registran abiertos en vez de arreglarse: los tres cambian el
  aspecto o el comportamiento del producto y los decide el dueño.
- **Ninguna de las reglas que siguen estas correcciones entra como decisión.**
  `DESIGN.md` las enuncia como lo que el código hace; el agente no confirma
  decisiones (regla dura 9), y si el dueño las quiere como regla registrada se
  transcriben con sus palabras.
- **Una regla de lint para los tamaños en píxeles.** El test los rechaza en
  todo `src`, que es lo que hacía falta, sin tocar `eslint.config.js`, que es
  una pieza del starter.
- **No se comprobó** Firefox, Safari, un lector de pantalla, un teléfono real,
  la aplicación instalada ni el contraste de los colores. Que las áreas
  seguras de `src/app/index.css` valgan cero en un teléfono con muesca es una
  inferencia, de que la página no declara `viewport-fit`, no algo visto.
- **`sm:max-h-safe` no hace nada** en la pantalla de la ficha; lo cuenta
  `#pokemon-details-dialog-overflows-short-windows` y no se tocó.

**Puertas.** Al arrancar, árbol limpio e igual que el remoto en `31c1694`, que
el hook `pre-push` verificó al publicarlo; aun así se corrieron `format`,
`lint`, `typecheck` y `tests` (300 tests) antes de tocar nada, en verde. Al
terminar, `.\dev.cmd verify` completo: `board: tests` 830 checks y 0 fallos,
`board: documents` 28 comprobaciones y 0 hallazgos, `tests` 304 tests con 0
fallidos y 0 con error, y `dependencies`, `format`, `lint`, `typecheck` y
`build` en verde; 9 puertas, 0 en rojo. La primera corrida completa se hizo
antes de escribir esta entrega y dio `board: documents` en rojo, porque la
cita a ella desde `DESIGN.md` y desde las tres decisiones aún no resolvía: por
eso `tools/board/verdict.txt` lleva la fecha de hoy, aunque ningún commit
estuvo en rojo. La verificación de este commit es la del hook `pre-push` al
empujarlo. El commit y el push los autorizó el dueño en la conversación del
encargo («tienes permisos de commit y push siempre»), también transcrito por
el agente que lanzó esta parte.

**Pendiente.** Tres decisiones del dueño, cada una con lo medido y con la
recomendación del agente: `#pokemon-details-dialog-overflows-short-windows`,
`#first-visit-stores-the-system-theme-as-a-choice` y
`#reduced-motion-covers-only-part-of-the-animations`. Y dos sin registro, en
«Lo que sigue abierto» de `DESIGN.md`: qué combinación de ventana estrecha y
letra grande soporta el producto, y si su aspecto se enuncia como regla.
