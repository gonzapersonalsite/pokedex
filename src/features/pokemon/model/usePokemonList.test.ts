import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PokeApiPokemon } from '@/entities/pokemon'
import { FIRST_PAGE_POKEMON, usePokemonList } from './usePokemonList'
import { usePokemonListByType } from './usePokemonListByType'

const BASE = 'https://pokeapi.co/api/v2'
const ARTWORK = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper(props: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, props.children)
  }
}

function jsonResponse(body: unknown) {
  return { ok: true, json: () => Promise.resolve(body) } as Response
}

function listItem(id: number, name: string) {
  return { name, url: `${BASE}/pokemon/${id}/` }
}

function typeResource(id: number, name: string, members: Array<[number, string, number]>) {
  return {
    id,
    name,
    pokemon: members.map(([pokemonId, pokemonName, slot]) => ({ slot, pokemon: listItem(pokemonId, pokemonName) })),
  }
}

function rawPokemon(id: number, name: string, types: string[]): PokeApiPokemon {
  return {
    id,
    name,
    height: 4,
    weight: 60,
    sprites: {
      front_default: `https://example.com/${id}.png`,
      front_shiny: null,
      other: { 'official-artwork': { front_default: `https://example.com/${id}-art.png` } },
    },
    types: types.map((type, index) => ({ slot: index + 1, type: { name: type, url: `${BASE}/type/${type}/` } })),
    species: { name, url: `${BASE}/pokemon-species/${id}/` },
    moves: [],
  }
}

const TYPES: Record<string, ReturnType<typeof typeResource>> = {
  electric: typeResource(13, 'electric', [
    [25, 'pikachu', 1],
    [10268, 'miraidon-low-power-mode', 1],
  ]),
  dragon: typeResource(16, 'dragon', [[10268, 'miraidon-low-power-mode', 2]]),
  fairy: typeResource(18, 'fairy', [[35, 'clefairy', 1]]),
  stellar: typeResource(19, 'stellar', []),
}

const SECOND_PAGE = [listItem(25, 'pikachu'), listItem(35, 'clefairy'), listItem(10268, 'miraidon-low-power-mode')]
const UNINDEXED = rawPokemon(1100, 'newcomer', ['normal'])

function pokeApi(url: string): Response {
  if (url === `${BASE}/pokemon?offset=0&limit=24`) {
    return jsonResponse({
      count: 27,
      next: `${BASE}/pokemon?offset=24&limit=24`,
      previous: null,
      results: FIRST_PAGE_POKEMON.map((pokemon) => listItem(pokemon.id, pokemon.name)),
    })
  }
  if (url === `${BASE}/pokemon?offset=24&limit=24`) {
    return jsonResponse({
      count: 28,
      next: null,
      previous: null,
      results: [...SECOND_PAGE, listItem(1100, 'newcomer')],
    })
  }
  if (url === `${BASE}/type?limit=100`) {
    return jsonResponse({
      count: 4,
      next: null,
      previous: null,
      results: Object.values(TYPES).map((type) => ({ name: type.name, url: `${BASE}/type/${type.id}/` })),
    })
  }
  const typeName = url.match(/\/type\/([a-z-]+)$/)?.[1]
  if (typeName && TYPES[typeName]) return jsonResponse(TYPES[typeName])
  if (url === `${BASE}/pokemon/1100`) return jsonResponse(UNINDEXED)
  const detailId = url.match(/\/pokemon\/(\d+)$/)?.[1]
  if (detailId) return jsonResponse(rawPokemon(Number(detailId), `pokemon-${detailId}`, ['normal']))
  throw new Error(`Unexpected URL: ${url}`)
}

function requestedUrls(): string[] {
  return vi.mocked(fetch).mock.calls.map(([url]) => String(url))
}

function detailRequests(): string[] {
  return requestedUrls().filter((url) => /\/pokemon\/\d+$/.test(url))
}

describe('usePokemonList', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => Promise.resolve(pokeApi(url))),
    )
  })

  it('builds a later page from the type index and asks for the detail of no indexed Pokémon', async () => {
    const { result } = renderHook(() => usePokemonList(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))
    expect(result.current.data?.pages).toHaveLength(1)

    await act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))

    expect(result.current.data?.pages[1].list.slice(0, 3)).toEqual([
      { id: 25, name: 'pikachu', image: `${ARTWORK}/25.png`, types: ['electric'] },
      { id: 35, name: 'clefairy', image: `${ARTWORK}/35.png`, types: ['fairy'] },
      { id: 10268, name: 'miraidon-low-power-mode', image: '', types: ['electric', 'dragon'] },
    ])
    expect(detailRequests()).toEqual([`${BASE}/pokemon/1100`])
  })

  it('asks for the detail of a listed Pokémon the type index does not know yet', async () => {
    const { result } = renderHook(() => usePokemonList(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))
    expect(result.current.data?.pages).toHaveLength(1)

    await act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))

    expect(result.current.data?.pages[1].list[3]).toEqual({
      id: 1100,
      name: 'newcomer',
      image: 'https://example.com/1100-art.png',
      types: ['normal'],
    })
  })

  it('serves the first page from the bundled seed without asking for any type or detail', async () => {
    const { result } = renderHook(() => usePokemonList(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))

    expect(result.current.data?.pages[0].list).toBe(FIRST_PAGE_POKEMON)
    expect(requestedUrls()).toEqual([`${BASE}/pokemon?offset=0&limit=24`])
  })
})

describe('usePokemonListByType', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => Promise.resolve(pokeApi(url))),
    )
  })

  it('lists a type from the type index without asking for any detail', async () => {
    const refs = [
      { id: 25, name: 'pikachu' },
      { id: 10268, name: 'miraidon-low-power-mode' },
    ]
    const { result } = renderHook(() => usePokemonListByType('electric', refs), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.status).toBe('success'))

    expect(result.current.data?.pages[0].list).toEqual([
      { id: 25, name: 'pikachu', image: `${ARTWORK}/25.png`, types: ['electric'] },
      { id: 10268, name: 'miraidon-low-power-mode', image: '', types: ['electric', 'dragon'] },
    ])
    expect(detailRequests()).toEqual([])
  })
})
