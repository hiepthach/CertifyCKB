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

  let creatorAddress = params.creatorAddress || '';
  if (!creatorAddress && signer && typeof (signer as any).getRecommendedAddress === 'function') {
    try {
      creatorAddress = await (signer as any).getRecommendedAddress();
    } catch {
      // fallback
    }
  }
  if (!creatorAddress) {
    creatorAddress = 'mock_address';
  }

  if (USE_MOCK) {
    // Generate cluster ID (mock)
    const clusterId = generateClusterId(creatorAddress.length > 10 ? creatorAddress : '0x000000000000000000000000000000000000000000');

    // Mock transaction for MVP
    const transactionHash = '0x' + '0'.repeat(64);

    // Store in mock storage for MVP
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

    console.log('Cluster created (mock):', {
      clusterId,
      transactionHash,
      name: config.name,
      creatorAddress,
    });

    return {
      clusterId,
      transactionHash,
    };
  }

  // Real Spore SDK implementation would go here
  throw new Error('Real Spore SDK integration not yet implemented');
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

