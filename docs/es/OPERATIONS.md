# 🛠️ Guía de Operaciones

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=333)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-8A6A4B)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-3A7D44)](https://github.com/vite-pwa/vite-plugin-pwa)
[![License: Evaluation Only](https://img.shields.io/badge/License-Evaluation--Only-red)](../../LICENSE)

🇪🇸 Español | [🇬🇧 English](../../OPERATIONS.md)

Guía de desarrollo local, build, tests, comportamiento PWA y despliegue del proyecto Pokédex.

## 🚀 Desarrollo Local
- Requisitos: una versión LTS actual de Node.js y pnpm.
- Instalar dependencias: `pnpm install --frozen-lockfile --ignore-scripts` (versiones exactas del lockfile, sin scripts de ciclo de vida de las dependencias)
- Arrancar en modo desarrollo: `pnpm dev`
  - Vite sirve en http://localhost:5173
- Previsualizar el build de producción: `pnpm preview`
- Ejecutar tests:
  - `pnpm test` (ejecución única)
  - `pnpm test:watch` (modo watch local)
- Lint: `pnpm lint` (ESLint, sin avisos permitidos)
- Typecheck: `pnpm run typecheck`
- Comprobación de formato: `pnpm run format:check`
- Puertas canónicas: `python verify.py` (ejecuta las 9 puertas del repositorio y del producto declaradas en `gates.txt`)
- Hooks de Git: `git config core.hooksPath .githooks` (`commit-msg` comprueba el mensaje de commit y `pre-push` rechaza empujar algo que no sea HEAD o con cambios sin commitear o ficheros sin versionar y ejecuta `python -I verify.py`)

## 🧪 Tests
- Vitest + Testing Library
- Entorno: jsdom
- Fichero de setup: `src/shared/test/setup.ts`

## 📦 Build
- `pnpm build`
- Salida: `dist/` (assets estáticos)
- El build de Vite reescribe la vista previa social estática de `index.html` y emite `llms.txt`, `robots.txt` y `sitemap.xml`.

## 📱 PWA
- vite-plugin-pwa con autoUpdate y Service Worker en desarrollo.
- Workbox: estrategia Network First para `https://pokeapi.co/api/v2/` con caché de respaldo.
- Probar la PWA localmente:
  1. `pnpm build`
  2. `pnpm preview`
  3. Abre en el navegador y usa “Install App”.

## 🌐 Despliegue
- Vercel despliega en producción cada push a `main`: https://pokedex-pokeapi-gonzalo.vercel.app/
- El build se ejecuta en la integración de Vercel con GitHub; el repositorio no tiene scripts ni workflows de despliegue.
- El resultado de cada despliegue aparece en el commit como el estado `Vercel` de GitHub.

## 🖼️ Vista previa social
- Fuente única de la URL de producción: `tooling/agent-files/site.ts`
- Portada social: `public/og-cover.png` (PNG de 1200×630)
- Plantilla fuente de la portada: `tooling/og-cover.html`
- Las etiquetas estáticas de `index.html` son placeholders para desarrollo; el build las reescribe con la URL absoluta de producción.
- `pnpm test` verifica los ficheros de metadata generados, las dimensiones de la imagen social y que el plugin de Vite esté conectado al build y al servidor de desarrollo reales.

## 🔧 Variables de Entorno
- No se requieren variables para usar PokeAPI.

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
