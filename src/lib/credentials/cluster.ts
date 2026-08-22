import { ccc } from '@ckb-ccc/core';
import type { Cluster, ClusterConfig } from '@/types';

// Environment flag to enable mock mode for testing
// Default to mock for development, set to 'false' for production
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

const CLUSTER_STORAGE_KEY = 'ckb_credential_clusters';

// Mock storage for MVP
const mockClusters = new Map<string, Cluster>();

function syncClustersFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CLUSTER_STORAGE_KEY);
    if (raw) {
      const parsed: Cluster[] = JSON.parse(raw);
      for (const item of parsed) {
        if (item && item.clusterId) {
          mockClusters.set(item.clusterId, item);
        }
      }
    }
  } catch (e) {
    console.error('Failed to load clusters from localStorage:', e);
  }
}

function syncClustersToLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(mockClusters.values());
    localStorage.setItem(CLUSTER_STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('Failed to save clusters to localStorage:', e);
  }
}

interface CreateClusterResult {
  clusterId: string;
  transactionHash: string;
}

/**
 * Create a new cluster (Course Provider) on CKB
 * Uses Spore Cluster cells to store provider identity
 */
export async function createCluster(params: {
  signer: unknown; // ccc.Signer in production
  config: ClusterConfig;
  creatorAddress?: string;
}): Promise<CreateClusterResult> {
  const { config, signer } = params;

  // If a live CCC signer is connected, construct and send a real on-chain transaction
  if (
    signer &&
    typeof signer === 'object' &&
    'client' in signer &&
    typeof (signer as any).sendTransaction === 'function' &&
    typeof (signer as any).getRecommendedAddressObj === 'function'
  ) {
    const liveSigner = signer as ccc.Signer;
    const addrObj = await liveSigner.getRecommendedAddressObj();
    const creatorAddress = addrObj.toString();
    const creatorLock = addrObj.script;

    // Encode cluster metadata
    const clusterMetadata = {
      type: 'SporeCluster',
      name: config.name,
      description: config.description,
      websiteUrl: config.websiteUrl || '',
      contactEmail: config.contactEmail || '',
      createdAt: new Date().toISOString(),
    };
    const dataBytes = ccc.bytesFrom(new TextEncoder().encode(JSON.stringify(clusterMetadata)));

    // Create Cell Output with creator's lock
    const cellOutput = ccc.CellOutput.from({
      capacity: 0,
      lock: creatorLock,
    });
    // Calculate required capacity in shannons: occupiedSize + dataBytes length
    cellOutput.capacity = ccc.fixedPointFrom(cellOutput.occupiedSize + dataBytes.length);

    const tx = ccc.Transaction.from({
      outputs: [cellOutput],
      outputsData: [ccc.hexFrom(dataBytes)],
    });

    try {
      await tx.completeInputsByCapacity(liveSigner);
      await tx.completeFeeBy(liveSigner);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('capacity') || msg.includes('balance') || msg.includes('Inputs') || msg.includes('LiveCells')) {
        throw new Error(
          `Insufficient CKB capacity in wallet. You need at least ~100 CKB to create an on-chain Cluster cell. Please claim free testnet CKB from https://faucet.nervos.org.`
        );
      }
      throw err;
    }

    const txHash = await liveSigner.sendTransaction(tx);
    const clusterId = txHash;

    const cluster: Cluster = {
      id: clusterId,
      clusterId,
      name: config.name,
      description: config.description,
      websiteUrl: config.websiteUrl,
      contactEmail: config.contactEmail,
      creatorAddress,
      createdAt: new Date().toISOString(),
    };

    saveClusterToMockStorage(cluster);

    return {
      clusterId,
      transactionHash: txHash,
    };
  }

  // Fallback for tests/mock environment
  let creatorAddress = params.creatorAddress || 'mock_address';
  const clusterId = generateClusterId(creatorAddress.length > 10 ? creatorAddress : '0x000000000000000000000000000000000000000000');
  const transactionHash = '0x' + '0'.repeat(64);

  const cluster: Cluster = {
    id: clusterId,
    clusterId,
    name: config.name,
    description: config.description,
    websiteUrl: config.websiteUrl,
    contactEmail: config.contactEmail,
    creatorAddress,
    createdAt: new Date().toISOString(),
  };

  saveClusterToMockStorage(cluster);

  return {
    clusterId,
    transactionHash,
  };
}

/**
 * Get cluster by ID
 */
export async function getCluster(clusterId: string): Promise<Cluster | null> {
  syncClustersFromLocalStorage();
  const mockCluster = getClusterFromMockStorage(clusterId);
  if (mockCluster) {
    return mockCluster;
  }

  if (USE_MOCK) {
    return null;
  }

  // Real Spore SDK implementation would go here
  return null;
}

/**
 * Get all clusters owned by an address
 */
export async function getProviderClusters(address?: string): Promise<Cluster[]> {
  syncClustersFromLocalStorage();
  if (USE_MOCK) {
    const all = Array.from(mockClusters.values());
    if (!address) return all;
    // Return clusters created by this address or general mock clusters
    return all.filter(c => !c.creatorAddress || c.creatorAddress === address || c.creatorAddress === 'mock_address');
  }

  // Real Spore SDK implementation would go here
  return [];
}

/**
 * Generate a cluster ID from address
 */
function generateClusterId(addressArgs: string): string {
  // Use first 16 chars of address as base, pad with random
  const base = addressArgs.slice(0, 16);
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `0x${base}${random}`;
}

export function saveClusterToMockStorage(cluster: Cluster): void {
  syncClustersFromLocalStorage();
  mockClusters.set(cluster.clusterId, cluster);
  syncClustersToLocalStorage();
}

/**
 * Clear all mock clusters (for testing)
 */
export function clearMockClusters(): void {
  mockClusters.clear();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CLUSTER_STORAGE_KEY);
    } catch {}
  }
}

function getClusterFromMockStorage(clusterId: string): Cluster | null {
  syncClustersFromLocalStorage();
  return mockClusters.get(clusterId) || null;
}

export function getClustersFromMockStorage(): Cluster[] {
  syncClustersFromLocalStorage();
  return Array.from(mockClusters.values());
}

