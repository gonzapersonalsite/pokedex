import { queryOptions, type QueryClient } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import {
  buildTypeIndex,
  mapPokemonFromApi,
  summarizeListedPokemon,
  summarizePokemon,
  type PokemonSummary,
  type TypeIndex,
} from '@/entities/pokemon'
import { typesQuery } from './useTypes'

const TYPE_DATA_STALE_MS = 1000 * 60 * 60

/** A type resource, shared by the type filter and the type index so each type is fetched once. */
export function typeResourceQuery(typeName: string) {
  return queryOptions({
    queryKey: ['pokemon', 'type', typeName],
    queryFn: ({ signal }) => pokemonApi.typeByIdOrName(typeName, { signal }),
    staleTime: TYPE_DATA_STALE_MS,
  })
}

/** The types of every Pokémon, read from the type resources rather than from one detail per Pokémon. */
export function loadTypeIndex(queryClient: QueryClient): Promise<TypeIndex> {
  return queryClient.fetchQuery({
    queryKey: ['pokemon', 'typeIndex'],
    queryFn: async () => {
      const types = await queryClient.ensureQueryData(typesQuery)
      const resources = await Promise.all(
        types.map((type) => queryClient.ensureQueryData(typeResourceQuery(type.name))),
      )
      return buildTypeIndex(resources)
    },
    staleTime: TYPE_DATA_STALE_MS,
  })
}

/**
 * The cards of a page of listed Pokémon. A Pokémon the type index does not know, one PokeAPI listed
 * after the index was read, falls back to its detail, which the details cache keeps for the modal.
 */
export function summarizeListedPage(
  queryClient: QueryClient,
  listed: ReadonlyArray<{ id: number; name: string }>,
  typeIndex: TypeIndex,
): Promise<PokemonSummary[]> {
  return Promise.all(
    listed.map(async (pokemon) => {
      const summary = summarizeListedPokemon(pokemon, typeIndex)
      if (summary) return summary
      const detail = await queryClient.ensureQueryData({
        queryKey: ['pokemon', 'details', pokemon.id],
        queryFn: ({ signal }) => pokemonApi.byIdOrName(pokemon.id, { signal }),
      })
      return summarizePokemon(mapPokemonFromApi(detail))
    }),
  )
}
