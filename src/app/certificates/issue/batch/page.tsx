'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Spinner, Badge } from '@/components/ui';
import { CredoraLogo } from '@/components/ui/CredoraLogo';
import { BatchUpload, BatchPreview } from '@/components/batch';
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Cluster, BatchEntry, BatchIssueParams, BatchIssueResult, VisualStyleConfig } from '@/types';
import { getCluster, previewBatch, validateBatchEntries, issueBatchCertificates } from '@/lib/credentials';
import { truncateAddress } from '@/utils';

type BatchStep = 'upload' | 'preview' | 'issuing' | 'result';

function BatchIssuePageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { signer, isLoadingAddress } = useWallet();
  const clusterId = searchParams.get('cluster');

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [step, setStep] = useState<BatchStep>('upload');
  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [preview, setPreview] = useState<ReturnType<typeof previewBatch> | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<VisualStyleConfig | undefined>(undefined);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentAddress: string;
    status: 'encoding' | 'building' | 'signing' | 'sending';
  } | null>(null);
  const [result, setResult] = useState<BatchIssueResult | null>(null);

  useEffect(() => {
    if (clusterId) {
      getCluster(clusterId).then(setCluster);
    }
  }, [clusterId]);

  const handleFileSelect = useCallback((file: File) => {
    async function parseFile() {
      const { parseBatchFile } = await import('@/lib/credentials');
      const { totalRows, entries: parsedEntries } = await parseBatchFile(file);
      const validated = validateBatchEntries(parsedEntries);
      setEntries(validated.entries);

      if (clusterId) {
        const previewData = previewBatch(validated.entries, clusterId);
        setPreview(previewData);
      }

      setStep('preview');
    }
    parseFile();
  }, [clusterId]);

  const issueMutation = useMutation({
    mutationFn: async (styleConfig?: VisualStyleConfig) => {
      if (!signer || !clusterId || !cluster || !preview) {
        throw new Error('Missing required parameters');
      }

      const styleToUse = styleConfig ?? selectedStyle;

      const params: BatchIssueParams = {
        clusterId,
        issuerName: cluster.name,
        issuerDescription: cluster.description,
        entries: preview.validEntries,
        defaultStyle: styleToUse,
      };

      return issueBatchCertificates(signer, params, (p) => setProgress(p));
    },
    onSuccess: (data) => {
      setResult(data);
      setStep('result');
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });

  const handleCancel = () => {
    setStep('upload');
    setEntries([]);
    setPreview(null);
    setSelectedStyle(undefined);
    setProgress(null);
    setResult(null);
  };

  if (isLoadingAddress) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Resolving wallet address..." />
      </div>
    );
  }

  if (!clusterId || !cluster) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Institution Not Selected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Please select an issuing institution before batch issuing certificates.
          </p>
          <Button onClick={() => router.push('/clusters')} className="text-xs">
            Go to Institutions
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="pb-6 border-b border-fog-line/10">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => router.back()}
            className="text-mid-ash hover:text-bone-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <CredoraLogo size={14} className="inline-block" />
          <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Batch Operations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Batch Issuance</h1>
        <p className="text-sm text-ash-veil mt-1">
          Issue multiple certificates at once via CSV or JSON file
        </p>
      </div>

      {/* Cluster Info */}
      <div className="p-4 bg-midnight-plum rounded-xl border border-fog-line/10 flex items-center justify-between">
        <div>
          <p className="text-xs text-mid-ash uppercase tracking-wider font-semibold">Issuing Institution</p>
          <p className="font-semibold text-bone-white text-base mt-0.5">{cluster.name}</p>
        </div>
        <Badge className="font-mono text-xs" variant="neutral">
          {truncateAddress(cluster.clusterId, 6, 4)}
        </Badge>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <BatchUpload onFileSelect={handleFileSelect} />
      )}

      {/* Preview Step */}
      {step === 'preview' && preview && (
        <BatchPreview
          entries={entries}
          estimatedCost={preview.estimatedFee}
          onConfirm={(defaultStyle) => {
            setSelectedStyle(defaultStyle);
            setStep('issuing');
            issueMutation.mutate(defaultStyle);
          }}
          onCancel={handleCancel}
          loading={issueMutation.isPending}
          progress={progress}
        />
      )}

      {/* Issuing Step */}
      {step === 'issuing' && (
        <Card variant="default" padding="xl" className="text-center">
          <div className="py-8 space-y-6">
            <div className="w-16 h-16 mx-auto bg-midnight-plum border border-lavender-spark/30 rounded-2xl flex items-center justify-center text-2xl shadow-glow-violet/30 animate-pulse">
              ⛏️
            </div>
            <div>
              <h2 className="text-xl font-bold text-bone-white tracking-tight mb-2">
                Issuing Certificates...
              </h2>
              <p className="text-sm text-ash-veil">
                Please wait while certificates are being minted to the blockchain.
              </p>
            </div>

            {progress && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-xs text-ash-veil mb-2">
                  <span>Progress</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="h-2 bg-midnight-plum rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lavender-spark transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <div className="mt-3 text-xs text-mid-ash font-mono">
                  {truncateAddress(progress.currentAddress, 10, 6)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Result Step */}
      {step === 'result' && result && (
        <Card variant={result.failed === 0 ? 'highlighted' : 'default'} padding="xl">
          <div className="text-center py-6">
            {result.failed === 0 ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-signal-green/10 border border-signal-green/30 rounded-2xl flex items-center justify-center text-signal-green">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-xl font-bold text-bone-white tracking-tight">
                  All Certificates Issued Successfully!
                </h2>
                <p className="text-sm text-ash-veil mt-1">
                  {result.successful} certificates have been minted to the blockchain.
                </p>
              </>
            ) : result.successful === 0 ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-9 h-9" />
                </div>
                <h2 className="text-xl font-bold text-bone-white tracking-tight">
                  Issuance Failed
                </h2>
                <p className="text-sm text-ash-veil mt-1">
                  All {result.total} certificates failed to issue.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center text-yellow-400">
                  <AlertTriangle className="w-9 h-9" />
                </div>
                <h2 className="text-xl font-bold text-bone-white tracking-tight">
                  Partially Completed
                </h2>
                <p className="text-sm text-ash-veil mt-1">
                  {result.successful} succeeded, {result.failed} failed.
                </p>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 p-4 bg-midnight-plum rounded-xl border border-fog-line/10 text-center">
              <div className="text-2xl font-bold text-signal-green">{result.successful}</div>
              <div className="text-xs text-mid-ash uppercase tracking-wider">Successful</div>
            </div>
            <div className="flex-1 p-4 bg-midnight-plum rounded-xl border border-fog-line/10 text-center">
              <div className="text-2xl font-bold text-red-400">{result.failed}</div>
              <div className="text-xs text-mid-ash uppercase tracking-wider">Failed</div>
            </div>
          </div>

          {/* Results Table */}
          {result.certificates.length > 0 && (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-shadow-plum">
                  <tr className="border-b border-fog-line/10">
                    <th className="text-left py-2 px-3 text-mid-ash font-semibold">#</th>
                    <th className="text-left py-2 px-3 text-mid-ash font-semibold">Address</th>
                    <th className="text-left py-2 px-3 text-mid-ash font-semibold">Status</th>
                    <th className="text-left py-2 px-3 text-mid-ash font-semibold">Certificate ID</th>
                  </tr>
                </thead>
                <tbody>
                  {result.certificates.slice(0, 50).map((cert) => (
                    <tr key={cert.row} className="border-b border-fog-line/5">
                      <td className="py-2 px-3 text-mid-ash">{cert.row}</td>
                      <td className="py-2 px-3 font-mono text-bone-white">
                        {truncateAddress(cert.recipientAddress, 8, 6)}
                      </td>
                      <td className="py-2 px-3">
                        {cert.success ? (
                          <Badge variant="success" className="text-[10px]">Success</Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px]">Failed</Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-mid-ash">
                        {cert.certificateId ? truncateAddress(cert.certificateId, 8, 6) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.certificates.length > 50 && (
                <p className="text-xs text-mid-ash text-center py-2">
                  ... and {result.certificates.length - 50} more results
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-fog-line/10">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="flex-1 text-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Issue More
            </Button>
            <Button
              onClick={() => router.push('/certificates')}
              className="flex-1 text-xs shadow-glow-green/30"
            >
              View Certificates →
            </Button>
          </div>
        </Card>
      )}

      {/* Error */}
      {issueMutation.isError && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
          <p className="text-sm text-red-400">
            Failed to issue certificates: {issueMutation.error?.message || 'Unknown error'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCancel}
            className="mt-3 text-xs"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BatchIssuePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <BatchIssuePageContent />
    </Suspense>
  );
}
