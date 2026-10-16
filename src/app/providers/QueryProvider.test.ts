import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { QueryProvider } from './QueryProvider';
import { useToastStore } from '@/shared/utils';
import { HttpError } from '@/shared/utils';

function useFailingQuery(key: string, error: Error) {
  return useQuery({
    queryKey: ['test', key],
    queryFn: () => Promise.reject(error),
    retry: false,
  });
}

describe('QueryProvider', () => {
  beforeEach(() => {
    useToastStore.getState().clear();
  });

  it('shows a single "Request failed" toast, without the raw URL, when several queries fail together', async () => {
    const { result } = renderHook(
      () => [
        useFailingQuery('server-error-a', new HttpError(500, 'HTTP 500: https://pokeapi.co/api/v2/type')),
        useFailingQuery('server-error-b', new HttpError(429, 'HTTP 429: https://pokeapi.co/api/v2/pokemon/25')),
      ],
      { wrapper: QueryProvider }
    );

    await waitFor(() => expect(result.current.every((q) => q.isError)).toBe(true));
    expect(useToastStore.getState().toasts).toEqual([
      expect.objectContaining({
        variant: 'error',
        title: 'Request failed',
        message: 'Could not load Pokémon data. Please try again in a moment.',
      }),
    ]);
  });

  it('shows a single "Network error" toast when several queries cannot reach the network', async () => {
    const { result } = renderHook(
      () => [
        useFailingQuery('offline-a', new TypeError('Failed to fetch')),
        useFailingQuery('offline-b', new TypeError('Failed to fetch')),
      ],
      { wrapper: QueryProvider }
    );

    await waitFor(() => expect(result.current.every((q) => q.isError)).toBe(true));
    expect(useToastStore.getState().toasts).toEqual([
      expect.objectContaining({
        variant: 'error',
        title: 'Network error',
        message: 'You appear to be offline. Check your connection and try again.',
      }),
    ]);
  });

  it('does not show a toast when the Pokémon does not exist', async () => {
    const { result } = renderHook(
      () => useFailingQuery('not-found', new HttpError(404, 'There is no Pokémon with that name or ID.')),
      { wrapper: QueryProvider }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('does not retry a request for a resource that does not exist', async () => {
    const queryFn = vi.fn(() => Promise.reject(new HttpError(404, 'There is no Pokémon with that name or ID.')));
    const { result } = renderHook(
      () => useQuery({ queryKey: ['test', 'missing'], queryFn, retryDelay: 0 }),
      { wrapper: QueryProvider }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('retries other failures twice before giving up', async () => {
    const queryFn = vi.fn(() => Promise.reject(new HttpError(500, 'HTTP 500: https://pokeapi.co/api/v2/type')));
    const { result } = renderHook(
      () => useQuery({ queryKey: ['test', 'flaky'], queryFn, retryDelay: 0 }),
      { wrapper: QueryProvider }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryFn).toHaveBeenCalledTimes(3);
  });
});
