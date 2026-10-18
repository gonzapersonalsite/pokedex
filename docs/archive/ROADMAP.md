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

## F1 — Navegar una lista larga (DONE)

- **Alcance:** que recorrer el scroll infinito no castigue volver atrás.
- **F1.1 Volver arriba — DONE.** Enlace fijo que aparece al bajar y lleva al
  principio de la página; forma y cifra en
  `#return-to-top-is-a-link-to-root-shown-past-400px`. Entrega:
  `#2026-10-19-return-to-top-link`.
- **F1.2 Saltar al contenido — DONE.** Enlace que aparece con el primer Tab y
  lleva el foco a la lista sin cruzar la cabecera; forma y cifra en
  `#skip-link-focuses-main-clear-of-the-sticky-header`. Entrega:
  `#2026-10-19-skip-to-content-link`.
- **Cierre:** por orden del dueño, con las dos partes entregadas y las puertas en
  verde. Los textos de la interfaz van en inglés (`#product-ui-text-is-english`).
