export interface SearchPartyPokemon {
  readonly id: number
  readonly name: string
  readonly types: readonly string[]
  readonly report: string
  readonly image: string
}

const OFFICIAL_ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

export const SEARCH_PARTY_POKEMON: readonly SearchPartyPokemon[] = [
  {
    id: 54,
    name: 'Psyduck',
    types: ['water'],
    report: 'Confused by the broken URL — using Amnesia!',
    image: `${OFFICIAL_ARTWORK_BASE}/54.png`,
  },
  {
    id: 143,
    name: 'Snorlax',
    types: ['normal'],
    report: 'Sleeping across Route 404 until someone plays the Poké Flute.',
    image: `${OFFICIAL_ARTWORK_BASE}/143.png`,
  },
  {
    id: 25,
    name: 'Pikachu',
    types: ['electric'],
    report: 'Using Flash to light the path back to the Pokédex.',
    image: `${OFFICIAL_ARTWORK_BASE}/25.png`,
  },
  {
    id: 94,
    name: 'Gengar',
    types: ['ghost', 'poison'],
    report: 'Hid this route in the shadow realm with Shadow Ball.',
    image: `${OFFICIAL_ARTWORK_BASE}/94.png`,
  },
  {
    id: 132,
    name: 'Ditto',
    types: ['normal'],
    report: 'Tried to Transform into this page, but no route matched!',
    image: `${OFFICIAL_ARTWORK_BASE}/132.png`,
  },
  {
    id: 151,
    name: 'Mew',
    types: ['psychic'],
    report: 'Used Teleport right before the page could load.',
    image: `${OFFICIAL_ARTWORK_BASE}/151.png`,
  },
]

export function isNotFoundPathname(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '').toLowerCase() || '/'
  return normalized !== '/' && normalized !== '/index.html'
}
