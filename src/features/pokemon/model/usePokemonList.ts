import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import {
  idFromUrl,
  officialArtworkUrl,
  resolvePokemonArtwork,
  SEED_POKEMON_MAX_ID,
  type PokemonSummary,
} from '@/entities/pokemon'
import { loadTypeIndex, summarizeListedPage } from './typeIndex'

const PAGE_SIZE = SEED_POKEMON_MAX_ID

const buildSeedPokemon = (id: number, name: string, types: string[]): PokemonSummary => ({
  id,
  name,
  image: resolvePokemonArtwork(id, officialArtworkUrl(id)),
  types,
})

export const FIRST_PAGE_POKEMON: PokemonSummary[] = [
  buildSeedPokemon(1, 'bulbasaur', ['grass', 'poison']),
  buildSeedPokemon(2, 'ivysaur', ['grass', 'poison']),
  buildSeedPokemon(3, 'venusaur', ['grass', 'poison']),
  buildSeedPokemon(4, 'charmander', ['fire']),
  buildSeedPokemon(5, 'charmeleon', ['fire']),
  buildSeedPokemon(6, 'charizard', ['fire', 'flying']),
  buildSeedPokemon(7, 'squirtle', ['water']),
  buildSeedPokemon(8, 'wartortle', ['water']),
  buildSeedPokemon(9, 'blastoise', ['water']),
  buildSeedPokemon(10, 'caterpie', ['bug']),
  buildSeedPokemon(11, 'metapod', ['bug']),
  buildSeedPokemon(12, 'butterfree', ['bug', 'flying']),
  buildSeedPokemon(13, 'weedle', ['bug', 'poison']),
  buildSeedPokemon(14, 'kakuna', ['bug', 'poison']),
  buildSeedPokemon(15, 'beedrill', ['bug', 'poison']),
  buildSeedPokemon(16, 'pidgey', ['normal', 'flying']),
  buildSeedPokemon(17, 'pidgeotto', ['normal', 'flying']),
  buildSeedPokemon(18, 'pidgeot', ['normal', 'flying']),
  buildSeedPokemon(19, 'rattata', ['normal']),
  buildSeedPokemon(20, 'raticate', ['normal']),
  buildSeedPokemon(21, 'spearow', ['normal', 'flying']),
  buildSeedPokemon(22, 'fearow', ['normal', 'flying']),
  buildSeedPokemon(23, 'ekans', ['poison']),
  buildSeedPokemon(24, 'arbok', ['poison']),
]

export function usePokemonList(enabled = true) {
  const queryClient = useQueryClient()
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
      const typeIndex = await loadTypeIndex(queryClient)
      const listed = res.results.map((r) => ({ id: idFromUrl(r.url), name: r.name }))
      return {
        list: await summarizeListedPage(queryClient, listed, typeIndex),
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
