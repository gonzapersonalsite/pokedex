---
title: Adopt agentic-scaffold, react-vite layer and react-fsd stack
date: 2026-10-18
phase: H0
---
**Adopt agentic-scaffold, react-vite layer and react-fsd stack.**
Unifies `pokedex` onto the canonical `agentic-scaffold` engine,
`layer:react-vite`, and `stack:react-fsd` from `templates` commit
`39bead6c761666ac5f5648e83bf89a4265d07aaf`, following
`#this-repository-uses-the-agentic-scaffold`.

- **Scaffold and hooks:** instantiated `agentic-scaffold` and `layer:react-vite`,
  replacing the legacy `.githooks/pre-push` script with `.githooks/commit-msg`
  (`tools/board/commit_message.py`) and `.githooks/pre-push`
  (`tools/board/pre_push.py`). Per-clone hook activation remains
  `#hook-activation-is-a-per-clone-step`.
- **Formatting and gates:** added `prettier` (`3.9.10`), `.prettierrc.json`, and
  `.prettierignore`, and added the `typecheck`, `format`, and `format:check`
  scripts so all nine gates in `gates.txt` (`board: tests`, `board: build`,
  `board: documents`, `dependencies`, `format`, `lint`, `typecheck`, `tests`,
  `build`) run under `python verify.py`.
- **Stack adoption (`stack:react-fsd`):** synced `eslint.config.js`,
  `eslint-fsd-gaps.js`, `eslint.config.test.ts`, and `tooling/agent-files/*`
  (`generate.ts`, `llmsTxt.ts`, `robotsTxt.ts`, `sitemap.ts` with XML escaping,
  `vitePlugin.ts`, and their tests), forwarded caller abort reasons in
  `src/shared/api/httpClient.ts`, and recorded `stack:react-fsd` in
  `tools/board/components.txt` with product-owned pieces marked `kept`
  (`src/shared/api/httpClient.ts`, `src/shared/api/httpClient.test.ts`,
  `vitest.setup.ts`).
- **Verification:** `python -I verify.py` passes all 9 gates (`0 en rojo`), and
  `upgrade.py` reports 0 pending changes against `templates` `39bead6`.
