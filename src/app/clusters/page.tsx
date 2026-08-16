'use client';

import { useState } from 'react';
import { useCKBConnector } from '@ckb-ccc/connector-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Card, Spinner } from '@/components/ui';
import { ClusterList, ClusterForm } from '@/components/cluster';
import { Plus, RefreshCw } from 'lucide-react';
import type { Cluster, ClusterConfig } from '@/types';
import {
  createCluster,
  getCluster,
  getProviderClusters,
  saveClusterToMockStorage,
} from '@/lib/credentials';

export default function ClustersPage() {
  const { address, signer } = useCKBConnector();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  // Fetch clusters from on-chain + mock storage
  const { data: clusters = [], isLoading, refetch, error } = useQuery({
    queryKey: ['clusters', address],
    queryFn: async () => {
      const onChainClusters = address ? await getProviderClusters(address) : [];

      // Merge with mock storage clusters for MVP
      const { getClustersFromMockStorage } = await import('@/lib/credentials');
      const mockClusters = getClustersFromMockStorage();

      // Combine and dedupe by clusterId
      const allClusters = [...onChainClusters];
      for (const mock of mockClusters) {
        if (!allClusters.find((c) => c.clusterId === mock.clusterId)) {
          allClusters.push(mock);
        }
      }

      return allClusters;
    },
    enabled: true,
  });

  // Create cluster mutation
  const createMutation = useMutation({
    mutationFn: async (config: ClusterConfig) => {
      if (!signer) throw new Error('Wallet not connected');

      const result = await createCluster({ signer, config });

      // Save to mock storage for MVP
      const cluster: Cluster = {
        id: result.clusterId,
        clusterId: result.clusterId,
        name: config.name,
        description: config.description,
        websiteUrl: config.websiteUrl,
        contactEmail: config.contactEmail,
        creatorAddress: await signer.getAddress().then(a => a.script.args),
        createdAt: new Date().toISOString(),
      };

      saveClusterToMockStorage(cluster);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      setShowCreateModal(false);
    },
  });

  const handleCreateCluster = async (config: ClusterConfig) => {
    await createMutation.mutateAsync(config);
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-3xl">👛</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to view and create course provider clusters.
          </p>
          <p className="text-sm text-slate-500">
            Supported wallets: JoyID, MetaMask, WalletConnect
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Clusters</h1>
          <p className="text-slate-400 mt-1">
            Manage your course provider clusters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Create Cluster
          </Button>
        </div>
      </div>

      {/* Cluster List */}
      <ClusterList
        clusters={clusters}
        loading={isLoading}
        onManage={(cluster) => setSelectedCluster(cluster)}
        onIssue={(cluster) => {
          window.location.href = `/certificates/issue?cluster=${cluster.clusterId}`;
        }}
        onCreateNew={() => setShowCreateModal(true)}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Cluster"
        size="md"
      >
        <ClusterForm
          onSubmit={handleCreateCluster}
          onCancel={() => setShowCreateModal(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Cluster Detail Modal */}
      {selectedCluster && (
        <Modal
          isOpen={!!selectedCluster}
          onClose={() => setSelectedCluster(null)}
          title={selectedCluster.name}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-slate-400 mb-1">Description</h3>
              <p className="text-white">{selectedCluster.description}</p>
            </div>

            {selectedCluster.websiteUrl && (
              <div>
                <h3 className="text-sm text-slate-400 mb-1">Website</h3>
                <a
                  href={selectedCluster.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {selectedCluster.websiteUrl}
                </a>
              </div>
            )}

            {selectedCluster.contactEmail && (
              <div>
                <h3 className="text-sm text-slate-400 mb-1">Contact</h3>
                <p className="text-white">{selectedCluster.contactEmail}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm text-slate-400 mb-1">Cluster ID</h3>
              <p className="font-mono text-sm text-white break-all">
                {selectedCluster.clusterId}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700 flex gap-3">
              <Button
                onClick={() => {
                  window.location.href = `/certificates/issue?cluster=${selectedCluster.clusterId}`;
                }}
              >
                Issue Certificate
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedCluster(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">Failed to load clusters: {String(error)}</p>
        </div>
      )}
    </div>
  );
}
