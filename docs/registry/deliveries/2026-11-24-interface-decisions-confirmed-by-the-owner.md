---
title: El dueño confirma por delegación las once decisiones de interfaz
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** producto. En un turno posterior a
`#2026-11-24-design-guide-aligned-with-code-and-template`, con las refutaciones
ya escritas, el dueño delegó su revisión: «si son correctas las decisiones por
mi apruebalas y no las dejes en provisionales» y «te estoy cediendo deicisiones
que entran ya confirmados». No abre ni cierra ninguna fase.

**Qué cambió.** Las once decisiones `provisional` de interfaz pasan a
`confirmed`, sin `criterion`, y cada una dice que se confirmó por delegación del
dueño: `#focus-is-always-visible`, `#search-is-a-combobox-that-keeps-the-focus`,
`#linking-ids-come-from-use-id`, `#external-text-never-widens-the-page`,
`#states-are-said-with-words-and-roles`, `#one-colour-table-per-pokemon-type`,
`#credits-follow-the-colour-scheme`,
`#first-visit-stores-the-system-theme-as-a-choice`,
`#reduced-motion-covers-only-part-of-the-animations`,
`#pokemon-details-dialog-overflows-short-windows` y
`#narrow-windows-large-text-and-control-names-hold`. El agente releyó cada
refutación con el código delante y ninguna pide cambiar lo decidido: lo que
señalan (el aspecto del foco, la paleta, la cabecera fija en pantallas
pequeñas) es aspecto y espera a `#choices-of-look-wait-for-the-visual-redesign`.
Ningún código cambia.

**Cómo se verificó.** No hay test nuevo: no cambia comportamiento. Las puertas
del tablero, sobre este contenido: ver «Puertas».

**Puertas.** `./dev verify` completo antes del commit, en verde; la verificación
del commit es la del hook `pre-push`.

**Pendiente.** Nada.
