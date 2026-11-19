---
title: Actualización a agentic-scaffold 0.6.0 y migración del registro
date: 2026-11-19
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo, a petición del dueño, que
pidió dejar cada proyecto «correcto y final sin deuda tras todo cambio» y dio
carta blanca: «quiero que dejes tu todo remediado y aprobado y listo sin
deuda, no te cortes o dejes cosas sin hacer por mi, tienes carta blanca».
`templates` publicó `agentic-scaffold` 0.6.0 en el commit `4948119`: el
registro dice lo que vale hoy. Este repositorio lo toma con `upgrade.py` desde
`0bb820d` y migra su registro una vez.

**Qué cambió.**

- **Motor**, de 0.5.0 a 0.6.0: toma `tools/board/board.py`,
  `tools/board/test_board.py`, `tools/board/adopt.py`, `tools/board/README.md`
  y `docs/registry/README.md`, y reescribe `tools/board/MANIFEST.txt` y
  `tools/board/components.txt`. Con él, toda decisión y toda lección declaran
  su `domain`, su cuerpo no lleva fechas, lo que nombran como código existe, y
  lo que deja de gobernar sale por `docs/registry/retired.txt`.
- **A mano, de lo pendiente del plan:** `AGENTS.md` (§5.1 y el glosario),
  `tools/board/exceptions.txt` (la clave `identifier`) y
  `tools/board/limits.txt` toman el diff de la plantilla tal cual; las nueve
  semillas de la plantilla, su versión con dominio; `README.md` es del
  producto y no cambia.
- **Dominios** (`tools/board/domains.txt`): `interface` (navegación,
  accesibilidad, textos y créditos) y `pokeapi` (peticiones, caché y peso),
  más los tres de la plantilla. Cada uno tiene su página en
  `docs/registry/index/`, y el build borró los índices por fase.
- **Salen por el libro:** `product-ui-text-language-is-undecided`, como
  `answered` por `#product-ui-text-is-english`, que deja de citarla; y
  `skip-to-content-link-is-missing`, como `applied` por
  `#2026-10-19-skip-to-content-link`.
- **Reescritas para decir lo que vale hoy:** la del peso de PokeAPI cita la
  entrega de su auditoría en vez de su fecha; volver arriba y saltar al
  contenido dicen que el dueño las confirmó viéndolas funcionar, sin la línea
  fechada; y la decisión de adopción toma el texto de 0.6.0.
- **La provisional de los créditos pasa a `confirmed`** por la delegación del
  dueño citada arriba, como dice su registro: el agente vio en el servidor de
  desarrollo que el botón abre el diálogo con su título accesible y su
  contenido, que `Escape` lo cierra y que el foco vuelve al botón.

**Cómo se verificó.** El árbol de partida estaba limpio. `upgrade.py`
planificó `5ff0149598b5` sin conflictos, `--apply` lo escribió y `--done`
cerró las quince cosas a mano. `board.py check` dio 28 comprobaciones y 0
hallazgos, sin ninguna excepción. `python verify.py` en verde, en la cifra
que dice el commit que lo entrega.

**Pendiente.** Nada de esta parte.
