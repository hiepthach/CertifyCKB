'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { Search } from 'lucide-react';

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
      setError('Invalid certificate ID format');
      return;
    }

    setError('');
    onVerify(certificateId.trim());
  };

  return (
    <Card variant="default" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Verify Certificate
          </h2>
          <p className="text-sm text-slate-400">
            Enter a certificate ID to verify its authenticity and validity
          </p>
        </div>

        <Input
          label="Certificate ID"
          placeholder="0x..."
          value={certificateId}
          onChange={setCertificateId}
          error={error}
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          <Search className="w-4 h-4" />
          Verify Certificate
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Certificate IDs are 66-character hexadecimal strings starting with 0x
        </p>
      </form>
    </Card>
  );
}
