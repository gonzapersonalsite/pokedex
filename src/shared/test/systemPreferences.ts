// jsdom has no matchMedia: a test says what the system prefers and changes it as the system would.

type Listener = (event: { matches: boolean; media: string }) => void

export interface SystemPreferences {
  /** Changes one answer and tells whoever listens, as a system setting changing with the page open does. */
  set: (query: string, matches: boolean) => void
}

export const PREFERS_DARK = '(prefers-color-scheme: dark)'
export const PREFERS_REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/** Replaces window.matchMedia; a query that is not named here does not match. */
export function stubSystemPreferences(matching: readonly string[] = []): SystemPreferences {
  const answers = new Map<string, boolean>(matching.map((query) => [query, true]))
  const listeners = new Map<string, Set<Listener>>()
  const listenersOf = (query: string) => listeners.get(query) ?? listeners.set(query, new Set()).get(query)!

  const matchMedia = (query: string) => ({
    media: query,
    get matches() {
      return answers.get(query) ?? false
    },
    addEventListener: (_type: 'change', listener: Listener) => listenersOf(query).add(listener),
    removeEventListener: (_type: 'change', listener: Listener) => listenersOf(query).delete(listener),
  })
  Object.defineProperty(window, 'matchMedia', { value: matchMedia, configurable: true, writable: true })

  return {
    set(query, matches) {
      answers.set(query, matches)
      listenersOf(query).forEach((listener) => listener({ matches, media: query }))
    },
  }
}
