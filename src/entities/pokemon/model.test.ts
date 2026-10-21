import { describe, expect, it } from 'vitest'
import {
  idFromUrl,
  mapEvolutionChain,
  mapPokemonFromApi,
  mapTypeFromApi,
  resolvePokemonArtwork,
  resolvePokemonArtworkSrcSet,
  SEED_POKEMON_MAX_ID,
} from './model'

describe('resolvePokemonArtwork', () => {
  it('does_return_local_webp_path_and_srcset_when_id_is_within_the_first_24_seed_pokemon', () => {
    const remote =
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png'

    expect(SEED_POKEMON_MAX_ID).toBe(24)
    expect(resolvePokemonArtwork(1, remote)).toBe('/pokemon/1.webp')
    expect(resolvePokemonArtwork(24, remote)).toBe('/pokemon/24.webp')
    expect(resolvePokemonArtworkSrcSet(1)).toBe('/pokemon/1-256.webp 256w, /pokemon/1.webp 475w')
    expect(resolvePokemonArtworkSrcSet(24)).toBe('/pokemon/24-256.webp 256w, /pokemon/24.webp 475w')
  })

  it('does_return_remote_artwork_url_and_no_srcset_when_id_is_outside_the_seed_range', () => {
    const remote =
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'

    expect(resolvePokemonArtwork(0, remote)).toBe(remote)
    expect(resolvePokemonArtwork(25, remote)).toBe(remote)
    expect(resolvePokemonArtwork(1.5, remote)).toBe(remote)
    expect(resolvePokemonArtwork(151, remote)).toBe(remote)
    expect(resolvePokemonArtworkSrcSet(0)).toBeUndefined()
    expect(resolvePokemonArtworkSrcSet(25)).toBeUndefined()
    expect(resolvePokemonArtworkSrcSet(1.5)).toBeUndefined()
  })
})

describe('mapPokemonFromApi', () => {
  it('does_use_local_webp_artwork_for_seed_pokemon_and_preserve_remote_or_fallback_for_others', () => {
    const bulbasaur = mapPokemonFromApi({
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      sprites: {
        front_default: 'https://example.com/1-front.png',
        front_shiny: 'https://example.com/1-shiny.png',
        other: {
          'official-artwork': {
            front_default: 'https://example.com/1-official.png',
            front_shiny: 'https://example.com/1-official-shiny.png',
          },
        },
      },
      types: [{ slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } }],
      species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
      moves: [{ move: { name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' } }],
    })
    const arbok = mapPokemonFromApi({
      id: 24,
      name: 'arbok',
      height: 35,
      weight: 650,
      sprites: {
        front_default: 'https://example.com/24-front.png',
        front_shiny: null,
      },
      types: [{ slot: 1, type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' } }],
      species: { name: 'arbok', url: 'https://pokeapi.co/api/v2/pokemon-species/24/' },
      moves: [],
    })
    const pikachuSpriteFallback = mapPokemonFromApi({
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      sprites: {
        front_default: 'https://example.com/25-front.png',
        front_shiny: 'https://example.com/25-shiny.png',
      },
      types: [{ slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } }],
      species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
      moves: [],
    })

    expect(bulbasaur.image).toBe('/pokemon/1.webp')
    expect(bulbasaur.imageShiny).toBe('https://example.com/1-official-shiny.png')
    expect(bulbasaur.moves).toEqual(['tackle'])
    expect(arbok.image).toBe('/pokemon/24.webp')
    expect(arbok.imageShiny).toBeNull()
    expect(arbok.moves).toEqual([])
    expect(pikachuSpriteFallback.image).toBe('https://example.com/25-front.png')
    expect(pikachuSpriteFallback.imageShiny).toBe('https://example.com/25-shiny.png')
  })

  it('does_extract_ids_and_map_evolution_chains_and_types', () => {
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species/25/')).toBe(25)
    expect(idFromUrl('invalid-url')).toBe(0)
    expect(
      mapEvolutionChain({
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolves_to: [
          {
            species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
            evolves_to: [],
          },
        ],
      }),
    ).toEqual({
      id: 1,
      name: 'bulbasaur',
      children: [{ id: 2, name: 'ivysaur', children: [] }],
    })
    expect(mapTypeFromApi({ name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' })).toEqual({
      id: 13,
      name: 'electric',
    })
  })
})
