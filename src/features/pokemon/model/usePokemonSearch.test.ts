import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePokemonSearch } from './usePokemonSearch'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper(props: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, props.children)
  }
}

describe('usePokemonSearch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not fetch when query is empty', async () => {
    const fetchMock = vi.mocked(fetch)
    const { result } = renderHook(() => usePokemonSearch(''), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.status).toBe('pending'))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches and returns mapped pokemon when query is provided', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 25,
          name: 'pikachu',
          height: 4,
          weight: 60,
          sprites: {
            front_default: 'https://example.com/pika.png',
            front_shiny: null,
            other: { 'official-artwork': { front_default: 'https://example.com/pika.png' } },
          },
          types: [{ slot: 1, type: { name: 'electric', url: 'https://api/type/13' } }],
          species: { name: 'pikachu', url: 'https://api/species/25' },
        }),
    } as Response)

    const { result } = renderHook(() => usePokemonSearch('pikachu'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(
      expect.objectContaining({
        id: 25,
        name: 'pikachu',
        types: ['electric'],
        image: 'https://example.com/pika.png',
      }),
    )
  })
})
