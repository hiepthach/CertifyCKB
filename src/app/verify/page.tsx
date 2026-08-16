'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VerifyForm, VerifyResult } from '@/components/verification';
import { Spinner } from '@/components/ui';
import type { VerificationResult } from '@/types';
import { verifyCertificate } from '@/lib/credentials';

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['verify', certificateId],
    queryFn: () => {
      if (!certificateId) return null;
      return verifyCertificate(certificateId);
    },
    enabled: !!certificateId,
  });

  const handleVerify = (id: string) => {
    setCertificateId(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Verify Certificate</h1>
        <p className="text-slate-400">
          Enter a certificate ID to verify its authenticity and validity on-chain
        </p>
      </div>

      <div className="space-y-6">
        <VerifyForm onVerify={handleVerify} />

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner label="Verifying certificate..." />
          </div>
        )}

        {result && !isLoading && (
          <VerifyResult result={result} />
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400">Verification failed: {String(error)}</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">How Verification Works</h3>
        <ul className="space-y-3 text-sm text-slate-400">
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-600/30 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
              1
            </span>
            <span>
              <strong className="text-white">On-chain verification</strong> — Certificate data is stored directly on CKB blockchain as Spore DOB
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-600/30 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
              2
            </span>
            <span>
              <strong className="text-white">W3C VC format</strong> — Verifiable Credential standard ensures interoperability
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 bg-blue-600/30 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
              3
            </span>
            <span>
              <strong className="text-white">Expiration & revocation</strong> — Status checks ensure certificates are still valid
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
