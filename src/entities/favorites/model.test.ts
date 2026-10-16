import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoritesStore } from './model';

describe('useFavoritesStore', () => {
  beforeEach(() => {
    localStorage.removeItem('pokedex-favorites');
    useFavoritesStore.setState({ favorites: [] });
  });

  it('starts with empty favorites', () => {
    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it('toggle adds and removes id', () => {
    useFavoritesStore.getState().toggle(25);
    expect(useFavoritesStore.getState().favorites).toEqual([25]);
    useFavoritesStore.getState().toggle(25);
    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it('isFavorite returns true when id is in favorites', () => {
    useFavoritesStore.getState().toggle(7);
    expect(useFavoritesStore.getState().isFavorite(7)).toBe(true);
    expect(useFavoritesStore.getState().isFavorite(8)).toBe(false);
  });
});
