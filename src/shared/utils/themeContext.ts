import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'pokedex-theme'
const SYSTEM_PREFERS_DARK = '(prefers-color-scheme: dark)'

/** The theme the visitor chose with the button, or null while the system decides. */
export function readThemeChoice(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' || stored === 'light' ? stored : null
  } catch {
    // Site data is blocked: follow the system.
    return null
  }
}

/** Keeps a choice for the next visit; null forgets it, so the system decides again. */
export function storeThemeChoice(choice: Theme | null): void {
  try {
    if (choice === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, choice)
    }
  } catch {
    // Site data is blocked: the choice lasts as long as this page.
  }
}

/** Runs onChange when another tab of the site stores or forgets a choice. */
export function subscribeToThemeChoice(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    // A null key is the whole storage being cleared.
    if (event.key === STORAGE_KEY || event.key === null) onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export function readSystemTheme(): Theme {
  return window.matchMedia(SYSTEM_PREFERS_DARK).matches ? 'dark' : 'light'
}

export function subscribeToSystemTheme(onChange: () => void): () => void {
  const systemPrefersDark = window.matchMedia(SYSTEM_PREFERS_DARK)
  systemPrefersDark.addEventListener('change', onChange)
  return () => systemPrefersDark.removeEventListener('change', onChange)
}

/**
 * The choice the button leaves behind: the theme not shown now. Going back to what the system
 * shows is undoing the choice, so nothing stays stored and the system is followed again
 * (#first-visit-stores-the-system-theme-as-a-choice).
 */
export function themeChoiceAfterToggle(shown: Theme, system: Theme): Theme | null {
  const next: Theme = shown === 'dark' ? 'light' : 'dark'
  return next === system ? null : next
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
