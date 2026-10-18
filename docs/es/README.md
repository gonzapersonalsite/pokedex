# Pokédex

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=333)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-8A6A4B)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-3A7D44)](https://github.com/vite-pwa/vite-plugin-pwa)
[![License: Evaluation Only](https://img.shields.io/badge/License-Evaluation--Only-red)](../../LICENSE)

🇪🇸 Español | [🇬🇧 English](../../README.md)

Pokédex moderna construida con React + Vite + TypeScript. Usa Diseño Feature-Sliced, con las reglas de capas e imports comprobadas por ESLint, y separación contenedor/presentacional. Datos con TanStack Query, estado con Zustand, estilos con Tailwind, iconos con Heroicons. Incluye sistema global de toasts y PWA.

**Demo en directo:** [pokedex-pokeapi-gonzalo.vercel.app](https://pokedex-pokeapi-gonzalo.vercel.app/)

## Funcionalidades
- Lista con scroll infinito y filtro por tipo.
- Favoritos: se pueden alternar en tarjetas y detalle; filtro “Favoritos” para ver solo guardados.
- Búsqueda por nombre o ID con loader centrado.
- Modal de detalles con cadena de evolución y navegación entre evoluciones dentro del modal.
- Notificaciones toast globales (esquina superior derecha, bajo el navbar).
- Build PWA.

## Inicio rápido
- Instalar: `pnpm install --frozen-lockfile --ignore-scripts`
- Hooks: `git config core.hooksPath .githooks`
- Puertas: `python verify.py`
- Desarrollo: `pnpm dev`
- Tests: `pnpm test`
- Lint: `pnpm lint`
- Typecheck: `pnpm run typecheck`
- Comprobación de formato: `pnpm run format:check`
- Compilar: `pnpm build`
- Previsualizar: `pnpm preview`

## Stack
- React, TypeScript, Vite
- TanStack Query, Zustand (persist), TailwindCSS, Heroicons
- Vitest, Testing Library
- ESLint con las reglas de Feature-Sliced Design y un caso por regla

## Documentación
- [Contrato de Arquitectura Feature-Sliced Design](../ARCHITECTURE.md)
- [Guía de Arquitectura](./ARCHITECTURE.md)
- [Guía de Operaciones](./OPERATIONS.md)

## Vista previa social y archivos para agentes
- Las etiquetas Open Graph y Twitter estáticas se escriben en `index.html` desde el tooling de build en `tooling/agent-files/`.
- `public/og-cover.png` es la imagen de vista previa social (PNG 1200×630), renderizada desde `tooling/og-cover.html`.
- El build también emite `llms.txt`, `robots.txt` y `sitemap.xml` para el sitio en producción.

## Endpoints (PokeAPI)
- `GET https://pokeapi.co/api/v2/pokemon?offset=&limit=`
- `GET https://pokeapi.co/api/v2/pokemon/:id|:name`
- `GET https://pokeapi.co/api/v2/pokemon-species/:id|:name`
- `GET https://pokeapi.co/api/v2/evolution-chain/:id`
- `GET https://pokeapi.co/api/v2/type`
- `GET https://pokeapi.co/api/v2/type/:id|:name`

## Accesibilidad
- Búsqueda implementada como combobox ARIA con listbox controlado.
- Tarjetas sin controles interactivos anidados.

## Responsive
Diseño mobile-first con header sticky y modal adaptable.

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
