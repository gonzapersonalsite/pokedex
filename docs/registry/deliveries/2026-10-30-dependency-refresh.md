---
title: Actualización de dependencias y alineación del toolchain de pnpm
date: 2026-10-30
phase: none
---
**Objetivo y dueño:** herramienta; mantenimiento autorizado por el dueño tras
la auditoría de dependencias del ecosistema. No abre fase de producto ni cambia
código ejecutable.

**Qué cambió.** `package.json` sube `@tanstack/react-query` a 5.105.0,
`zustand` a 5.0.16, `postcss` a 8.5.32, `vite` a 8.3.5 y `typescript-eslint` a
8.72.1; declara `@testing-library/dom` 10.4.2, el peer que antes resolvía pnpm,
y añade `engines` con el rango del template (`^24.15.0 || >=26.0.0`). El pin de
`packageManager` pasa a pnpm 12.16.1 con su SHA-512, el mismo que ya tenía la
máquina. `pnpm-workspace.yaml` lleva los overrides de seguridad a `fast-uri`
3.1.9, `rollup` 4.66.0, `minimatch` 5.1.9 y `serialize-javascript` 7.1.4,
dentro de la línea que ya estaba fijada. `pnpm-lock.yaml` se regenera con pnpm
12.16.1 y scripts de instalación desactivados.

**Cómo se verificó.** Antes de editar, `python verify.py` sobre
`776837417f9788d3e59160e4407ff46eeeba6891` dio nueve puertas en verde. La
instalación se hizo con `pnpm install --ignore-scripts`; la política global
`ignoreScripts=true` y la puerta `dependencies` restauran después el lock sin
red. Después del cambio, `python verify.py` volvió a dar nueve puertas en
verde: 728 comprobaciones del tablero, 24 comprobaciones documentales y 286
tests de producto sin fallos, con la puerta de dependencias ejecutando pnpm
12.16.1. `pnpm audit` deja un aviso bajo sin parche publicado en
`deepmerge` 4.3.1, que llega por `vite-plugin-pwa > workbox-build >
@rollup/plugin-node-resolve`; solo afecta a la construcción de la PWA. No se
cambió código, configuración de Vite o TypeScript ni tests.

**Pendiente.** TypeScript 7 sigue bloqueado por el peer `<6.1.0` de
`typescript-eslint`; Node 26 y npm 12 son decisiones de toolchain del dueño.
No se toca ninguna dependencia de otros repositorios.
