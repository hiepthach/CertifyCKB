'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCcc } from '@ckb-ccc/connector-react';
import { useMutation } from '@tanstack/react-query';
import { Card, Button, Modal, Spinner } from '@/components/ui';
import { CertificateForm, type CertificateData } from '@/components/certificate';
import { CheckCircle } from 'lucide-react';
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
        <Card variant="default" padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-3xl">👛</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to issue certificates.
          </p>
          <Button onClick={() => window.location.href = '/clusters'}>
            Go to Clusters
          </Button>
        </Card>
      </div>
    );
  }

  if (!clusterId || !cluster) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="lg" className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Cluster Not Found</h2>
          <p className="text-slate-400 mb-6">
            Please select a cluster from the clusters page.
          </p>
          <Button onClick={() => window.location.href = '/clusters'}>
            Go to Clusters
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Issue Certificate</h1>
        <p className="text-slate-400 mt-1">
          Issue a new course completion certificate
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CertificateForm
          clusterId={clusterId}
          clusterName={cluster.name}
          onSubmit={(data) => issueMutation.mutate(data)}
          onCancel={() => window.history.back()}
          loading={issueMutation.isPending}
        />
      </Card>

      {issueMutation.isError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">
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
        title="Certificate Issued!"
        size="md"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Certificate Issued Successfully!
          </h2>
          <p className="text-slate-400 mb-6">
            Your certificate has been created and stored on the CKB blockchain.
          </p>

          {result && (
            <div className="p-4 bg-slate-800 rounded-lg text-left space-y-2 mb-6">
              <div>
                <p className="text-sm text-slate-400">Certificate ID</p>
                <p className="font-mono text-sm text-white break-all">
                  {result.certificateId}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Transaction Hash</p>
                <p className="font-mono text-sm text-white break-all">
                  {result.transactionHash}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSuccessModal(false);
                setResult(null);
              }}
              className="flex-1"
            >
              Issue Another
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                window.location.href = '/certificates';
              }}
              className="flex-1"
            >
              View Certificates
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
