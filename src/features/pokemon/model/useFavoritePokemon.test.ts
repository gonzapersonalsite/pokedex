import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PokeApiPokemon } from '@/entities/pokemon'
import { useFavoritePokemon } from './useFavoritePokemon'

const BASE = 'https://pokeapi.co/api/v2'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  return {
    queryClient,
    wrapper: function Wrapper(props: { children: React.ReactNode }) {
      return createElement(QueryClientProvider, { client: queryClient }, props.children)
    },
  }
}

function rawPokemon(id: number, name: string, type: string): PokeApiPokemon {
  return {
    id,
    name,
    height: 7,
    weight: 69,
    sprites: {
      front_default: `https://example.com/${id}.png`,
      front_shiny: null,
      other: { 'official-artwork': { front_default: `https://example.com/${id}-art.png` } },
    },
    types: [{ slot: 1, type: { name: type, url: `${BASE}/type/1/` } }],
    species: { name, url: `${BASE}/pokemon-species/${id}/` },
    moves: [],
  }
}

const pikachu = rawPokemon(25, 'pikachu', 'electric')
const bulbasaur = rawPokemon(1, 'bulbasaur', 'grass')

function jsonResponse(body: unknown) {
  return { ok: true, json: () => Promise.resolve(body) } as Response
}

describe('useFavoritePokemon', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('reuses the details cache without fetching a favorite that is already loaded', async () => {
    const fetchMock = vi.mocked(fetch)
    const { queryClient, wrapper } = createWrapper()
    queryClient.setQueryData(['pokemon', 'details', 25], pikachu)

    const { result } = renderHook(() => useFavoritePokemon([25]), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('success'))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.list).toEqual([expect.objectContaining({ id: 25, name: 'pikachu', types: ['electric'] })])
  })

  it('fetches only the favorites missing from the details cache', async () => {
    const fetchMock = vi.mocked(fetch)
    const { queryClient, wrapper } = createWrapper()
    queryClient.setQueryData(['pokemon', 'details', 25], pikachu)
    fetchMock.mockResolvedValueOnce(jsonResponse(bulbasaur))

    const { result } = renderHook(() => useFavoritePokemon([25, 1]), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('success'))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/pokemon/1`, expect.anything())
    expect(result.current.list.map((pokemon) => pokemon.id)).toEqual([25, 1])
  })

  it('does not fetch when there are no favorites to load', async () => {
    const fetchMock = vi.mocked(fetch)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useFavoritePokemon([]), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.list).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
