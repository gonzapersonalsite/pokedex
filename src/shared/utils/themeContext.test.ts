import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PREFERS_DARK, stubSystemPreferences } from '@/shared/test/systemPreferences'
import { applyTheme, readSystemTheme, readThemeChoice, storeThemeChoice, themeChoiceAfterToggle } from './themeContext'

const STORAGE_KEY = 'pokedex-theme'

describe('themeChoiceAfterToggle', () => {
  it.each([
    ['light', 'light', 'dark'],
    ['dark', 'dark', 'light'],
    ['dark', 'light', null],
    ['light', 'dark', null],
  ] as const)('shown_%s_with_a_system_that_prefers_%s_leaves_%s_as_the_choice', (shown, system, choice) => {
    expect(themeChoiceAfterToggle(shown, system)).toBe(choice)
  })
})

describe('the stored theme choice', () => {
  beforeEach(() => localStorage.removeItem(STORAGE_KEY))
  afterEach(() => vi.restoreAllMocks())

  it('is_nothing_until_a_choice_is_stored_and_nothing_again_once_it_is_forgotten', () => {
    expect(readThemeChoice()).toBeNull()

    storeThemeChoice('dark')
    expect(readThemeChoice()).toBe('dark')

    storeThemeChoice(null)
    expect(readThemeChoice()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('ignores_a_stored_value_that_is_not_a_theme', () => {
    localStorage.setItem(STORAGE_KEY, 'sepia')

    expect(readThemeChoice()).toBeNull()
  })

  it('follows_the_system_when_the_browser_blocks_site_data', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    })

    expect(readThemeChoice()).toBeNull()
    expect(() => storeThemeChoice('dark')).not.toThrow()
  })

  it('is_not_written_by_painting_a_theme', () => {
    applyTheme('dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('readSystemTheme', () => {
  it('reads_the_colour_scheme_the_system_prefers_now', () => {
    const system = stubSystemPreferences([PREFERS_DARK])
    expect(readSystemTheme()).toBe('dark')

    system.set(PREFERS_DARK, false)
    expect(readSystemTheme()).toBe('light')
  })
})
