# 🛠️ Operations Guide

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=333)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-8A6A4B)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-3A7D44)](https://github.com/vite-pwa/vite-plugin-pwa)
[![License: Evaluation Only](https://img.shields.io/badge/License-Evaluation--Only-red)](LICENSE)

🇬🇧 English | [🇪🇸 Español](docs/es/OPERATIONS.md)

Covers local development, build, testing, PWA behavior, and deployment for the Pokédex project.

## 🚀 Local Development
- Prerequisites: a current Node.js LTS release and pnpm.
- Install: `pnpm install --frozen-lockfile --ignore-scripts` (exact lockfile versions, no dependency lifecycle scripts)
- Start dev server: `pnpm dev`
  - Vite serves at http://localhost:5173
- Preview production build: `pnpm preview`
- Run tests:
  - `pnpm test` (single run)
  - `pnpm test:watch` (local watch mode)
- Lint: `pnpm lint` (ESLint, no warning allowed)
- Pre-push hook: `git config core.hooksPath .githooks` (runs `pnpm lint`, `pnpm test`, and `pnpm build` on a clean working tree before pushing)

## 🧪 Testing
- Vitest + Testing Library
- Environment: jsdom
- Setup file: `src/shared/test/setup.ts`

## 📦 Build
- `pnpm build`
- Output: `dist/` (static assets)
- The Vite build rewrites the static social preview in `index.html` and emits `llms.txt`, `robots.txt` and `sitemap.xml`.

## 📱 PWA
- vite-plugin-pwa with autoUpdate and dev SW enabled.
- Workbox: Network First for `https://pokeapi.co/api/v2/` with cache fallback.
- To test PWA locally: build, then `pnpm preview`, and “Install App” in the browser.

## 🌐 Deployment
- Vercel deploys every push to `main` to production: https://pokedex-pokeapi-gonzalo.vercel.app/
- The build runs in Vercel's GitHub integration; the repository has no deploy scripts or workflows.
- Each deployment's result shows up on the commit as the `Vercel` GitHub status.

## 🖼️ Social Preview
- Production URL source: `tooling/agent-files/site.ts`
- Social cover: `public/og-cover.png` (1200×630 PNG)
- Cover source template: `tooling/og-cover.html`
- Static tags in `index.html` are placeholders for development; the build rewrites them with the absolute production URL.
- `pnpm test` verifies the generated metadata files, the social image dimensions, and that the Vite plugin is wired into the real build and dev server.

## 🔧 Environment Variables
- None required for PokeAPI usage.

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
