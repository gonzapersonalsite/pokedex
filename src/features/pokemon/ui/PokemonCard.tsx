import { useEffect, useRef, useState } from 'react'
import { POKEMON_CARD_IMAGE_SIZES, resolvePokemonArtworkSrcSet, type Pokemon } from '@/entities/pokemon'
import { cn, getTypeBadgeClass } from '@/shared/utils'

export interface PokemonCardProps {
  pokemon: Pokemon
  isFavorite?: boolean
  onToggleFavorite?: (id: number) => void
  onClick?: (id: number) => void
  className?: string
  priority?: boolean
}

/**
 * Pokémon card: image + number + name + types always visible without clipping.
 */
export function PokemonCard({
  pokemon,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  className,
  priority = false,
}: PokemonCardProps) {
  const name = pokemon.name.replace(/-/g, ' ')
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const srcSet = resolvePokemonArtworkSrcSet(pokemon.id)
  const cardRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(() => priority || typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (isVisible) return
    const element = cardRef.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '64px 0px', threshold: 0 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible])

  return (
    <article
      ref={cardRef}
      className={cn(
        'rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition hover:shadow-xl hover:border-primary-500/50 dark:hover:border-primary-500/50',
        className,
      )}
      data-testid="pokemon-card"
    >
      <div className="relative">
        <button
          type="button"
          className="w-full text-left focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded-2xl"
          onClick={() => onClick?.(pokemon.id)}
        >
          {/* Image area: fixed aspect ratio without clipping the content below */}
          <div className="aspect-square bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-4">
            {pokemon.image ? (
              isVisible ? (
                <img
                  src={pokemon.image}
                  srcSet={srcSet}
                  sizes={srcSet ? POKEMON_CARD_IMAGE_SIZES : undefined}
                  alt={displayName}
                  width={192}
                  height={192}
                  decoding="async"
                  className="w-full h-full object-contain"
                  loading={priority ? 'eager' : 'lazy'}
                  fetchPriority={priority ? 'high' : undefined}
                />
              ) : (
                <div className="w-full h-full" aria-hidden="true" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
            )}
          </div>

          {/* Always-visible info: number, name, types */}
          <div className="p-4 min-h-[5.5rem] flex flex-col justify-center border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              #{String(pokemon.id).padStart(3, '0')}
            </p>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight break-words">
              {displayName}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', getTypeBadgeClass(type))}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </button>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(pokemon.id)}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md hover:scale-110 transition"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIconOutline className="w-5 h-5 text-slate-500" />
            )}
          </button>
        )}
      </div>
    </article>
  )
}

function HeartIconSolid({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  )
}

function HeartIconOutline({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}
