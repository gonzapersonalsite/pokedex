import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTypes } from './useTypes'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper(props: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, props.children)
  }
}

const BASE = 'https://pokeapi.co/api/v2'

const typeDetails: Record<string, { id: number; pokemonNames: string[] }> = {
  fire: { id: 10, pokemonNames: ['charmander', 'vulpix'] },
  water: { id: 11, pokemonNames: ['squirtle'] },
  stellar: { id: 19, pokemonNames: [] },
  unknown: { id: 10001, pokemonNames: [] },
  shadow: { id: 10002, pokemonNames: [] },
}

function jsonResponse(body: unknown) {
  return { ok: true, json: () => Promise.resolve(body) } as Response
}

function mockPokeApi(url: string) {
  if (url === `${BASE}/type?limit=100`) {
    return jsonResponse({
      count: 5,
      next: null,
      previous: null,
      results: Object.entries(typeDetails).map(([name, detail]) => ({ name, url: `${BASE}/type/${detail.id}/` })),
    })
  }
  throw new Error(`Unexpected URL: ${url}`)
}

describe('useTypes', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => Promise.resolve(mockPokeApi(url))),
    )
  })

  it('only lists types that have at least one Pokémon', async () => {
    const { result } = renderHook(() => useTypes(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))

    expect(result.current.data).toEqual([
      { id: 10, name: 'fire' },
      { id: 11, name: 'water' },
    ])
  })
})
