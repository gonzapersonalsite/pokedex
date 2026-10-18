import { PokeballIcon } from './PokeballIcon'

/**
 * Wobbling Pokéball loader (adapted from CodePen).
 * Uses the same PokeballIcon as the header with a CSS animation.
 */
export function PokeballLoader({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-8 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="relative w-[100px] h-[100px] flex items-center justify-center">
        <div className="pokeball-loader-item absolute inset-0 flex items-center justify-center">
          <PokeballIcon size={100} />
        </div>
      </div>
      <span className="text-sm text-slate-500 dark:text-slate-400">Loading…</span>
    </div>
  )
}
