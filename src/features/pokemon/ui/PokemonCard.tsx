import type { Pokemon } from '@/entities/pokemon'
import { cn, getTypeBadgeClass } from '@/shared/utils'

export interface PokemonCardProps {
  pokemon: Pokemon
  isFavorite?: boolean
  onToggleFavorite?: (id: number) => void
  onClick?: (id: number) => void
  className?: string
}

/**
 * Pokémon card: image + number + name + types always visible without clipping.
 */
export function PokemonCard({ pokemon, isFavorite = false, onToggleFavorite, onClick, className }: PokemonCardProps) {
  const name = pokemon.name.replace(/-/g, ' ')
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)

  return (
    <article
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
          aria-label={`View details of ${displayName}`}
        >
          {/* Image area: fixed aspect ratio without clipping the content below */}
          <div className="aspect-square bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-4">
            {pokemon.image ? (
              <img
                src={pokemon.image}
                alt={displayName}
                width={192}
                height={192}
                decoding="async"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
            )}
          </div>

          {/* Always-visible info: number, name, types */}
          <div className="p-4 min-h-[5.5rem] flex flex-col justify-center border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              #{String(pokemon.id).padStart(3, '0')}
            </p>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight break-words">
              {displayName}
            </h3>
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
