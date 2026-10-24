---
title: Créditos y aviso legal alcanzables desde la lista infinita
date: 2026-10-24
phase: none
---
**Objetivo y dueño:** producto; mantenimiento de presentación y créditos
solicitado por el dueño. No abre fase: no cambia el modelo, la navegación ni el
scroll infinito. Decisión: `#credits-reachable-from-an-infinite-list`.

**Qué cambió.** La página incorpora un botón flotante `Credits` que abre un
diálogo con la autoría, el rol, los enlaces al portafolio, GitHub y el correo
personal, la atribución a PokéAPI y el aviso de marcas de Pokémon. El mismo
contenido se renderiza en un footer semántico al final de la página. El
contenido vive en `src/pages/pokedex/ui/Credits.tsx`; la página lo monta en
`src/pages/pokedex/ui/PokedexPage.tsx`. La página es una columna flex con
`main` flexible, para que el footer quede al fondo de la ventana también en
estados vacíos (por ejemplo, Favorites sin elementos). Los tests de contenido,
diálogo y apertura desde la página viven en `Credits.test.tsx` y
`PokedexPage.test.ts`. No se añaden dependencias.

**Cómo se verificó.** La ejecución inicial de `python verify.py` terminó con
código 0, nueve puertas en verde y 728 comprobaciones del tablero. La suite de
Vitest pasó de 275 a 286 pruebas con las nuevas comprobaciones.

El test de regresión se vio fallar con el defecto original reintroducido: se
cambió `PORTFOLIO_URL` de `https://mi-portafolio-gonzalo.vercel.app/` a
`https://example.com/` y fallaron los tres checks que fijan el destino
(`Credits.test.tsx` dos veces y `PokedexPage.test.ts` una). Restaurada la URL,
volvieron a verde.

La ejecución final de `python verify.py` terminó con código 0, nueve puertas en
verde y 286 pruebas sin fallos; la compilación y el build también pasaron. La
revisión en navegador del dueño mostró que, con Favorites vacío, el footer
quedaba pegado al contenido en vez de al fondo de la ventana; se corrigió con
la columna flex y el `main` flexible, y se volvieron a pasar las puertas.

**Pendiente.** La decisión queda provisional hasta que el dueño vea el
resultado; entonces se confirma o se corrige. No se ha hecho commit ni push.
