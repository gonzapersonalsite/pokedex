import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { idFromUrl } from '@/entities/pokemon'
import { loadTypeIndex, summarizeListedPage, typeResourceQuery } from './typeIndex'

const PAGE_SIZE = 24

/** Pokémon references for a type (ids + names) used for pagination. */
export function useTypeRefs(typeName: string | null) {
  return useQuery({
    ...typeResourceQuery(typeName ?? ''),
    select: (typeData) =>
      typeData.pokemon.map((p) => ({
        id: idFromUrl(p.pokemon.url),
        name: p.pokemon.name,
      })),
    enabled: !!typeName && typeName.length > 0,
  })
}

/** Paginated Pokémon list by type (infinite scroll), built from the type index. */
export function usePokemonListByType(typeName: string | null, refs: { id: number; name: string }[]) {
  const queryClient = useQueryClient()
  return useInfiniteQuery({
    queryKey: ['pokemon', 'byType', typeName, refs.length],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam as number
      const typeIndex = await loadTypeIndex(queryClient)
      return {
        list: await summarizeListedPage(queryClient, refs.slice(start, start + PAGE_SIZE), typeIndex),
        nextOffset: start + PAGE_SIZE,
        hasMore: start + PAGE_SIZE < refs.length,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    enabled: !!typeName && refs.length > 0,
  })
}
