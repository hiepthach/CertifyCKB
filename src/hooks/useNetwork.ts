'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNetwork as getEnvNetwork, getNetworkConfig as getEnvNetworkConfig, getExplorerUrl as getEnvExplorerUrl } from '@/lib/ckb/config';

export type Network = 'testnet' | 'mainnet';

const STORAGE_KEY = 'ckb_credential_network';

interface NetworkConfig {
  ckbNodeUrl: string;
  ckbIndexerUrl: string;
  explorerUrl: string;
}

const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  testnet: {
    ckbNodeUrl: 'https://testnet.ckb.dev',
    ckbIndexerUrl: 'https://testnet.ckb.dev',
    explorerUrl: 'https://explorer.nervos.org/aggron2',
  },
  mainnet: {
    ckbNodeUrl: 'https://mainnet.ckb.com',
    ckbIndexerUrl: 'https://mainnet.ckb.com',
    explorerUrl: 'https://explorer.nervos.org',
  },
};

const NETWORK_DISPLAY_NAMES: Record<Network, string> = {
  testnet: 'Testnet (Aggron)',
  mainnet: 'Mainnet',
};

interface UseNetworkResult {
  network: Network;
  explorerUrl: string;
  networkConfig: NetworkConfig;
  displayName: string;
  isTestnet: boolean;
  isMainnet: boolean;
  setNetwork: (network: Network) => void;
}

function getStoredNetwork(): Network | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'testnet' || stored === 'mainnet') {
    return stored;
  }
  return null;
}

function storeNetwork(network: Network): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, network);
}

export function useNetwork(): UseNetworkResult {
  const [network, setNetworkState] = useState<Network>(() => {
    // Try to get from localStorage first
    const stored = getStoredNetwork();
    if (stored) return stored;

    // Fallback to environment variable
    const env = getEnvNetwork();
    if (env === 'testnet' || env === 'mainnet') {
      return env;
    }
    return 'testnet';
  });

  const setNetwork = useCallback((newNetwork: Network) => {
    setNetworkState(newNetwork);
    storeNetwork(newNetwork);
  }, []);

  useEffect(() => {
    // Sync with localStorage on mount
    const stored = getStoredNetwork();
    if (stored && stored !== network) {
      setNetworkState(stored);
    }
  }, []);

  const networkConfig = NETWORK_CONFIGS[network];
  const explorerUrl = networkConfig.explorerUrl;
  const displayName = NETWORK_DISPLAY_NAMES[network];

  return {
    network,
    explorerUrl,
    networkConfig,
    displayName,
    isTestnet: network === 'testnet',
    isMainnet: network === 'mainnet',
    setNetwork,
  };
}

export { NETWORK_DISPLAY_NAMES, NETWORK_CONFIGS };
