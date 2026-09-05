'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Button, Card, Spinner, Badge } from '@/components/ui';
import { CredoraLogo } from '@/components/ui/CredoraLogo';
import { BatchIssueSection } from '@/components/batch';
import { ArrowLeft } from 'lucide-react';
import type { Cluster } from '@/types';
import { getCluster } from '@/lib/credentials';
import { truncateAddress } from '@/utils';

function BatchIssuePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signer, isLoadingAddress } = useWallet();
  const clusterId = searchParams.get('cluster');

  const [cluster, setCluster] = useState<Cluster | null>(null);

  useEffect(() => {
    if (clusterId) {
      getCluster(clusterId).then(setCluster);
    }
  }, [clusterId]);

  if (isLoadingAddress) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Resolving wallet address..." />
      </div>
    );
  }

  if (!clusterId || !cluster) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Institution Not Selected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Please select an issuing institution before batch issuing certificates.
          </p>
          <Button onClick={() => router.push('/certificates/issue')} className="text-xs">
            Go to Issue Certificates
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="pb-6 border-b border-fog-line/10">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => router.back()}
            className="text-mid-ash hover:text-bone-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <CredoraLogo size={14} className="inline-block" />
          <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Batch Operations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Batch Issuance</h1>
        <p className="text-sm text-ash-veil mt-1">
          Issue multiple certificates at once via CSV or JSON file
        </p>
      </div>

      {/* Cluster Info */}
      <div className="p-4 bg-midnight-plum rounded-xl border border-fog-line/10 flex items-center justify-between">
        <div>
          <p className="text-xs text-mid-ash uppercase tracking-wider font-semibold">Issuing Institution</p>
          <p className="font-semibold text-bone-white text-base mt-0.5">{cluster.name}</p>
        </div>
        <Badge className="font-mono text-xs" variant="neutral">
          {truncateAddress(cluster.clusterId, 6, 4)}
        </Badge>
      </div>

      {/* Batch Issue Flow */}
      <BatchIssueSection
        clusterId={clusterId}
        cluster={cluster}
        signer={signer}
        onNavigateToCertificates={() => router.push('/certificates')}
      />
    </div>
  );
}

export default function BatchIssuePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <BatchIssuePageContent />
    </Suspense>
  );
}
