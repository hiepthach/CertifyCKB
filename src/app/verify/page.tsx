'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/hooks/useWallet';
import { VerifyForm, VerifyResult } from '@/components/verification';
import { Spinner, Card, Badge } from '@/components/ui';
import type { VerificationResult } from '@/types';
import { verifyCertificate } from '@/lib/credentials';
import { Shield, CheckCircle2, Lock, Cpu } from 'lucide-react';

function VerifyPageContent() {
  const { client } = useWallet();
  const searchParams = useSearchParams();
  const [certificateId, setCertificateId] = useState<string | null>(
    searchParams.get('certId') ?? null
  );

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['verify', certificateId],
    queryFn: () => {
      if (!certificateId) return null;
      return verifyCertificate(certificateId, client);
    },
    enabled: !!certificateId,
  });

  const handleVerify = (id: string) => {
    setCertificateId(id);
  };

  return (
    <>
      <div className="space-y-6">
        <VerifyForm
          initialValue={certificateId ?? ''}
          onVerify={handleVerify}
          loading={isLoading}
        />

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner label="Querying CKB nodes and validating Spore DNA..." />
          </div>
        )}

        {result && !isLoading && (
          <VerifyResult result={result} />
        )}

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
            <p className="text-sm text-red-400">Verification failed: {String(error)}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function VerifyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shadow-plum border border-lavender-spark/30 shadow-glow-sm mb-2">
          <span className="text-lavender-spark text-xs font-semibold">✱</span>
          <span className="text-xs font-medium text-bone-white">Zero-Knowledge & On-Chain Audit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">
          Verify Credential Authenticity
        </h1>
        <p className="text-sm text-ash-veil max-w-md mx-auto leading-relaxed">
          Verify any Spore DOB credential directly against the Nervos CKB layer-1 consensus state
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner label="Loading..." />
          </div>
        }
      >
        <VerifyPageContent />
      </Suspense>

      {/* Info Section */}
      <Card variant="default" padding="xl" className="border-fog-line/15">
        <h3 className="text-base font-semibold text-bone-white mb-4 tracking-tight flex items-center gap-2">
          <Cpu className="w-4 h-4 text-lavender-spark" />
          <span>How Cryptographic Verification Works</span>
        </h3>
        <ul className="space-y-4 text-xs text-ash-veil">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-shadow-plum border border-lavender-spark/30 text-lavender-spark rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
              1
            </span>
            <span className="leading-relaxed">
              <strong className="text-bone-white font-medium">On-chain Spore DOB Cell</strong> — Credential payload is bound to an immutable CKB cell backed by native CKBytes capacity.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-shadow-plum border border-lavender-spark/30 text-lavender-spark rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
              2
            </span>
            <span className="leading-relaxed">
              <strong className="text-bone-white font-medium">W3C Verifiable Credential Data Model</strong> — Ensures cryptographic signature standards and universal wallet interoperability.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-shadow-plum border border-lavender-spark/30 text-lavender-spark rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
              3
            </span>
            <span className="leading-relaxed">
              <strong className="text-bone-white font-medium">On-Chain Expiration Status</strong> — Immediate check against issuer cluster state preventing fraudulent credential reuse.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
