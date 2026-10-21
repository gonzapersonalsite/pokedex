import { useInfiniteQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import { mapPokemonFromApi, type Pokemon } from '@/entities/pokemon'

const PAGE_SIZE = 24
const ARTWORK_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const SPECIES_BASE = 'https://pokeapi.co/api/v2/pokemon-species'

const buildSeedPokemon = (id: number, name: string, types: string[], height: number, weight: number): Pokemon => ({
  id,
  name,
  height,
  weight,
  image: `${ARTWORK_BASE}/${id}.png`,
  imageShiny: `${ARTWORK_BASE}/shiny/${id}.png`,
  types,
  speciesUrl: `${SPECIES_BASE}/${id}/`,
  moves: [],
})

const FIRST_PAGE_POKEMON: Pokemon[] = [
  buildSeedPokemon(1, 'bulbasaur', ['grass', 'poison'], 7, 69),
  buildSeedPokemon(2, 'ivysaur', ['grass', 'poison'], 10, 130),
  buildSeedPokemon(3, 'venusaur', ['grass', 'poison'], 20, 1000),
  buildSeedPokemon(4, 'charmander', ['fire'], 6, 85),
  buildSeedPokemon(5, 'charmeleon', ['fire'], 11, 190),
  buildSeedPokemon(6, 'charizard', ['fire', 'flying'], 17, 905),
  buildSeedPokemon(7, 'squirtle', ['water'], 5, 90),
  buildSeedPokemon(8, 'wartortle', ['water'], 10, 225),
  buildSeedPokemon(9, 'blastoise', ['water'], 16, 855),
  buildSeedPokemon(10, 'caterpie', ['bug'], 3, 29),
  buildSeedPokemon(11, 'metapod', ['bug'], 7, 99),
  buildSeedPokemon(12, 'butterfree', ['bug', 'flying'], 11, 320),
  buildSeedPokemon(13, 'weedle', ['bug', 'poison'], 3, 32),
  buildSeedPokemon(14, 'kakuna', ['bug', 'poison'], 6, 100),
  buildSeedPokemon(15, 'beedrill', ['bug', 'poison'], 10, 295),
  buildSeedPokemon(16, 'pidgey', ['normal', 'flying'], 3, 18),
  buildSeedPokemon(17, 'pidgeotto', ['normal', 'flying'], 11, 300),
  buildSeedPokemon(18, 'pidgeot', ['normal', 'flying'], 15, 395),
  buildSeedPokemon(19, 'rattata', ['normal'], 3, 35),
  buildSeedPokemon(20, 'raticate', ['normal'], 7, 185),
  buildSeedPokemon(21, 'spearow', ['normal', 'flying'], 3, 20),
  buildSeedPokemon(22, 'fearow', ['normal', 'flying'], 12, 380),
  buildSeedPokemon(23, 'ekans', ['poison'], 20, 69),
  buildSeedPokemon(24, 'arbok', ['poison'], 35, 650),
]

export function usePokemonList(enabled = true) {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'list'],
    queryFn: async ({ pageParam = 0, signal }) => {
      const res = await pokemonApi.list(
        {
          offset: pageParam as number,
          limit: PAGE_SIZE,
        },
        { signal },
      )
      if (
        pageParam === 0 &&
        res.results.length === FIRST_PAGE_POKEMON.length &&
        res.results.every((item, index) => item.name === FIRST_PAGE_POKEMON[index]?.name)
      ) {
        return {
          list: FIRST_PAGE_POKEMON,
          nextOffset: res.next ? PAGE_SIZE : null,
          hasMore: !!res.next,
        }
      }
      const details = await Promise.all(
        res.results.map((r) => {
          const id = r.url.replace(/.*\/(\d+)\/$/, '$1')
          return pokemonApi.byIdOrName(id, { signal })
        }),
      )
      return {
        list: details.map(mapPokemonFromApi),
        nextOffset: res.next ? (pageParam as number) + PAGE_SIZE : null,
        hasMore: !!res.next,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    placeholderData: {
      pages: [{ list: FIRST_PAGE_POKEMON, nextOffset: PAGE_SIZE, hasMore: true }],
      pageParams: [0],
    },
    staleTime: 1000 * 60 * 60,
    enabled,
  })
}
