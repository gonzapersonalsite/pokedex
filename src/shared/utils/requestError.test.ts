import { describe, it, expect, vi, afterEach } from 'vitest';
import { HttpError, HttpTimeoutError, classifyRequestError } from './requestError';

describe('classifyRequestError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('treats a 404 response as not found, whatever its message', () => {
    expect(classifyRequestError(new HttpError(404, 'There is no Pokémon with that name or ID.'))).toBe(
      'notFound'
    );
  });

  it('treats a request that outlived its deadline as a timeout', () => {
    expect(
      classifyRequestError(
        new HttpTimeoutError('Request timed out after 10000 ms: https://pokeapi.co/api/v2/type')
      )
    ).toBe('timeout');
  });

  // The TypeError message each engine's fetch() rejects with when it gets no response.
  it.each([
    ['Chromium', 'Failed to fetch'],
    ['Gecko (Firefox)', 'NetworkError when attempting to fetch resource.'],
    ['WebKit (Safari)', 'Load failed'],
  ])('treats a fetch that cannot reach the server in %s as a network error', (_engine, message) => {
    expect(classifyRequestError(new TypeError(message))).toBe('network');
  });

  it('does not treat an aborted request or an unrelated TypeError as a network error', () => {
    expect(classifyRequestError(new DOMException('signal is aborted without reason', 'AbortError'))).toBe(
      'other'
    );
    expect(classifyRequestError(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(
      'other'
    );
  });

  it('treats any failure while the browser is offline as a network error', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(classifyRequestError(new HttpError(500, 'HTTP 500: https://pokeapi.co/api/v2/type'))).toBe(
      'network'
    );
  });

  it('treats other HTTP statuses and unexpected values as other errors', () => {
    expect(classifyRequestError(new HttpError(500, 'HTTP 500: https://pokeapi.co/api/v2/type'))).toBe(
      'other'
    );
    expect(classifyRequestError(new Error('HTTP 404: https://pokeapi.co/api/v2/type/x'))).toBe('other');
    expect(classifyRequestError('boom')).toBe('other');
    expect(classifyRequestError(undefined)).toBe('other');
  });
});
