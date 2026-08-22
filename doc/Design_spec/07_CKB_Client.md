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

The CKB Client Configuration module provides centralized setup for connecting to CKB networks (testnet, mainnet) and configures the Spore SDK with the correct script addresses.

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
type Network = 'testnet' | 'mainnet';

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
| **Testnet** | https://testnet.ckb.dev | https://testnet.ckb.dev | https://explorer.nervos.org/aggron2 |
| **Mainnet** | https://mainnet.ckb.com | https://mainnet.ckb.com | https://explorer.nervos.org |

---

## 5. Spore Configuration

### 5.1 Config Selection

Both testnet and mainnet use predefined configurations from the Spore SDK.

```typescript
export function getSporeConfig(): SporeConfig {
  // Both testnet and mainnet use predefined config from Spore SDK
  return undefined as unknown as SporeConfig;
}

export function getNetwork(): Network {
  return (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as Network;
}

export function getExplorerUrl(): string {
  const network = getNetwork();
  return EXPLORER_URLS[network];
}
```

---

## 6. Network Selection

Network selection is done via the UI network selector, which stores the user's preference in localStorage. The default network is testnet.

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
  }
}

export function getDefaultClient(): ccc.Client {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
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

## 9. Network Constants

```typescript
export const EXPLORER_URLS: Record<Network, string> = {
  testnet: 'https://explorer.nervos.org/aggron2',
  mainnet: 'https://explorer.nervos.org',
};

export const NETWORK_DISPLAY_NAMES: Record<Network, string> = {
  testnet: 'Testnet (Aggron)',
  mainnet: 'Mainnet',
};
```

---

## 10. Testing

### 10.1 Configuration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| getNetwork returns correct network | Matches env variable or localStorage |
| getSporeConfig returns correct config | Matches network |
| createClient creates correct client type | Correct class for network |

### 10.2 Connection Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Testnet connection | Connects to testnet.ckb.dev |
| Mainnet connection | Connects to mainnet.ckb.com |
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
