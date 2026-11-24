import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  applyTheme,
  readSystemTheme,
  readThemeChoice,
  storeThemeChoice,
  subscribeToSystemTheme,
  subscribeToThemeChoice,
  ThemeContext,
  themeChoiceAfterToggle,
} from '@/shared/utils'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useSyncExternalStore(subscribeToSystemTheme, readSystemTheme)
  const [choice, setChoice] = useState(readThemeChoice)
  const theme = choice ?? system

  useEffect(() => subscribeToThemeChoice(() => setChoice(readThemeChoice())), [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const next = themeChoiceAfterToggle(theme, system)
    setChoice(next)
    storeThemeChoice(next)
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
