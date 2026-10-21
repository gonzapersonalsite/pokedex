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
- Typecheck: `pnpm run typecheck`
- Format check: `pnpm run format:check`
- Canonical gates: `python verify.py` (runs all 9 repository and product gates declared in `gates.txt`)
- Git hooks: `git config core.hooksPath .githooks` (`commit-msg` validates commit messages and `pre-push` refuses to push anything but HEAD or with uncommitted/untracked files and runs `python -I verify.py`)

## 🧪 Testing
- Vitest + Testing Library
- Environment: jsdom
- Setup file: `src/shared/test/setup.ts`

## 📦 Build
- `pnpm build`
- Output: `dist/` (static assets)
- The Vite build rewrites the static social preview in `index.html` and emits `404.html`, `llms.txt`, `robots.txt` and `sitemap.xml`.

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

## 🎨 Local Seed Artwork & PWA Icons Recipe
- First-page Pokémon (`1`–`24`): generated from PokeAPI official artwork (`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`, native `475×475` RGBA) using Python `Pillow 13.0.0`:
  - `public/pokemon/{id}.webp`: native `475×475` RGBA (`format="WEBP", quality=75, alpha_quality=80, method=4`).
  - `public/pokemon/{id}-256.webp`: resized `256×256` RGBA (`Image.Resampling.LANCZOS`, `format="WEBP", quality=75, alpha_quality=80, method=4`).
- PWA manifest icons: resized from the RGBA Pokéball master with `Pillow 13.0.0` (`Image.Resampling.LANCZOS`, `quantize(colors=256, method=Image.Quantize.FASTOCTREE)`, `format="PNG", optimize=True`):
  - `public/favicon.png`: `192×192` PNG (`5,789` bytes).
  - `public/pokeball.png`: `512×512` PNG (`21,276` bytes).

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
