import { useQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import { mapTypeFromApi, type TypeOption } from '@/entities/pokemon'

const NON_POKEMON_TYPES = new Set(['unknown', 'shadow', 'stellar'])

const DEFAULT_TYPES: TypeOption[] = [
  { id: 1, name: 'normal' },
  { id: 2, name: 'fighting' },
  { id: 3, name: 'flying' },
  { id: 4, name: 'poison' },
  { id: 5, name: 'ground' },
  { id: 6, name: 'rock' },
  { id: 7, name: 'bug' },
  { id: 8, name: 'ghost' },
  { id: 9, name: 'steel' },
  { id: 10, name: 'fire' },
  { id: 11, name: 'water' },
  { id: 12, name: 'grass' },
  { id: 13, name: 'electric' },
  { id: 14, name: 'psychic' },
  { id: 15, name: 'ice' },
  { id: 16, name: 'dragon' },
  { id: 17, name: 'dark' },
  { id: 18, name: 'fairy' },
]

/**
 * Types offered by the type filter. Types without any Pokémon (PokeAPI lists Shadow,
 * Stellar and Unknown) are left out, since selecting them could only show an empty list.
 */
export function useTypes() {
  return useQuery({
    queryKey: ['pokemon', 'types'],
    queryFn: async ({ signal }) => {
      const res = await pokemonApi.types({ signal })
      return res.results
        .filter((t) => !NON_POKEMON_TYPES.has(t.name))
        .map((t, index) => {
          const mapped = mapTypeFromApi(t)
          return mapped.id ? mapped : { id: index + 1, name: mapped.name }
        })
    },
    placeholderData: DEFAULT_TYPES,
    staleTime: 1000 * 60 * 60,
  })
}
