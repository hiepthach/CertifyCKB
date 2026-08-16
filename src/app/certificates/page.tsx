'use client';

import { useState } from 'react';
import { useCKBConnector } from '@ckb-ccc/connector-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { CertificateList, CertificateDetail } from '@/components/certificate';
import type { CertificateDNA } from '@/types';
import { getHolderCertificates } from '@/lib/credentials';

interface CertificateWithMeta {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
}

export default function CertificatesPage() {
  const { address } = useCKBConnector();
  const [selectedCert, setSelectedCert] = useState<CertificateWithMeta | null>(null);

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
        <Card variant="default" padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-3xl">👛</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to view your certificates.
          </p>
        </Card>
      </div>
    );
  }

  if (selectedCert) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedCert(null)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to certificates
          </button>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Certificates</h1>
        <p className="text-slate-400 mt-1">
          View and manage your course completion certificates
        </p>
      </div>

      <CertificateList
        certificates={certificates}
        loading={isLoading}
        onSelect={setSelectedCert}
        emptyTitle="No certificates yet"
        emptyDescription="Certificates issued to you will appear here. Connect with a course provider to earn your first certificate."
        emptyAction={() => window.location.href = '/clusters'}
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">Failed to load certificates: {String(error)}</p>
        </div>
      )}
    </div>
  );
}
