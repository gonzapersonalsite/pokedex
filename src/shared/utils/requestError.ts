/** A non-2xx HTTP response. The status is kept so callers can classify it without parsing the message. */
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/** A request the client aborted because it outlived its deadline: a slow server, not a refusal. */
export class HttpTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HttpTimeoutError'
  }
}

export type RequestErrorKind = 'network' | 'timeout' | 'notFound' | 'other'

/**
 * The Fetch spec only says fetch() rejects with a TypeError when it gets no response
 * (DNS failure, refused or dropped connection, CORS block); each engine words it differently.
 */
const FETCH_NETWORK_FAILURE_MESSAGES = [
  'Failed to fetch', // Chromium (Chrome, Edge)
  'NetworkError when attempting to fetch resource.', // Gecko (Firefox)
  'Load failed', // WebKit (Safari)
]

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

function isFetchNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError && FETCH_NETWORK_FAILURE_MESSAGES.some((message) => error.message.includes(message))
}

/**
 * The single place that decides what a failed request means, so the global toasts,
 * the retry policy and every inline error message agree on it.
 */
export function classifyRequestError(error: unknown): RequestErrorKind {
  if (error instanceof HttpError && error.status === 404) return 'notFound'
  if (error instanceof HttpTimeoutError) return 'timeout'
  if (isOffline()) return 'network'
  if (isFetchNetworkFailure(error)) return 'network'
  return 'other'
}
