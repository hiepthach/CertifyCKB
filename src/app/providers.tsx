'use client';

import { ReactNode, useMemo } from 'react';
import { Provider } from '@ckb-ccc/connector-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ccc } from '@ckb-ccc/core';
import { getNetwork } from '@/lib/ckb/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create client options based on network
  const clientOptions = useMemo(() => {
    const network = getNetwork();

    const options: { name: string; icon: string; client: ccc.Client }[] = [];

    // Testnet client
    if (network === 'testnet') {
      options.push({
        name: 'Testnet (Aggron)',
        icon: '🧪',
        client: new ccc.ClientPublicTestnet(),
      });
    }

    // Mainnet client
    options.push({
      name: 'Mainnet',
      icon: '⚡',
      client: new ccc.ClientPublicMainnet(),
    });

    return options;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider
        clientOptions={clientOptions}
        preferredNetworks={['CKB'] as unknown as ccc.NetworkPreference[]}
      >
        {children}
      </Provider>
    </QueryClientProvider>
  );
}
