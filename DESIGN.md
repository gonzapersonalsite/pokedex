# Diseño de la interfaz

Esta guía dice para quién se diseña la interfaz de la Pokédex, qué decisiones
visuales ha tomado el producto, dónde están hechas y cómo se comprueba que
siguen en pie. Los valores (colores, fuentes, medidas) viven en el código: aquí
van la intención y el porqué. Es del producto: se reescribe cuando el producto
decide otra cosa, y ninguna actualización del andamio la toca.

## Para quién

Quien abre la Pokédex quiere encontrar un Pokémon y abrir su ficha: recorriendo
la lista, filtrando por tipo o escribiendo su nombre o su número, y guardando
como favoritos los que le interesan («Features» de [README.md](README.md)). La
abre en un móvil o en un escritorio, a veces instalada como aplicación
(«Responsive» y «PWA build», en el mismo documento), y la lee en inglés
(`#product-ui-text-is-english`). Es además una aplicación de currículum y de
evaluación, no comercial (`#credits-reachable-from-an-infinite-list`): quien la
evalúa mira también cómo está hecha. Las decisiones de abajo se juzgan contra
esa tarea: llegar a un Pokémon sin esfuerzo, con el dedo o con el teclado.

## Decisiones tomadas

Cada una dice qué hace hoy el código, por qué y dónde se ve. La que tiene
registro lo cita, y su porqué largo está allí. Una decisión visual nueva se
registra como cualquier otra ([docs/registry/README.md](docs/registry/README.md))
y deja aquí la línea que la enuncia, con su cita.

- **El texto sigue el tamaño que cada persona eligió en su navegador.** Ninguna
  hoja fija el tamaño de la raíz y todo tamaño de texto es relativo a ella,
  también los tres hechos a medida de la pantalla 404
  ([NotFoundSection.tsx](src/pages/pokedex/ui/NotFoundSection.tsx)); un test
  recorre el código de `src`, la hoja global y la página de arranque y rechaza
  uno escrito en píxeles ([textSizes.test.ts](src/app/textSizes.test.ts)).
  Quien agranda la letra del navegador tiene que verla agrandada aquí, y el
  zoom no tiene tope ([index.html](index.html)).
- **Claro y oscuro, pintados antes de que cargue la aplicación.** La primera
  visita toma el esquema del sistema, después manda el guardado y el botón de
  la cabecera lo cambia. Un script de [index.html](index.html) lo aplica antes
  del primer pintado, para que nadie vea un destello del otro esquema, y
  `color-scheme` lo sigue para que los controles del navegador lo acompañen
  ([themeContext.ts](src/shared/utils/themeContext.ts),
  [ThemeProvider.tsx](src/app/providers/ThemeProvider.tsx),
  [index.css](src/app/index.css)). Un color que cambia con el esquema lleva su
  par en la variante `dark:`, en la misma clase del componente.
- **El foco siempre se ve.** Un control al que se le quita el contorno del
  navegador recibe a cambio un anillo ([Button.tsx](src/shared/ui/Button.tsx),
  [PokemonCard.tsx](src/features/pokemon/ui/PokemonCard.tsx), el campo de
  búsqueda), y los demás conservan el contorno del navegador. La excepción es
  el `main`, que solo recibe el foco desde el enlace de saltar al contenido.
- **Lo primero que alcanza el teclado es saltar al contenido**
  (`#skip-link-focuses-main-clear-of-the-sticky-header`,
  [SkipToContent.tsx](src/pages/pokedex/ui/SkipToContent.tsx)). Volver arriba
  es un enlace que el teclado alcanza aunque todavía no se vea
  (`#return-to-top-is-a-link-to-root-shown-past-400px`,
  [ReturnToTop.tsx](src/pages/pokedex/ui/ReturnToTop.tsx)), y los créditos, que
  una lista sin fin dejaría fuera de alcance, se abren con un botón
  (`#credits-reachable-from-an-infinite-list`,
  [Credits.tsx](src/pages/pokedex/ui/Credits.tsx)).
- **El buscador es un combobox con su lista de sugerencias.** Flechas, Intro y
  Escape bastan para elegir, y la opción activa se señala sin sacar el foco del
  campo ([PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx)): buscar no
  obliga a soltar el teclado.
- **Un identificador que une dos elementos sale de `useId()`.** El buscador con
  su lista y su opción activa, y el pie con su título, para que dos en la misma
  página no compartan ninguno
  ([PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx),
  [Credits.tsx](src/pages/pokedex/ui/Credits.tsx)). Fijos quedan los que son
  únicos por página porque nombran un sitio de ella: el `main`, la cabecera y
  el contenedor raíz.
- **Lo que viene de fuera no ensancha la página.** Un nombre de PokeAPI cambia
  sus guiones por espacios y, si aun así no cabe, se parte dentro de su
  elemento ([PokemonCard.tsx](src/features/pokemon/ui/PokemonCard.tsx),
  [PokemonModal.tsx](src/features/pokemon/ui/PokemonModal.tsx)); la ruta
  desconocida de la pantalla 404 se parte por cualquier carácter
  ([NotFoundSection.tsx](src/pages/pokedex/ui/NotFoundSection.tsx)); y un aviso
  nunca es más ancho que la ventana ([Toast.tsx](src/shared/ui/Toast.tsx)).
- **Un estado se dice con palabras y con su papel, no solo con un color.** La
  carga es un `status` que dice «Loading…»
  ([PokeballLoader.tsx](src/shared/ui/PokeballLoader.tsx)), un fallo de la lista
  es un `alert` con su texto
  ([PokemonList.tsx](src/features/pokemon/ui/PokemonList.tsx)), un aviso es un
  `status` con el suyo ([Toast.tsx](src/shared/ui/Toast.tsx)) y un filtro dice
  si está pulsado ([PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx)).
- **El color de un tipo es el mismo en toda la aplicación.** Sale de una sola
  tabla, que usan la tarjeta, los filtros, la ficha y la pantalla 404
  ([typeBadge.ts](src/shared/utils/typeBadge.ts)): un tipo se reconoce por su
  color allí donde aparezca.
- **Los textos de la interfaz van en inglés** (`#product-ui-text-is-english`).

## Lo que sigue abierto

Nada de esto está decidido. Lo decide el dueño con el producto delante, y hasta
entonces lo que hay es lo que el código hace, no una regla:

- **La ficha no cabe en una ventana baja.** Es más alta que muchas ventanas y
  su contenedor no se desplaza, así que se recorta por arriba y por abajo; con
  el zoom al 200 % quedan fuera de la ventana parte del botón de cerrar de la
  carcasa y de su cruceta (`#pokemon-details-dialog-overflows-short-windows`).
- **La primera visita guarda el tema del sistema** como si alguien lo hubiera
  elegido, y desde entonces un cambio del sistema no se sigue
  (`#first-visit-stores-the-system-theme-as-a-choice`).
- **El movimiento reducido solo alcanza a una parte de las animaciones**
  (`#reduced-motion-covers-only-part-of-the-animations`).
- **Ventana estrecha y letra grande a la vez.** Cada condición se sostiene por
  separado. Juntas no: con la letra del navegador en 24 px y el botón de
  instalar a la vista, el cambio de tema tapa el título de la cabecera a 320,
  360 y 390 px de ancho, y a 320 px la pantalla de la ficha se desplaza de
  lado. Qué combinación soporta el producto no está dicho.
- **El aspecto.** La paleta (el rojo `primary` y los colores de Tailwind), la
  fuente Outfit con su sustituta ajustada y la ficha dibujada como una Pokédex
  están hechas en el código, y ningún registro dice por qué. No son una regla
  de marca hasta que alguien las enuncie.

Cuando una se decida, pasa a la lista de arriba con su porqué y su registro.

## Dónde está hecho

| Qué | Dónde |
|---|---|
| La entrada de Tailwind, la variante oscura por clase, la fuente sustituta, las animaciones propias y las áreas seguras | [src/app/index.css](src/app/index.css) |
| La fuente y el rojo `primary`, el único color propio de la paleta | [tailwind.config.js](tailwind.config.js), que la hoja global carga |
| El tema: su lectura inicial, quién lo aplica y quién lo reparte | El script de [index.html](index.html), [themeContext.ts](src/shared/utils/themeContext.ts) y [ThemeProvider.tsx](src/app/providers/ThemeProvider.tsx) |
| El estilo de cada componente | Sus clases de Tailwind, en su propio fichero; la regla está en «Estilos» de [la arquitectura](docs/ARCHITECTURE.md) |
| La interfaz base que no sabe del negocio | El botón, la carga y los avisos que exporta [src/shared/ui/index.ts](src/shared/ui/index.ts) |
| El color de cada tipo | [typeBadge.ts](src/shared/utils/typeBadge.ts) |
| Las pantallas de referencia | [PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx) (cabecera, buscador, filtros y lista), [PokemonModal.tsx](src/features/pokemon/ui/PokemonModal.tsx) (ficha), [NotFoundSection.tsx](src/pages/pokedex/ui/NotFoundSection.tsx) (404) y [Credits.tsx](src/pages/pokedex/ui/Credits.tsx) |
| Lo que se ve mientras carga la aplicación | El indicador de arranque de [index.html](index.html), con sus propios estilos |

## Cómo comprobarlo

`./dev verify` (en Windows, `.\dev.cmd verify`) corre los tests que sostienen
parte de lo de arriba: ningún tamaño de texto en píxeles
([textSizes.test.ts](src/app/textSizes.test.ts)), identificadores propios para
dos buscadores y para dos pies, el enlace de saltar y el script que pinta el
tema ([PokedexPage.test.ts](src/pages/pokedex/ui/PokedexPage.test.ts),
[Credits.test.tsx](src/pages/pokedex/ui/Credits.test.tsx)) y volver arriba
([ReturnToTop.test.ts](src/pages/pokedex/ui/ReturnToTop.test.ts)). Comprueban
nombres, papeles e identificadores, no el aspecto. Lo demás se mira en un
navegador, con `./dev start` y la dirección que imprime:

- **Pantallas.** La lista, un filtro por tipo, los favoritos vacíos, las
  sugerencias del buscador, una búsqueda sin resultado, un resultado, la ficha,
  los créditos, un aviso y una ruta que no existe.
- **Esquemas.** Cada pantalla en claro y en oscuro, cambiando el del sistema o
  emulándolo, con la consola limpia y sin peticiones fallidas.
- **Tamaños.** A 320 píxeles CSS de ancho no aparece desplazamiento
  horizontal, tampoco con un nombre largo, una ruta de 120 caracteres sin
  espacios o un aviso abierto. Con la letra del navegador en 24 px, todo texto
  crece en la misma proporción. Con el zoom al 200 % no hay desplazamiento
  horizontal y todo control queda a la vista, salvo en la ficha, que es lo
  primero de «Lo que sigue abierto».
- **Teclado.** Sin ratón: el tabulador empieza en saltar al contenido y
  recorre el buscador, el tema, los filtros y cada tarjeta; las flechas e Intro
  eligen una sugerencia; Intro abre la ficha, el foco no sale de ella y Escape
  lo devuelve a donde estaba; y el foco siempre se ve.

Este recorrido se hizo en Chrome 157 sobre el servidor de desarrollo, y lo que
se vio, con sus cifras, está en
`#2026-11-24-design-guide-and-interface-corrections`. No se ha comprobado en
Firefox ni en Safari, con un lector de pantalla, en un teléfono real ni con la
aplicación instalada; tampoco se ha medido el contraste de los colores, ni si
las áreas seguras que lee la hoja global llegan a valer algo en un teléfono
con muesca, porque la página no pide ocupar esa zona. Hazlo antes de dar por
buena una pantalla nueva.
