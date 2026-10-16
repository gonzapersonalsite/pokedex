import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { classifyRequestError, toast, type RequestErrorKind } from '@/shared/utils';

const ERROR_TOAST_COOLDOWN_MS = 8000;
const MAX_QUERY_RETRIES = 2;

type ToastedErrorKind = Exclude<RequestErrorKind, 'notFound'>;

const ERROR_TOASTS: Record<ToastedErrorKind, { title: string; message: string }> = {
  network: {
    title: 'Network error',
    message: 'You appear to be offline. Check your connection and try again.',
  },
  timeout: {
    title: 'Request timed out',
    message: 'The server took too long to answer. Check your connection and try again.',
  },
  other: {
    title: 'Request failed',
    message: 'Could not load Pokémon data. Please try again in a moment.',
  },
};

function createQueryClient() {
  // One cooldown per kind, so a burst of failing queries (an outage or a 429) shows a single toast.
  const lastToastAt: Record<ToastedErrorKind, number> = { network: 0, timeout: 0, other: 0 };

  return new QueryClient({
    // TanStack Query v5 ignores onError in defaultOptions.queries; the QueryCache is the global hook.
    queryCache: new QueryCache({
      onError: (err) => {
        const kind = classifyRequestError(err);
        if (kind === 'notFound') return;
        const now = Date.now();
        if (now - lastToastAt[kind] < ERROR_TOAST_COOLDOWN_MS) return;
        lastToastAt[kind] = now;
        toast({ variant: 'error', ...ERROR_TOASTS[kind] });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        // A missing Pokémon or resource stays missing, so retrying it only delays the answer.
        retry: (failureCount, error) =>
          classifyRequestError(error) !== 'notFound' && failureCount < MAX_QUERY_RETRIES,
      },
      mutations: {
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unexpected error';
          toast({
            variant: 'error',
            title: 'Operation failed',
            message,
          });
        },
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
