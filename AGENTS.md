# AGENTS.md — Pokédex

## Project Identity
| Property | Value |
| --- | --- |
| Stack | React, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Vitest, pnpm |
| Architecture | Feature-oriented React frontend, described in `ARCHITECTURE.md` |
| Purpose | Browser-first Pokédex with search, filters, favorites, evolutions and PWA installability |

## Where each rule lives

| Subject | Document |
| --- | --- |
| What the app is, what it ships and how to start a clone | `README.md` |
| Frontend architecture, state and testing shape | `ARCHITECTURE.md` |
| Local development, build, deployment, social preview and agent-readable output | `OPERATIONS.md` |
| Day-to-day contribution rules for this repository | this file |

## Quality Baseline

- TypeScript stays strict.
- `pnpm test` and `pnpm build` must pass before reporting a change as done.
- Social preview and agent-readable files are part of the product surface: changes to site URL, cover image, metadata or emitted files update their tests in the same change.
- Do not add dependencies or external services without the owner's confirmation.
- Generated output in `dist/` is never committed.

## Development Workflow

```bash
pnpm dev
pnpm test
pnpm build
pnpm preview
```

## Project Conventions

- `index.html` is the only HTML crawlers read without running the app; the build tooling under `tooling/agent-files/` owns its static social preview and the emitted `llms.txt`, `robots.txt` and `sitemap.xml`.
- The live production address is a single source in `tooling/agent-files/site.ts`.
- The social cover is `public/og-cover.png`, rendered from `tooling/og-cover.html` with headless Edge at 1200×630.
- Root routes only: the sitemap lists `/` alone, because the app has no server-rendered subpages.
