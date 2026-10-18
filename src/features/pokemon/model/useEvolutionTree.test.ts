import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEvolutionTree } from './useEvolutionTree'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper(props: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, props.children)
  }
}

describe('useEvolutionTree', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not fetch when pokemonIdOrName is null', async () => {
    const fetchMock = vi.mocked(fetch)
    renderHook(() => useEvolutionTree(null), { wrapper: createWrapper() })
    await waitFor(() => {})
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches species then evolution chain and returns tree', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 25,
            name: 'pikachu',
            species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 25,
            name: 'pikachu',
            evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 10,
            chain: {
              species: { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon-species/172/' },
              evolves_to: [
                {
                  species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
                  evolves_to: [
                    {
                      species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' },
                      evolves_to: [],
                    },
                  ],
                },
              ],
            },
          }),
      } as Response)

    const { result } = renderHook(() => useEvolutionTree('pikachu'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      id: 172,
      name: 'pichu',
      children: [
        {
          id: 25,
          name: 'pikachu',
          children: [
            {
              id: 26,
              name: 'raichu',
              children: [],
            },
          ],
        },
      ],
    })
  })
})
