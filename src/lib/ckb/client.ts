import { ccc } from '@ckb-ccc/core';
import { getNetwork, getNetworkConfig } from './config';

let clientInstance: ccc.Client | null = null;

/**
 * Create a CKB client for the current network
 */
export function createClient(): ccc.Client {
  const network = getNetwork();
  const config = getNetworkConfig();

  switch (network) {
    case 'testnet':
      return new ccc.ClientPublicTestnet();
    case 'mainnet':
      return new ccc.ClientPublicMainnet();
    default:
      // Devnet - use custom RPC URL
      return new ccc.ClientPublicRpc(config.ckbNodeUrl);
  }
}

/**
 * Get the default client instance (singleton)
 */
export function getDefaultClient(): ccc.Client {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

/**
 * Create a client for server-side rendering
 */
export function createClientForServer(): ccc.Client {
  const config = getNetworkConfig();
  if (!config.ckbNodeUrl) {
    throw new Error('NEXT_PUBLIC_CKB_NODE_URL is not set');
  }
  return new ccc.ClientPublicRpc(config.ckbNodeUrl);
}

/**
 * Reset client instance (useful for network switching)
 */
export function resetClient(): void {
  clientInstance = null;
}

/**
 * Check if client is connected
 */
export async function isClientConnected(): Promise<boolean> {
  try {
    const client = getDefaultClient();
    await client.getTip();
    return true;
  } catch {
    return false;
  }
}
