'use client';

import { ReactNode } from 'react';
import { CKBConnectorProvider, useCKBConnector } from '@ckb-ccc/connector-react';
import { SporeProvider } from '@spore-sdk/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setSporeConfig } from '@spore-sdk/core';
import { getSporeConfig } from '@/lib/ckb/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Initialize Spore config
setSporeConfig(getSporeConfig());

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SporeProvider>
        <CKBConnectorProvider
          supportedWallets={['joyid', 'metamask', 'walletconnect']}
          appName="CKB Credential Registry"
        >
          {children}
        </CKBConnectorProvider>
      </SporeProvider>
    </QueryClientProvider>
  );
}
