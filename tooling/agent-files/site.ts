export const SITE_URL = 'https://pokedex-pokeapi-gonzalo.vercel.app'

export const SITE_NAME = 'Pokédex'

export const SITE_TITLE = 'Pokédex'

export const SITE_DESCRIPTION =
  'Modern Pokédex built with React, TypeScript and Vite: search Pokémon by name or ID, filter by type, browse evolutions and keep favorites locally in your browser.'

export const COVER_PATH = '/og-cover.png'

export const COVER_ALT =
  'Pokédex: the app name, the tagline “Search Pokémon, types and evolutions” and its stack, React, TypeScript, TanStack Query, Zustand and PWA, over a red and dark interface inspired by a Pokédex.'

export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`
