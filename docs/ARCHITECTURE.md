# Arquitectura del producto

El producto es una aplicación React con Vite y TypeScript organizada con
Feature-Sliced Design. Este documento manda sobre la forma del código de
`src`: dónde va cada cosa, qué puede importar qué y cómo se llega a la red.
Cómo se trabaja en el repositorio lo manda `AGENTS.md`, y cómo se pone en
marcha un clon, `README.md`.

**Cada regla dice qué la hace cumplir.** Las que hace cumplir el lint tienen en
`eslint.config.test.ts` el caso más pequeño que las rompe, y ese test falla si
alguien relaja la regla en `eslint.config.js`. Las reglas de fsd-lint 1.2.1
no leen las reexportaciones (`export … from`), y `fsd/forbidden-imports`
tampoco lee el `import()` dinámico: en ellos sostiene los mismos límites una
regla local, `fsd-gaps/boundaries` (`eslint-fsd-gaps.js`), que sobra cuando
fsd-lint los lea. Ninguna regla lee un `import()` cuya ruta no esté escrita
entre comillas (una plantilla de texto, aunque no tenga huecos, o una
variable), ni un tipo que importa (`typeof import('…')` o `import('…').Tipo`):
lo que se importa así es convención, y `eslint.config.test.ts` tiene sus casos.
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
  `fsd/forbidden-imports` y, en una reexportación o un `import()` dinámico,
  `fsd-gaps/boundaries`.
- **Dos slices de la misma capa no se importan entre sí.** Si los dos necesitan
  algo, ese algo baja a una capa inferior. Lo hacen cumplir
  `fsd/no-cross-slice-dependency` y, en una reexportación,
  `fsd-gaps/boundaries`.
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

- **Desde fuera, a un slice solo se entra por su `<slice>/index.ts`**, que
  exporta a propósito lo que es público y nada más: ni un fichero interno ni
  un segmento (`@/entities/<slice>`, nunca `@/entities/<slice>/model`). Lo
  hacen cumplir `fsd/no-public-api-sidestep` y, en una reexportación,
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
- **Los tests van al lado de lo que prueban**, como `<fichero>.test.ts` o
  `<fichero>.test.tsx`, por convención, y las reglas de imports de
  Feature-Sliced Design no se les aplican: un test puede entrar en el slice que
  prueba.
- **Todo test corre y comprueba algo.** `.skip`, `.todo`, `skipIf` y `runIf`
  son errores de `no-restricted-properties` en los tests, y Vitest rechaza un
  `.only` (`allowOnly: false`) y hace fallar un test que no comprueba nada
  (`expect.requireAssertions`), los dos en `vite.config.ts`.

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
- **El cliente HTTP es el único código que envía peticiones.** Fuera de
  `src/shared/api`, `fetch`, `XMLHttpRequest`, `window.fetch`,
  `globalThis.fetch` y `self.fetch` son errores de `no-restricted-globals` y
  `no-restricted-properties`; los tests quedan fuera, porque le inyectan un
  transporte falso.
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
  textos, el repositorio, la portada y las rutas del sitemap; el plugin
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
