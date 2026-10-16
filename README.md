# Pokédex

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=333)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-8A6A4B)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-3A7D44)](https://github.com/vite-pwa/vite-plugin-pwa)
[![License: Evaluation Only](https://img.shields.io/badge/License-Evaluation--Only-red)](LICENSE)

🇬🇧 English | [🇪🇸 Español](docs/es/README.md)

Modern Pokédex built with React + Vite + TypeScript. It uses Feature-Sliced architecture and a container/presentational split. Data fetching with TanStack Query, state with Zustand, styling with Tailwind, icons with Heroicons. Includes a global toast system and a PWA.

**Live demo:** [pokedex-pokeapi-gonzalo.vercel.app](https://pokedex-pokeapi-gonzalo.vercel.app/)

## Features
- Infinite scroll list with type filter.
- Favorites: toggle in cards and details, and a “Favorites” filter to list only your saved Pokémon.
- Search by name or ID with centered loading feedback.
- Details modal with evolution chain and intra-modal navigation by clicking evolutions.
- Global toast notifications (top-right, below the navbar).
- PWA build.

## Getting Started
- Install: `pnpm install --frozen-lockfile --ignore-scripts`
- Dev: `pnpm dev`
- Test: `pnpm test`
- Build: `pnpm build`
- Preview: `pnpm preview`

## Tech Stack
- React, TypeScript, Vite
- TanStack Query, Zustand (persist), TailwindCSS, Heroicons
- Vitest, Testing Library

## Documentation
- [Architecture Guide](ARCHITECTURE.md)
- [Operations Guide](OPERATIONS.md)

## Social Preview & Agent Files
- Static Open Graph and Twitter tags are written into `index.html` by the build tooling in `tooling/agent-files/`.
- `public/og-cover.png` is the social preview image (1200×630 PNG), rendered from `tooling/og-cover.html`.
- The build also emits `llms.txt`, `robots.txt` and `sitemap.xml` for the production site.

## API Endpoints (PokeAPI)
- `GET https://pokeapi.co/api/v2/pokemon?offset=&limit=`
- `GET https://pokeapi.co/api/v2/pokemon/:id|:name`
- `GET https://pokeapi.co/api/v2/pokemon-species/:id|:name`
- `GET https://pokeapi.co/api/v2/evolution-chain/:id`
- `GET https://pokeapi.co/api/v2/type`
- `GET https://pokeapi.co/api/v2/type/:id|:name`

## Accessibility
- Search input implemented as a proper ARIA combobox with a controlled listbox.
- Cards avoid nested interactive controls.

## Responsive
Mobile-first layout with sticky header and adaptive modal.

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
