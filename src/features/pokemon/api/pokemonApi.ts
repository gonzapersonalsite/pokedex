import type {
  PokeApiPaginated,
  PokeApiPokemonListItem,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiEvolutionChain,
  PokeApiType,
} from '@/entities/pokemon'
import { requestJson } from '@/shared/api'

const BASE = 'https://pokeapi.co/api/v2'

type FetchOpts = { friendly404?: string; signal?: AbortSignal }

const fetchApi = <T>(url: string, opts?: FetchOpts): Promise<T> =>
  requestJson<T>(url, { signal: opts?.signal, notFoundMessage: opts?.friendly404 })

export const pokemonApi = {
  /** Paginated list (offset/limit) for infinite scroll */
  list(params: { offset: number; limit: number }, options?: { signal?: AbortSignal }) {
    const { offset, limit } = params
    const url = `${BASE}/pokemon?offset=${offset}&limit=${limit}`
    return fetchApi<PokeApiPaginated<PokeApiPokemonListItem>>(url, { signal: options?.signal })
  },

  /** Pokémon details by ID or name */
  byIdOrName(idOrName: string | number, options?: { signal?: AbortSignal }) {
    const url = `${BASE}/pokemon/${idOrName}`
    return fetchApi<PokeApiPokemon>(url, {
      friendly404: 'There is no Pokémon with that name or ID.',
      signal: options?.signal,
    })
  },

  /** Lists all Pokémon (name + id) for search suggestions (up to ~1300). */
  async allNames(options?: { signal?: AbortSignal }): Promise<{ name: string; id: number }[]> {
    const res = await fetchApi<PokeApiPaginated<PokeApiPokemonListItem>>(`${BASE}/pokemon?limit=2000`, {
      signal: options?.signal,
    })
    return res.results.map((r) => {
      const id = parseInt(r.url.replace(/.*\/(\d+)\/$/, '$1'), 10)
      return { name: r.name, id }
    })
  },

  /** Species resource (for evolution_chain URL) */
  species(idOrName: string | number, options?: { signal?: AbortSignal }) {
    const url = `${BASE}/pokemon-species/${idOrName}`
    return fetchApi<PokeApiSpecies>(url, { signal: options?.signal })
  },

  /** Evolution chain by chain ID (trailing number in URL) */
  evolutionChain(chainId: number, options?: { signal?: AbortSignal }) {
    const url = `${BASE}/evolution-chain/${chainId}`
    return fetchApi<{ id: number; chain: PokeApiEvolutionChain['chain'] }>(url, { signal: options?.signal })
  },

  /** All Pokémon types (for the type filter) */
  types(options?: { signal?: AbortSignal }) {
    const url = `${BASE}/type?limit=100`
    return fetchApi<PokeApiPaginated<{ name: string; url: string }>>(url, { signal: options?.signal })
  },

  /** Type by ID or name (includes the list of Pokémon of that type) */
  typeByIdOrName(idOrName: string | number, options?: { signal?: AbortSignal }) {
    const url = `${BASE}/type/${idOrName}`
    return fetchApi<PokeApiType>(url, { signal: options?.signal })
  },
}
