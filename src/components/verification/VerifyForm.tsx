'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { Search, ShieldCheck } from 'lucide-react';

interface VerifyFormProps {
  onVerify: (certificateId: string) => void;
  loading?: boolean;
}

export function VerifyForm({ onVerify, loading = false }: VerifyFormProps) {
  const [certificateId, setCertificateId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    // Basic validation - should be hex string starting with 0x
    if (!/^0x[a-fA-F0-9]+$/.test(certificateId.trim())) {
      setError('Invalid certificate ID format (must be 0x hex format)');
      return;
    }

    setError('');
    onVerify(certificateId.trim());
  };

  return (
    <Card variant="default" padding="xl" className="shadow-glow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-midnight-plum border border-lavender-spark/30 flex items-center justify-center text-lavender-spark shadow-glow-violet/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-bone-white mb-1.5 tracking-tight">
            Cryptographic On-Chain Verification
          </h2>
          <p className="text-xs text-ash-veil max-w-md mx-auto leading-relaxed">
            Query the CKB blockchain to decrypt and authenticate the Spore DOB cell proof
          </p>
        </div>

        <Input
          label="On-Chain Certificate ID"
          placeholder="0x9a8f4c2e..."
          value={certificateId}
          onChange={setCertificateId}
          error={error}
        />

        <Button
          type="submit"
          className="w-full text-xs gap-2 py-3 shadow-glow-green/30 font-semibold"
          loading={loading}
        >
          <Search className="w-4 h-4" />
          <span>Verify Authenticity</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Button>

        <p className="text-[11px] text-mid-ash text-center font-mono">
          Hexadecimal Spore DOB Cell OutPoint / Hash identifier
        </p>
      </form>
    </Card>
  );
}

