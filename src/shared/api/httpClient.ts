import { HttpError, HttpTimeoutError } from '@/shared/utils';

// The only module in the product that talks to the network: every request goes through it, so
// the deadline and the errors thrown (the ones classifyRequestError knows) are decided here once.
const DEFAULT_TIMEOUT_MS = 10_000;

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface JsonRequestOptions extends RequestOptions {
  /** The message of the HttpError when the response is 404; the generic one otherwise. */
  notFoundMessage?: string;
}

interface Deadline {
  signal: AbortSignal;
  release: () => void;
  /** Whether the abort came from the deadline and not from the caller. */
  timedOut: () => boolean;
}

// The caller's signal and the deadline travel together: whichever aborts first ends the request,
// and only the deadline turns into an HttpTimeoutError; a caller's abort stays a cancellation.
function withDeadline(signal: AbortSignal | undefined, timeoutMs: number): Deadline {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    release: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', forwardAbort);
    },
  };
}

export async function requestJson<T>(url: string, options: JsonRequestOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = withDeadline(options.signal, timeoutMs);

  try {
    const response = await fetch(url, { signal: deadline.signal });
    if (!response.ok) {
      const message =
        response.status === 404 && options.notFoundMessage
          ? options.notFoundMessage
          : `HTTP ${response.status}: ${url}`;
      throw new HttpError(response.status, message);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (deadline.timedOut()) {
      throw new HttpTimeoutError(`Request timed out after ${timeoutMs} ms: ${url}`);
    }
    throw error;
  } finally {
    deadline.release();
  }
}

export async function requestArrayBuffer(url: string, options: RequestOptions = {}): Promise<ArrayBuffer> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = withDeadline(options.signal, timeoutMs);

  try {
    const response = await fetch(url, { signal: deadline.signal });
    if (!response.ok) throw new HttpError(response.status, `HTTP ${response.status}: ${url}`);
    return await response.arrayBuffer();
  } catch (error) {
    if (deadline.timedOut()) {
      throw new HttpTimeoutError(`Request timed out after ${timeoutMs} ms: ${url}`);
    }
    throw error;
  } finally {
    deadline.release();
  }
}
