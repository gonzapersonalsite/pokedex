import { useQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'

/** Lista de todos los nombres + id para sugerencias de búsqueda. Se cachea. */
export function usePokemonNames() {
  return useQuery({
    queryKey: ['pokemon', 'allNames'],
    queryFn: ({ signal }) => pokemonApi.allNames({ signal }),
    staleTime: 1000 * 60 * 60,
  })
}
