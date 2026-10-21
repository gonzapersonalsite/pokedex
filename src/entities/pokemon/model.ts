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

export const SEED_POKEMON_MAX_ID = 24
export const POKEMON_CARD_IMAGE_SIZES = '(min-width: 1280px) 256px, (min-width: 640px) 280px, calc(100vw - 68px)'

function isSeedPokemonId(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= SEED_POKEMON_MAX_ID
}

/** Returns the local 475×475 WebP artwork path for initial seed Pokémon (1–24), or the remote fallback. */
export function resolvePokemonArtwork(id: number, remoteUrl: string): string {
  if (isSeedPokemonId(id)) {
    return `/pokemon/${id}.webp`
  }
  return remoteUrl
}

/** Returns the responsive 256w/475w WebP srcset for initial seed Pokémon (1–24), or undefined outside the seed range. */
export function resolvePokemonArtworkSrcSet(id: number): string | undefined {
  if (isSeedPokemonId(id)) {
    return `/pokemon/${id}-256.webp 256w, /pokemon/${id}.webp 475w`
  }
  return undefined
}

export function mapPokemonFromApi(api: PokeApiPokemon): Pokemon {
  const remoteImage = api.sprites.other?.['official-artwork']?.front_default ?? api.sprites.front_default ?? ''
  const image = resolvePokemonArtwork(api.id, remoteImage)
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

export function mapTypeFromApi(api: PokeApiType | { id?: number; name: string; url?: string }): TypeOption {
  const id = typeof api.id === 'number' ? api.id : 'url' in api && api.url ? idFromUrl(api.url) : 0
  return { id, name: api.name }
}
