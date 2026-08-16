'use client';

import { useState, useEffect } from 'react';
import { getNetwork, getExplorerUrl, type Network } from '@/lib/ckb';

interface UseNetworkResult {
  network: Network;
  explorerUrl: string;
  isDevnet: boolean;
  isTestnet: boolean;
  isMainnet: boolean;
}

export function useNetwork(): UseNetworkResult {
  const [network, setNetwork] = useState<Network>('devnet');

  useEffect(() => {
    setNetwork(getNetwork());
  }, []);

  return {
    network,
    explorerUrl: getExplorerUrl(),
    isDevnet: network === 'devnet',
    isTestnet: network === 'testnet',
    isMainnet: network === 'mainnet',
  };
}
