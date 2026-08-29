import { ccc, Address, ClientPublicTestnet } from '@ckb-ccc/core';
import { createSporeCluster } from '@ckb-ccc/spore';
import type { Cluster, ClusterConfig } from '@/types';

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

    // Encode cluster metadata — same JSON structure as before
    const clusterMetadata = {
      name: config.name,
      description: config.description,
      websiteUrl: config.websiteUrl || '',
      contactEmail: config.contactEmail || '',
    };

    try {
      // Use CCC Spore SDK to create the cluster cell
      const { tx, id: clusterId } = await createSporeCluster({
        signer: liveSigner,
        data: {
          name: config.name,
          description: JSON.stringify(clusterMetadata),
        },
        to: addrObj.script,
      });

      await tx.completeInputsByCapacity(liveSigner);
      await tx.completeFeeBy(liveSigner, 1000);
      const txHash = await liveSigner.sendTransaction(tx);

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
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('capacity') || msg.includes('balance') || msg.includes('Inputs') || msg.includes('LiveCells')) {
        throw new Error(
          `Insufficient CKB capacity in wallet. You need at least ~100 CKB to create an on-chain Cluster cell. Please claim free testnet CKB from https://faucet.nervos.org.`
        );
      }
      throw err;
    }
  }

  throw new Error('Live signer is required to create a cluster');
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
  return null;
}

/**
 * Get all clusters owned by an address
 */
export async function getProviderClusters(
  address?: string,
  client?: unknown
): Promise<Cluster[]> {
  syncClustersFromLocalStorage();
  const results = Array.from(mockClusters.values());
  const seenIds = new Set(results.map((c) => c.clusterId));

  if (address && typeof window !== 'undefined') {
    try {
      const ckbClient = (client as ccc.Client) || (ClientPublicTestnet ? new ClientPublicTestnet() : new ccc.ClientPublicTestnet());
      const AddressClass = Address || ccc?.Address;
      if (AddressClass?.fromString) {
        const addrObj = await AddressClass.fromString(address, ckbClient);

        // 1. Search live cells owned by the creator for SporeCluster cells
        for await (const cell of ckbClient.findCellsByLock(addrObj.script, undefined, true)) {
          try {
            if (!cell.outputData || cell.outputData === '0x' || cell.outputData.length < 10) continue;
            const text = new TextDecoder().decode(ccc.bytesFrom(cell.outputData));
            if (!text.includes('SporeCluster')) continue;

            const meta = JSON.parse(text);
            const clusterId = cell.outPoint.txHash;

            if (!seenIds.has(clusterId)) {
              seenIds.add(clusterId);
              const cluster: Cluster = {
                id: clusterId,
                clusterId,
                name: meta.name || 'Unnamed Cluster',
                description: meta.description || '',
                websiteUrl: meta.websiteUrl || '',
                contactEmail: meta.contactEmail || '',
                creatorAddress: address,
                createdAt: meta.createdAt || new Date().toISOString(),
              };
              results.push(cluster);
              mockClusters.set(clusterId, cluster);
            }
          } catch {
            // Ignore non-cluster cells
          }
        }

        // 2. Scan transactions sent by this creator (input = creator lock)
        // If this wallet created clusters or issued certificates on-chain, discover them!
        let txCount = 0;
        for await (const txRecord of ckbClient.findTransactionsByLock(addrObj.script, undefined, false, 'desc', 20)) {
          if (txCount++ > 20) break;
          try {
            if (!txRecord.isInput) continue;
            const txResponse = await ckbClient.getTransaction(txRecord.txHash);
            if (!txResponse?.transaction?.outputsData) continue;

            for (let i = 0; i < txResponse.transaction.outputsData.length; i++) {
              const hex = txResponse.transaction.outputsData[i];
              if (!hex || hex === '0x' || hex.length < 10) continue;
              try {
                const text = new TextDecoder().decode(ccc.bytesFrom(hex));

                // If it's a Cluster Cell created by this sender
                if (text.includes('SporeCluster')) {
                  const meta = JSON.parse(text);
                  const clusterId = txRecord.txHash;
                  if (!seenIds.has(clusterId)) {
                    seenIds.add(clusterId);
                    const cluster: Cluster = {
                      id: clusterId,
                      clusterId,
                      name: meta.name || 'Unnamed Cluster',
                      description: meta.description || '',
                      websiteUrl: meta.websiteUrl || '',
                      contactEmail: meta.contactEmail || '',
                      creatorAddress: address,
                      createdAt: meta.createdAt || new Date().toISOString(),
                    };
                    results.push(cluster);
                    mockClusters.set(clusterId, cluster);
                  }
                }

                // If it's a Certificate Cell issued by this sender
                if (
                  text.includes('@context') &&
                  (text.includes('VerifiableCredential') ||
                   text.includes('credentialSubject') ||
                   text.includes('CourseCertificate'))
                ) {
                  const certDna = JSON.parse(text);
                  const cid = certDna.issuer?.id;
                  if (cid && !seenIds.has(cid)) {
                    seenIds.add(cid);
                    const cluster: Cluster = {
                      id: cid,
                      clusterId: cid,
                      name: certDna.issuer?.name || 'Accredited Institution',
                      description: certDna.issuer?.description || 'Verified On-Chain Credential Provider Cluster',
                      websiteUrl: '',
                      contactEmail: '',
                      creatorAddress: address,
                      createdAt: certDna.issuanceDate || new Date().toISOString(),
                    };
                    results.push(cluster);
                    mockClusters.set(cid, cluster);
                  }
                }
              } catch { }
            }
          } catch { }
        }

        syncClustersToLocalStorage();
      }
    } catch (e) {
      console.warn('Error querying on-chain cluster cells:', e);
    }
  }

  if (!address) return results;
  return results.filter((c) => {
    return (
      !c.creatorAddress ||
      c.creatorAddress.toLowerCase() === address.toLowerCase()
    );
  });
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
    } catch { }
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

