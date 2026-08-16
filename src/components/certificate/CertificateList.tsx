'use client';

import { CertificateCard } from './CertificateCard';
import { EmptyState, Spinner } from '@/components/ui';
import type { CertificateDNA } from '@/types';

interface CertificateWithMeta {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
}

interface CertificateListProps {
  certificates: CertificateWithMeta[];
  loading?: boolean;
  onSelect?: (cert: CertificateWithMeta) => void;
  onShare?: (cert: CertificateWithMeta) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: () => void;
}

export function CertificateList({
  certificates,
  loading = false,
  onSelect,
  onShare,
  emptyTitle = 'No certificates yet',
  emptyDescription = 'Certificates issued to you will appear here.',
  emptyAction,
}: CertificateListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner label="Loading certificates..." />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <EmptyState
        icon="🎓"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction ? { label: 'Get Started', onClick: emptyAction } : undefined}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert) => (
        <CertificateCard
          key={cert.certificateId}
          certificate={cert.certificate}
          certificateId={cert.certificateId}
          transactionHash={cert.transactionHash}
          onClick={() => onSelect?.(cert)}
          onShare={() => onShare?.(cert)}
        />
      ))}
    </div>
  );
}
