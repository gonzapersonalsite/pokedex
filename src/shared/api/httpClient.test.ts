import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError, HttpTimeoutError } from '@/shared/utils';
import { requestArrayBuffer, requestJson } from './httpClient';

// The smallest response the client reads: only what it uses, so the test does not grow with Response.
const okJson = (body: unknown): Response =>
  ({ ok: true, status: 200, json: () => Promise.resolve(body) }) as unknown as Response;
const failure = (status: number): Response => ({ ok: false, status }) as unknown as Response;
const okBytes = (bytes: Uint8Array): Response =>
  ({ ok: true, status: 200, arrayBuffer: () => Promise.resolve(bytes.buffer) }) as unknown as Response;

// A fetch that never answers on its own: it ends when the signal it was given aborts, at once
// when that signal is already aborted, as the real fetch does.
const fetchUntilAborted = () =>
  vi.fn(
    (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const abort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (init.signal?.aborted) abort();
        else init.signal?.addEventListener('abort', abort);
      })
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('requestJson', () => {
  it('does_return_the_parsed_body_when_the_response_is_ok', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(okJson({ id: 25 }))));

    await expect(requestJson<{ id: number }>('https://api.test/pokemon/25')).resolves.toEqual({ id: 25 });
  });

  it('does_throw_an_HttpError_with_the_status_when_the_response_fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(failure(500))));

    const request = requestJson('https://api.test/pokemon/25');

    await expect(request).rejects.toBeInstanceOf(HttpError);
    await expect(request).rejects.toMatchObject({ status: 500 });
  });

  it('does_use_the_friendly_message_for_a_404_when_one_is_given', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(failure(404))));

    await expect(
      requestJson('https://api.test/pokemon/zzz', { notFoundMessage: 'There is no Pokémon with that name or ID.' })
    ).rejects.toThrow('There is no Pokémon with that name or ID.');
  });

  it('does_throw_an_HttpTimeoutError_when_the_request_outlives_its_deadline', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchUntilAborted());

    const request = requestJson('https://api.test/slow', { timeoutMs: 50 });
    const failure = expect(request).rejects.toBeInstanceOf(HttpTimeoutError);
    await vi.advanceTimersByTimeAsync(60);

    await failure;
    await expect(request).rejects.toThrow(/timed out after 50 ms/);
  });

  it('does_keep_the_cancellation_when_the_caller_aborts_the_request', async () => {
    vi.stubGlobal('fetch', fetchUntilAborted());
    const controller = new AbortController();

    const request = requestJson('https://api.test/slow', { signal: controller.signal });
    const failure = expect(request).rejects.toThrow('Aborted');
    controller.abort();

    await failure;
    await expect(request).rejects.toBeInstanceOf(DOMException);
    await expect(request).rejects.not.toBeInstanceOf(HttpTimeoutError);
  });

  it('does_keep_the_cancellation_when_the_caller_aborted_before_the_request', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchUntilAborted());
    const controller = new AbortController();
    controller.abort();

    const request = requestJson('https://api.test/slow', { signal: controller.signal, timeoutMs: 50 });
    const failure = expect(request).rejects.toThrow('Aborted');
    await vi.advanceTimersByTimeAsync(60);

    await failure;
    await expect(request).rejects.not.toBeInstanceOf(HttpTimeoutError);
  });
});

describe('requestArrayBuffer', () => {
  it('does_return_the_bytes_when_the_response_is_ok', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(okBytes(new Uint8Array([1, 2, 3])))));

    const bytes = await requestArrayBuffer('https://api.test/sound.wav');

    expect(new Uint8Array(bytes)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('does_throw_an_HttpError_when_the_response_fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(failure(404))));

    await expect(requestArrayBuffer('https://api.test/sound.wav')).rejects.toBeInstanceOf(HttpError);
  });
});
