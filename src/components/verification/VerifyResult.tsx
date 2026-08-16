'use client';

import { Card, Badge, Button } from '@/components/ui';
import type { VerificationResult } from '@/types';
import { formatDate, truncateAddress } from '@/utils';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Award } from 'lucide-react';
import { useNetwork } from '@/hooks';

interface VerifyResultProps {
  result: VerificationResult;
  onViewDetails?: () => void;
}

export function VerifyResult({ result, onViewDetails }: VerifyResultProps) {
  const { explorerUrl } = useNetwork();

  if (result.valid && !result.certificate.isExpired && !result.certificate.isRevoked) {
    return (
      <ValidResult result={result} onViewDetails={onViewDetails} />
    );
  }

  if (result.certificate.isExpired) {
    return (
      <ExpiredResult result={result} />
    );
  }

  if (result.certificate.isRevoked) {
    return (
      <RevokedResult result={result} />
    );
  }

  return (
    <InvalidResult result={result} />
  );
}

function ValidResult({
  result,
  onViewDetails,
}: {
  result: VerificationResult;
  onViewDetails?: () => void;
}) {
  const { explorerUrl } = useNetwork();

  return (
    <Card variant="highlighted" padding="lg">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-green-400 mb-2">
          Valid Certificate
        </h2>
        <p className="text-slate-400 text-sm">
          This certificate is authentic and currently valid
        </p>
      </div>

      <div className="space-y-3 mt-6 pt-6 border-t border-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-400">Certificate ID</span>
          <span className="font-mono text-white">
            {truncateAddress(result.certificateId, 10, 8)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Issuer</span>
          <span className="text-white">{result.issuer.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Issued</span>
          <span className="text-white">
            {formatDate(result.certificate.issuanceDate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <Badge variant="success">Active</Badge>
        </div>
      </div>

      {onViewDetails && (
        <Button className="w-full mt-6" onClick={onViewDetails}>
          <Award className="w-4 h-4" />
          View Details
        </Button>
      )}
    </Card>
  );
}

function ExpiredResult({ result }: { result: VerificationResult }) {
  return (
    <Card variant="default" padding="lg">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>
        <h2 className="text-xl font-semibold text-yellow-400 mb-2">
          Expired Certificate
        </h2>
        <p className="text-slate-400 text-sm">
          This certificate was valid but has expired
        </p>
      </div>

      <div className="space-y-3 mt-6 pt-6 border-t border-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-400">Certificate ID</span>
          <span className="font-mono text-white">
            {truncateAddress(result.certificateId, 10, 8)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Issuer</span>
          <span className="text-white">{result.issuer.name}</span>
        </div>
        {result.certificate.expirationDate && (
          <div className="flex justify-between">
            <span className="text-slate-400">Expired</span>
            <span className="text-yellow-400">
              {formatDate(result.certificate.expirationDate)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <Badge variant="warning">Expired</Badge>
        </div>
      </div>
    </Card>
  );
}

function RevokedResult({ result }: { result: VerificationResult }) {
  return (
    <Card variant="default" padding="lg">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-red-400 mb-2">
          Revoked Certificate
        </h2>
        <p className="text-slate-400 text-sm">
          This certificate has been revoked by the issuer
        </p>
      </div>

      <div className="space-y-3 mt-6 pt-6 border-t border-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-400">Certificate ID</span>
          <span className="font-mono text-white">
            {truncateAddress(result.certificateId, 10, 8)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Issuer</span>
          <span className="text-white">{result.issuer.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <Badge variant="danger">Revoked</Badge>
        </div>
      </div>
    </Card>
  );
}

function InvalidResult({ result }: { result: VerificationResult }) {
  return (
    <Card variant="default" padding="lg">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-red-400 mb-2">
          Invalid Certificate
        </h2>
        <p className="text-slate-400 text-sm">
          {result.errors?.join('. ') || 'This certificate could not be verified'}
        </p>
      </div>

      {result.errors && result.errors.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Errors</h3>
          <ul className="space-y-1">
            {result.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-400">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
