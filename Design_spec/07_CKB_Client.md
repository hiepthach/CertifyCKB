# CKB Client Configuration — Unit Design

## 1. Overview

| Item | Details |
|------|---------|
| **Module** | CKB Client Configuration |
| **Files** | `src/lib/ckb/config.ts`, `src/lib/ckb/client.ts` |
| **Purpose** | Configure CCC SDK and Spore SDK for different networks |
| **Dependencies** | `@ckb-ccc/core`, `@spore-sdk/core` |

---

## 2. Purpose

The CKB Client Configuration module provides centralized setup for connecting to CKB networks (devnet, testnet, mainnet) and configures the Spore SDK with the correct script addresses.

---

## 3. Public API

### 3.1 Files

```typescript
// config.ts - Network and script configurations
export const lumosConfig: LumosConfig;
export const sporeConfig: SporeConfig;
export function getSporeConfig(): SporeConfig;
export function getNetwork(): Network;

// client.ts - Client creation
export function createClient(): ccc.Client;
export function getDefaultClient(): ccc.Client;
```

### 3.2 Types

```typescript
type Network = 'devnet' | 'testnet' | 'mainnet';

interface NetworkConfig {
  ckbNodeUrl: string;
  ckbIndexerUrl: string;
  explorerUrl: string;
}

interface ScriptConfig {
  CODE_HASH: string;
  HASH_TYPE: 'type' | 'data' | 'data1' | 'data2';
  TX_HASH: string;
  INDEX: string;
  DEP_TYPE: 'code' | 'depGroup';
}
```

---

## 4. Network Configurations

### 4.1 Network Matrix

| Network | Node URL | Indexer URL | Explorer |
|---------|----------|------------|----------|
| **Devnet** | localhost:28114 | localhost:28114 | N/A |
| **Testnet** | https://testnet.ckb.dev | https://testnet.ckb.dev | https://explorer.nervos.org/aggron2 |
| **Mainnet** | https://mainnet.ckb.com | https://mainnet.ckb.com | https://explorer.nervos.org |

### 4.2 Script Addresses (Devnet)

```typescript
const DEVNET_SCRIPTS = {
  SECP256K1_BLAKE160: {
    CODE_HASH: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    HASH_TYPE: 'type',
    TX_HASH: '0x4d804f1495612631da202fe9902fa9899118554b08138cfe5dfb50e1ede76293',
    INDEX: '0x0',
    DEP_TYPE: 'depGroup',
  },
  SPORE: {
    CODE_HASH: '0x7e8bf78a62232caa2f5d47e691e8db1a90d05e93dc6828ad3cb935c01ec6d208',
    HASH_TYPE: 'data2',
    TX_HASH: '0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7',
    INDEX: '0xa',
    DEP_TYPE: 'code',
  },
  SPORE_CLUSTER: {
    CODE_HASH: '0x7366a61534fa7c7e6225ecc0d828ea3b5366adec2b58206f2ee84995fe030075',
    HASH_TYPE: 'data2',
    TX_HASH: '0x1bb87da347a776a927ab6593e1e10304ca195f8e24279f039008d5e3115b1bf7',
    INDEX: '0xb',
    DEP_TYPE: 'code',
  },
};
```

---

## 5. Spore Configuration

### 5.1 Spore Config Structure

```typescript
import type { SporeConfig } from '@spore-sdk/core';

export const devnetSporeConfig: SporeConfig = {
  lumos: lumosConfig,
  ckbNodeUrl: 'http://localhost:28114',
  ckbIndexerUrl: 'http://localhost:28114',
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
```

### 5.2 Config Selection

```typescript
export function getSporeConfig(): SporeConfig {
  const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';

  switch (network) {
    case 'testnet':
      return predefinedSporeConfigs.Testnet;
    case 'mainnet':
      return predefinedSporeConfigs.Mainnet;
    default:
      return devnetSporeConfig;
  }
}

export function getNetwork(): Network {
  return (process.env.NEXT_PUBLIC_NETWORK || 'devnet') as Network;
}

export function getExplorerUrl(): string {
  const network = getNetwork();
  return EXPLORER_URLS[network];
}
```

---

## 6. Environment Variables

### 6.1 Required Variables

```bash
# .env.local

# Network selection: 'devnet' | 'testnet' | 'mainnet'
NEXT_PUBLIC_NETWORK=devnet

# Devnet (OffCKB)
NEXT_PUBLIC_CKB_NODE_URL=http://localhost:28114
NEXT_PUBLIC_CKB_INDEXER_URL=http://localhost:28114

# Testnet (uncomment for testnet)
# NEXT_PUBLIC_NETWORK=testnet
# NEXT_PUBLIC_CKB_NODE_URL=https://testnet.ckb.dev
# NEXT_PUBLIC_CKB_INDEXER_URL=https://testnet.ckb.dev

# Mainnet (uncomment for mainnet)
# NEXT_PUBLIC_NETWORK=mainnet
# NEXT_PUBLIC_CKB_NODE_URL=https://mainnet.ckb.com
# NEXT_PUBLIC_CKB_INDEXER_URL=https://mainnet.ckb.com
```

### 6.2 Network Detection

```typescript
// Auto-detect network from URL for development
export function detectNetwork(): Network {
  if (typeof window === 'undefined') return 'devnet';

  const host = window.location.hostname;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'devnet';
  }
  // Default to testnet for external deployments
  return 'testnet';
}
```

---

## 7. Client Creation

### 7.1 Client Factory

```typescript
import { ccc } from '@ckb-ccc/core';

let clientInstance: ccc.Client | null = null;

export function createClient(): ccc.Client {
  const network = getNetwork();

  switch (network) {
    case 'testnet':
      return new ccc.ClientPublicTestnet();
    case 'mainnet':
      return new ccc.ClientPublicMainnet();
    default:
      // Devnet - use custom URL
      return new ccc.ClientPublicRpc(process.env.NEXT_PUBLIC_CKB_NODE_URL!);
  }
}

export function getDefaultClient(): ccc.Client {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

// For server-side rendering
export function createClientForServer(): ccc.Client {
  const url = process.env.NEXT_PUBLIC_CKB_NODE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_CKB_NODE_URL is not set');
  }
  return new ccc.ClientPublicRpc(url);
}
```

### 7.2 Initialization

```typescript
// src/lib/ckb/index.ts

import { setSporeConfig } from '@spore-sdk/core';
import { getSporeConfig } from './config';

// Initialize Spore config
setSporeConfig(getSporeConfig());

export { getSporeConfig, getNetwork, getExplorerUrl } from './config';
export { createClient, getDefaultClient } from './client';
```

---

## 8. Usage Examples

### 8.1 Component Usage

```typescript
import { useCcc } from '@ckb-ccc/connector-react';
import { getExplorerUrl } from '@/lib/ckb';

function CertificateCard({ certificate }) {
  const explorerUrl = getExplorerUrl();

  return (
    <div>
      <a
        href={`${explorerUrl}/transaction/${certificate.txHash}`}
        target="_blank"
      >
        View on Explorer
      </a>
    </div>
  );
}
```

### 8.2 Service Usage

```typescript
import { getDefaultClient } from '@/lib/ckb';

async function getCertificate(certificateId: string) {
  const client = getDefaultClient();
  const cells = await client.findCellsByType({
    script: {
      codeHash: SPORE_CODE_HASH,
      hashType: 'data2',
      args: certificateId,
    },
  });
  return cells[0];
}
```

---

## 9. Script Reference Table

### 9.1 Devnet Scripts

| Script | Code Hash | Hash Type | Purpose |
|--------|-----------|-----------|---------|
| SECP256K1_BLAKE160 | 0x9bd7... | type | Standard lock |
| SPORE | 0x7e8b... | data2 | DOB storage |
| SPORE_CLUSTER | 0x7366... | data2 | Cluster storage |
| SPORE_CLUSTER_AGENT | 0xc986... | data2 | Cluster proxy |
| SPORE_LUA | 0x94a9... | data2 | Lua scripts |

### 9.2 Network Constants

```typescript
export const EXPLORER_URLS: Record<Network, string> = {
  devnet: '',  // No explorer for devnet
  testnet: 'https://explorer.nervos.org/aggron2',
  mainnet: 'https://explorer.nervos.org',
};

export const NETWORK_DISPLAY_NAMES: Record<Network, string> = {
  devnet: 'Devnet (Local)',
  testnet: 'Testnet (Aggron)',
  mainnet: 'Mainnet',
};
```

---

## 10. Testing

### 10.1 Configuration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| getNetwork returns correct network | Matches env variable |
| getSporeConfig returns correct config | Matches network |
| createClient creates correct client type | Correct class for network |

### 10.2 Connection Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Devnet connection | Connects to localhost:28114 |
| Testnet connection | Connects to testnet.ckb.dev |
| Client query works | Returns cells |

---

## 11. Related Documents

| Document | Path |
|----------|------|
| Implementation Architecture | `Design_spec/Implementation_Architecture.md` |
| Cluster Service | `Design_spec/01_Cluster_Service.md` |
| Certificate Service | `Design_spec/03_Certificate_Service.md` |

---

## 12. References

| Resource | Link |
|----------|------|
| CCC SDK | https://docs.ckbccc.com |
| Spore SDK | https://docs.spore.pro/ |
| OffCKB | https://github.com/nervosnetwork/offckb |

---

*Version: 1.0*
*Last Updated: 2026-08-11*
