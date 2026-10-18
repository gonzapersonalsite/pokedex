import { useInfiniteQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import { mapPokemonFromApi } from '@/entities/pokemon'

const PAGE_SIZE = 24

export function usePokemonList() {
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
  })
}
