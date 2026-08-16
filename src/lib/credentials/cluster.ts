import { ccc } from '@ckb-ccc/core';
import type { Cluster, ClusterConfig } from '@/types';
import { getDefaultClient } from '@/lib/ckb/client';

// Cluster type from Spore SDK
interface SporeCluster {
  id: string;
  data: {
    name: string;
    description?: string;
    websiteUrl?: string;
    contactEmail?: string;
    avatarUrl?: string;
    bannerUrl?: string;
  };
  lock: {
    args: string;
  };
  createdAt: string;
  updatedAt?: string;
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
  signer: ccc.Signer;
  config: ClusterConfig;
}): Promise<CreateClusterResult> {
  const { signer, config } = params;
  const client = getDefaultClient();

  // Get address from signer
  const addressObj = await signer.getAddress();
  const address = addressObj.script;

  // Build cluster data following Spore Cluster format
  const clusterData = {
    name: config.name,
    description: config.description,
    websiteUrl: config.websiteUrl || '',
    contactEmail: config.contactEmail || '',
    avatarUrl: config.avatarUrl || '',
    bannerUrl: config.bannerUrl || '',
  };

  // For MVP: Create a mock cluster since Spore SDK's createCluster may have specific requirements
  // In production, this would use the actual Spore SDK createCluster function

  // Generate cluster ID (this would come from the actual transaction)
  const clusterId = generateClusterId(address.args);

  console.log('Creating cluster:', {
    name: config.name,
    address: address.args,
    data: clusterData,
  });

  // TODO: Integrate with actual Spore SDK createCluster
  // const { txHash, clusterId } = await sporeCreateCluster({
  //   data: clusterData,
  //   from: signer,
  // });

  // Mock transaction for MVP
  const transactionHash = '0x' + '0'.repeat(64);

  return {
    clusterId,
    transactionHash,
  };
}

/**
 * Get cluster by ID
 */
export async function getCluster(clusterId: string): Promise<Cluster | null> {
  try {
    const client = getDefaultClient();

    // Find cluster cells by type script
    // This queries the Spore Cluster type
    const sporeCodeHash = process.env.NEXT_PUBLIC_SPORE_CLUSTER_CODE_HASH;
    const cells = await client.findCells({
      script: {
        codeHash: sporeCodeHash || '',
        hashType: 'data2',
        args: clusterId,
      },
      scriptType: 'type',
    });

    if (cells.length === 0) {
      // Try to get from mock storage for MVP
      return getClusterFromMockStorage(clusterId);
    }

    const cell = cells[0];
    const data = cell.outputData;

    if (!data) {
      return null;
    }

    // Parse cluster data
    const clusterData = JSON.parse(data);

    return {
      id: clusterId,
      clusterId,
      name: clusterData.name,
      description: clusterData.description || '',
      websiteUrl: clusterData.websiteUrl,
      contactEmail: clusterData.contactEmail,
      avatarUrl: clusterData.avatarUrl,
      bannerUrl: clusterData.bannerUrl,
      creatorAddress: cell.output.lock.args,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get cluster:', error);
    // Return from mock storage for MVP
    return getClusterFromMockStorage(clusterId);
  }
}

/**
 * Get all clusters owned by an address
 */
export async function getProviderClusters(address: string): Promise<Cluster[]> {
  const client = getDefaultClient();

  try {
    // Find all Spore Cluster cells owned by this address
    const sporeCodeHash = process.env.NEXT_PUBLIC_SPORE_CLUSTER_CODE_HASH;
    const omnilockCodeHash = process.env.NEXT_PUBLIC_OMNILOCK_CODE_HASH;

    const cells = await client.findCells({
      script: {
        codeHash: sporeCodeHash || '',
        hashType: 'data2',
      },
      scriptType: 'type',
      filter: {
        script: {
          codeHash: omnilockCodeHash || '',
          hashType: 'type',
          args: address,
        },
      },
    });

    const clusters: Cluster[] = [];

    for (const cell of cells) {
      try {
        const data = cell.outputData;
        if (!data) continue;

        const clusterData = JSON.parse(data);
        const clusterId = cell.output.type?.args || '';

        clusters.push({
          id: clusterId,
          clusterId,
          name: clusterData.name,
          description: clusterData.description || '',
          websiteUrl: clusterData.websiteUrl,
          contactEmail: clusterData.contactEmail,
          creatorAddress: cell.output.lock.args,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to parse cluster:', error);
      }
    }

    return clusters;
  } catch (error) {
    console.error('Failed to get provider clusters:', error);
    return [];
  }
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

// Mock storage for MVP - in production this would be on-chain
const mockClusters = new Map<string, Cluster>();

export function saveClusterToMockStorage(cluster: Cluster): void {
  mockClusters.set(cluster.clusterId, cluster);
}

function getClusterFromMockStorage(clusterId: string): Cluster | null {
  return mockClusters.get(clusterId) || null;
}

export function getClustersFromMockStorage(): Cluster[] {
  return Array.from(mockClusters.values());
}
