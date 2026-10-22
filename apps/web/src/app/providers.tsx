import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { SessionProvider } from '../features/session/SessionProvider';
import { ToastProvider, useToast } from '../features/toast/ToastProvider';

function QueryProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 5_000 } },
        // Any failed action tells the user, so no screen has to handle errors one by one.
        mutationCache: new MutationCache({
          onError: (error) => toast(error.message, 'error'),
        }),
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <QueryProvider>
        <SessionProvider>{children}</SessionProvider>
      </QueryProvider>
    </ToastProvider>
  );
}
