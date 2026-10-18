import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import { mapPokemonFromApi } from '@/entities/pokemon'

const PAGE_SIZE = 24

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? parseInt(match[1], 10) : 0
}

/** Pokémon references for a type (ids + names) used for pagination. */
export function useTypeRefs(typeName: string | null) {
  return useQuery({
    queryKey: ['pokemon', 'typeRefs', typeName],
    queryFn: async ({ signal }) => {
      if (!typeName) return []
      const typeData = await pokemonApi.typeByIdOrName(typeName, { signal })
      return typeData.pokemon.map((p) => ({
        id: idFromUrl(p.pokemon.url),
        name: p.pokemon.name,
      }))
    },
    enabled: !!typeName && typeName.length > 0,
  })
}

/** Paginated Pokémon list by type (infinite scroll). */
export function usePokemonListByType(typeName: string | null, refs: { id: number; name: string }[]) {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'byType', typeName, refs.length],
    queryFn: async ({ pageParam = 0, signal }) => {
      const start = pageParam as number
      const slice = refs.slice(start, start + PAGE_SIZE)
      const details = await Promise.all(slice.map((r) => pokemonApi.byIdOrName(r.id, { signal })))
      return {
        list: details.map(mapPokemonFromApi),
        nextOffset: start + PAGE_SIZE,
        hasMore: start + PAGE_SIZE < refs.length,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    enabled: !!typeName && refs.length > 0,
  })
}
