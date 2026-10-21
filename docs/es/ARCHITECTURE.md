# 🏗️ Guía de Arquitectura

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=333)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-8A6A4B)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-3A7D44)](https://github.com/vite-pwa/vite-plugin-pwa)
[![License: Evaluation Only](https://img.shields.io/badge/License-Evaluation--Only-red)](../../LICENSE)

🇪🇸 Español | [🇬🇧 English](../../ARCHITECTURE.md)

Este documento resume los patrones arquitectónicos, principios de diseño y decisiones tecnológicas del proyecto Pokédex.

## 🏗️ Arquitectura y Principios
- Diseño Feature-Sliced: las seis capas, imports solo hacia abajo y cada slice se entra por su `index.ts`; las reglas son reglas de lint (`pnpm lint`) con un caso por regla en `eslint.config.test.ts`.
- UI por composición; división contenedor/presentacional cuando aporta.
- Legibilidad y simplicidad sobre abstracción; YAGNI por defecto.
- Peticiones sin estado; el estado cliente se limita a necesidades de UI.

### Arquitectura Frontend
- Framework: React + Vite + TypeScript.
- Estilos: TailwindCSS.
- Estado: Zustand para estado global ligero (favoritos, toast).
- Datos/caché: TanStack Query (PokeAPI).
- Tests: Vitest + Testing Library.
- PWA: vite-plugin-pwa con Workbox (Network First para PokeAPI).

### Estructura del Proyecto
```
src/
├── app/                  # Capa de aplicación (providers, contexto de tema, App, ErrorBoundary, main, estilos globales, tipos)
├── entities/
│   ├── favorites/        # Slice de favoritos: model (store persistido)
│   └── pokemon/          # Slice de Pokemon: types y model (mappers)
├── features/
│   └── pokemon/          # Un slice: api (pokemonApi), model (hooks), ui (card, lista, modal)
├── pages/
│   └── pokedex/          # Un slice: model (notFoundRoute), ui (PokedexPage, NotFoundSection)
└── shared/               # api (el único cliente HTTP), ui (primitivas), utils (cn, typeBadge, audio, toast, tema, requestError), test (setup)
```

### Datos y API
- API externa: PokeAPI (endpoints de solo lectura mediante GET).
- Todas las peticiones pasan por el cliente de `shared/api` —el único módulo que llama a `fetch`—, con un plazo que las aborta y el `HttpError` que lee `classifyRequestError`.
- El Query Provider centraliza caché, tiempos de frescura, reintentos y los toasts de error globales (mediante el handler `onError` de `QueryCache`).
- Las peticiones fallidas se clasifican en un único sitio (`shared/utils/requestError.ts`: red, tiempo agotado, no encontrado u otro). Los toasts globales, la política de reintentos (un 404 nunca se reintenta) y los mensajes de error en pantalla se basan en esa clasificación.
- Esta guía evita duplicar listados de endpoints; ver README para ejemplos y el código en `features/pokemon/api`.

### Gestión de Estado
- Mantén el estado global al mínimo (favoritos, toasts).
- Deriva el resto del estado desde el servidor (TanStack Query) o props.

### PWA y Caché
- Estrategia Network First para `https://pokeapi.co/api/v2/` con caché de respaldo.
- Assets estáticos cacheados con Workbox; ver `vite.config.ts` para detalles.

### Vista previa social y salida legible por agentes
- Los crawlers y las plataformas sociales leen `index.html` sin ejecutar React. Las etiquetas Open Graph y Twitter estáticas viven ahí, y el tooling de build en `tooling/agent-files/` las reescribe con la URL absoluta de producción.
- La URL del sitio tiene una única fuente en `tooling/agent-files/site.ts`.
- El build emite `404.html` (con `<meta name="robots" content="noindex" />` para que el alojamiento estático sirva rutas desconocidas con HTTP 404), `llms.txt`, `robots.txt` y `sitemap.xml`. El sitemap solo lista `/`, porque la app no tiene subpáginas servidas desde el servidor.
- `public/og-cover.png` es la imagen social PNG de 1200×630; los tests cruzan su tipo y tamaño declarados con el fichero real.

## 📚 Tests
- Tests unitarios e integrados con Vitest + Testing Library.
- Entorno JSDOM para los tests de la app y entorno Node para los tests de tooling que verifican los ficheros emitidos y el plugin de Vite.

## 🔒 Seguridad y Accesibilidad
- Sin credenciales ni claves privadas; uso de API pública y de solo lectura.
- Accesibilidad cuidada (combobox ARIA en búsqueda, evitar controles anidados).

## 🧭 Convenciones
- TypeScript en modo estricto.
- Exportaciones con nombre para componentes y hooks.
- CSS utility-first; extraer UI compartida a `shared/ui`.
- Las fronteras de Feature-Sliced Design son reglas de lint: `pnpm lint` falla ante un import entre capas prohibido, un import a un slice hermano, un import relativo que sale de su slice o un import que salta el `index.ts` de un slice.

---

## 🚫 Aviso Legal

**© 2026 Gonzalo Martínez García. Todos los derechos reservados.**

Este software es **propietario** y se proporciona **exclusivamente para fines de evaluación**.
- **Queda estrictamente prohibida la copia**, modificación, distribución o uso no autorizado de este software por cualquier medio.
- **No se permite el uso personal para otros portafolios.**
- Ver el archivo [LICENSE](../../LICENSE) para los términos y condiciones completos.

---

**Desarrollado por Gonzalo Martínez García**  
*Full Stack Developer | Software Engineering & Innovation*
