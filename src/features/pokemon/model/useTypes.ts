import { useQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import { mapTypeFromApi } from '@/entities/pokemon'

/**
 * Types offered by the type filter. Types without any Pokémon (PokeAPI lists Shadow,
 * Stellar and Unknown) are left out, since selecting them could only show an empty list.
 */
export function useTypes() {
  return useQuery({
    queryKey: ['pokemon', 'types'],
    queryFn: async ({ signal }) => {
      const res = await pokemonApi.types({ signal })
      const types = await Promise.all(res.results.map((t) => pokemonApi.typeByIdOrName(t.name, { signal })))
      return types.filter((t) => t.pokemon.length > 0).map(mapTypeFromApi)
    },
  })
}
