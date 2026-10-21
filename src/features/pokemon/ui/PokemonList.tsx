import { useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePokemonList, useTypeRefs, usePokemonListByType } from '../model'
import { useFavoritesStore } from '@/entities/favorites'
import { PokemonCard } from './PokemonCard'
import { loadErrorMessage } from './loadErrorMessage'
import { Loader } from '@/shared/ui'
import { toast } from '@/shared/utils'
import { pokemonApi } from '../api/pokemonApi'
import { mapPokemonFromApi } from '@/entities/pokemon'

export interface PokemonListProps {
  onSelectPokemon?: (id: number) => void
  /** When set, filters the list by this type name (e.g. "grass"). */
  typeFilter?: string | null
  /** When true, displays only favorites (ignores typeFilter). */
  favoritesOnly?: boolean
}

/**
 * Responsive grid list with full-page scroll and IntersectionObserver infinite scroll.
 * When typeFilter is set, displays only Pokémon of that type.
 */
export function PokemonList({ onSelectPokemon, typeFilter, favoritesOnly = false }: PokemonListProps) {
  const defaultList = usePokemonList()
  const { data: typeRefs = [], isPending: isRefsPending } = useTypeRefs(typeFilter ?? null)
  const byTypeList = usePokemonListByType(typeFilter ?? null, typeRefs)

  const useFiltered = !favoritesOnly && !!typeFilter && typeFilter.length > 0
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useFiltered ? byTypeList : defaultList

  const list = data?.pages.flatMap((p) => p.list) ?? []
  const { favorites, toggle } = useFavoritesStore()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const isLoadingRefs = useFiltered && isRefsPending

  const {
    data: favList = [],
    status: favStatus,
    error: favError,
  } = useQuery({
    queryKey: ['pokemon', 'favorites', favorites],
    queryFn: async () => {
      const details = await Promise.all(favorites.map((id) => pokemonApi.byIdOrName(id)))
      return details.map(mapPokemonFromApi)
    },
    enabled: favoritesOnly && favorites.length > 0,
  })

  useEffect(() => {
    if (favoritesOnly) return
    if (!hasNextPage || isFetchingNextPage || list.length === 0) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage()
      },
      { rootMargin: '200px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [favoritesOnly, hasNextPage, isFetchingNextPage, fetchNextPage, list.length])

  if (!favoritesOnly && useFiltered && !isLoadingRefs && typeRefs.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        There are no Pokémon for the selected type.
      </div>
    )
  }

  if (!favoritesOnly && (status === 'pending' || isLoadingRefs)) {
    return <Loader className="min-h-[300px]" />
  }

  if (!favoritesOnly && status === 'error') {
    return (
      <div
        className="py-12 text-center text-red-600 dark:text-red-400 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
        role="alert"
      >
        {`Error: ${loadErrorMessage(error, 'Could not load the list.')}`}
      </div>
    )
  }

  if (!favoritesOnly && list.length === 0) {
    return <div className="py-12 text-center text-slate-500 dark:text-slate-400">There are no Pokémon to display.</div>
  }

  if (favoritesOnly) {
    if (favorites.length === 0) {
      return (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">You haven’t added any favorites yet.</div>
      )
    }
    if (favStatus === 'pending') {
      return <Loader className="min-h-[300px]" />
    }
    if (favStatus === 'error') {
      return (
        <div
          className="py-12 text-center text-red-600 dark:text-red-400 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
          role="alert"
        >
          {`Error: ${loadErrorMessage(favError, 'Could not load favorites.')}`}
        </div>
      )
    }
  }

  return (
    <div className="w-full">
      {/* Responsive grid: 1 col on mobile, 2–3–4 on larger viewports. */}
      <ul
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 list-none p-0 m-0"
        role="list"
      >
        {(favoritesOnly ? favList : list).map((pokemon, index) => (
          <li key={pokemon.id} className="min-w-0">
            <PokemonCard
              pokemon={pokemon}
              priority={index < 2}
              eager={index < 8}
              isFavorite={favorites.includes(pokemon.id)}
              onToggleFavorite={(id) => {
                const wasFavorite = favorites.includes(id)
                toggle(id)
                const displayName = pokemon.name.replace(/-/g, ' ')
                toast({
                  variant: wasFavorite ? 'info' : 'success',
                  title: wasFavorite ? 'Removed from favorites' : 'Added to favorites',
                  message: wasFavorite
                    ? `${displayName} was removed from your favorites.`
                    : `${displayName} was added to your favorites.`,
                })
              }}
              onClick={onSelectPokemon}
            />
          </li>
        ))}
      </ul>

      {/* Sentinel to load more on scroll */}
      {!favoritesOnly && <div ref={sentinelRef} className="h-4 flex-shrink-0" aria-hidden />}
      {!favoritesOnly && isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader className="p-4" />
        </div>
      )}
    </div>
  )
}
