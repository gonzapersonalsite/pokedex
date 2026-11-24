---
title: La primera visita sigue el tema del sistema y solo se guarda la elección manual
state: confirmed
date: 2026-11-24
domain: interface
phase: none
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

Decidido por el agente bajo la delegación del dueño («No quiero deuda de ningun tipo»,
«Dejo a tu preferencia recomendados»), verificado en
`#2026-11-24-interface-decisions-closed-before-redesign` y cubierto por
`ThemeProvider.test.tsx`, `themeContext.test.ts` y `PokedexPage.test.ts`.

## Refutación

En contra: guardar el tema del sistema en la primera visita fija la apariencia desde ese
momento aunque cambie el entorno más tarde. Se mantiene: seguir al sistema hasta una
acción explícita evita fijar preferencias sin permiso y mantiene sincronizada cada pestaña;
los colores y contrastes de la paleta esperan al rediseño
(`#choices-of-look-wait-for-the-visual-redesign`).
