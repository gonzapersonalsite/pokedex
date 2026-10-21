import { useState } from 'react'
import { Button, PokeballIcon } from '@/shared/ui'
import { cn, getTypeBadgeClass } from '@/shared/utils'
import { SEARCH_PARTY_POKEMON } from '../model/notFoundRoute'

export interface NotFoundSectionProps {
  pathname: string
  onReturnHome: () => void
  onInspectPokemon: (id: number) => void
}

const OFFICIAL_SHINY_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny'

export function NotFoundSection({ pathname, onReturnHome, onInspectPokemon }: NotFoundSectionProps) {
  const [shinyMode, setShinyMode] = useState(false)

  return (
    <section className="max-w-6xl mx-auto py-2 sm:py-6">
      {/* Kanto Dual-Screen Pokédex Hardware Unit */}
      <div className="rounded-3xl border-4 border-slate-900 dark:border-slate-700 bg-red-600 dark:bg-red-700 shadow-2xl overflow-hidden mb-8">
        {/* Top Hardware Sensor Bezel */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-red-700 dark:bg-red-800 border-b-4 border-slate-900 dark:border-slate-700 text-white"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-200 via-sky-400 to-blue-600 border-4 border-white shadow-md inline-block" />
            <span className="w-3.5 h-3.5 rounded-full bg-red-300 border-2 border-slate-900/50 inline-block" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 border-2 border-slate-900/50 inline-block" />
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-slate-900/50 inline-block" />
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase text-red-100">
            KANTO DEX-OS · SECTOR #404
          </span>
        </div>

        {/* Inner CRT Encounter Display + Battle Dialog */}
        <div className="p-4 sm:p-7 bg-red-600 dark:bg-red-700">
          <div className="rounded-2xl border-4 border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-5 sm:p-8 shadow-inner">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left: Wild Encounter Battle HUD */}
              <div className="lg:col-span-7 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider mb-3">
                  <span>WILD ENCOUNTER · ROUTE 404</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
                  Wild Missing Route Appeared!
                </h2>

                {/* Classic Game Boy style HP status bar for the missing route */}
                <div
                  className="max-w-md rounded-xl border-2 border-slate-800 dark:border-slate-700 bg-amber-50/90 dark:bg-slate-800/90 p-3.5 mb-4 shadow-xs"
                  aria-hidden="true"
                >
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span>MISSINGNO. (ROUTE)</span>
                    <span>Lv.404</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 font-mono text-[10px] font-black">
                      HP
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden border border-slate-700">
                      <div className="w-0 h-full bg-red-500" />
                    </div>
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">000/404</span>
                  </div>
                  <p className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-400 break-all">LOC: {pathname}</p>
                </div>

                {/* Classic RPG text box */}
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Professor Oak&apos;s words echoed:{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    &ldquo;There&apos;s a time and place for everything, but this URL leads into uncharted tall
                    grass!&rdquo;
                  </span>{' '}
                  Return to the Pokédex or send out one of the Pokémon below to inspect its entry.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="lg" onClick={onReturnHome} className="gap-2 shadow-md">
                    <PokeballIcon size={20} className="shrink-0" />
                    <span>Back to Pokédex</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShinyMode((prev) => !prev)}
                    aria-pressed={shinyMode}
                  >
                    {shinyMode ? '✨ Shiny Patrol: ON' : '✨ Toggle Shiny Patrol'}
                  </Button>
                </div>
              </div>

              {/* Right: Featured Trio Radar Display */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-sky-50/70 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/80 p-4 text-center">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-3">
                    Tall Grass Radar · Active Signals
                  </p>
                  <div className="grid grid-cols-3 gap-2 items-end">
                    {SEARCH_PARTY_POKEMON.slice(0, 3).map((pokemon, index) => (
                      <button
                        key={pokemon.id}
                        type="button"
                        onClick={() => onInspectPokemon(pokemon.id)}
                        className="group flex flex-col items-center p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 transition focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      >
                        <img
                          src={shinyMode ? `${OFFICIAL_SHINY_BASE}/${pokemon.id}.png` : pokemon.image}
                          alt={`Inspect ${pokemon.name}`}
                          width={88}
                          height={88}
                          decoding="async"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : undefined}
                          className="w-20 h-20 object-contain group-hover:scale-110 transition"
                        />
                        <span className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {pokemon.name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          #{String(pokemon.id).padStart(3, '0')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Varied 6-Pokémon Search Party Roster */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
          Search party roster — click any Pokémon to open its Pokédex entry
        </h3>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          6 Pokémon across Kanto · Water, Normal, Electric, Ghost, Psychic
        </span>
      </div>

      <ul
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        data-testid="not-found-pokemon-grid"
      >
        {SEARCH_PARTY_POKEMON.map((pokemon) => (
          <li key={pokemon.id}>
            <button
              type="button"
              onClick={() => onInspectPokemon(pokemon.id)}
              className="w-full h-full text-left rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-md hover:shadow-xl hover:border-primary-500 dark:hover:border-primary-500 transition flex items-center gap-4 focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-2 flex items-center justify-center">
                <img
                  src={shinyMode ? `${OFFICIAL_SHINY_BASE}/${pokemon.id}.png` : pokemon.image}
                  alt={pokemon.name}
                  width={96}
                  height={96}
                  decoding="async"
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    #{String(pokemon.id).padStart(3, '0')}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className={cn(
                          'text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize',
                          getTypeBadgeClass(type),
                        )}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug mb-1">
                  {pokemon.name}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{pokemon.report}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
