import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { QueryProvider, ThemeProvider } from '@/app/providers'
import { applyTheme, useToastStore } from '@/shared/utils'
import indexHtml from '../../../../index.html?raw'
import { PokedexPage } from './PokedexPage'

// Extract the synchronous pre-paint script from index.html so the tests run the real script.
const inlineThemeScriptMatch = indexHtml.match(/<script>([\s\S]*?)<\/script>/)
if (!inlineThemeScriptMatch) {
  throw new Error('Expected inline theme script in index.html')
}
const runInlineThemeScript = new Function(inlineThemeScriptMatch[1]) as () => void

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
    window.history.replaceState(null, '', '/')
    vi.stubGlobal('scrollTo', vi.fn())
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

  it('opens_with_a_skip_link_that_moves_the_focus_into_the_main_content', () => {
    const { container } = render(createElement(PokedexPage), { wrapper: Providers })

    const firstFocusable = container.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    )
    expect(firstFocusable).toBe(screen.getByRole('link', { name: 'Skip to content' }))

    const target = document.querySelector<HTMLElement>(firstFocusable?.getAttribute('href') ?? '')
    expect(target?.tagName).toBe('MAIN')
    target?.focus()
    expect(target).toHaveFocus()
  })

  it('replaces_the_initial_html_startup_indicator_when_react_mounts', () => {
    const doc = new DOMParser().parseFromString(indexHtml, 'text/html')
    const root = doc.getElementById('root')!
    document.body.append(root)

    expect(within(root).getByRole('progressbar', { name: 'Loading Pokédex' })).toBeInTheDocument()

    render(createElement(PokedexPage), { container: root, wrapper: Providers })

    expect(root.querySelector('.app-startup')).toBeNull()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument()
  })

  it('paints_the_saved_or_system_theme_and_promotes_fonts_in_the_inline_pre_paint_script', () => {
    const matchMediaSpy = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', matchMediaSpy)

    localStorage.setItem('pokedex-theme', 'dark')
    runInlineThemeScript()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')

    localStorage.removeItem('pokedex-theme')
    matchMediaSpy.mockReturnValue({ matches: false })
    runInlineThemeScript()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')

    applyTheme('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')

    const link = document.createElement('link')
    link.id = 'app-fonts'
    link.media = 'print'
    document.head.appendChild(link)
    runInlineThemeScript()
    link.dispatchEvent(new Event('load'))
    expect(link.media).toBe('all')
    link.remove()
  })

  it('renders_the_pokedex_404_scanner_with_varied_pokemon_on_unknown_routes_and_returns_home', () => {
    window.history.replaceState(null, '', '/route-404-tall-grass')

    render(createElement(PokedexPage), { wrapper: Providers })

    expect(screen.getByRole('heading', { level: 2, name: 'Wild Missing Route Appeared!' })).toBeInTheDocument()
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    const grid = screen.getByTestId('not-found-pokemon-grid')
    for (const name of ['Psyduck', 'Snorlax', 'Pikachu', 'Gengar', 'Ditto', 'Mew']) {
      expect(within(grid).getByText(name)).toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole('button', { name: /back to pokédex/i }))

    expect(window.location.pathname).toBe('/')
    expect(screen.queryByRole('heading', { name: 'Wild Missing Route Appeared!' })).toBeNull()
  })
})
