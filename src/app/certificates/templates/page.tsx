'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Button, Card, Spinner } from '@/components/ui';
import { CredoraLogo } from '@/components/ui/CredoraLogo';
import { TemplateList } from '@/components/template';
import { ArrowLeft, Sparkles, Award } from 'lucide-react';
import type { Cluster } from '@/types';
import { getCluster } from '@/lib/credentials';

function TemplatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoadingAddress } = useWallet();
  const clusterId = searchParams.get('cluster');

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (clusterId) {
        try {
          const clusterData = await getCluster(clusterId);
          setCluster(clusterData);
        } catch (error) {
          console.error('Failed to load cluster:', error);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [clusterId]);

  if (isLoadingAddress || loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Loading certificate style showcase..." />
      </div>
    );
  }

  if (!clusterId || !cluster) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-midnight-plum border border-lavender-spark/30 rounded-2xl flex items-center justify-center text-2xl shadow-glow-violet/30 animate-float">
            🎨
          </div>
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Templates in Issuance Form</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Certificate templates and visual style presets are now directly integrated into the Certificate Issuance workspace.
          </p>
          <Button onClick={() => router.push('/certificates/issue')} className="text-xs shadow-glow-green/30">
            Go to Issue Certificates →
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-fog-line/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.back()}
              className="text-mid-ash hover:text-bone-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <CredoraLogo size={14} className="inline-block" />
            <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Style Showcase & Gallery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Certificate Styles</h1>
          <p className="text-sm text-ash-veil mt-1">
            Preview, test, and issue on-chain certificates with curated design presets for{' '}
            <strong className="text-bone-white font-medium">{cluster.name}</strong>
          </p>
        </div>

        <Button
          onClick={() => router.push(`/certificates/issue?cluster=${encodeURIComponent(clusterId)}`)}
          className="gap-1.5 text-xs shadow-glow-green/30"
        >
          <Sparkles className="w-3.5 h-3.5 text-signal-green" />
          Issue Certificate
        </Button>
      </div>

      {/* Showcase List Component */}
      <TemplateList
        clusterId={clusterId}
        clusterName={cluster.name}
      />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <TemplatesPageContent />
    </Suspense>
  );
}
