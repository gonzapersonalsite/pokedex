import { describe, expect, it } from 'vitest'
import { isNotFoundPathname, SEARCH_PARTY_POKEMON } from './notFoundRoute'

describe('notFoundRoute', () => {
  it('recognizes_the_root_and_index_paths_as_valid_and_everything_else_as_404', () => {
    expect(isNotFoundPathname('/')).toBe(false)
    expect(isNotFoundPathname('///')).toBe(false)
    expect(isNotFoundPathname('/index.html')).toBe(false)
    expect(isNotFoundPathname('/404.html')).toBe(true)
    expect(isNotFoundPathname('/unknown-route')).toBe(true)
    expect(isNotFoundPathname('/pokemon/99999')).toBe(true)
  })

  it('lists_six_varied_search_party_pokemon_with_official_artwork_and_types', () => {
    expect(SEARCH_PARTY_POKEMON).toHaveLength(6)
    expect(SEARCH_PARTY_POKEMON.map((pokemon) => pokemon.name)).toEqual([
      'Psyduck',
      'Snorlax',
      'Pikachu',
      'Gengar',
      'Ditto',
      'Mew',
    ])
    for (const pokemon of SEARCH_PARTY_POKEMON) {
      expect(pokemon.image).toMatch(/^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/.+\/\d+\.png$/)
      expect(pokemon.types.length).toBeGreaterThan(0)
      expect(pokemon.report.length).toBeGreaterThan(0)
    }
  })
})
