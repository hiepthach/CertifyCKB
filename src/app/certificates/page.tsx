'use client';

import { useState } from 'react';
import { useCcc } from '@ckb-ccc/connector-react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button } from '@/components/ui';
import { CertificateList, CertificateDetail } from '@/components/certificate';
import type { CertificateDNA } from '@/types';
import { getHolderCertificates } from '@/lib/credentials';
import { ArrowLeft } from 'lucide-react';

interface CertificateWithMeta {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
}

export default function CertificatesPage() {
  const { signerInfo } = useCcc();
  const [selectedCert, setSelectedCert] = useState<CertificateWithMeta | null>(null);

  const address = signerInfo?.address?.addressStr;

  const { data: certificates = [], isLoading, error } = useQuery({
    queryKey: ['certificates', address],
    queryFn: async () => {
      if (!address) return [];
      return getHolderCertificates(address);
    },
    enabled: !!address,
  });

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-midnight-plum border border-lavender-spark/30 rounded-2xl flex items-center justify-center text-2xl shadow-glow-violet/30 animate-float">
            👛
          </div>
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Wallet Not Connected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Connect your wallet to view your portable, verifiable Spore DOB certificates.
          </p>
          <p className="text-xs text-mid-ash pt-2 border-t border-fog-line/10">
            Supported wallets: JoyID Passkeys, MetaMask, WalletConnect
          </p>
        </Card>
      </div>
    );
  }

  if (selectedCert) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-fog-line/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCert(null)}
            className="text-ash-veil hover:text-bone-white gap-2 border border-fog-line/15"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to certificates</span>
          </Button>
        </div>
        <CertificateDetail
          certificate={selectedCert.certificate}
          certificateId={selectedCert.certificateId}
          transactionHash={selectedCert.transactionHash}
        />
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
            <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Recipient Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">My Certificates</h1>
          <p className="text-sm text-ash-veil mt-1">
            View and manage your on-chain Spore DOB credentials
          </p>
        </div>
      </div>

      <CertificateList
        certificates={certificates}
        loading={isLoading}
        onSelect={setSelectedCert}
        emptyTitle="No certificates found"
        emptyDescription="Certificates issued to your address will appear here. Connect with an accredited course provider or cluster to receive your first credential."
        emptyAction={() => window.location.href = '/clusters'}
      />

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
          <p className="text-sm text-red-400">Failed to load certificates: {String(error)}</p>
        </div>
      )}
    </div>
  );
}

