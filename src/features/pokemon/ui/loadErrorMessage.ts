import { classifyRequestError } from '@/shared/utils';

/** The message an inline load failure shows: network and timeout have their own copy, the rest its error. */
export function loadErrorMessage(error: unknown, fallback: string): string {
  const kind = classifyRequestError(error);
  if (kind === 'network') {
    return 'Network unavailable. Check your internet connection and try again.';
  }
  if (kind === 'timeout') {
    return 'The server took too long to answer. Try again.';
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
