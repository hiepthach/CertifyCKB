'use client';

import { ReactNode, useMemo } from 'react';
import { Provider } from '@ckb-ccc/connector-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ccc } from '@ckb-ccc/core';
import { getNetwork, getNetworkConfig } from '@/lib/ckb/config';

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
    const config = getNetworkConfig();
    const network = getNetwork();

    const options: { name: string; icon: string; client: ccc.Client }[] = [];

    // Devnet client
    if (network === 'devnet' || config.ckbNodeUrl.includes('localhost')) {
      options.push({
        name: 'Devnet (Local)',
        icon: '🔧',
        client: new ccc.ClientPublicTestnet(), // Use testnet as fallback
      });
    }

    // Testnet client
    options.push({
      name: 'Testnet (Aggron)',
      icon: '🧪',
      client: new ccc.ClientPublicTestnet(),
    });

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
