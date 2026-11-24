import { createElement } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PokemonCard } from './PokemonCard'

const ZYGARDE_TEN = {
  id: 10118,
  name: 'zygarde-10-power-construct',
  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10118.png',
  types: ['dragon', 'ground'],
}

describe('PokemonCard', () => {
  it('shows the artwork of the Pokémon with its number, name and types', () => {
    render(createElement(PokemonCard, { pokemon: ZYGARDE_TEN, priority: true }))

    expect(screen.getByRole('img', { name: 'Zygarde 10 power construct' })).toHaveAttribute('src', ZYGARDE_TEN.image)
    expect(screen.getByText('#10118')).toBeInTheDocument()
    expect(screen.getByText('ground')).toBeInTheDocument()
    expect(screen.getByText('dragon')).toBeInTheDocument()
  })

  it('replaces artwork that fails to load with the no-image placeholder', () => {
    render(createElement(PokemonCard, { pokemon: ZYGARDE_TEN, priority: true }))

    fireEvent.error(screen.getByRole('img', { name: 'Zygarde 10 power construct' }))

    expect(screen.queryByRole('img', { name: 'Zygarde 10 power construct' })).not.toBeInTheDocument()
    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('shows the no-image placeholder for a Pokémon without artwork', () => {
    render(createElement(PokemonCard, { pokemon: { ...ZYGARDE_TEN, image: '' }, priority: true }))

    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('names_its_favourite_button_after_the_pokemon_so_two_cards_do_not_sound_alike', () => {
    const onToggleFavorite = vi.fn()
    const { rerender } = render(createElement(PokemonCard, { pokemon: ZYGARDE_TEN, onToggleFavorite }))

    fireEvent.click(screen.getByRole('button', { name: 'Add Zygarde 10 power construct to favorites' }))
    expect(onToggleFavorite).toHaveBeenCalledWith(ZYGARDE_TEN.id)

    rerender(createElement(PokemonCard, { pokemon: ZYGARDE_TEN, onToggleFavorite, isFavorite: true }))
    expect(screen.getByRole('button', { name: 'Remove Zygarde 10 power construct from favorites' })).toBeInTheDocument()
  })
})
