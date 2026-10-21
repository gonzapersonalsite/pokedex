import { useQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'

/** Cached list of all Pokémon names + IDs for search suggestions. */
export function usePokemonNames(enabled = true) {
  return useQuery({
    queryKey: ['pokemon', 'allNames'],
    queryFn: ({ signal }) => pokemonApi.allNames({ signal }),
    staleTime: 1000 * 60 * 60,
    enabled,
  })
}
