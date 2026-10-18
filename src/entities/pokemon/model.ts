import type { PokeApiPokemon, PokeApiEvolutionChainLink, PokeApiType } from './types'

/** Domain model: normalized Pokémon for the UI */
export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  image: string
  imageShiny: string | null
  types: string[]
  speciesUrl: string
  moves: string[]
}

/** Evolution tree node */
export interface EvolutionNode {
  name: string
  id: number
  children: EvolutionNode[]
}

/** Type option for filters and listings */
export interface TypeOption {
  id: number
  name: string
}

export function mapPokemonFromApi(api: PokeApiPokemon): Pokemon {
  const image = api.sprites.other?.['official-artwork']?.front_default ?? api.sprites.front_default ?? ''
  const imageShiny = api.sprites.other?.['official-artwork']?.front_shiny ?? api.sprites.front_shiny ?? null
  return {
    id: api.id,
    name: api.name,
    height: api.height,
    weight: api.weight,
    image,
    imageShiny,
    types: api.types.map((t) => t.type.name),
    speciesUrl: api.species.url,
    moves: api.moves ? api.moves.map((m) => m.move.name) : [],
  }
}

/** Extracts numeric ID from a URL like https://pokeapi.co/api/v2/pokemon/123/ */
export function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? parseInt(match[1], 10) : 0
}

export function mapEvolutionChain(chain: PokeApiEvolutionChainLink): EvolutionNode {
  const id = idFromUrl(chain.species.url)
  return {
    id,
    name: chain.species.name,
    children: chain.evolves_to.map(mapEvolutionChain),
  }
}

export function mapTypeFromApi(api: PokeApiType): TypeOption {
  return { id: api.id, name: api.name }
}
