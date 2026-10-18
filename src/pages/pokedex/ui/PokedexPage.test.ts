import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryProvider, ThemeProvider } from '@/app/providers'
import { useToastStore } from '@/shared/utils'
import { PokedexPage } from './PokedexPage'

const BASE = 'https://pokeapi.co/api/v2'
const MISSING_POKEMON = 'zzzznotapokemon'
const MISSING_POKEMON_URL = `${BASE}/pokemon/${MISSING_POKEMON}`

function Providers({ children }: { children: ReactNode }) {
  return createElement(QueryProvider, null, createElement(ThemeProvider, null, children))
}

/** Every list the page loads on mount comes back empty; only the searched Pokémon is missing. */
function mockPokeApi(url: string) {
  if (url === MISSING_POKEMON_URL) return { ok: false, status: 404 } as Response
  return {
    ok: true,
    json: () => Promise.resolve({ count: 0, next: null, previous: null, results: [] }),
  } as Response
}

describe('PokedexPage', () => {
  beforeEach(() => {
    // ThemeProvider falls back to matchMedia, which jsdom does not implement.
    localStorage.setItem('pokedex-theme', 'light')
    useToastStore.getState().clear()
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => Promise.resolve(mockPokeApi(url))),
    )
  })

  it('tells the user when no Pokémon matches the search, without retrying or a toast', async () => {
    render(createElement(PokedexPage), { wrapper: Providers })

    fireEvent.change(screen.getByRole('combobox', { name: 'Search Pokémon' }), {
      target: { value: MISSING_POKEMON },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(
      await screen.findByText('There is no Pokémon with that name or ID. Try "Pikachu" or "25".'),
    ).toBeInTheDocument()
    const searchCalls = vi.mocked(fetch).mock.calls.filter(([url]) => url === MISSING_POKEMON_URL)
    expect(searchCalls).toHaveLength(1)
    expect(useToastStore.getState().toasts).toEqual([])
  })
})
