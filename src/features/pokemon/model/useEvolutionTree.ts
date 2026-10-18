import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import { mapEvolutionChain } from '@/entities/pokemon'

/** Árbol de evolución a partir del ID o nombre del Pokémon. */
export function useEvolutionTree(pokemonIdOrName: string | number | null) {
  return useQuery({
    queryKey: ['pokemon', 'evolution', pokemonIdOrName],
    queryFn: async ({ signal }) => {
      if (pokemonIdOrName == null) return null
      // Resolver especies a partir del Pokémon real para soportar formas (mega/gmax) con IDs > 10000.
      // La API de 'pokemon-species/{id}' para 10033 da 404, pero el recurso 'pokemon/{id}' incluye la species base.
      const pokemon = await pokemonApi.byIdOrName(pokemonIdOrName as string | number, { signal })
      const species = await pokemonApi.species(pokemon.species.name, { signal })
      const chainUrl = species.evolution_chain.url
      const chainId = parseInt(chainUrl.replace(/.*\/(\d+)\/$/, '$1'), 10)
      const chain = await pokemonApi.evolutionChain(chainId, { signal })
      return mapEvolutionChain(chain.chain)
    },
    enabled: pokemonIdOrName != null && pokemonIdOrName !== '',
    placeholderData: keepPreviousData,
  })
}
