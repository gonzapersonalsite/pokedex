import { useQuery } from '@tanstack/react-query';
import { pokemonApi } from '../api/pokemonApi';
import { mapPokemonFromApi } from '@/entities/pokemon';

/** Búsqueda por nombre o ID. Desacoplado del listado. */
export function usePokemonSearch(query: string) {
  const trimmed = query.trim().toLowerCase();
  return useQuery({
    queryKey: ['pokemon', 'search', trimmed],
    queryFn: ({ signal }) => pokemonApi.byIdOrName(trimmed, { signal }),
    enabled: trimmed.length > 0,
    select: (data) => mapPokemonFromApi(data),
  });
}
