import type { SporeConfig } from '@spore-sdk/core';
import type { Network, NetworkConfig } from '@/types';

// Network configurations
export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  devnet: {
    ckbNodeUrl: process.env.NEXT_PUBLIC_CKB_NODE_URL || 'http://localhost:28114',
    ckbIndexerUrl: process.env.NEXT_PUBLIC_CKB_INDEXER_URL || 'http://localhost:28114',
    explorerUrl: '',
  },
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

// Devnet script configurations (from OffCKB)
export const DEVNET_SCRIPTS = {
  SECP256K1_BLAKE160: {
    CODE_HASH: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    HASH_TYPE: 'type' as const,
    TX_HASH: '0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293',
    INDEX: '0x0',
    DEP_TYPE: 'depGroup' as const,
  },
  SPORE: {
    CODE_HASH: process.env.NEXT_PUBLIC_SPORE_CODE_HASH || '0x7e8bf78a62232caa2f5d47e691e8db1a90d05e93dc6828ad3cb935c01ec6d208',
    HASH_TYPE: 'data2' as const,
    TX_HASH: '0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7',
    INDEX: '0xa',
    DEP_TYPE: 'code' as const,
  },
  SPORE_CLUSTER: {
    CODE_HASH: process.env.NEXT_PUBLIC_SPORE_CLUSTER_CODE_HASH || '0x7366a61534fa7c7e6225ecc0d828ea3b5366adec2b58206f2ee84995fe030075',
    HASH_TYPE: 'data2' as const,
    TX_HASH: '0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7',
    INDEX: '0xb',
    DEP_TYPE: 'code' as const,
  },
  OMNILOCK: {
    CODE_HASH: process.env.NEXT_PUBLIC_OMNILOCK_CODE_HASH || '0x540ecae6c76b3830d105c5aa9e6239b2b9804292d4df9f9e72d018d76a14e2c',
    HASH_TYPE: 'type' as const,
  },
};

// Get current network from environment
export function getNetwork(): Network {
  return (process.env.NEXT_PUBLIC_NETWORK || 'devnet') as Network;
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

// Get Spore configuration for current network
export function getSporeConfig(): SporeConfig {
  const network = getNetwork();

  switch (network) {
    case 'testnet':
      // Testnet uses predefined config from Spore SDK
      return undefined as unknown as SporeConfig;
    case 'mainnet':
      return undefined as unknown as SporeConfig;
    default:
      return createDevnetSporeConfig();
  }
}

// Create devnet Spore configuration
function createDevnetSporeConfig(): SporeConfig {
  const networkConfig = NETWORK_CONFIGS.devnet;

  return {
    lumos: undefined as unknown as SporeConfig['lumos'],
    ckbNodeUrl: networkConfig.ckbNodeUrl,
    ckbIndexerUrl: networkConfig.ckbIndexerUrl,
    defaultTags: ['latest'],
    scripts: {
      Spore: {
        versions: [
          {
            tags: ['v2', 'latest'],
            script: {
              codeHash: DEVNET_SCRIPTS.SPORE.CODE_HASH,
              hashType: DEVNET_SCRIPTS.SPORE.HASH_TYPE,
            },
            cellDep: {
              outPoint: {
                txHash: DEVNET_SCRIPTS.SPORE.TX_HASH,
                index: DEVNET_SCRIPTS.SPORE.INDEX,
              },
              depType: DEVNET_SCRIPTS.SPORE.DEP_TYPE,
            },
            behaviors: {
              lockProxy: true,
              cobuild: true,
            },
          },
        ],
      },
      Cluster: {
        versions: [
          {
            tags: ['v2', 'latest'],
            script: {
              codeHash: DEVNET_SCRIPTS.SPORE_CLUSTER.CODE_HASH,
              hashType: DEVNET_SCRIPTS.SPORE_CLUSTER.HASH_TYPE,
            },
            cellDep: {
              outPoint: {
                txHash: DEVNET_SCRIPTS.SPORE_CLUSTER.TX_HASH,
                index: DEVNET_SCRIPTS.SPORE_CLUSTER.INDEX,
              },
              depType: DEVNET_SCRIPTS.SPORE_CLUSTER.DEP_TYPE,
            },
            behaviors: {
              lockProxy: true,
              cobuild: true,
            },
          },
        ],
      },
    },
  };
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
  devnet: 'Devnet (Local)',
  testnet: 'Testnet (Aggron)',
  mainnet: 'Mainnet',
};
