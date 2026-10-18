/** Tipos de la API PokeAPI (respuestas raw) */
export interface PokeApiPokemonListItem {
  name: string
  url: string
}

export interface PokeApiPaginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PokeApiTypeRef {
  slot: number
  type: { name: string; url: string }
}

export interface PokeApiSprites {
  front_default: string | null
  front_shiny: string | null
  other?: {
    'official-artwork'?: { front_default: string; front_shiny?: string }
    dream_world?: { front_default: string }
  }
}

export interface PokeApiPokemon {
  id: number
  name: string
  height: number
  weight: number
  sprites: PokeApiSprites
  types: PokeApiTypeRef[]
  species: { name: string; url: string }
  moves: Array<{ move: { name: string; url: string } }>
}

export interface PokeApiSpecies {
  id: number
  name: string
  evolution_chain: { url: string }
}

export interface PokeApiEvolutionChainLink {
  species: { name: string; url: string }
  evolves_to: PokeApiEvolutionChainLink[]
}

export interface PokeApiEvolutionChain {
  id: number
  chain: PokeApiEvolutionChainLink
}

export interface PokeApiType {
  id: number
  name: string
  damage_relations?: {
    double_damage_from: Array<{ name: string; url: string }>
    half_damage_from: Array<{ name: string; url: string }>
    no_damage_from: Array<{ name: string; url: string }>
    double_damage_to?: Array<{ name: string; url: string }>
    half_damage_to?: Array<{ name: string; url: string }>
    no_damage_to?: Array<{ name: string; url: string }>
  }
  pokemon: Array<{ pokemon: PokeApiPokemonListItem; slot: number }>
}
