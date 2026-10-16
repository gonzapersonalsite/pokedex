import { HttpError } from '@/shared/utils';

// The only module in the product that talks to the network: every request goes through it, so
// the deadline and the error thrown (the one classifyRequestError knows) are decided here once.
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
}

// The caller's signal and the deadline travel together: whichever aborts first ends the request.
function withDeadline(signal: AbortSignal | undefined, timeoutMs: number): Deadline {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  return {
    signal: controller.signal,
    release: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', forwardAbort);
    },
  };
}

export async function requestJson<T>(url: string, options: JsonRequestOptions = {}): Promise<T> {
  const deadline = withDeadline(options.signal, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

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
  } finally {
    deadline.release();
  }
}

export async function requestArrayBuffer(url: string, options: RequestOptions = {}): Promise<ArrayBuffer> {
  const deadline = withDeadline(options.signal, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: deadline.signal });
    if (!response.ok) throw new HttpError(response.status, `HTTP ${response.status}: ${url}`);
    return await response.arrayBuffer();
  } finally {
    deadline.release();
  }
}
