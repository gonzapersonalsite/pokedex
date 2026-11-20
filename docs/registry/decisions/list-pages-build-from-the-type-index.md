---
title: Las páginas de la lista se construyen con el índice de tipos, sin el detalle de cada Pokémon
state: confirmed
date: 2026-11-20
domain: pokeapi
phase: none
---
**Una página de la lista no pide el detalle de ningún Pokémon que el índice de
tipos conozca.** La tarjeta muestra número, nombre, ilustración y tipos, que es
lo que guarda `PokemonSummary`. El número y el nombre llegan con la lista
paginada; la ilustración oficial se publica en una ruta que solo depende del
número (`officialArtworkUrl`); y los tipos salen del índice que
`buildTypeIndex` arma con los recursos de tipo, ordenados por su slot. Esos
recursos son los que el filtro por tipo ya pedía, y la lista y el filtro los
comparten en la caché (`typeResourceQuery`), así que cada uno se pide una vez
por hora de uso. El detalle completo lo pide solo el modal
(`usePokemonDetails`), y un Pokémon que la lista nombra y el índice aún no
conoce cae a su detalle, que queda en la misma caché que lee el modal
(`summarizeListedPage`).

**El presupuesto lo fijó el agente con la carta blanca del dueño**, que pidió
cerrar este frente «si lo recomiendas» y añadió «Tienes carta blanca para
tomar decisiones recuerda no te me pares esperando aprobaciones o
confirmaciones»: una página posterior a la primera hace una sola petición de
lista a PokeAPI y ninguna de detalle. Medido contra PokeAPI, la página 2 eran
24 detalles, 184 KB comprimidos y 7,6 MB de JSON que descomprimir y analizar;
ahora es una petición de 334 B. El índice cuesta, una vez, 19 peticiones (el
listado de tipos y los dieciocho tipos con Pokémon), 48 KB comprimidos y
380 KB de JSON. La medida anterior de este frente contaba el JSON sin
comprimir como si fuera lo transferido; lo caro era también analizarlo.

Las formas para las que PokeAPI no publica ninguna ilustración, ni oficial ni
sprite, son datos en `POKEMON_WITHOUT_ARTWORK`, medidas sobre toda la lista
para que la tarjeta no pida una imagen que no existe; una forma nueva sin
ilustración cae al hueco «No image» de `PokemonCard` cuando su imagen falla.

La alternativa GraphQL de PokeAPI daría lo mismo en una petición, pero es una
API beta con límites de uso propios; bajar el tamaño de página no cambia lo
que cuesta cada Pokémon, y cachear el arte remoto no toca el JSON.
