'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCcc } from '@ckb-ccc/connector-react';
import { useMutation } from '@tanstack/react-query';
import { Card, Button, Modal, Spinner } from '@/components/ui';
import { CertificateForm, type CertificateData } from '@/components/certificate';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { Cluster } from '@/types';
import { getCluster } from '@/lib/credentials';
import { issueCertificate } from '@/lib/credentials';

function IssuePageContent() {
  const searchParams = useSearchParams();
  const { signerInfo } = useCcc();
  const clusterId = searchParams.get('cluster');

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [result, setResult] = useState<{ certificateId: string; transactionHash: string } | null>(null);

  const address = signerInfo?.address?.addressStr;
  const signer = signerInfo?.signer;

  useEffect(() => {
    if (clusterId) {
      getCluster(clusterId).then(setCluster);
    }
  }, [clusterId]);

  const issueMutation = useMutation({
    mutationFn: async (data: CertificateData) => {
      if (!signer || !clusterId || !cluster) {
        throw new Error('Missing required parameters');
      }
      return issueCertificate({
        signer,
        clusterId,
        issuerName: cluster.name,
        issuerDescription: cluster.description,
        subject: {
          id: data.recipientAddress,
          type: 'CourseCertificate',
          name: data.recipientName,
          courseName: data.courseName,
          completionDate: data.completionDate,
          grade: data.grade,
          score: data.score,
          skills: data.skills,
        },
      });
    },
    onSuccess: (data) => {
      setResult(data);
      setShowSuccessModal(true);
    },
  });

  if (!address || !signer) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-midnight-plum border border-lavender-spark/30 rounded-2xl flex items-center justify-center text-2xl shadow-glow-violet/30 animate-float">
            👛
          </div>
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Wallet Not Connected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Connect your wallet to issue sovereign on-chain certificates as Spore DOBs.
          </p>
          <Button onClick={() => window.location.href = '/clusters'} className="text-xs">
            Go to Clusters
          </Button>
        </Card>
      </div>
    );
  }

  if (!clusterId || !cluster) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Cluster Not Selected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Please choose an issuing provider cluster before creating a certificate.
          </p>
          <Button onClick={() => window.location.href = '/clusters'} className="text-xs">
            Go to Clusters
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-fog-line/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lavender-spark text-sm font-bold">✱</span>
          <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">DOB Minting Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Issue Certificate</h1>
        <p className="text-sm text-ash-veil mt-1">
          Mint an immutable Spore DOB credential directly to a student's CKB address
        </p>
      </div>

      <Card variant="default" padding="xl">
        <CertificateForm
          clusterId={clusterId}
          clusterName={cluster.name}
          onSubmit={(data) => issueMutation.mutate(data)}
          onCancel={() => window.history.back()}
          loading={issueMutation.isPending}
        />
      </Card>

      {issueMutation.isError && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
          <p className="text-sm text-red-400">
            Failed to issue certificate: {issueMutation.error?.message || 'Unknown error'}
          </p>
        </div>
      )}

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          window.location.href = '/certificates';
        }}
        title="Certificate Minted On CKB!"
        size="md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 mx-auto bg-midnight-plum border border-signal-green/40 rounded-2xl flex items-center justify-center text-signal-green shadow-glow-green/30 animate-float">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-bone-white tracking-tight">
              Certificate Minted Successfully!
            </h2>
            <p className="text-sm text-ash-veil mt-1 leading-relaxed">
              Your credential has been converted into a Spore DOB cell and stored permanently on the Nervos CKB blockchain.
            </p>
          </div>

          {result && (
            <div className="p-4 bg-midnight-plum rounded-xl text-left space-y-2.5 border border-fog-line/10 text-xs">
              <div>
                <p className="text-mid-ash uppercase tracking-wider font-semibold">Certificate ID</p>
                <p className="font-mono text-bone-white break-all mt-0.5 bg-shadow-plum/50 p-2 rounded-lg border border-fog-line/10">
                  {result.certificateId}
                </p>
              </div>
              <div>
                <p className="text-mid-ash uppercase tracking-wider font-semibold">Transaction Hash</p>
                <p className="font-mono text-bone-white break-all mt-0.5 bg-shadow-plum/50 p-2 rounded-lg border border-fog-line/10">
                  {result.transactionHash}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSuccessModal(false);
                setResult(null);
              }}
              className="flex-1 text-xs"
            >
              Issue Another
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                window.location.href = '/certificates';
              }}
              className="flex-1 text-xs shadow-glow-green/30"
            >
              View Certificates →
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function IssuePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <IssuePageContent />
    </Suspense>
  );
}

