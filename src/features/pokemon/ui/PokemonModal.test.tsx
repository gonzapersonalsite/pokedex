import { createElement } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PREFERS_REDUCED_MOTION, stubSystemPreferences } from '@/shared/test/systemPreferences'
import { PokemonModal } from './PokemonModal'

const BASE = 'https://pokeapi.co/api/v2'
const BULBASAUR = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  sprites: { front_default: null, front_shiny: null },
  types: [{ slot: 1, type: { name: 'grass', url: `${BASE}/type/12/` } }],
  species: { name: 'bulbasaur', url: `${BASE}/pokemon-species/1/` },
  moves: [],
}

/** Only the Pokémon itself answers: its species, its types and the sounds of the casing are not found. */
function mockPokeApi(url: string) {
  if (url === `${BASE}/pokemon/1`) return { ok: true, json: () => Promise.resolve(BULBASAUR) } as Response
  return { ok: false, status: 404 } as Response
}

async function openModal() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(PokemonModal, { pokemonIdOrName: 1, open: true, onClose: vi.fn(), onNavigate: vi.fn() }),
    ),
  )
  return screen.findByRole('dialog', { name: 'bulbasaur' })
}

describe('PokemonModal', () => {
  const scrollBy = vi.fn()

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => Promise.resolve(mockPokeApi(url))),
    )
    // jsdom has no Web Audio and no animations; the casing's sounds and Headless UI say so on every run.
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    // jsdom scrolls nothing: the pad's scroll is observed where it would land.
    Object.defineProperty(Element.prototype, 'scrollBy', { value: scrollBy, configurable: true, writable: true })
    scrollBy.mockClear()
    stubSystemPreferences()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(Element.prototype, 'scrollBy')
  })

  it('names_every_control_of_the_casing_after_what_it_does', async () => {
    const dialog = await openModal()

    expect(within(dialog).getAllByRole('button', { name: 'Previous Pokémon' })).toHaveLength(2)
    expect(within(dialog).getAllByRole('button', { name: 'Next Pokémon' })).toHaveLength(2)
    for (const name of ['Close', 'Close Pokédex', 'Scroll up', 'Scroll down', 'Add to favorites']) {
      expect(within(dialog).getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('sits_its_casing_in_the_viewport_that_scrolls_centred_by_its_own_margins', async () => {
    const dialog = await openModal()

    const viewport = dialog.querySelector('.dialog-viewport')
    expect(viewport?.children).toHaveLength(1)
    expect(viewport?.firstElementChild).toHaveClass('m-auto')
    expect(viewport?.firstElementChild).toContainElement(within(dialog).getByRole('button', { name: 'Close Pokédex' }))
  })

  it('scrolls_its_screen_with_the_pad_gliding_by_default', async () => {
    const dialog = await openModal()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Scroll down' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Scroll up' }))

    expect(scrollBy.mock.calls).toEqual([[{ top: 120, behavior: 'smooth' }], [{ top: -120, behavior: 'smooth' }]])
  })

  it('scrolls_its_screen_with_the_pad_at_once_for_a_reader_who_asked_for_less_motion', async () => {
    stubSystemPreferences([PREFERS_REDUCED_MOTION])
    const dialog = await openModal()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Scroll down' }))

    expect(scrollBy.mock.calls).toEqual([[{ top: 120, behavior: 'auto' }]])
  })
})
