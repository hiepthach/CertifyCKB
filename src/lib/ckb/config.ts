import type { SporeConfig } from '@spore-sdk/core';
import type { Network, NetworkConfig } from '@/types';

// Network configurations
export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  testnet: {
    ckbNodeUrl: 'https://testnet.ckb.dev',
    ckbIndexerUrl: 'https://testnet.ckb.dev',
    explorerUrl: 'https://testnet.explorer.nervos.org',
  },
  mainnet: {
    ckbNodeUrl: 'https://mainnet.ckb.com',
    ckbIndexerUrl: 'https://mainnet.ckb.com',
    explorerUrl: 'https://explorer.nervos.org',
  },
};

// Get Spore configuration for current network
export function getSporeConfig(): SporeConfig {
  // Both testnet and mainnet use predefined config from Spore SDK
  return undefined as unknown as SporeConfig;
}

// Get current network from environment
export function getNetwork(): Network {
  return (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as Network;
}

// Get network configuration
export function getNetworkConfig(): NetworkConfig {
  const network = getNetwork();
  return NETWORK_CONFIGS[network];
}

// Get explorer URL
export function getExplorerUrl(): string {
  return getNetworkConfig().explorerUrl;
}

// Explorer URL helpers
export function getTransactionUrl(txHash: string): string {
  const explorerUrl = getExplorerUrl();
  return `${explorerUrl}/transaction/${txHash}`;
}

export function getCellUrl(typeHash: string): string {
  const explorerUrl = getExplorerUrl();
  return `${explorerUrl}/cell/${typeHash}`;
}

export function getAddressUrl(address: string): string {
  const explorerUrl = getExplorerUrl();
  return `${explorerUrl}/address/${address}`;
}

// Network display names
export const NETWORK_DISPLAY_NAMES: Record<Network, string> = {
  testnet: 'Testnet (Aggron)',
  mainnet: 'Mainnet',
};
