'use client';

import { Card, Badge, Button } from '@/components/ui';
import type { CertificateDNA } from '@/types';
import { formatDate, truncateAddress, copyToClipboard } from '@/utils';
import { formatCertificateDisplay, isExpired, isRevoked } from '@/lib/credentials';
import { Award, Calendar, User, Building, ExternalLink, Copy, Check } from 'lucide-react';
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
    return <Badge variant="success">Valid</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Certificate Header */}
      <div className="text-center py-8 px-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border border-slate-700">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Certificate of Completion
        </h1>
        <p className="text-xl text-blue-400 mb-4">{display.course}</p>
        {getStatusBadge()}
      </div>

      {/* Recipient Info */}
      <Card variant="default" padding="lg">
        <h2 className="text-lg font-semibold text-white mb-4">Recipient</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-slate-400" />
            <span className="text-white">{display.recipient}</span>
          </div>
          {subject.grade && (
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                🎓
              </span>
              <span className="text-white">Grade: {subject.grade}</span>
            </div>
          )}
          {subject.score !== undefined && (
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                📊
              </span>
              <span className="text-white">Score: {subject.score}%</span>
            </div>
          )}
        </div>
      </Card>

      {/* Course Details */}
      <Card variant="default" padding="lg">
        <h2 className="text-lg font-semibold text-white mb-4">Course Details</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-slate-400" />
            <span className="text-white">{display.course}</span>
          </div>
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-slate-400" />
            <span className="text-white">{display.issuer}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="text-white">
              Completed: {formatDate(certificate.issuanceDate)}
            </span>
          </div>
          {certificate.expirationDate && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span className="text-white">
                Expires: {formatDate(certificate.expirationDate)}
              </span>
            </div>
          )}
        </div>

        {/* Skills */}
        {subject.skills && subject.skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Skills Acquired</h3>
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
        <h2 className="text-lg font-semibold text-white mb-4">Certificate Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Certificate ID</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white">
                {truncateAddress(certificateId, 12, 8)}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Issuer ID</span>
            <span className="font-mono text-white">
              {truncateAddress(certificate.issuer.id, 12, 8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Issued</span>
            <span className="text-white">{formatDate(certificate.issuanceDate)}</span>
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
            className="flex-1 min-w-[120px]"
          >
            <Button variant="secondary" className="w-full">
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </Button>
          </a>
        )}
        <Button variant="secondary" className="flex-1 min-w-[120px]" onClick={onShare}>
          Share Certificate
        </Button>
      </div>
    </div>
  );
}
