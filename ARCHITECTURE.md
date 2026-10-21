# 🏗️ Architecture Guide

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=333)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-8A6A4B)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-3A7D44)](https://github.com/vite-pwa/vite-plugin-pwa)
[![License: Evaluation Only](https://img.shields.io/badge/License-Evaluation--Only-red)](LICENSE)

🇬🇧 English | [🇪🇸 Español](docs/es/ARCHITECTURE.md)

This document outlines the architectural patterns, design principles, and technology choices for the Pokédex project.

## 🏗️ Architecture & Principles
- Feature-Sliced Design: the six layers, imports only downwards, and every slice entered through its `index.ts`; the rules are lint rules (`pnpm lint`) with a case per rule in `eslint.config.test.ts`.
- Composition-first UI; container/presentational split where useful.
- Readability and simplicity over abstraction; YAGNI by default.
- Stateless data fetching; client-side state scoped to UI needs.

### Frontend Architecture
- Framework: React + Vite + TypeScript.
- Styling: TailwindCSS.
- State: Zustand for lightweight global state (favorites, toast).
- Data fetching/caching: TanStack Query (PokeAPI).
- Testing: Vitest + Testing Library.
- PWA: vite-plugin-pwa with Workbox (Network First for PokeAPI).

### Project Structure
```
src/
├── app/                  # Application layer (providers, theme context, App, ErrorBoundary, main, global styles, types)
├── entities/
│   ├── favorites/        # Favorites slice: model (persisted store)
│   └── pokemon/          # Pokemon slice: types and model (mappers)
├── features/
│   └── pokemon/          # One slice: api (pokemonApi), model (hooks), ui (card, list, modal)
├── pages/
│   └── pokedex/          # One slice: model (notFoundRoute), ui (PokedexPage, NotFoundSection)
└── shared/               # api (the only HTTP client), ui (primitives), utils (cn, typeBadge, audio, toast, theme, requestError), test (setup)
```

### Data & API
- External API: PokeAPI (read-only GET endpoints).
- Every request goes through the client in `shared/api` — the only module that calls `fetch` — with a deadline that aborts it and the `HttpError` that `classifyRequestError` reads.
- Query Provider centralizes caching, stale time, retries, and global error toasts (through the `QueryCache` `onError` handler).
- Failed requests are classified in one place (`shared/utils/requestError.ts`: network, timeout, not found or other). The global toasts, the retry policy (a 404 is never retried) and the inline error messages all rely on it.
- This guide avoids duplicating endpoint lists; see README for example endpoints and the code in `features/pokemon/api`.

### State Management
- Keep global state minimal (favorites, toasts).
- Derive everything else from server state (TanStack Query) or props.

### PWA & Caching
- Network First strategy for `https://pokeapi.co/api/v2/` with fallback cache.
- Static assets cached via Workbox defaults; see vite.config.ts for details.

### Social Preview & Agent-Readable Output
- Crawlers and social platforms read `index.html` without running React. Static Open Graph and Twitter tags live there, and the build tooling in `tooling/agent-files/` rewrites them with the absolute production URL.
- The site URL is a single source in `tooling/agent-files/site.ts`.
- The build emits `404.html` (with `<meta name="robots" content="noindex" />` so static hosts serve unknown paths with HTTP 404), `llms.txt`, `robots.txt` and `sitemap.xml`. The sitemap lists only `/`, because the app has no server-rendered subpages.
- `public/og-cover.png` is the 1200×630 PNG social preview image; tests cross its declared type and size against the real file.

## 📚 Testing
- Unit and integration tests with Vitest + Testing Library.
- JSDOM environment for app tests; Node environment for build-tooling tests that verify emitted metadata files and the Vite plugin.

## 🔒 Security & Accessibility
- No credentials or private keys; public, read-only API usage.
- Accessibility guidelines applied (combobox ARIA for search, avoid nested interactive controls).

## 🧭 Conventions
- TypeScript strict mode.
- Named exports for components and hooks.
- Utility-first CSS classes; extract shared UI to `shared/ui`.
- The Feature-Sliced Design boundaries are lint rules: `pnpm lint` fails on a cross-layer import, a sibling-slice import, a relative import that leaves its slice, or an import that skips a slice's `index.ts`.

---

## 🚫 Legal Notice

**© 2026 Gonzalo Martínez García. All rights reserved.**

This software is **proprietary** and is provided for **evaluation purposes only**.
- **Unauthorized copying**, modification, distribution, or use of this software, via any medium, is strictly prohibited.
- **Personal use for other portfolios is not allowed.**
- See the [LICENSE](LICENSE) file for full terms and conditions.

---

**Developed by Gonzalo Martínez García**  
*Full Stack Developer | Software Engineering & Innovation*
