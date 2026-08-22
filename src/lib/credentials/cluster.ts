import type { Cluster, ClusterConfig } from '@/types';

// Environment flag to enable mock mode for testing
// Default to mock for development, set to 'false' for production
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

// Mock storage for MVP - in production this would be on-chain
const mockClusters = new Map<string, Cluster>();

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
}): Promise<CreateClusterResult> {
  const { config } = params;

  if (USE_MOCK) {
    // Generate cluster ID (mock)
    const clusterId = generateClusterId('0x000000000000000000000000000000000000000000');

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
      creatorAddress: 'mock_address',
      createdAt: new Date().toISOString(),
    };

    saveClusterToMockStorage(cluster);

    console.log('Cluster created (mock):', {
      clusterId,
      transactionHash,
      name: config.name,
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
  // Try mock storage first
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
export async function getProviderClusters(address: string): Promise<Cluster[]> {
  if (USE_MOCK) {
    // Return clusters from mock storage owned by this address
    return Array.from(mockClusters.values()).filter(c => c.creatorAddress === address);
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
  mockClusters.set(cluster.clusterId, cluster);
}

/**
 * Clear all mock clusters (for testing)
 */
export function clearMockClusters(): void {
  mockClusters.clear();
}

function getClusterFromMockStorage(clusterId: string): Cluster | null {
  return mockClusters.get(clusterId) || null;
}

export function getClustersFromMockStorage(): Cluster[] {
  return Array.from(mockClusters.values());
}
