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

Cada una dice qué hace hoy el código, por qué y dónde se ve, y cita su registro,
donde están su porqué largo, su refutación y su estado: una decisión visual se
registra como cualquier otra ([docs/registry/README.md](docs/registry/README.md))
y deja aquí la línea que la enuncia, con su cita. Una línea sin registro no es
una decisión.

- **El texto sigue el tamaño que cada persona eligió en su navegador**
  (`#narrow-windows-large-text-and-control-names-hold`). Ninguna hoja fija el
  tamaño de la raíz y todo tamaño de texto es relativo a ella, también los
  tres hechos a medida de la pantalla 404
  ([NotFoundSection.tsx](src/pages/pokedex/ui/NotFoundSection.tsx)); un test
  recorre el código de `src`, la hoja global y la página de arranque y rechaza
  uno escrito en píxeles ([textSizes.test.ts](src/app/textSizes.test.ts)).
  Quien agranda la letra del navegador tiene que verla agrandada aquí, y el
  zoom no tiene tope ([index.html](index.html)).
- **Claro y oscuro, pintados antes de que cargue la aplicación**
  (`#first-visit-stores-the-system-theme-as-a-choice`). La primera visita sigue
  el esquema del sistema sin escribir en el almacenamiento local, después manda
  la elección manual si difiere del sistema y el botón de la cabecera la
  cambia. Un script de [index.html](index.html) lo aplica antes del primer
  pintado, para que nadie vea un destello del otro esquema, y `color-scheme` lo
  sigue para que los controles del navegador lo acompañen
  ([themeContext.ts](src/shared/utils/themeContext.ts),
  [ThemeProvider.tsx](src/app/providers/ThemeProvider.tsx),
  [index.css](src/app/index.css)). Un color que cambia con el esquema lleva su
  par en la variante `dark:`, en la misma clase del componente.
- **Los créditos siguen el tema, como el resto de la página**
  (`#credits-follow-the-colour-scheme`). Su pie y su diálogo usan en claro las
  superficies y los textos que ya usa la aplicación, y en oscuro los de
  siempre ([Credits.tsx](src/pages/pokedex/ui/Credits.tsx)). Los botones que
  flotan sobre la lista, el de los créditos y el de volver arriba, son oscuros
  translúcidos en los dos esquemas, porque se leen sobre cualquier contenido.
- **El foco siempre se ve** (`#focus-is-always-visible`). Un control al que se
  le quita el contorno del navegador recibe a cambio un anillo ([Button.tsx](src/shared/ui/Button.tsx),
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
- **El buscador es un combobox con su lista de sugerencias**
  (`#search-is-a-combobox-that-keeps-the-focus`). Flechas, Intro y Escape
  bastan para elegir, y la opción activa se señala sin sacar el foco del
  campo: las sugerencias no son paradas del tabulador, y la lista se cierra
  cuando el foco sale del campo ([PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx)).
  Buscar no obliga a soltar el teclado, y la lista no se queda tapando la
  página.
- **Un identificador que une dos elementos sale de `useId()`**
  (`#linking-ids-come-from-use-id`). El buscador con
  su lista y su opción activa, y el pie con su título, para que dos en la misma
  página no compartan ninguno
  ([PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx),
  [Credits.tsx](src/pages/pokedex/ui/Credits.tsx)). Fijos quedan los que son
  únicos por página porque nombran un sitio de ella: el `main`, la cabecera y
  el contenedor raíz.
- **Lo que viene de fuera no ensancha la página**
  (`#external-text-never-widens-the-page`). Un nombre de PokeAPI cambia
  sus guiones por espacios y, si aun así no cabe, se parte dentro de su
  elemento ([PokemonCard.tsx](src/features/pokemon/ui/PokemonCard.tsx),
  [PokemonModal.tsx](src/features/pokemon/ui/PokemonModal.tsx)); la ruta
  desconocida de la pantalla 404 se parte por cualquier carácter
  ([NotFoundSection.tsx](src/pages/pokedex/ui/NotFoundSection.tsx)); y un aviso
  nunca es más ancho que la ventana ([Toast.tsx](src/shared/ui/Toast.tsx)).
- **Un estado se dice con palabras y con su papel, no solo con un color**
  (`#states-are-said-with-words-and-roles`). La
  carga es un `status` que dice «Loading…»
  ([PokeballLoader.tsx](src/shared/ui/PokeballLoader.tsx)), un fallo de la lista
  es un `alert` con su texto
  ([PokemonList.tsx](src/features/pokemon/ui/PokemonList.tsx)), un aviso es un
  `status` con el suyo ([Toast.tsx](src/shared/ui/Toast.tsx)) y un filtro dice
  si está pulsado ([PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx)).
- **El color de un tipo es el mismo en toda la aplicación**
  (`#one-colour-table-per-pokemon-type`). Sale de una sola tabla, que usan la
  tarjeta, los filtros, la ficha y la pantalla 404
  ([typeBadge.ts](src/shared/utils/typeBadge.ts)), y el tipo lleva siempre su
  nombre escrito: el color ayuda a reconocerlo, pero no basta, porque hoy
  `normal` y `steel` comparten el suyo y la paleta espera al rediseño.
- **Los textos de la interfaz van en inglés** (`#product-ui-text-is-english`).
- **Los diálogos se desplazan dentro del visor sin recortar sus controles**
  (`#pokemon-details-dialog-overflows-short-windows`). `DialogViewport`
  ([DialogViewport.tsx](src/shared/ui/DialogViewport.tsx)) centra el panel por
  márgenes (`m-auto`) y deja hacer scroll por toda la carcasa de
  [PokemonModal.tsx](src/features/pokemon/ui/PokemonModal.tsx) o el diálogo de
  créditos sin mover la página detrás, ignorando pulsaciones en la barra de
  desplazamiento o arrastres que salen del panel.
- **El movimiento reducido cubre animaciones CSS, spinners y scrolls**
  (`#reduced-motion-covers-only-part-of-the-animations`). Toda animación CSS
  vive bajo `no-preference`, las utilidades usan `motion-safe:` o
  `motion-reduce:transition-none`, y cada scroll por código usa
  `preferredScrollBehavior` ([scroll.ts](src/shared/utils/scroll.ts)).
- **Cada control lleva nombre propio y envuelve sin solaparse en estrecho**
  (`#narrow-windows-large-text-and-control-names-hold`). La cabecera y los
  filtros envuelven con 320 px y letra en 24 px sin tapar el título, pulsar
  «All» desde favoritos vuelve al listado coherente con `aria-pressed`
  ([PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx)), y los botones de
  favorito nombran a su Pokémon
  ([PokemonCard.tsx](src/features/pokemon/ui/PokemonCard.tsx)).

## Lo que sigue abierto

Queda el aspecto estético, aplazado hasta que el dueño abra el rediseño visual,
y lo que «Cómo comprobarlo» dice que nadie ha mirado todavía:

- **El aspecto visual (`#choices-of-look-wait-for-the-visual-redesign`).** La
  paleta (el rojo `primary` y los colores de Tailwind), la fuente Outfit con su
  sustituta ajustada, el dibujo de la carcasa de `PokemonModal` y el estilo de
  `NotFoundSection` siguen tal cual sin fijar reglas de marca hasta el
  rediseño. Hoy cada componente escribe la paleta de Tailwind con su par
  `dark:`; si el rediseño quiere cambiar un color en un solo sitio, tendrá que
  decidir antes si los colores pasan a ser tokens con nombre en la hoja global.

Cuando se abra el rediseño o se añada una regla visual, se registra en
[docs/registry/decisions/](docs/registry/decisions/) y pasa arriba con su cita.

## Dónde está hecho

| Qué | Dónde |
|---|---|
| La entrada de Tailwind, la variante oscura por clase, el visor de diálogos, la fuente sustituta, las animaciones propias y las áreas seguras | [src/app/index.css](src/app/index.css) |
| La fuente y el rojo `primary`, el único color propio de la paleta | [tailwind.config.js](tailwind.config.js), que la hoja global carga |
| El tema: su lectura inicial, quién lo aplica y quién lo reparte | El script de [index.html](index.html), [themeContext.ts](src/shared/utils/themeContext.ts) y [ThemeProvider.tsx](src/app/providers/ThemeProvider.tsx) |
| El visor de diálogos y el scroll con movimiento reducido | [DialogViewport.tsx](src/shared/ui/DialogViewport.tsx) y [scroll.ts](src/shared/utils/scroll.ts) |
| El estilo de cada componente | Sus clases de Tailwind, en su propio fichero; la regla está en «Estilos» de [la arquitectura](docs/ARCHITECTURE.md) |
| La interfaz base que no sabe del negocio | El botón, el visor de diálogo, la carga y los avisos que exporta [src/shared/ui/index.ts](src/shared/ui/index.ts) |
| El color de cada tipo | [typeBadge.ts](src/shared/utils/typeBadge.ts) |
| Las pantallas de referencia | [PokedexPage.tsx](src/pages/pokedex/ui/PokedexPage.tsx) (cabecera, buscador, filtros y lista), [PokemonModal.tsx](src/features/pokemon/ui/PokemonModal.tsx) (ficha), [NotFoundSection.tsx](src/pages/pokedex/ui/NotFoundSection.tsx) (404) y [Credits.tsx](src/pages/pokedex/ui/Credits.tsx) |
| Lo que se ve mientras carga la aplicación | El indicador de arranque de [index.html](index.html), con sus propios estilos |

## Cómo comprobarlo

`./dev verify` (en Windows, `.\dev.cmd verify`) corre los tests que sostienen
estas reglas: ningún tamaño de texto en píxeles
([textSizes.test.ts](src/app/textSizes.test.ts)), visor desplazable y sin
barra mientras el diálogo se mueve ([dialogViewport.test.ts](src/app/dialogViewport.test.ts),
[DialogViewport.test.tsx](src/shared/ui/DialogViewport.test.tsx)), guardas de
movimiento reducido ([motion.test.ts](src/app/motion.test.ts),
[scroll.test.ts](src/shared/utils/scroll.test.ts)), tema sin escritura en
primera visita ([themeContext.test.ts](src/shared/utils/themeContext.test.ts),
[ThemeProvider.test.tsx](src/app/providers/ThemeProvider.test.tsx)),
controles de carcasa y tarjetas ([PokemonModal.test.tsx](src/features/pokemon/ui/PokemonModal.test.tsx),
[PokemonCard.test.tsx](src/features/pokemon/ui/PokemonCard.test.tsx)),
identificadores únicos, filtro «All», sugerencias que no son paradas del
tabulador y se cierran al salir el foco
([PokedexPage.test.ts](src/pages/pokedex/ui/PokedexPage.test.ts)), créditos
que siguen el tema ([Credits.test.tsx](src/pages/pokedex/ui/Credits.test.tsx)) y volver arriba
([ReturnToTop.test.ts](src/pages/pokedex/ui/ReturnToTop.test.ts)). Lo demás se
mira en un navegador, con `./dev start` y la dirección que imprime:

- **Pantallas.** La lista, un filtro por tipo, los favoritos vacíos y la vuelta
  con «All», las sugerencias del buscador, una búsqueda sin resultado, un
  resultado, la ficha, los créditos, un aviso y una ruta que no existe.
- **Esquemas.** Cada pantalla en claro y en oscuro, cambiando el del sistema o
  emulándolo, con la consola limpia y sin peticiones fallidas.
- **Tamaños.** A 320 píxeles CSS de ancho no aparece desplazamiento
  horizontal, tampoco con 24 px, un nombre largo, una ruta de 120 caracteres sin
  espacios o un aviso abierto. Con la letra del navegador en 24 px, todo texto
  crece en la misma proporción. Con el zoom al 200 % no hay desplazamiento
  horizontal y todo control queda a la vista y accesible en la ficha y los
  diálogos.
- **Teclado.** Sin ratón: el tabulador empieza en saltar al contenido y
  recorre el buscador, el tema, los filtros y cada tarjeta; las flechas e Intro
  eligen una sugerencia; Intro abre la ficha, el foco no sale de ella y Escape
  lo devuelve a donde estaba; y el foco siempre se ve.

Este recorrido se hizo solo en Chrome, sobre el servidor de desarrollo
(`#2026-11-24-design-guide-and-interface-corrections`), y se repitió sobre el
código de hoy en el navegador integrado de Claude, basado en Chromium
(`#2026-11-24-design-guide-aligned-with-code-and-template`). No se ha comprobado
en Firefox, en Safari, con un lector de pantalla, en un teléfono real ni con la aplicación
instalada; tampoco se ha medido el contraste de los colores con herramienta ni si
las áreas seguras que lee la hoja global llegan a valer algo en un teléfono
con muesca, porque la página no pide ocupar esa zona. Hazlo antes de dar por
buena una pantalla nueva.
