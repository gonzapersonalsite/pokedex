# Archivo del plan del producto — fases cerradas (CERRADO)

Los cuerpos de las fases ya DONE. **Este documento no gobierna nada**: se lee
para saber qué trajo una fase y con qué criterio se cerró, nunca para decidir
trabajo futuro. Manda `../ROADMAP.md`, donde cada fase conserva su cabecera, su
marcador y la lápida que apunta aquí. Solo crece por el final.

## F0 — Línea base de la aplicación Pokédex (DONE)

- **Alcance:** aplicación web Pokédex con scroll infinito, filtro por tipo,
  búsqueda por nombre o ID, modal de detalles con cadena de evolución,
  favoritos locales, notificaciones toast globales, caché PWA con Workbox y
  generación en build de vista previa social y ficheros para agentes
  (llms.txt, robots.txt, sitemap.xml).
- **Gobernanza:** los límites de Feature-Sliced Design viven en
  `../ARCHITECTURE.md` y los hacen cumplir `../../eslint.config.js` y
  `../../eslint-fsd-gaps.js`.
- **Línea base de adopción:** producto existente adoptado bajo el andamio
  compartido y el stack `react-fsd` en
  `#this-repository-uses-the-agentic-scaffold` y verificado en
  `#2026-10-18-adopt-agentic-scaffold-and-react-fsd`. No hay ninguna fase de
  producto abierta actualmente.
