import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'pokedex-favorites';

interface FavoritesState {
  favorites: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggle: (id) =>
        set((state) => {
          const has = state.favorites.includes(id);
          const next = has
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id].sort((a, b) => a - b);
          return { favorites: next };
        }),
      isFavorite: (id) => get().favorites.includes(id),
    }),
    { name: STORAGE_KEY }
  )
);
