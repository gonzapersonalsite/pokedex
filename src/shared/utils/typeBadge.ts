/** Clases Tailwind por tipo de Pokémon (mismo color en cartas y modal). */
export function getTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    normal: 'bg-slate-400/90 text-white',
    fire: 'bg-orange-500/90 text-white',
    water: 'bg-blue-500/90 text-white',
    grass: 'bg-green-500/90 text-white',
    electric: 'bg-yellow-500/90 text-slate-900',
    ice: 'bg-cyan-400/90 text-slate-900',
    fighting: 'bg-red-700/90 text-white',
    poison: 'bg-purple-600/90 text-white',
    ground: 'bg-amber-700/90 text-white',
    flying: 'bg-indigo-400/90 text-white',
    psychic: 'bg-pink-500/90 text-white',
    bug: 'bg-lime-600/90 text-white',
    rock: 'bg-amber-800/90 text-white',
    ghost: 'bg-indigo-800/90 text-white',
    dragon: 'bg-violet-700/90 text-white',
    dark: 'bg-slate-800 text-white',
    steel: 'bg-slate-500/90 text-white',
    fairy: 'bg-pink-300/90 text-slate-900',
  }
  return map[type] ?? 'bg-slate-500/90 text-white'
}
