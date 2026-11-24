import { createElement } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PREFERS_DARK, stubSystemPreferences } from '@/shared/test/systemPreferences'
import { useTheme } from '@/shared/utils'
import { ThemeProvider } from './ThemeProvider'

const STORAGE_KEY = 'pokedex-theme'

/** Shows the theme in force and toggles it, as the header button does. */
function ThemeButton() {
  const { theme, toggleTheme } = useTheme()
  return createElement('button', { type: 'button', onClick: toggleTheme }, theme)
}

function renderThemeButton() {
  render(createElement(ThemeProvider, null, createElement(ThemeButton)))
  return screen.getByRole('button')
}

const paintedTheme = () => document.documentElement.getAttribute('data-theme')

describe('ThemeProvider', () => {
  beforeEach(() => localStorage.removeItem(STORAGE_KEY))

  it('follows_the_system_on_a_first_visit_without_storing_anything', () => {
    stubSystemPreferences([PREFERS_DARK])

    const button = renderThemeButton()

    expect(button).toHaveTextContent('dark')
    expect(paintedTheme()).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('follows_a_change_of_the_system_while_the_page_is_open_and_nobody_has_chosen', () => {
    const system = stubSystemPreferences([PREFERS_DARK])
    const button = renderThemeButton()

    act(() => system.set(PREFERS_DARK, false))

    expect(button).toHaveTextContent('light')
    expect(paintedTheme()).toBe('light')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('stores_the_theme_the_visitor_chooses_and_keeps_it_when_the_system_changes', () => {
    const system = stubSystemPreferences()
    const button = renderThemeButton()

    fireEvent.click(button)
    expect(button).toHaveTextContent('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')

    act(() => system.set(PREFERS_DARK, true))
    act(() => system.set(PREFERS_DARK, false))
    expect(button).toHaveTextContent('dark')
    expect(paintedTheme()).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
  })

  it('forgets_the_choice_when_the_visitor_goes_back_to_what_the_system_shows', () => {
    const system = stubSystemPreferences()
    const button = renderThemeButton()
    fireEvent.click(button)

    fireEvent.click(button)
    expect(button).toHaveTextContent('light')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    act(() => system.set(PREFERS_DARK, true))
    expect(button).toHaveTextContent('dark')
  })

  it('respects_a_theme_stored_by_an_earlier_visit_whatever_the_system_prefers', () => {
    localStorage.setItem(STORAGE_KEY, 'light')
    const system = stubSystemPreferences([PREFERS_DARK])

    const button = renderThemeButton()
    act(() => system.set(PREFERS_DARK, false))
    act(() => system.set(PREFERS_DARK, true))

    expect(button).toHaveTextContent('light')
    expect(paintedTheme()).toBe('light')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light')
  })

  it('takes_a_choice_made_in_another_tab_of_the_site', () => {
    stubSystemPreferences()
    const button = renderThemeButton()

    localStorage.setItem(STORAGE_KEY, 'dark')
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'dark' }))
    })

    expect(button).toHaveTextContent('dark')
    expect(paintedTheme()).toBe('dark')
  })
})
