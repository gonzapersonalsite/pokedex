import { useState, useRef, useEffect, Suspense } from 'react'
import { PokemonList, PokemonModal, usePokemonSearch, usePokemonNames, useTypes } from '@/features/pokemon'
import { Button, Loader, PokeballIcon } from '@/shared/ui'
import { classifyRequestError, cn, getTypeBadgeClass, toast, useTheme, type RequestErrorKind } from '@/shared/utils'
import { SunIcon, MoonIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { isNotFoundPathname } from '../model/notFoundRoute'
import { NotFoundSection } from './NotFoundSection'
import { ReturnToTop } from './ReturnToTop'
import { SkipToContent } from './SkipToContent'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void> | void
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

const SUGGESTIONS_MAX = 8

const MAIN_CONTENT_ID = 'main-content'

const SEARCH_RETRY_HINT = 'Type a name or number in the search or pick a suggestion.'

const SEARCH_ERROR_COPY: Record<RequestErrorKind, { message: string; hint: string }> = {
  network: {
    message: 'You appear to be offline. Check your connection and try again.',
    hint: 'Reconnect to the internet and try again.',
  },
  timeout: {
    message: 'The request took too long. Check your connection and try again.',
    hint: SEARCH_RETRY_HINT,
  },
  notFound: {
    message: 'There is no Pokémon with that name or ID. Try "Pikachu" or "25".',
    hint: SEARCH_RETRY_HINT,
  },
  other: {
    message: 'Something went wrong. Please try again.',
    hint: SEARCH_RETRY_HINT,
  },
}

export function PokedexPage() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSubmitted, setSearchSubmitted] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { data: allNames = [] } = usePokemonNames()
  const { data: typesList = [] } = useTypes()
  const isNotFound = isNotFoundPathname(pathname)

  const handleReturnHome = () => {
    if (isNotFoundPathname(window.location.pathname)) {
      window.history.pushState(null, '', '/')
    }
    setPathname('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = () => {
    if (isNotFound) handleReturnHome()
    setSearchSubmitted(searchQuery.trim())
  }

  const handleSelectSuggestion = (name: string) => {
    if (isNotFound) handleReturnHome()
    setSearchQuery(name)
    setSearchSubmitted(name)
  }

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!isNotFound) return
    const previousTitle = document.title
    document.title = 'Page not found — Pokédex'
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const createdMeta = !robotsMeta
    const previousRobots = robotsMeta?.getAttribute('content') ?? null
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    robotsMeta.setAttribute('content', 'noindex')

    return () => {
      document.title = previousTitle
      if (createdMeta) {
        robotsMeta?.remove()
      } else if (previousRobots !== null) {
        robotsMeta?.setAttribute('content', previousRobots)
      }
    }
  }, [isNotFound])

  useEffect(() => {
    function onBeforeInstall(e: BeforeInstallPromptEvent) {
      e.preventDefault()
      setInstallEvent(e)
      setCanInstall(true)
    }
    function onInstalled() {
      setCanInstall(false)
      setInstallEvent(null)
      toast({ variant: 'success', title: 'App installed', message: 'The app was installed successfully.' })
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SkipToContent targetId={MAIN_CONTENT_ID} />
      {/* Pokédex-style top header bar */}
      <header
        id="top"
        className="sticky top-0 z-20 border-b-4 border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] gap-3 lg:grid-rows-1 lg:items-center">
            <div className="flex min-w-0 items-center gap-3 col-span-2 row-start-1 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:justify-self-start">
              <PokeballIcon size={40} className="shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Pokédex</h1>
            </div>
            <div className="w-full min-w-0 col-span-3 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-self-center lg:max-w-2xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearch}
                onSelectSuggestion={handleSelectSuggestion}
                onClear={() => {
                  setSearchQuery('')
                  setSearchSubmitted('')
                }}
                suggestions={allNames}
                maxSuggestions={SUGGESTIONS_MAX}
              />
            </div>
            <div className="flex items-center gap-2 justify-self-end row-start-1 col-start-3 self-start lg:self-auto lg:col-start-3 lg:row-start-1 lg:justify-self-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="shrink-0"
                aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </Button>
              {canInstall && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={async () => {
                    const ev = installEvent
                    setCanInstall(false)
                    if (!ev) return
                    ev.prompt()
                    try {
                      const { outcome } = await ev.userChoice
                      if (outcome === 'accepted') {
                        toast({
                          variant: 'success',
                          title: 'Installation requested',
                          message: 'Follow the browser prompt to install.',
                        })
                      } else {
                        toast({
                          variant: 'info',
                          title: 'Installation dismissed',
                          message: 'You can install the app later from the menu.',
                        })
                      }
                    } finally {
                      setInstallEvent(null)
                    }
                  }}
                  aria-label="Install app"
                >
                  Install app
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full-width main content with full-page scroll.
          tabIndex -1: the skip link must move the focus here, not only the scroll.
          scroll-mt-40 clears the sticky header, which grows to two rows on phones. */}
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-12 scroll-mt-40 outline-hidden"
      >
        {isNotFound ? (
          <NotFoundSection
            pathname={pathname}
            onReturnHome={handleReturnHome}
            onInspectPokemon={(id) => {
              handleReturnHome()
              setSelectedId(id)
            }}
          />
        ) : searchSubmitted ? (
          <Suspense
            fallback={
              <div className="min-h-[60vh] flex items-center justify-center">
                <Loader />
              </div>
            }
          >
            <SearchResult
              query={searchSubmitted}
              onSelect={(id) => setSelectedId(id)}
              onClose={() => setSearchSubmitted('')}
            />
          </Suspense>
        ) : (
          <>
            <TypeFilter
              types={typesList}
              selectedType={typeFilter}
              onSelectType={(t) => {
                setTypeFilter(t)
                if (t !== null) setShowFavorites(false)
              }}
              showFavorites={showFavorites}
              onToggleFavorites={() => {
                const next = !showFavorites
                setShowFavorites(next)
                if (next) setTypeFilter(null)
              }}
            />
            <Suspense fallback={<Loader className="min-h-[300px]" />}>
              <PokemonList onSelectPokemon={setSelectedId} typeFilter={typeFilter} favoritesOnly={showFavorites} />
            </Suspense>
          </>
        )}
      </main>

      <ReturnToTop />

      <PokemonModal
        pokemonIdOrName={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        onNavigate={(id) => setSelectedId(typeof id === 'number' ? id : Number(id))}
      />
    </div>
  )
}

function TypeFilter({
  types,
  selectedType,
  onSelectType,
  showFavorites,
  onToggleFavorites,
}: {
  types: { id: number; name: string }[]
  selectedType: string | null
  onSelectType: (type: string | null) => void
  showFavorites: boolean
  onToggleFavorites: () => void
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Filter by type</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectType(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition',
            selectedType === null
              ? 'ring-2 ring-offset-2 ring-primary-500 bg-primary-500 text-white dark:ring-offset-slate-900'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600',
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={onToggleFavorites}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition',
            showFavorites
              ? 'ring-2 ring-offset-2 ring-amber-500 bg-amber-500 text-slate-900 dark:ring-offset-slate-900'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600',
          )}
        >
          Favorites
        </button>
        {types.map((t) => {
          const isSelected = selectedType === t.name
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectType(isSelected ? null : t.name)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium capitalize transition',
                getTypeBadgeClass(t.name),
                isSelected &&
                  'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-100 ring-offset-slate-100 dark:ring-offset-slate-900',
              )}
            >
              {t.name.replace(/-/g, ' ')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  onSelectSuggestion,
  suggestions,
  maxSuggestions = 8,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onClear: () => void
  onSelectSuggestion?: (name: string) => void
  suggestions: { name: string; id: number }[]
  maxSuggestions?: number
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const q = value.trim().toLowerCase()
  const filtered =
    q.length < 1
      ? []
      : suggestions.filter((s) => s.name.toLowerCase().includes(q) || s.id.toString() === q).slice(0, maxSuggestions)

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (containerRef.current?.contains(ev.target as Node)) return
      setOpen(false)
      setActiveIndex(-1)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showDropdown = open && filtered.length > 0 && value.length > 0

  // Showing the dropdown hands the cursor to its first suggestion; closing forgets it.
  const [wasDropdownShown, setWasDropdownShown] = useState(showDropdown)
  if (showDropdown !== wasDropdownShown) {
    setWasDropdownShown(showDropdown)
    setActiveIndex(showDropdown ? 0 : -1)
  }

  const pick = (name: string) => {
    onSelectSuggestion?.(name)
    setOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 w-full" ref={containerRef}>
      <div className="relative flex-1 min-w-0">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
        <input
          type="search"
          role="combobox"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onFocus={() => value.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              if (!showDropdown) {
                setOpen(true)
                setActiveIndex(0)
                return
              }
              setActiveIndex((prev) =>
                filtered.length === 0 ? -1 : Math.min((prev < 0 ? 0 : prev) + 1, filtered.length - 1),
              )
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              if (!showDropdown) return
              setActiveIndex((prev) => (filtered.length === 0 ? -1 : Math.max((prev < 0 ? 0 : prev) - 1, 0)))
            } else if (e.key === 'Enter') {
              if (activeIndex >= 0 && filtered[activeIndex]) {
                pick(filtered[activeIndex].name)
              } else if (filtered.length > 0 && onSelectSuggestion) {
                pick(filtered[0].name)
              } else {
                onSubmit()
              }
            } else if (e.key === 'Escape') {
              setOpen(false)
              setActiveIndex(-1)
            }
          }}
          placeholder="Search by name or ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          aria-label="Search Pokémon"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-haspopup="listbox"
          aria-expanded={!!showDropdown}
          aria-activedescendant={
            activeIndex >= 0 && filtered[activeIndex] ? `search-option-${filtered[activeIndex].id}` : undefined
          }
        />
        {showDropdown && (
          <ul
            className="absolute top-full left-0 right-0 mt-1 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg max-h-[240px] overflow-y-auto z-50"
            role="listbox"
            id="search-suggestions"
          >
            {filtered.map((s, i) => (
              <li
                key={s.id}
                role="option"
                id={`search-option-${s.id}`}
                tabIndex={0}
                aria-selected={i === activeIndex}
                className={cn(
                  'px-4 py-2.5 text-left flex justify-between items-center gap-2 cursor-pointer',
                  i === activeIndex ? 'bg-slate-100 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700',
                )}
                onClick={() => pick(s.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    pick(s.name)
                  }
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="font-medium capitalize text-slate-800 dark:text-slate-100">
                  {s.name.replace(/-/g, ' ')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">#{String(s.id).padStart(3, '0')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="primary" size="md" onClick={onSubmit}>
          Search
        </Button>
        {value ? (
          <Button variant="ghost" size="md" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function SearchResult({
  query,
  onSelect,
  onClose,
}: {
  query: string
  onSelect: (id: number) => void
  onClose: () => void
}) {
  const { data, status, error } = usePokemonSearch(query)

  if (query.length === 0) return null
  if (status === 'pending')
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    )
  if (status === 'error') {
    const { message, hint } = SEARCH_ERROR_COPY[classifyRequestError(error)]
    return (
      <div className="text-center py-12 px-4">
        <p className="text-slate-700 dark:text-slate-300 mb-2 font-medium">{message}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{hint}</p>
        <Button variant="secondary" onClick={onClose}>
          Back to list
        </Button>
      </div>
    )
  }
  if (!data) return null
  const displayName = data.name.replace(/-/g, ' ')
  const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1)
  return (
    <div className="max-w-md mx-auto">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Result for &quot;{query}&quot;</p>
      <button
        type="button"
        onClick={() => onSelect(data.id)}
        className="w-full rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-4 hover:border-primary-500 dark:hover:border-primary-500 transition text-left shadow-xs"
      >
        <span className="font-semibold capitalize text-slate-800 dark:text-slate-100">{capitalized}</span>
        <span className="text-slate-500 dark:text-slate-400 ml-2">#{String(data.id).padStart(3, '0')}</span>
      </button>
      <Button variant="ghost" className="mt-4 w-full sm:w-auto" onClick={onClose}>
        Back to list
      </Button>
    </div>
  )
}
