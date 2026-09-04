'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Modal, Spinner } from '@/components/ui';
import { CredoraLogo } from '@/components/ui/CredoraLogo';
import {
  CertificateForm,
  type CertificateData,
  PaperCertificate,
  InstitutionSelector,
} from '@/components/certificate';
import { CheckCircle2, ArrowRight, ExternalLink, Eye, EyeOff, Sparkles, Wallet, Plus, Users, Palette } from 'lucide-react';
import type { Cluster, CertificateDNA, CertificateLayout, CertificateTheme } from '@/types';
import { getCluster, issueCertificate } from '@/lib/credentials';
import { getTransactionUrl } from '@/lib/ckb';

function IssuePageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { signer, address, isLoadingAddress } = useWallet();
  const clusterId = searchParams.get('cluster');
  const queryLayout = searchParams.get('layout') as CertificateLayout | null;
  const queryTheme = searchParams.get('theme') as CertificateTheme | null;

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [result, setResult] = useState<{ certificateId: string; transactionHash: string } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // Load cluster when selection changes
  useEffect(() => {
    const id = clusterId || selectedClusterId;
    if (id) {
      getCluster(id).then(setCluster);
    } else {
      setCluster(null);
    }
  }, [clusterId, selectedClusterId]);

  // Derive active clusterId (URL param takes precedence, else selector)
  const activeClusterId = clusterId || selectedClusterId;
  const isHubMode = !activeClusterId;

  // Live preview form state
  const [liveFormData, setLiveFormData] = useState<CertificateData>({
    recipientAddress: address || '',
    recipientName: '',
    courseName: '',
    completionDate: new Date().toISOString().split('T')[0],
    layout: queryLayout || 'classic',
    theme: queryTheme || 'blue',
    customColor: '#1E40AF',
    customTitle: '',
  });


  const previewCertificate: CertificateDNA = useMemo(() => {
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://schema.org',
      ],
      id: '0x0000000000000000000000000000000000000000000000000000000000000000',
      type: ['VerifiableCredential', 'CourseCertificate'],
      issuer: {
        id: activeClusterId || 'ckt1qcluster',
        name: cluster?.name || 'Certificate Authority',
        description: cluster?.description,
      },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: liveFormData.recipientAddress || address || 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqv',
        type: 'CourseCertificate',
        name: liveFormData.recipientName || 'Jane Doe',
        courseName: liveFormData.courseName || 'Certified CKB & DOB Developer',
        completionDate: liveFormData.completionDate || new Date().toISOString().split('T')[0],
        grade: liveFormData.grade,
        score: liveFormData.score,
        skills: liveFormData.skills && liveFormData.skills.length > 0 ? liveFormData.skills : ['CKB-VM', 'Spore DOB', 'Cell Model'],
        issuerName: cluster?.name || 'Certificate Authority',
        metadata: {
          layout: liveFormData.layout,
          theme: liveFormData.theme,
          customColor: liveFormData.customColor,
          customTitle: liveFormData.customTitle,
        },
      },
    };
  }, [liveFormData, cluster, activeClusterId, address]);

  const issueMutation = useMutation({
    mutationFn: async (data: CertificateData) => {
      if (!signer || !activeClusterId || !cluster) {
        throw new Error('Missing required parameters');
      }
      return issueCertificate({
        signer,
        clusterId: activeClusterId,
        issuerName: cluster.name,
        issuerDescription: cluster.description,
        subject: {
          id: data.recipientAddress || address || '',
          type: 'CourseCertificate',
          name: data.recipientName,
          courseName: data.courseName,
          completionDate: data.completionDate,
          grade: data.grade,
          score: data.score,
          skills: data.skills,
          metadata: {
            layout: data.layout,
            theme: data.theme,
            customColor: data.customColor,
            customTitle: data.customTitle,
          },
        },
        expirationDate: data.expirationDate,
      });
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['certificates'] });
      await queryClient.invalidateQueries({ queryKey: ['clusters'] });
      setResult(data);
      setShowSuccessModal(true);
    },
  });

  if (isLoadingAddress) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Resolving wallet address..." />
      </div>
    );
  }

  if (!address || !signer) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-shadow-plum/80 border border-lavender-spark/30 rounded-2xl flex items-center justify-center shadow-glow-violet/30 animate-float">
            <Wallet className="w-8 h-8 text-lavender-spark drop-shadow-[0_0_12px_rgba(185,151,255,0.6)]" />
          </div>
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Wallet Not Connected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Connect your wallet to issue verifiable certificates on Nervos CKB.
          </p>
          <Button onClick={() => router.push('/certificates/issue')} className="text-xs">
            Go to Issue Certificates
          </Button>
        </Card>
      </div>
    );
  }

  if (!activeClusterId || !cluster) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="pb-6 border-b border-fog-line/10">
          <div className="flex items-center gap-2 mb-1">
            <CredoraLogo size={14} className="inline-block" />
            <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Certificate Issuance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Issue Certificates</h1>
          <p className="text-sm text-ash-veil mt-1">
            Select an institution and choose an issuance method below
          </p>
        </div>

        {/* Institution Selector */}
        <Card variant="default" padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ash-veil mb-2">
                Issuing Institution
              </label>
              <InstitutionSelector
                value={selectedClusterId}
                onChange={(id) => setSelectedClusterId(id)}
              />
            </div>
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Single Issue */}
          <Card
            variant="interactive"
            padding="lg"
            className="group cursor-pointer"
            onClick={() => {
              if (selectedClusterId) {
                router.push(`/certificates/issue?cluster=${selectedClusterId}`);
              }
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-midnight-plum border border-fog-line/15 flex items-center justify-center mb-4 group-hover:border-lavender-spark/40 transition-colors">
              <Plus className="w-5 h-5 text-bone-white group-hover:text-lavender-spark transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-bone-white mb-2">Single Certificate</h3>
            <p className="text-sm text-ash-veil leading-relaxed">
              Issue one verifiable certificate to a specific recipient address with live preview.
            </p>
          </Card>

          {/* Batch Issue */}
          <Card
            variant="interactive"
            padding="lg"
            className="group cursor-pointer"
            onClick={() => {
              if (selectedClusterId) {
                router.push(`/certificates/issue/batch?cluster=${selectedClusterId}`);
              }
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-midnight-plum border border-fog-line/15 flex items-center justify-center mb-4 group-hover:border-lavender-spark/40 transition-colors">
              <Users className="w-5 h-5 text-bone-white group-hover:text-lavender-spark transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-bone-white mb-2">Batch Issue</h3>
            <p className="text-sm text-ash-veil leading-relaxed">
              Upload CSV or JSON to issue hundreds of certificates simultaneously with transaction batching.
            </p>
          </Card>

          {/* Templates */}
          <Card
            variant="interactive"
            padding="lg"
            className="group cursor-pointer"
            onClick={() => {
              if (selectedClusterId) {
                router.push(`/certificates/templates?cluster=${selectedClusterId}`);
              }
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-midnight-plum border border-fog-line/15 flex items-center justify-center mb-4 group-hover:border-lavender-spark/40 transition-colors">
              <Palette className="w-5 h-5 text-bone-white group-hover:text-lavender-spark transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-bone-white mb-2">Certificate Templates</h3>
            <p className="text-sm text-ash-veil leading-relaxed">
              Browse visual templates, color themes, and layout presets for your certificates.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-fog-line/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CredoraLogo size={14} className="inline-block" />
            <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Certificate Issuance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">Issue Certificate</h1>
          <p className="text-sm text-ash-veil mt-1">
            Mint an immutable Spore DOB credential directly to a student&apos;s CKB address
          </p>
        </div>

        {/* Mobile preview toggle button */}
        <div className="lg:hidden flex items-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="text-xs gap-1.5 w-full sm:w-auto justify-center"
          >
            {showMobilePreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Live Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-lavender-spark" />
                <span>Preview Certificate</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Split-screen layout: Form on Left (7 cols), Live Preview on Right (5 cols) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="default" padding="xl">
            <CertificateForm
              clusterId={activeClusterId}
              clusterName={cluster.name}
              defaultRecipientAddress={address || ''}
              defaultLayout={queryLayout || 'classic'}
              defaultTheme={queryTheme || 'blue'}
              onChange={setLiveFormData}
              onSubmit={(data) => issueMutation.mutate(data)}
              onCancel={() => router.back()}
              loading={issueMutation.isPending}
            />
          </Card>

          {issueMutation.isError && (
            <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
              <p className="text-sm text-red-400">
                Failed to issue certificate: {issueMutation.error?.message || 'Unknown error'}
              </p>
              {(issueMutation.error?.message || '').includes('faucet') && (
                <a
                  href="https://faucet.nervos.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-lavender-spark hover:underline"
                >
                  Get free testnet CKB →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Live Preview Column (Sticky on Desktop, Toggleable on Mobile) */}
        <div
          className={`lg:col-span-5 space-y-4 lg:sticky lg:top-8 ${
            showMobilePreview ? 'block mt-6 lg:mt-0' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lavender-spark" />
              <h3 className="text-xs font-semibold text-bone-white uppercase tracking-wider">
                Live Certificate Preview
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-plum text-lavender-spark border border-lavender-spark/20">
              WYSIWYG
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-midnight-plum/40 rounded-2xl border border-fog-line/15 shadow-xl backdrop-blur-xs">
            <PaperCertificate
              certificate={previewCertificate}
              certificateId="PREVIEW_ID"
              layout={liveFormData.layout}
              theme={liveFormData.theme}
              customColor={liveFormData.customColor}
              customTitle={liveFormData.customTitle}
              className="transform scale-100 origin-top"
            />
          </div>

          <div className="p-3 bg-midnight-plum/20 rounded-xl border border-fog-line/10 text-[11px] text-mid-ash flex items-center justify-between">
            <span>Theme: <strong className="text-bone-white capitalize">{liveFormData.theme || 'Blue'}</strong></span>
            <span>Layout: <strong className="text-bone-white capitalize">{liveFormData.layout || 'Classic'}</strong></span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/certificates');
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
                <div className="flex items-center justify-between">
                  <p className="text-mid-ash uppercase tracking-wider font-semibold">Transaction Hash</p>
                  <a
                    href={getTransactionUrl(result.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-lavender-spark hover:underline flex items-center gap-1"
                  >
                    View on CKB Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
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
                router.push('/certificates');
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
