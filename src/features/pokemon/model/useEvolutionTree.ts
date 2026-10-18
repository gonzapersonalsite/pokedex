import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { pokemonApi } from '../api/pokemonApi'
import { mapEvolutionChain } from '@/entities/pokemon'

/** Evolution tree from the Pokémon ID or name. */
export function useEvolutionTree(pokemonIdOrName: string | number | null) {
  return useQuery({
    queryKey: ['pokemon', 'evolution', pokemonIdOrName],
    queryFn: async ({ signal }) => {
      if (pokemonIdOrName == null) return null
      // Resolve species from the actual Pokémon resource to support alternate forms (mega/gmax) with IDs > 10000.
      // Calling 'pokemon-species/{id}' for 10033 returns 404, whereas 'pokemon/{id}' includes the base species.
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
