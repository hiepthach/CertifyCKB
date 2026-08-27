'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Card, Badge, Spinner } from '@/components/ui';
import { ClusterList, ClusterForm } from '@/components/cluster';
import { Plus, RefreshCw, Globe, Mail, Copy, Check, ArrowRight, ExternalLink, Wallet, Award, FileText, Layers } from 'lucide-react';
import type { Cluster, ClusterConfig } from '@/types';
import {
  createCluster,
  getCluster,
  getProviderClusters,
  saveClusterToMockStorage,
  getClustersFromMockStorage,
  getAllCertificates,
} from '@/lib/credentials';
import { getTransactionUrl } from '@/lib/ckb';

export default function ClustersPage() {
  const router = useRouter();
  const { signer, address, client, isLoadingAddress, open } = useWallet();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: clusters = [], isLoading, refetch, error } = useQuery({
    queryKey: ['clusters', address],
    queryFn: async () => {
      const onChainClusters = await getProviderClusters(address || undefined, client);
      const mockClusters = getClustersFromMockStorage();

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

  const { data: allCertificates = [], refetch: refetchCerts } = useQuery({
    queryKey: ['certificates', 'all', address],
    queryFn: async () => {
      return getAllCertificates(client, address || undefined);
    },
    enabled: true,
  });

  const certificateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cert of allCertificates) {
      const cid = cert.clusterId || cert.certificate.issuer?.id;
      if (cid) {
        counts[cid] = (counts[cid] || 0) + 1;
        if (cid.toLowerCase() !== cid) {
          counts[cid.toLowerCase()] = (counts[cid.toLowerCase()] || 0) + 1;
        }
      }
    }
    return counts;
  }, [allCertificates]);

  const selectedClusterCerts = useMemo(() => {
    if (!selectedCluster) return [];
    const target = (selectedCluster.clusterId || selectedCluster.id || '').toLowerCase();
    return allCertificates.filter((c) => {
      const cid = (c.clusterId || c.certificate.issuer?.id || '').toLowerCase();
      return cid === target;
    });
  }, [selectedCluster, allCertificates]);

  const createMutation = useMutation({
    mutationFn: async (config: ClusterConfig) => {
      if (!signer) throw new Error('Wallet not connected');

      const result = await createCluster({
        signer,
        config,
        creatorAddress: address || '',
      });

      const cluster: Cluster = {
        id: result.clusterId,
        clusterId: result.clusterId,
        name: config.name,
        description: config.description,
        websiteUrl: config.websiteUrl,
        contactEmail: config.contactEmail,
        creatorAddress: address || '',
        createdAt: new Date().toISOString(),
      };

      saveClusterToMockStorage(cluster);

      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clusters'] });
      await refetch();
      await refetchCerts();
      setShowCreateModal(false);
    },
  });

  const handleCreateCluster = async (config: ClusterConfig) => {
    await createMutation.mutateAsync(config);
  };

  const handleCopyClusterId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingAddress) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Resolving wallet address..." />
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-midnight-plum border border-lavender-spark/30 rounded-2xl flex items-center justify-center text-2xl shadow-glow-violet/30 animate-float">
            👛
          </div>
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Wallet Not Connected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Connect your wallet to create and manage sovereign credential provider clusters on CKB.
          </p>
          <div className="pt-2">
            <Button onClick={() => open()} className="gap-2 shadow-glow-green/30">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </Button>
          </div>
          <p className="text-xs text-mid-ash pt-2 border-t border-fog-line/10">
            Supported wallets: JoyID Passkeys, MetaMask, WalletConnect
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-fog-line/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lavender-spark text-sm font-bold">✱</span>
            <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Institution Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Clusters</h1>
          <p className="text-sm text-ash-veil mt-1">
            Manage your accredited course provider clusters and on-chain authority
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => {
              refetch();
              refetchCerts();
            }}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-1.5 text-xs shadow-glow-green/30">
            <Plus className="w-3.5 h-3.5" />
            Create Cluster
          </Button>
        </div>
      </div>

      <ClusterList
        clusters={clusters}
        certificateCounts={certificateCounts}
        loading={isLoading}
        onManage={(cluster) => setSelectedCluster(cluster)}
        onIssue={(cluster) => {
          router.push(`/certificates/issue?cluster=${cluster.clusterId}`);
        }}
        onCreateNew={() => setShowCreateModal(true)}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register Spore Cluster"
        size="md"
      >
        <ClusterForm
          onSubmit={handleCreateCluster}
          onCancel={() => setShowCreateModal(false)}
          loading={createMutation.isPending}
        />
        {createMutation.isError && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl">
            <p className="text-sm text-red-400">{createMutation.error?.message}</p>
            {(createMutation.error?.message || '').includes('faucet') && (
              <a
                href="https://faucet.nervos.org"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-lavender-spark hover:underline"
              >
                Get free testnet CKB →
              </a>
            )}
          </div>
        )}
      </Modal>

      {selectedCluster && (
        <Modal
          isOpen={!!selectedCluster}
          onClose={() => setSelectedCluster(null)}
          title={selectedCluster.name}
          size="lg"
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-xs text-mid-ash uppercase tracking-wider mb-1.5 font-semibold">About Institution</h3>
              <p className="text-sm text-bone-white leading-relaxed">{selectedCluster.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {selectedCluster.websiteUrl && (
                <div className="p-3 bg-midnight-plum rounded-xl border border-fog-line/10">
                  <h3 className="text-xs text-mid-ash mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-lavender-spark" />
                    Website
                  </h3>
                  <a
                    href={selectedCluster.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-lavender-spark hover:underline truncate block"
                  >
                    {selectedCluster.websiteUrl}
                  </a>
                </div>
              )}

              {selectedCluster.contactEmail && (
                <div className="p-3 bg-midnight-plum rounded-xl border border-fog-line/10">
                  <h3 className="text-xs text-mid-ash mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-lavender-spark" />
                    Contact
                  </h3>
                  <p className="text-xs text-bone-white">{selectedCluster.contactEmail}</p>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-midnight-plum rounded-xl border border-fog-line/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-mid-ash uppercase tracking-wider font-semibold">On-Chain Cluster ID / Tx</span>
                <div className="flex items-center gap-3">
                  {selectedCluster.clusterId.startsWith('0x') && selectedCluster.clusterId.length === 66 && (
                    <a
                      href={getTransactionUrl(selectedCluster.clusterId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-lavender-spark hover:underline flex items-center gap-1"
                    >
                      Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => handleCopyClusterId(selectedCluster.clusterId)}
                    className="flex items-center gap-1 text-[11px] text-lavender-spark hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3 text-signal-green" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <p className="font-mono text-xs text-bone-white break-all bg-shadow-plum/60 p-2 rounded-lg border border-fog-line/10">
                {selectedCluster.clusterId}
              </p>
            </div>

            {/* Issued Certificates under this cluster */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs text-mid-ash uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-lavender-spark" />
                  Issued DOBs ({selectedClusterCerts.length})
                </h3>
              </div>

              {selectedClusterCerts.length === 0 ? (
                <div className="p-4 bg-midnight-plum rounded-xl border border-fog-line/10 text-center text-xs text-ash-veil">
                  No DOB certificates issued under this cluster yet. Click "Issue Certificate" below to mint one.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedClusterCerts.map((cert) => (
                    <div
                      key={cert.certificateId}
                      className="p-3 bg-midnight-plum rounded-xl border border-fog-line/10 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-semibold text-bone-white truncate">
                          {cert.certificate.credentialSubject.courseName}
                        </p>
                        <p className="text-ash-veil truncate text-[11px]">
                          Recipient: {cert.certificate.credentialSubject.name || cert.certificate.credentialSubject.id}
                        </p>
                      </div>
                      <Badge variant="neutral" className="font-mono text-[10px]">
                        {cert.certificateId.slice(0, 8)}...
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-fog-line/10">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  onClick={() => {
                    router.push(`/certificates/issue?cluster=${selectedCluster.clusterId}`);
                    setSelectedCluster(null);
                  }}
                  className="text-xs gap-1.5 shadow-glow-green/30"
                >
                  <Award className="w-3.5 h-3.5" />
                  Issue Single
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    router.push(`/certificates/issue/batch?cluster=${selectedCluster.clusterId}`);
                    setSelectedCluster(null);
                  }}
                  className="text-xs gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Batch Issue
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push(`/certificates/templates?cluster=${selectedCluster.clusterId}`);
                    setSelectedCluster(null);
                  }}
                  className="flex-1 text-xs gap-1.5 border border-fog-line/15"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Templates
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedCluster(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
          <p className="text-sm text-red-400">Failed to load clusters: {String(error)}</p>
        </div>
      )}
    </div>
  );
}


