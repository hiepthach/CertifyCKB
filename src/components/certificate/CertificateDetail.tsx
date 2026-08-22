'use client';

import { Card, Badge, Button } from '@/components/ui';
import type { CertificateDNA } from '@/types';
import { formatDate, truncateAddress, copyToClipboard } from '@/utils';
import { formatCertificateDisplay, isExpired, isRevoked } from '@/lib/credentials';
import { Award, Calendar, User, Building, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNetwork } from '@/hooks';

interface CertificateDetailProps {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
  onCopyId?: () => void;
  onOpenExplorer?: () => void;
  onShare?: () => void;
}

export function CertificateDetail({
  certificate,
  certificateId,
  transactionHash,
  onOpenExplorer,
  onShare,
}: CertificateDetailProps) {
  const { explorerUrl } = useNetwork();
  const [copied, setCopied] = useState(false);
  const display = formatCertificateDisplay(certificate);
  const expired = isExpired(certificate);
  const revoked = isRevoked(certificate);
  const subject = certificate.credentialSubject;

  const handleCopyId = async () => {
    const success = await copyToClipboard(certificateId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    if (revoked) return <Badge variant="danger">Revoked</Badge>;
    if (expired) return <Badge variant="warning">Expired</Badge>;
    return <Badge variant="success" pulse>Verified On-Chain DOB</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Certificate Header Display */}
      <div className="text-center py-10 px-6 bg-shadow-plum rounded-2xl border border-fog-line/15 shadow-glow-violet relative overflow-hidden">
        <div className="w-20 h-20 mx-auto mb-4 bg-midnight-plum border border-lavender-spark/30 rounded-2xl flex items-center justify-center shadow-glow-violet text-lavender-spark animate-float">
          <Award className="w-10 h-10" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-bone-white mb-2 tracking-tight">
          Certificate of Completion
        </h1>
        <p className="text-xl text-lavender-spark font-semibold mb-4">{display.course}</p>
        <div className="flex justify-center">
          {getStatusBadge()}
        </div>
      </div>

      {/* Recipient Info */}
      <Card variant="default" padding="lg">
        <h2 className="text-base font-semibold text-bone-white mb-4 tracking-tight">Recipient Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-mid-ash" />
            <span className="text-bone-white font-medium">{display.recipient}</span>
          </div>
          {subject.grade && (
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 flex items-center justify-center text-xs text-mid-ash">🎓</span>
              <span className="text-bone-white">Grade: <strong className="text-signal-green">{subject.grade}</strong></span>
            </div>
          )}
          {subject.score !== undefined && (
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 flex items-center justify-center text-xs text-mid-ash">📊</span>
              <span className="text-bone-white">Score: <strong className="text-signal-green">{subject.score}%</strong></span>
            </div>
          )}
        </div>
      </Card>

      {/* Course Details */}
      <Card variant="default" padding="lg">
        <h2 className="text-base font-semibold text-bone-white mb-4 tracking-tight">Course & Issuer</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-mid-ash" />
            <span className="text-bone-white">{display.course}</span>
          </div>
          <div className="flex items-center gap-3">
            <Building className="w-4 h-4 text-mid-ash" />
            <span className="text-bone-white">{display.issuer}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-mid-ash" />
            <span className="text-ash-veil">
              Completed on {formatDate(certificate.issuanceDate)}
            </span>
          </div>
          {certificate.expirationDate && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-mid-ash" />
              <span className="text-ash-veil">
                Expires on {formatDate(certificate.expirationDate)}
              </span>
            </div>
          )}
        </div>

        {/* Skills */}
        {subject.skills && subject.skills.length > 0 && (
          <div className="mt-5 pt-4 border-t border-fog-line/10">
            <h3 className="text-xs font-semibold text-mid-ash uppercase tracking-wider mb-2.5">Skills Certified</h3>
            <div className="flex flex-wrap gap-2">
              {subject.skills.map((skill, index) => (
                <Badge key={index} variant="lavender">{skill}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Certificate Metadata */}
      <Card variant="default" padding="lg">
        <h2 className="text-base font-semibold text-bone-white mb-4 tracking-tight">On-Chain Cryptographic Proof</h2>
        <div className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 p-2.5 bg-midnight-plum rounded-xl border border-fog-line/10">
            <span className="text-mid-ash uppercase tracking-wider font-medium">Certificate ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-bone-white">
                {truncateAddress(certificateId, 12, 8)}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 text-ash-veil hover:text-bone-white transition-colors"
                title="Copy ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-signal-green" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 p-2.5 bg-midnight-plum rounded-xl border border-fog-line/10">
            <span className="text-mid-ash uppercase tracking-wider font-medium">Issuer Cluster ID</span>
            <span className="font-mono text-bone-white">
              {truncateAddress(certificate.issuer.id, 12, 8)}
            </span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-midnight-plum rounded-xl border border-fog-line/10">
            <span className="text-mid-ash uppercase tracking-wider font-medium">Issued Date</span>
            <span className="text-bone-white">{formatDate(certificate.issuanceDate)}</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {explorerUrl && transactionHash && (
          <a
            href={`${explorerUrl}/transaction/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px]"
          >
            <Button variant="secondary" className="w-full text-xs gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              View on CKB Explorer
            </Button>
          </a>
        )}
        <Button variant="secondary" className="flex-1 min-w-[140px] text-xs" onClick={onShare}>
          Share Certificate
        </Button>
      </div>
    </div>
  );
}

