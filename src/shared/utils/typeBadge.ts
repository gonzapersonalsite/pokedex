/** Tailwind classes per Pokémon type (shared across cards and modal). */
export function getTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    normal: 'bg-slate-600 text-white',
    fire: 'bg-orange-700 text-white',
    water: 'bg-blue-600 text-white',
    grass: 'bg-green-700 text-white',
    electric: 'bg-yellow-400 text-slate-900',
    ice: 'bg-cyan-300 text-slate-900',
    fighting: 'bg-red-700 text-white',
    poison: 'bg-purple-700 text-white',
    ground: 'bg-amber-700 text-white',
    flying: 'bg-indigo-600 text-white',
    psychic: 'bg-pink-700 text-white',
    bug: 'bg-lime-800 text-white',
    rock: 'bg-amber-800 text-white',
    ghost: 'bg-indigo-800 text-white',
    dragon: 'bg-violet-700 text-white',
    dark: 'bg-slate-800 text-white',
    steel: 'bg-slate-600 text-white',
    fairy: 'bg-pink-200 text-slate-900',
  }
  return map[type] ?? 'bg-slate-600 text-white'
}
