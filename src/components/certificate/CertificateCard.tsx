'use client';

import { Card, Badge, Button } from '@/components/ui';
import type { CertificateDNA } from '@/types';
import { formatDate, truncateAddress } from '@/utils';
import { formatCertificateDisplay, isExpired, isRevoked } from '@/lib/credentials';
import { Award, Calendar, User, ExternalLink } from 'lucide-react';
import { useNetwork } from '@/hooks';

interface CertificateCardProps {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
  onClick?: () => void;
  onShare?: () => void;
}

export function CertificateCard({
  certificate,
  certificateId,
  transactionHash,
  onClick,
  onShare,
}: CertificateCardProps) {
  const { explorerUrl } = useNetwork();
  const display = formatCertificateDisplay(certificate);
  const expired = isExpired(certificate);
  const revoked = isRevoked(certificate);

  const getStatusBadge = () => {
    if (revoked) return <Badge variant="danger">Revoked</Badge>;
    if (expired) return <Badge variant="danger">Expired</Badge>;
    return <Badge variant="success">Valid</Badge>;
  };

  return (
    <Card
      variant="interactive"
      padding="lg"
      className="hover:border-blue-500/50 transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{display.course}</h3>
            <p className="text-sm text-slate-400">{display.issuer}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="w-4 h-4" />
          <span>{display.recipient}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Completed {display.date}</span>
        </div>
      </div>

      {/* Certificate ID */}
      <div className="text-xs text-slate-500 font-mono truncate mb-4">
        ID: {truncateAddress(certificateId, 8, 6)}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-700">
        {explorerUrl && transactionHash && (
          <a
            href={`${explorerUrl}/transaction/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="ghost" size="sm" className="w-full">
              <ExternalLink className="w-4 h-4" />
              Explorer
            </Button>
          </a>
        )}
        <Button variant="secondary" size="sm" className="flex-1" onClick={onShare}>
          Share
        </Button>
      </div>
    </Card>
  );
}
