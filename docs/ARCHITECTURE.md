# Arquitectura del producto

El producto es una aplicación React con Vite y TypeScript organizada con
Feature-Sliced Design. Este documento manda sobre la forma del código de
`src`: dónde va cada cosa, qué puede importar qué y cómo se llega a la red.
Cómo se trabaja en el repositorio lo manda `AGENTS.md`, y cómo se pone en
marcha un clon, `README.md`.

**Cada regla dice qué la hace cumplir.** Las que hace cumplir el lint tienen en
`eslint.config.test.ts` el caso más pequeño que las rompe, y ese test falla si
alguien relaja la regla en `eslint.config.js`. Las reglas de fsd-lint 1.2.1
no leen las reexportaciones (`export … from`) ni `import.meta.glob`, y
`fsd/forbidden-imports` tampoco lee el `import()` dinámico: en ellos sostiene
los mismos límites una regla local, `fsd-gaps/boundaries`
(`eslint-fsd-gaps.js`), que sobra cuando fsd-lint los lea. Por debajo de
`app`, que puede globar cualquier capa, un `import.meta.glob` solo se admite
con patrones escritos entre comillas que empiezan por `./` y no tienen ningún
`..`, y, si lleva opciones, en un objeto literal con sus claves escritas y sin
`base`: cualquier otro es un error, porque el lint no puede leer adónde llega.
Ninguna regla lee un `import()` cuya ruta no esté escrita entre comillas (una
plantilla de texto, aunque no tenga huecos, o una variable), ni un tipo que
importa (`typeof import('…')` o `import('…').Tipo`): lo que se importa así es
convención, y `eslint.config.test.ts` tiene sus casos.
Un comentario no apaga ninguna regla: el lint da por aviso un
`eslint-disable`, y un aviso es rojo (`--max-warnings=0` en `pnpm run lint`),
así que una excepción vive en `eslint.config.js`, junto a su decisión. Las que
dicen «convención» no las comprueba nada: las sostiene la revisión del diff, y
se convierten en regla de lint con su caso en cuanto alguien encuentra cómo.

## Capas

`src` contiene estas seis carpetas y nada más, de arriba abajo:

| Capa | Qué contiene |
|---|---|
| `app` | La entrada (`src/app/main.tsx`), los providers, el router y los estilos globales |
| `pages` | Una pantalla entera: compone lo de debajo y guarda el código que solo usa ella |
| `widgets` | Un bloque de interfaz grande que usan varias páginas |
| `features` | Una acción del usuario con valor propio: un formulario, un filtro, un borrado |
| `entities` | Un concepto del negocio: sus tipos, sus reglas, su estado y su vista |
| `shared` | Lo que no sabe nada del negocio: el cliente HTTP, utilidades, la UI base |

- **Una capa solo importa de las que tiene debajo.** Lo hacen cumplir
  `fsd/forbidden-imports` y, en una reexportación, un `import()` dinámico o un
  `import.meta.glob`, `fsd-gaps/boundaries`.
- **Dos slices de la misma capa no se importan entre sí.** Si los dos necesitan
  algo, ese algo baja a una capa inferior. Lo hacen cumplir
  `fsd/no-cross-slice-dependency` y, en una reexportación,
  `fsd-gaps/boundaries`.
- **La única excepción es la de Feature-Sliced Design entre entidades, `@x`.**
  La entidad B expone a la entidad A lo que A necesita de ella en
  `src/entities/B/@x/A.ts`, y solo A lo importa, con esa forma:
  `@/entities/B/@x/A`. Solo en `entities` y solo así: desde otra entidad, desde
  otra capa o por una ruta relativa es un error de fsd-lint, y reexportarlo,
  que se lo daría a todo el que use A, de `fsd-gaps/boundaries`. Una ruta que
  sigue más allá del fichero `@x` (`@/entities/B/@x/A/model`) la acepta
  fsd-lint, y no usarla es convención.
- **No hay más capas.** Un fichero de código fuera de esas seis carpetas, o
  suelto en la raíz de `src`, es un error de `no-restricted-syntax`; carpetas
  como `services`, `hooks` o `utils` en la raíz no existen.
- **En `src` el código es TypeScript en `.ts` y `.tsx`**, los únicos ficheros
  que leen estas reglas: un `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts` o `.cts` es un
  error de `no-restricted-syntax`, o un error de parseo (`Parsing error`) si
  contiene sintaxis de TypeScript o JSX.
- `app` y `shared` no tienen slices, por convención: sus carpetas internas son
  segmentos.

## Slices y segmentos

Un slice es una carpeta dentro de `pages`, `widgets`, `features` o `entities`
(`src/entities/<slice>/`), con nombre en kebab-case. Dentro, solo los
segmentos que tengan algo:

| Segmento | Qué contiene |
|---|---|
| `ui` | Componentes `.tsx` y sus estilos |
| `model` | Tipos, reglas de negocio como funciones puras, hooks y estado |
| `api` | Las llamadas del slice al cliente HTTP |
| `lib` | Utilidades internas del slice |
| `config` | Constantes del slice |

- **En una capa con slices no hay ficheros sueltos**, por convención: ninguna
  regla rechaza uno en su raíz (`src/entities/<fichero>.ts`), y desde ahí un
  `import.meta.glob('./*/model/*.ts')`, que no sale de su carpeta, llega a
  todos los slices de la capa, aunque importar uno de ellos desde el mismo
  fichero sea un error. `eslint.config.test.ts` tiene su caso.
- **Desde fuera, a un slice solo se entra por su `<slice>/index.ts`**, que
  exporta a propósito lo que es público y nada más: ni un fichero interno ni
  un segmento (`@/entities/<slice>`, nunca `@/entities/<slice>/model`), salvo
  la entidad a la que otra expone su `@x` (arriba, en «Capas»). Lo hacen
  cumplir `fsd/no-public-api-sidestep` y, en una reexportación,
  `fsd-gaps/boundaries`. A `shared` se entra por segmento (`@/shared/api`), por
  convención.
- **Entre slices se importa con el alias `@/`**, y lo hacen cumplir
  `fsd/no-relative-imports` y, en una reexportación, `fsd-gaps/boundaries`.
  **Dentro del slice, con rutas relativas**, por convención: entrar en el
  propio slice por el alias, y más aún por su `<slice>/index.ts`, crea un ciclo
  de imports que el lint no ve. El alias se declara una sola vez, en
  `tsconfig.json`, y Vite, Vitest y `eslint.config.js` lo leen de ahí. Solo
  `@/` es el alias: un paquete con scope que empiece como una capa
  (`@app/tokens`) es un paquete, no la capa `app`.
- **En `model`, `api` y `lib` no hay UI**: ni ficheros `.tsx`, ni imports,
  estáticos o dinámicos, de un segmento `ui`, de estilos, de cualquier entrada
  de `react-dom` o de los runtimes de JSX, ni `createElement`, `cloneElement` o
  React entero (por defecto, como espacio de nombres o dinámico): de React se
  importa por nombre lo que es lógica, como sus hooks. Lo hacen cumplir
  `no-restricted-imports` y `no-restricted-syntax` sobre esos segmentos. Que
  no llegue un componente por la API pública de otro slice es convención: el
  lint ve rutas, no qué exporta cada una. Sus tests sí pueden renderizar.
- **Un test es un `<fichero>.test.ts` o un `<fichero>.test.tsx`, y está donde
  lo corre Vitest.** Es el único sufijo que el lint lee como test, de una sola
  lista de `eslint.config.js`, y el único que buscan los proyectos de
  `vite.config.ts`. Con una extensión de código, las que Vitest lee por defecto
  (`.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.cts`, `.mjs` y `.cjs`), son errores
  de `tests/no-stray-file` (`eslint-tests.js`) un `.spec` y un `.stories`, que
  la lista por defecto de fsd-lint daría por tests y libraría de sus reglas, y
  un `.test` que no busca ningún proyecto (buscan `src/**/*.test.{ts,tsx}`,
  `tooling/**/*.test.ts` y `eslint.config.test.ts`); con otra extensión
  (`<fichero>.spec.json`, `<Componente>.stories.mdx`) no son código y el lint
  no los lee. Dónde busca Vitest está escrito dos veces: en los proyectos de
  `vite.config.ts` y, para el lint, en `VITEST_TESTS` de `eslint.config.js`.
  `eslint.config.test.ts` lee esos proyectos en el `vite.config.ts` real y
  comprueba, en rutas representativas, que Vitest corre un fichero justo
  cuando el lint lo lee como test, con una ruta de test para cada sitio donde
  busca: un proyecto nuevo se declara en `vite.config.ts` y, en el mismo
  cambio, su `include` en `VITEST_TESTS` y una ruta suya entre las
  representativas. Que vaya al lado de lo que prueba es convención. Las reglas
  de imports de Feature-Sliced Design no se aplican a los tests: un test puede
  entrar en el slice que prueba.
- **Todo test corre y comprueba algo.** `.skip`, `.todo`, `skipIf` y `runIf`
  son errores de `no-restricted-properties` en los tests. `tests/no-skip-option`
  lee el objeto literal que va de segundo argumento de `it`, `test`, `describe`
  o `suite`, llamados por ese nombre, también tras un modificador o una tabla
  (`describe.concurrent('…', { skip: true }, …)`, `it.each([…])`,
  ``it.each`…` ``, ``test.for`…` ``) y bajo `as`, `satisfies`, `<T>` o `!`, y
  es un error suyo una clave `skip` o `todo` con un valor que no sea `false`,
  escrita como nombre o como texto (entre comillas, entre corchetes o en una
  plantilla sin huecos). Lo que esa regla no lee lo deja en rojo la puerta
  `tests`, que no admite ningún caso que el informe de Vitest dé por saltado
  (`--forbid-skipped`); entre otros, cada uno con su caso en
  `eslint.config.test.ts`: unas opciones en una variable o traídas con `...`,
  una clave calculada de otro modo (`[CLAVE]`), un `it` importado con otro
  nombre o leído de un objeto (`vitest.it`) y un `it` sin función, que Vitest
  da por `todo`. Vitest rechaza un `.only` (`allowOnly: false`) y hace fallar
  un test que no comprueba nada (`expect.requireAssertions`), los dos en
  `vite.config.ts`.

## Dónde va el código nuevo

Primero, en la página que lo usa. Baja cuando aparece el segundo consumidor, y
no antes: a `widgets` si es un bloque de interfaz, a `features` si es una
acción del usuario, a `entities` si es un concepto del negocio, y a `shared` si
no sabe nada del negocio. Bajar código es un cambio con su propio diff, que
deja los imports por la `<slice>/index.ts` del nuevo sitio. Es convención; el
lint solo impide que una capa use lo que tiene encima.

## Estilos

- Los componentes usan clases utilitarias de TailwindCSS; que no se importen
  hojas de estilos desde `model`, `api` ni `lib` lo hace cumplir el lint; el
  resto es convención.
- Los estilos globales de toda la aplicación viven en `src/app/index.css`, que
  importa la entrada y nadie más, por convención.

## Datos y red

- **El flujo va en una dirección:** la vista (`ui`) usa el modelo (`model`),
  el modelo usa la API del slice (`api`) y la API usa el cliente HTTP de
  `src/shared/api`. Que la vista no salte al `api` es convención.
- **La red, solo desde `src/shared/api`.** El cliente HTTP es el único código
  que envía peticiones, y una conexión o una baliza también se abre allí. Fuera
  de `src/shared/api` el lint rechaza exactamente esto: `fetch`,
  `XMLHttpRequest`, `WebSocket` y `EventSource` como globales
  (`no-restricted-globals`), también para leer una constante
  (`WebSocket.OPEN`); esos cuatro leídos de `window`, `globalThis` o `self`
  (`new window.XMLHttpRequest()`, `const { fetch } = window`), y `sendBeacon`
  de cualquier objeto (`navigator.sendBeacon`, `window.navigator.sendBeacon`),
  los dos con `no-restricted-properties`. Una conexión o una baliza tiene su
  propio mensaje, que no manda al cliente HTTP. Los tests quedan fuera, porque
  le inyectan un transporte falso. Todo lo demás es convención; entre otros,
  cada uno con su caso en `eslint.config.test.ts`: esos cuatro leídos de otra
  ventana (`top`, `parent`, `frames`, `window.window`,
  `document.defaultView`) o con `Reflect.get(window, 'fetch')`, un elemento
  que carga una dirección (`new Image().src`, `new Audio('/ping')`), un
  `import()` de una URL y otras APIs que llegan a la red (`Worker`,
  `SharedWorker`, `navigator.serviceWorker.register`, `RTCPeerConnection`,
  `WebTransport`, `WebSocketStream`, `fetchLater`).
- **Lo que hace el cliente** (`src/shared/api/httpClient.ts`, con sus tests al
  lado): `requestJson` y `requestArrayBuffer` cortan cada petición, cuerpo
  incluido, al pasar su `timeoutMs` lanzando `HttpTimeoutError`, lanzan
  `HttpError` cuando la respuesta no es `ok` (clasificados en
  `src/shared/utils/requestError.ts`), y conservan la cancelación que pide el
  propio llamante.
- **Las reglas de negocio son funciones puras en `model`**, con su test en el
  mismo cambio; los hooks del modelo solo guardan estado y llaman a esas
  funciones. Convención.

## La superficie para agentes y buscadores

- **Lo que ven los crawlers y los agentes sale del build, con una sola
  fuente.** `tooling/agent-files/site.ts` nombra la dirección del sitio, sus
  textos, el repositorio y las rutas del sitemap, e `index.html` la portada
  por su ruta, con su tipo, su tamaño y su texto alternativo; el plugin
  cableado en `vite.config.ts` reescribe en el build el título, la descripción
  y las direcciones absolutas de la vista previa social de `index.html`, y
  emite llms.txt, robots.txt y sitemap.xml (el servidor de desarrollo sirve
  los mismos ficheros por middleware). Los tests de `tooling/agent-files`
  cruzan cada valor con el fichero real —el tipo y el tamaño declarados de la
  portada incluidos— y comprueban que el plugin sigue cableado en la
  configuración real: quitarlo de `vite.config.ts` los deja en rojo.
- **La portada se edita en su fuente.** `public/og-cover.png` se renderiza
  desde `tooling/og-cover.html`; una portada nueva se re-renderiza y actualiza
  sus metadatos y sus tests en el mismo cambio.

## Nombres

Por convención: componentes en PascalCase (`<slice>/ui/TaskItem.tsx`), hooks
en camelCase con `use` delante (`<slice>/model/useTaskList.ts`), slices en
kebab-case (`<capa>/add-task`) y segmentos en minúsculas.
