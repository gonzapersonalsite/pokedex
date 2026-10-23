import { useQueries } from '@tanstack/react-query'
import { mapPokemonFromApi, type Pokemon } from '@/entities/pokemon'
import { pokemonApi } from '../api/pokemonApi'

export type FavoritePokemonStatus = 'pending' | 'error' | 'success'

export interface FavoritePokemonResult {
  list: Pokemon[]
  status: FavoritePokemonStatus
  error: unknown
}

export function useFavoritePokemon(favorites: readonly number[]): FavoritePokemonResult {
  const queries = useQueries({
    queries: favorites.map((id) => ({
      queryKey: ['pokemon', 'details', id],
      queryFn: ({ signal }: { signal: AbortSignal }) => pokemonApi.byIdOrName(id, { signal }),
      select: mapPokemonFromApi,
    })),
  })

  const status: FavoritePokemonStatus = queries.some((query) => query.status === 'error')
    ? 'error'
    : queries.some((query) => query.status === 'pending')
      ? 'pending'
      : 'success'

  return {
    list: queries.flatMap((query) => (query.data ? [query.data] : [])),
    status,
    error: queries.find((query) => query.error)?.error ?? null,
  }
}
