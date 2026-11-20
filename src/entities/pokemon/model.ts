import type { PokeApiPokemon, PokeApiEvolutionChainLink, PokeApiType } from './types'

/** What a list card shows: identity, artwork and types */
export interface PokemonSummary {
  id: number
  name: string
  image: string
  types: string[]
}

/** Domain model: a normalized Pokémon with everything its detail view shows */
export interface Pokemon extends PokemonSummary {
  height: number
  weight: number
  imageShiny: string | null
  speciesUrl: string
  moves: string[]
}

/** Types of every Pokémon the type resources list, in slot order, keyed by Pokémon ID */
export type TypeIndex = ReadonlyMap<number, readonly string[]>

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
const OFFICIAL_ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
/** Forms PokeAPI publishes no artwork for, neither official nor sprite, so a card asks for none. */
const POKEMON_WITHOUT_ARTWORK: ReadonlySet<number> = new Set([10264, 10266, 10268, 10270])
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

/** PokeAPI's official artwork for a Pokémon ID, published at a path derived from the ID alone. */
export function officialArtworkUrl(id: number): string {
  return `${OFFICIAL_ARTWORK_BASE}/${id}.png`
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

/** Indexes the types each type resource lists, ordering a Pokémon's types by their slot. */
export function buildTypeIndex(types: readonly PokeApiType[]): TypeIndex {
  const slotted = new Map<number, Array<{ slot: number; name: string }>>()
  for (const type of types) {
    for (const entry of type.pokemon) {
      const id = idFromUrl(entry.pokemon.url)
      const known = slotted.get(id) ?? []
      known.push({ slot: entry.slot, name: type.name })
      slotted.set(id, known)
    }
  }
  return new Map(
    [...slotted].map(([id, entries]) => [id, entries.sort((a, b) => a.slot - b.slot).map((entry) => entry.name)]),
  )
}

/** The card of a listed Pokémon from the type index, or null when the index does not know the Pokémon. */
export function summarizeListedPokemon(
  listed: { id: number; name: string },
  typeIndex: TypeIndex,
): PokemonSummary | null {
  const types = typeIndex.get(listed.id)
  if (!types) return null
  return {
    id: listed.id,
    name: listed.name,
    image: POKEMON_WITHOUT_ARTWORK.has(listed.id)
      ? ''
      : resolvePokemonArtwork(listed.id, officialArtworkUrl(listed.id)),
    types: [...types],
  }
}

/** The card of a Pokémon whose full detail is known. */
export function summarizePokemon(pokemon: Pokemon): PokemonSummary {
  return { id: pokemon.id, name: pokemon.name, image: pokemon.image, types: pokemon.types }
}
