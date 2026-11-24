import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  TransitionChild,
} from '@headlessui/react'
import { useEffect, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { XMarkIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { usePokemonDetails, useEvolutionTree } from '../model'
import { useFavoritesStore } from '@/entities/favorites'
import { Button, DialogViewport, Loader } from '@/shared/ui'
import type { EvolutionNode } from '@/entities/pokemon'
import { cn, getTypeBadgeClass, preferredScrollBehavior, scrollToTop, toast, useAudio } from '@/shared/utils'
import { loadErrorMessage } from './loadErrorMessage'
import { useScreenScan } from './useScreenScan'
import { pokemonApi } from '../api/pokemonApi'

export interface PokemonModalProps {
  pokemonIdOrName: number | string | null
  open: boolean
  onClose: () => void
  onNavigate?: (idOrName: number | string) => void
}

const PAD_SCROLL_STEP_PX = 120

// What the casing takes above and below its screen at each breakpoint: its paddings, lights, hinge row and
// buttons in rem, and 16px of borders. The screen takes the rest of the window, down to 9rem, so the whole
// Pokédex fits wherever it can (#pokemon-details-dialog-overflows-short-windows). A casing that changes
// without this number makes the dialog scroll where it used to fit; nothing gets cut off.
const CASING_AROUND_SCREEN = '[--casing:calc(19.5rem+16px)] sm:[--casing:calc(21.5rem+16px)]'
// A side padding of the casing: 1rem, and never more than a twentieth of the window, which is that same 1rem
// at 320px with the default font size. In a narrow window with a larger font the paddings stop growing with
// the letters, and the width they would take stays with the text of the screen.
const CASING_SIDE_PADDING = '[--side:min(1rem,5vw)]'
const SCREEN_MAX_HEIGHT = 'max-h-[max(9rem,min(58svh,100svh_-_var(--safe-top)_-_var(--safe-bottom)_-_var(--casing)))]'
// The backdrop fades; the casing also rises, grows and straightens as it comes in, and sinks and shrinks as it
// goes. Headless UI marks the hidden end of each move with data-closed and its direction with data-enter or
// data-leave. Nothing of it runs for a reader who asked for less motion.
const BACKDROP_TRANSITION =
  'data-closed:opacity-0 data-enter:ease-out data-enter:duration-500 data-leave:ease-in data-leave:duration-300 motion-reduce:transition-none'
const CASING_TRANSITION = [
  'data-closed:opacity-0 data-enter:data-closed:translate-y-20 data-enter:data-closed:scale-90 data-enter:data-closed:-rotate-6',
  'data-leave:data-closed:translate-y-10 data-leave:data-closed:scale-95',
  'data-enter:ease-out data-enter:duration-1000 data-leave:ease-in data-leave:duration-500 motion-reduce:transition-none',
].join(' ')
// Halfway down a tall screen, and never above the middle of the artwork, which starts 9.75rem into the
// screen: on a short screen, halfway down is the name and the types, and the arrows would cover them.
const SCREEN_ARROW_TOP = 'top-[max(50%,14.75rem)] sm:top-[max(50%,15.75rem)]'

export function PokemonModal({ pokemonIdOrName, open, onClose, onNavigate }: PokemonModalProps) {
  const scan = useScreenScan(open, pokemonIdOrName)
  const [blinkBlue, setBlinkBlue] = useState(false)
  const [blinkGreen, setBlinkGreen] = useState(false)
  const { playSound, loadSounds } = useAudio()
  const skipNextClickRef = useRef(false)
  const triggerBlue = () => {
    setBlinkBlue(true)
    setTimeout(() => setBlinkBlue(false), 260)
  }
  const triggerGreen = () => {
    setBlinkGreen(true)
    setTimeout(() => setBlinkGreen(false), 260)
  }
  useEffect(() => {
    if (!open) return
    ;(async () => {
      await loadSounds({
        'pokedex-move': '/sounds/pokedexMoveButton.mp3',
        'pokedex-on': '/sounds/pokedexOn.mp3',
        'pokedex-off': '/sounds/pokedexOff.wav',
      })
      playSound('pokedex-on')
    })()
  }, [open, loadSounds, playSound])
  const closeWithSound = () => {
    playSound('pokedex-off')
    onClose()
  }
  const { data: pokemon, status, error, isFetching } = usePokemonDetails(pokemonIdOrName)
  const { data: evolutionTree } = useEvolutionTree(pokemonIdOrName)
  const { favorites, toggle } = useFavoritesStore()
  const screenRef = useRef<HTMLDivElement | null>(null)
  const scrollScreenBy = (top: number) => {
    screenRef.current?.scrollBy({ top, behavior: preferredScrollBehavior() })
  }
  const navigateTo = (idOrName: number | string) => {
    scrollToTop(screenRef.current)
    playSound('pokedex-move')
    onNavigate?.(idOrName)
  }

  const isFavorite = pokemon ? favorites.includes(pokemon.id) : false

  const typeQueries = useQueries({
    queries:
      pokemon?.types.map((t) => ({
        queryKey: ['types', 'damage', t],
        queryFn: () => pokemonApi.typeByIdOrName(t),
        enabled: !!pokemon,
        staleTime: 1000 * 60 * 60,
      })) ?? [],
  })

  const weaknesses = (() => {
    const details = typeQueries.map((q) => q.data).filter(Boolean) as Array<{
      name: string
      damage_relations?: {
        double_damage_from: Array<{ name: string }>
        half_damage_from: Array<{ name: string }>
        no_damage_from: Array<{ name: string }>
      }
    }>
    if (!details.length) return []
    const mult = new Map<string, number>()
    for (const d of details) {
      const dr = d.damage_relations
      if (!dr) continue
      for (const it of dr.double_damage_from) {
        mult.set(it.name, (mult.get(it.name) ?? 1) * 2)
      }
      for (const it of dr.half_damage_from) {
        mult.set(it.name, (mult.get(it.name) ?? 1) * 0.5)
      }
      for (const it of dr.no_damage_from) {
        mult.set(it.name, 0)
      }
    }
    const result = Array.from(mult.entries())
      .filter(([, v]) => v > 1)
      .sort((a, b) => b[1] - a[1])
    return result
  })()

  return (
    // The dialog owns its transitions: wrapped in a Transition of ours it mounted too late to make the page
    // behind it inert, and a screen reader could still walk the list under the open Pokédex.
    <Dialog open={open} onClose={closeWithSound} className="relative z-50">
      {/* 1. Smooth backdrop transition */}
      <DialogBackdrop transition className={cn('fixed inset-0 bg-black/60', BACKDROP_TRANSITION)} />
      <DialogViewport onDismiss={closeWithSound}>
        {/* 2. Dynamic Pokédex casing transition */}
        <TransitionChild>
          <div
            className={cn(
              'relative m-auto flex items-center justify-center py-2 px-[calc(var(--side)/2)] w-full max-w-md sm:max-w-2xl',
              CASING_AROUND_SCREEN,
              CASING_SIDE_PADDING,
              CASING_TRANSITION,
            )}
          >
            <div className="relative w-full bg-[#e30000] rounded-tl-[60px] rounded-tr-2xl rounded-br-2xl rounded-bl-[40px] border-b-[12px] border-r-[12px] border-[#a00000] py-4 px-(--side) sm:p-6 shadow-2xl overflow-hidden">
              <div className="absolute left-0 top-1/4 bottom-1/4 w-3 bg-[#c00000] border-r border-black/10 rounded-r-full" />
              <div className="flex items-start gap-4 mb-4 sm:mb-6">
                <div className="relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full border-4 border-slate-200 shadow-lg">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-500 rounded-full border-2 border-blue-300 motion-safe:animate-pulse shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />
                  <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full rotate-[-45deg]" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full border border-black/30 shadow-[0_0_5px_red]" />
                  <div className="w-4 h-4 bg-yellow-400 rounded-full border border-black/30 shadow-[0_0_5px_yellow]" />
                  <div className="w-4 h-4 bg-green-500 rounded-full border border-black/30 shadow-[0_0_5px_green]" />
                </div>
              </div>
              <div className="bg-[#dedede] pt-4 px-(--side) sm:p-6 pb-10 rounded-xl rounded-bl-[40px] border-b-4 border-r-4 border-gray-400 shadow-inner flex flex-col min-h-0">
                <div
                  ref={screenRef}
                  className={cn(
                    'relative mx-auto w-full flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-pt-14 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-black/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]',
                    SCREEN_MAX_HEIGHT,
                  )}
                >
                  {scan && (
                    <div key={scan.run} className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="animate-scan absolute left-0 right-0 top-0 h-[45%] bg-gradient-to-b from-emerald-300/0 via-emerald-300/60 to-emerald-300/0 mix-blend-screen blur-[2px]" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.5)_0,rgba(255,255,255,0.5)_2px,rgba(0,0,0,0)_4px)]" />
                  {pokemon && onNavigate && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous Pokémon"
                        title="Previous Pokémon"
                        disabled={isFetching || pokemon.id <= 1}
                        onPointerDown={() => {
                          skipNextClickRef.current = true
                          triggerBlue()
                          const prevId = Math.max(1, pokemon.id - 1)
                          navigateTo(prevId)
                        }}
                        onClick={() => {
                          if (skipNextClickRef.current) {
                            skipNextClickRef.current = false
                            return
                          }
                          const prevId = Math.max(1, pokemon.id - 1)
                          navigateTo(prevId)
                        }}
                        className={cn(
                          'flex items-center justify-center absolute left-2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 shadow hover:bg-white dark:hover:bg-slate-700 transition motion-reduce:transition-none disabled:opacity-50 hint-loop',
                          SCREEN_ARROW_TOP,
                        )}
                      >
                        <ChevronLeftIcon className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next Pokémon"
                        title="Next Pokémon"
                        disabled={isFetching}
                        onPointerDown={() => {
                          skipNextClickRef.current = true
                          triggerGreen()
                          navigateTo(pokemon.id + 1)
                        }}
                        onClick={() => {
                          if (skipNextClickRef.current) {
                            skipNextClickRef.current = false
                            return
                          }
                          navigateTo(pokemon.id + 1)
                        }}
                        className={cn(
                          'flex items-center justify-center absolute right-2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 shadow hover:bg-white dark:hover:bg-slate-700 transition motion-reduce:transition-none disabled:opacity-50 hint-loop',
                          SCREEN_ARROW_TOP,
                        )}
                      >
                        <ChevronRightIcon className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  {/* The screen's scroll-pt-14 is this bar: a control that takes the focus scrolls clear of it. */}
                  <div className="sticky top-0 flex justify-end p-2 bg-white/90 dark:bg-slate-900/90 z-10">
                    <Button variant="ghost" size="sm" onClick={closeWithSound} aria-label="Close">
                      <XMarkIcon className="w-6 h-6" />
                    </Button>
                  </div>
                  <div className="px-(--side) pb-4 wrap-anywhere">
                    {!pokemon && <DialogTitle className="sr-only">Pokémon details</DialogTitle>}
                    {status === 'pending' && !pokemon && <Loader className="min-h-[200px]" />}
                    {status === 'error' && (
                      <p className="text-red-600 dark:text-red-400 py-6">{loadErrorMessage(error, 'Error loading.')}</p>
                    )}
                    {pokemon && (
                      <>
                        {isFetching && (
                          <div className="absolute inset-0 z-20 rounded-lg bg-black/10 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                            <Loader className="p-4" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            #{String(pokemon.id).padStart(3, '0')}
                          </p>
                          <DialogTitle
                            as="h2"
                            className="text-2xl font-bold capitalize break-words text-slate-800 dark:text-slate-100"
                          >
                            {pokemon.name.replace(/-/g, ' ')}
                          </DialogTitle>
                          <div className="flex justify-center gap-2 mt-2 flex-wrap">
                            {pokemon.types.map((t) => (
                              <span
                                key={t}
                                className={cn(
                                  'text-sm font-medium px-3 py-1 rounded-full capitalize',
                                  getTypeBadgeClass(t),
                                )}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          {pokemon.image && (
                            <img
                              src={pokemon.image}
                              alt={pokemon.name}
                              width={192}
                              height={192}
                              decoding="async"
                              className="mx-auto w-40 h-40 sm:w-48 sm:h-48 object-contain mt-4"
                            />
                          )}
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <span className="text-slate-600 dark:text-slate-300">Height</span>
                              <p className="font-medium">{pokemon.height / 10} m</p>
                            </div>
                            <div>
                              <span className="text-slate-600 dark:text-slate-300">Weight</span>
                              <p className="font-medium">{pokemon.weight / 10} kg</p>
                            </div>
                          </div>
                          {weaknesses.length > 0 && (
                            <div className="mt-6 text-left">
                              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Weaknesses</h3>
                              <div className="flex flex-wrap gap-2">
                                {weaknesses.map(([type, factor]) => (
                                  <span
                                    key={type}
                                    className={cn(
                                      'text-sm font-medium px-3 py-1 rounded-full capitalize',
                                      getTypeBadgeClass(type),
                                    )}
                                    title={`x${factor.toFixed(1)}`}
                                  >
                                    {type} ×{factor.toFixed(1)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {pokemon.moves.length > 0 && (
                            <Disclosure>
                              {({ open }) => (
                                <div className="mt-6 text-left">
                                  <DisclosureButton className="w-full flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-left font-semibold text-slate-800 dark:text-slate-100">
                                    <span>Moves</span>
                                    <ChevronDownIcon
                                      className={cn(
                                        'w-5 h-5 shrink-0 transition-transform motion-reduce:transition-none',
                                        open ? 'rotate-180' : '',
                                      )}
                                    />
                                  </DisclosureButton>
                                  <DisclosurePanel>
                                    <ul className="grid grid-cols-2 gap-2 p-3">
                                      {pokemon.moves.slice(0, 12).map((m) => (
                                        <li
                                          key={m}
                                          className="text-sm capitalize px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                                        >
                                          {m.replace(/-/g, ' ')}
                                        </li>
                                      ))}
                                    </ul>
                                  </DisclosurePanel>
                                </div>
                              )}
                            </Disclosure>
                          )}
                          <Button
                            variant={isFavorite ? 'secondary' : 'primary'}
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              const wasFavorite = isFavorite
                              toggle(pokemon.id)
                              const displayName = pokemon.name.replace(/-/g, ' ')
                              toast({
                                variant: wasFavorite ? 'info' : 'success',
                                title: wasFavorite ? 'Removed from favorites' : 'Added to favorites',
                                message: wasFavorite
                                  ? `${displayName} was removed from your favorites.`
                                  : `${displayName} was added to your favorites.`,
                              })
                            }}
                          >
                            {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          </Button>
                        </div>
                        {evolutionTree && (
                          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Evolution chain</h3>
                            <EvolutionChain chain={evolutionTree} onNavigate={navigateTo} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 px-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full border border-black/20 shadow-md" />
                  <div className="flex gap-4">
                    <div className="w-10 h-1 bg-black/20 rounded-full" />
                    <div className="w-10 h-1 bg-black/20 rounded-full" />
                  </div>
                </div>
              </div>
              {/* Only the lights give way in a narrow casing; a row that cannot hold both controls wraps. */}
              <div className="flex flex-wrap justify-between items-center gap-x-1 gap-y-3 mt-6 px-4">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    skipNextClickRef.current = true
                    closeWithSound()
                  }}
                  onClick={() => {
                    if (skipNextClickRef.current) {
                      skipNextClickRef.current = false
                      return
                    }
                    closeWithSound()
                  }}
                  className="shrink-0 w-12 h-12 bg-slate-800 rounded-full border-b-4 border-black shadow-lg active:translate-y-1 transition-all motion-reduce:transition-none hint-loop"
                  aria-label="Close Pokédex"
                />
                <div className="flex gap-3 flex-1 min-w-0 max-w-[7.75rem]">
                  <div
                    className={cn(
                      'w-14 h-3 bg-blue-900 rounded-xs border border-black/40 shadow-inner',
                      blinkBlue && 'led-blink-blue',
                    )}
                  />
                  <div
                    className={cn(
                      'w-14 h-3 bg-green-900 rounded-xs border border-black/40 shadow-inner',
                      blinkGreen && 'led-blink-green',
                    )}
                  />
                </div>
                <div
                  className="relative shrink-0 w-20 h-20 cursor-pointer hint-loop select-none touch-none"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-1/2 left-0 w-20 h-6 -translate-y-1/2 bg-slate-800 rounded-xs border-b-2 border-black transition motion-reduce:transition-none hover:ring-2 hover:ring-emerald-400/40" />
                  <div className="absolute left-1/2 top-0 w-6 h-20 -translate-x-1/2 bg-slate-800 rounded-xs border-r-2 border-black transition motion-reduce:transition-none hover:ring-2 hover:ring-emerald-400/40" />
                  <button
                    type="button"
                    aria-label="Previous Pokémon"
                    disabled={isFetching || !pokemon || (pokemon && pokemon.id <= 1) || !onNavigate}
                    onPointerDown={(e) => {
                      e.preventDefault()
                      skipNextClickRef.current = true
                      triggerBlue()
                      if (!pokemon || !onNavigate) return
                      const prevId = Math.max(1, pokemon.id - 1)
                      navigateTo(prevId)
                    }}
                    onClick={() => {
                      if (skipNextClickRef.current) {
                        skipNextClickRef.current = false
                        return
                      }
                      triggerBlue()
                      if (!pokemon || !onNavigate) return
                      const prevId = Math.max(1, pokemon.id - 1)
                      navigateTo(prevId)
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6"
                  />
                  <button
                    type="button"
                    aria-label="Next Pokémon"
                    disabled={isFetching || !pokemon || !onNavigate}
                    onPointerDown={(e) => {
                      e.preventDefault()
                      skipNextClickRef.current = true
                      triggerGreen()
                      if (!pokemon || !onNavigate) return
                      navigateTo(pokemon.id + 1)
                    }}
                    onClick={() => {
                      if (skipNextClickRef.current) {
                        skipNextClickRef.current = false
                        return
                      }
                      triggerGreen()
                      if (!pokemon || !onNavigate) return
                      navigateTo(pokemon.id + 1)
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6"
                  />
                  <button
                    type="button"
                    aria-label="Scroll up"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      skipNextClickRef.current = true
                      scrollScreenBy(-PAD_SCROLL_STEP_PX)
                    }}
                    onClick={() => {
                      if (skipNextClickRef.current) {
                        skipNextClickRef.current = false
                        return
                      }
                      scrollScreenBy(-PAD_SCROLL_STEP_PX)
                    }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6"
                  />
                  <button
                    type="button"
                    aria-label="Scroll down"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      skipNextClickRef.current = true
                      scrollScreenBy(PAD_SCROLL_STEP_PX)
                    }}
                    onClick={() => {
                      if (skipNextClickRef.current) {
                        skipNextClickRef.current = false
                        return
                      }
                      scrollScreenBy(PAD_SCROLL_STEP_PX)
                    }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </TransitionChild>
      </DialogViewport>
    </Dialog>
  )
}

/** Flattens a linear evolution chain (A → B → C without branches) into an array. */
function flattenLinearChain(node: EvolutionNode): EvolutionNode[] {
  const steps: EvolutionNode[] = [node]
  if (node.children.length === 1) {
    steps.push(...flattenLinearChain(node.children[0]))
  }
  return steps
}

/** Renders the evolution chain horizontally ([A] → [B] → [C]), or branches below when split (e.g. Eevee). */
function EvolutionChain({ chain, onNavigate }: { chain: EvolutionNode; onNavigate?: (id: number | string) => void }) {
  const isLinear = chain.children.length <= 1
  const steps = isLinear ? flattenLinearChain(chain) : [chain]

  if (steps.length > 1) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((node, i) => (
          <span key={node.id} className="inline-flex flex-wrap items-center gap-2">
            <EvolutionChip id={node.id} name={node.name} onClick={onNavigate} />
            {i < steps.length - 1 && (
              <span className="text-slate-500 dark:text-slate-300 shrink-0" aria-hidden>
                →
              </span>
            )}
          </span>
        ))}
      </div>
    )
  }

  if (chain.children.length > 1) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <EvolutionChip id={chain.id} name={chain.name} onClick={onNavigate} />
          <span className="text-slate-500 dark:text-slate-300">→</span>
        </div>
        <div className="flex flex-wrap gap-2 pl-2">
          {chain.children.map((child) => (
            <EvolutionChip key={child.id} id={child.id} name={child.name} onClick={onNavigate} />
          ))}
        </div>
      </div>
    )
  }

  return <EvolutionChip id={chain.id} name={chain.name} onClick={onNavigate} />
}

function EvolutionChip({ id, name, onClick }: { id: number; name: string; onClick?: (id: number | string) => void }) {
  const displayName = name.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className="inline-flex px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 capitalize text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition motion-reduce:transition-none"
      title={`View ${displayName}`}
    >
      {displayName}
    </button>
  )
}
