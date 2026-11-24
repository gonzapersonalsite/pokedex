---
title: La primera visita sigue el tema del sistema y solo se guarda la elección manual
state: provisional
date: 2026-11-24
domain: interface
phase: none
criterion: Se confirma cuando el dueño relea esta refutación con el trabajo delante y lo diga en un turno posterior.
---
**En la primera visita el tema sigue el esquema del sistema (`prefers-color-scheme`) sin
escribir en `localStorage`.** Mientras no haya una elección manual guardada, la interfaz
cambia automáticamente si el lector cambia el tema del sistema con la página abierta.

- **Solo el botón del encabezado guarda o borra la elección.** `themeChoiceAfterToggle`
  guarda en `localStorage` el tema elegido cuando difiere del sistema y elimina la clave
  cuando coincide para volver a seguirlo.
- **Tolerancia a datos inválidos o bloqueados.** `readThemeChoice` ignora cualquier valor
  que no sea `'light'` ni `'dark'`, y tanto la lectura como la escritura toleran un
  `SecurityError` si el navegador bloquea el almacenamiento.
- **Sincronización entre pestañas.** `ThemeProvider` escucha el evento `storage` y
  actualiza el tema cuando otra pestaña lo cambia. El script de `index.html` lee sin
  escribir antes del primer pintado.

Propuesto por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados»); pasa a confirmada cuando el dueño relea esta
refutación (`#2026-11-24-design-guide-aligned-with-code-and-template`). Su fase es `none`: F0
y F1 están hechas y el rediseño visual todavía no tiene fase. Se verificó en
`#2026-11-24-interface-decisions-closed-before-redesign` y cubierto por
`ThemeProvider.test.tsx`, `themeContext.test.ts` y `PokedexPage.test.ts`.

## Refutación

En contra: borrar la elección cuando coincide con el sistema pierde una
intención. Con el sistema en claro, quien pasa a oscuro y vuelve a claro deja
la clave borrada, y cuando el sistema cambie a oscuro por la noche la página se
pondrá oscura aunque lo último que eligió fue claro. Guardar siempre la
elección lo evitaría, a cambio de dejar de seguir al sistema después de un
solo clic. Se mantiene porque volver al tema que ya enseña el sistema se lee
como «deshacer mi elección», porque así nadie queda atado a un tema por
probar el botón, y porque quien quiera fijar claro con el sistema en claro no
tiene hoy forma de decirlo: si eso importa, la salida es un tercer estado
(«seguir al sistema») en el botón, no guardar siempre.
