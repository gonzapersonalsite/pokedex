---
title: La guía de diseño, alineada con el código, con la plantilla y con el registro
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** producto. El dueño preguntó si `DESIGN.md` y el sistema de
diseño heredado de la plantilla react-fsd se usaban bien; una revisión encontró
que no del todo, y el dueño encargó arreglarlo: «Déjalo todo correctamente
entonces. Ahorrate el pasar puertas o pruebas ahora desde un inicio, haz los
ajustes que debas y ya las pasas al final.» Sobre los créditos, que el dueño vio
siempre oscuros, eligió entre las opciones del agente «Diálogo y pie siguen el
tema». No abre ni cierra ninguna fase. Fuera de la parte: el rediseño visual
(`#choices-of-look-wait-for-the-visual-redesign`), Firefox, Safari, un lector de
pantalla y el commit.

**Qué cambió.**

- **El buscador ya no saca el foco del campo**
  (`#search-is-a-combobox-that-keeps-the-focus`). En
  `src/pages/pokedex/ui/PokedexPage.tsx`, las sugerencias tenían `tabIndex={0}`,
  así que Tab entraba en hasta ocho opciones, y la lista solo se cerraba con un
  clic fuera. Ahora las opciones no son paradas del tabulador, la lista se cierra
  cuando el campo pierde el foco y pulsar una opción no le quita el foco (se
  impide el efecto por defecto de pulsar), así que el clic la elige. Sale el
  oyente de `mousedown` en el documento, que ya no hace falta, y el
  `onKeyDown` de cada opción, que ya no recibe teclas porque no toma el foco. El navegador
  enseñó un fallo más: Chrome hace parada del tabulador a toda caja con scroll,
  así que Tab caía en la lista, el campo perdía el foco, la lista se cerraba y el
  foco quedaba en `body`; la lista lleva `tabIndex={-1}`.
- **Los créditos siguen el tema** (`#credits-follow-the-colour-scheme`). En
  `src/pages/pokedex/ui/Credits.tsx`, el pie, el diálogo y sus enlaces tenían
  colores fijos de oscuro; cada uno lleva ahora su color claro (los que ya usa
  la aplicación) y su par `dark:` con el valor de antes. El botón flotante
  «Credits» se queda oscuro translúcido, como el de volver arriba.
- **El manifiesto de la aplicación instalable, en inglés**
  (`#product-ui-text-is-english`): `vite.config.ts` decía «Busca Pokémon, tipos
  y evoluciones».
- **Una sola variante oscura.** Sale `darkMode: 'class'` de
  `tailwind.config.js`: en Tailwind 4.3.3 registraba `dark` como
  `&:is(.dark *)`, y el `@custom-variant` de `src/app/index.css`, que se
  registra después, la sustituía. `DESIGN.md` ya nombraba la de la hoja global.
- **`DESIGN.md`.** Quita que el recorrido se hiciera en Firefox, que ninguna
  entrega dice; deja de decir que un test sostiene una «transición en `rem`»; ya
  no dice que un tipo se reconoce por su color (`normal` y `steel` comparten el
  suyo); vuelve a la regla de la plantilla, que toda decisión visual tiene su
  registro; quita «todo defecto … quedó cerrado»; y cita los registros nuevos.
  «Lo que sigue abierto» nombra que el rediseño tendrá que decidir si los
  colores pasan a tokens con nombre.
- **Registros.** Siete decisiones nuevas, todas `provisional`:
  `#focus-is-always-visible`, `#search-is-a-combobox-that-keeps-the-focus`,
  `#linking-ids-come-from-use-id`, `#external-text-never-widens-the-page`,
  `#states-are-said-with-words-and-roles`, `#one-colour-table-per-pokemon-type`
  y `#credits-follow-the-colour-scheme`. Y cuatro que estaban `confirmed` con
  «Decidido por el agente» vuelven a `provisional` con una refutación que
  argumenta contra lo decidido, no contra el defecto viejo:
  `#first-visit-stores-the-system-theme-as-a-choice`,
  `#reduced-motion-covers-only-part-of-the-animations`,
  `#pokemon-details-dialog-overflows-short-windows` y
  `#narrow-windows-large-text-and-control-names-hold`. La regla dura 9 pide que
  el dueño las confirme en un turno posterior, tras releerlas.
- **Tests nuevos:** tres del buscador en `PokedexPage.test.ts` y dos de los
  créditos en `Credits.test.tsx`.

**Cómo se vio fallar cada test.** Con el código corregido en verde, se repuso
cada defecto con la edición inversa, se corrió `./dev verify -- tests` y se
deshizo. Primera ronda, cinco defectos a la vez, uno por test (358 tests, 5
fallidos):

- Las opciones otra vez con `tabIndex={0}`:
  `points_at_its_suggestions_from_the_field_without_making_them_tab_stops`
  falló con «expected [ +0, +0 ] to deeply equal [ -1, -1 ]».
- El campo que al perder el foco abre la lista en vez de cerrarla:
  `closes_its_suggestions_when_the_focus_leaves_the_field` falló con «expected
  document not to contain element, found <ul…».
- Pulsar una opción sin impedir su efecto por defecto (se paraba la
  propagación en su lugar):
  `picks_a_clicked_suggestion_without_taking_the_focus_from_the_field` falló
  con «expected true to be false».
- El pie con `bg-slate-900` sin su par: `follows_the_theme_in_its_footer_instead_of_staying_dark`
  falló con «expected [ 'bg-slate-900' ] to deeply equal []».
- El panel del diálogo con `text-slate-200` sin su par:
  `follows_the_theme_in_its_dialog_instead_of_staying_dark` falló con
  «expected [ 'text-slate-200' ] to deeply equal []».

Segunda ronda, la lista con `tabIndex={0}`: el primer test falló con
«Expected the element to have attribute: tabindex="-1" Received: tabindex="0"»
(358 tests, 1 fallido).

**Qué se midió en un navegador.** El navegador integrado de Claude (Chromium)
contra `./dev start`, en `http://127.0.0.1:5173`, con PokeAPI real y el esquema
emulado. La letra de 24 px se emuló poniendo el tamaño de la raíz, que es lo
que cambia el ajuste del navegador para todo lo que va en `rem`; el zoom al
200 % se emuló con una ventana de 640 × 400.

- **Buscador, con teclas reales.** Con «pi» escrito, las ocho opciones tienen
  `tabIndex` −1; Tab lleva el foco a «Search» y cierra la lista; mayúsculas+Tab
  vuelve al campo; dos flechas abajo marcan `pidgeotto` sin sacar el foco;
  Escape cierra la lista y el foco sigue en el campo. Un clic de ratón en
  `pichu` la eligió («Result for "pichu"») con el foco en el campo.
- **Créditos.** En claro, el panel y el pie miden fondo `rgb(255, 255, 255)` y
  texto `slate-800`; en oscuro, `slate-900`, como antes. Escape cierra el
  diálogo y devuelve el foco a «Credits».
- **Tamaños.** A 320 × 640 en oscuro, con la letra en 16 y en 24 px, 0 px de
  desplazamiento horizontal en la lista, en los créditos y en la ficha, y el
  título no se solapa con el buscador; el texto de las tarjetas pasa de 18 a
  27 px. Una ruta de 120 caracteres sin espacios: 0 px en 16 y en 24. A
  640 × 400 en claro: 0 px en la lista, los créditos y la ficha, y cada control
  con nombre de la ficha se puede llevar a la vista. Una primera medida dio la
  carcasa de la ficha en 332 px a 320 de ancho: se tomó mientras la ficha se
  animaba; quieta mide 288 y no recorta ningún control.
- **Teclado en la ficha.** Abierta con Intro desde la tarjeta, catorce Tab dan
  la vuelta sin salir del diálogo, cada control enseña el contorno del
  navegador o su anillo, y Escape la cierra y devuelve el foco a la tarjeta. El
  único botón sin nombre que recibe el foco es la guarda de foco de Headless UI,
  que lo reenvía en el acto.
- **Consola y red.** Ninguna petición fallida. En cada carga, un error «An
  unknown error occurred when fetching the script»: es el registro del service
  worker de desarrollo. `/dev-sw.js` tardó 6,4 s en una petición y más de 20 en
  otra, porque el servidor de desarrollo lo regenera en cada petición sobre el
  volumen de Docker, y la página recarga antes. No lo toca este cambio, el
  build no lo sirve así, y no se registra: se anota aquí. Un aviso de la imagen
  precargada sin usar, el de siempre del servidor de desarrollo.

**Lo que no se hizo, y por qué.**

- **Confirmar decisiones.** Las once quedan `provisional`: las confirma el
  dueño tras releer sus refutaciones (regla dura 9).
- **Cambiar colores de la paleta**, como separar `normal` de `steel`: es
  aspecto, y espera al rediseño.
- **No se comprobó** Firefox, Safari, un lector de pantalla, un teléfono real,
  la aplicación instalada ni el contraste; un aviso no se abrió en el recorrido.

**Puertas.** Al arrancar, árbol limpio en `5147b5d`, que el hook `pre-push`
verificó al publicarlo; por orden del dueño no se corrieron las puertas antes de
tocar nada. Al terminar, `./dev verify` completo: la primera corrida dio
`format` en rojo en `src/pages/pokedex/ui/Credits.tsx` (clases largas), que se
arregló con `./dev format-fix`. Sobre el contenido final: `board: tests` 830
checks y 0 fallos, `board: documents` 28 comprobaciones y 0 hallazgos, `tests`
358 tests (353 antes de esta parte) con 0 fallidos y 0 con error, y
`dependencies`, `format`, `lint`, `typecheck` y `build` en verde; 9 puertas, 0
en rojo. La verificación del commit, cuando el dueño lo autorice, es la del
hook `pre-push`.

**Pendiente.** Que el dueño relea y confirme las once decisiones
`provisional` de arriba.
