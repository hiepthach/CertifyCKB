'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { CertificateList, CertificateDetail } from '@/components/certificate';
import type { CertificateDNA } from '@/types';
import {
  getHolderCertificates,
  getAllCertificates,
  getProviderClusters,
} from '@/lib/credentials';
import { ArrowLeft, Wallet, RefreshCw, Sparkles, Filter } from 'lucide-react';

interface CertificateWithMeta {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
  clusterId?: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { address, client, isConnected, isLoadingAddress, open } = useWallet();
  const [selectedCert, setSelectedCert] = useState<CertificateWithMeta | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'received' | 'issued'>('all');

  const { data: rawCertificates = [], isLoading, refetch, error } = useQuery({
    queryKey: ['certificates', address],
    queryFn: async () => {
      const allCerts = await getAllCertificates(client, address || undefined);
      return allCerts;
    },
    enabled: true,
  });

  const { data: userClusters = [] } = useQuery({
    queryKey: ['clusters', address],
    queryFn: async () => {
      return getProviderClusters(address || undefined, client);
    },
    enabled: true,
  });

  const { receivedCerts, issuedCerts, allUserCerts, certificates } = useMemo(() => {
    const userClusterIds = new Set(
      userClusters.flatMap((c) => [
        c.clusterId,
        c.clusterId?.toLowerCase(),
        c.id,
        c.id?.toLowerCase(),
      ].filter(Boolean) as string[])
    );

    const isAddressMatch = (addr1?: string, addr2?: string): boolean => {
      if (!addr1 || !addr2) return false;
      const a1 = addr1.toLowerCase().replace(/^0x/, '').trim();
      const a2 = addr2.toLowerCase().replace(/^0x/, '').trim();
      if (!a1 || !a2) return false;
      if (a1 === a2) return true;
      if (a1.length >= 10 && a2.length >= 10 && (a1.startsWith(a2) || a2.startsWith(a1))) return true;
      return false;
    };

    const checkIsRecipient = (c: CertificateWithMeta): boolean => {
      if (!address) return false;
      const recipientAddr = c.certificate?.credentialSubject?.id || '';
      return isAddressMatch(recipientAddr, address);
    };

    const checkIsIssuer = (c: CertificateWithMeta): boolean => {
      if (!address) return false;
      const issuerId = c.certificate?.issuer?.id || '';
      const clusterId = c.clusterId || '';

      // 1. Direct address match with issuer ID or cluster ID
      if (isAddressMatch(issuerId, address) || isAddressMatch(clusterId, address)) {
        return true;
      }

      // 2. Check against user's cluster IDs
      for (const ucid of Array.from(userClusterIds)) {
        if (isAddressMatch(ucid, issuerId) || isAddressMatch(ucid, clusterId)) {
          return true;
        }
      }

      return false;
    };

    const received: CertificateWithMeta[] = [];
    const issued: CertificateWithMeta[] = [];
    const allUser: CertificateWithMeta[] = [];

    // Single-pass partition
    for (const cert of rawCertificates) {
      const isRec = checkIsRecipient(cert);
      const isIss = checkIsIssuer(cert);

      if (isRec) received.push(cert);
      if (isIss) issued.push(cert);
      if (isRec || isIss) allUser.push(cert);
    }

    let activeList: CertificateWithMeta[] = [];
    if (filterMode === 'received') {
      activeList = received;
    } else if (filterMode === 'issued') {
      activeList = issued;
    } else {
      activeList = allUser;
    }

    return {
      receivedCerts: received,
      issuedCerts: issued,
      allUserCerts: allUser,
      certificates: activeList,
    };
  }, [rawCertificates, userClusters, address, filterMode]);

  if (isLoadingAddress) {
    return (
      <div className="flex justify-center py-24">
        <Spinner label="Resolving wallet address..." />
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card variant="default" padding="xl" className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-midnight-plum border border-lavender-spark/30 rounded-2xl flex items-center justify-center text-2xl shadow-glow-violet/30 animate-float">
            👛
          </div>
          <h2 className="text-xl font-bold text-bone-white tracking-tight">Wallet Not Connected</h2>
          <p className="text-sm text-ash-veil leading-relaxed">
            Connect your wallet to view your portable, verifiable Spore DOB certificates.
          </p>
          <div className="pt-2">
            <Button onClick={() => open()} className="gap-2 shadow-glow-green/30">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </Button>
          </div>
          <p className="text-xs text-mid-ash pt-2 border-t border-fog-line/10">
            Supported wallets: JoyID Passkeys, MetaMask, WalletConnect
          </p>
        </Card>
      </div>
    );
  }

  if (selectedCert) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-fog-line/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCert(null)}
            className="text-ash-veil hover:text-bone-white gap-2 border border-fog-line/15"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to certificates</span>
          </Button>
        </div>
        <CertificateDetail
          certificate={selectedCert.certificate}
          certificateId={selectedCert.certificateId}
          transactionHash={selectedCert.transactionHash}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-fog-line/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lavender-spark text-sm font-bold">✱</span>
            <span className="text-xs font-mono text-mid-ash uppercase tracking-wider">Credential Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-bone-white tracking-tight">My Certificates</h1>
          <p className="text-sm text-ash-veil mt-1">
            View, verify, and export your sovereign on-chain Spore DOB credentials
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex bg-midnight-plum p-1 rounded-xl border border-fog-line/10 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-shadow-plum text-bone-white font-medium border border-fog-line/20'
                  : 'text-mid-ash hover:text-bone-white'
              }`}
            >
              All ({allUserCerts.length})
            </button>
            <button
              onClick={() => setFilterMode('received')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'received'
                  ? 'bg-shadow-plum text-bone-white font-medium border border-fog-line/20'
                  : 'text-mid-ash hover:text-bone-white'
              }`}
            >
              Received ({receivedCerts.length})
            </button>
            <button
              onClick={() => setFilterMode('issued')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'issued'
                  ? 'bg-shadow-plum text-bone-white font-medium border border-fog-line/20'
                  : 'text-mid-ash hover:text-bone-white'
              }`}
            >
              Issued by You ({issuedCerts.length})
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <CertificateList
        certificates={certificates}
        loading={isLoading}
        onSelect={setSelectedCert}
        emptyTitle={
          filterMode === 'received'
            ? 'No received certificates'
            : filterMode === 'issued'
            ? 'No certificates issued yet'
            : 'No certificates found'
        }
        emptyDescription={
          filterMode === 'received'
            ? 'You have not received any verifiable certificates at this address yet.'
            : filterMode === 'issued'
            ? 'You have not issued any certificates from your clusters yet.'
            : 'Certificates issued to your address or minted by your clusters will appear here.'
        }
        emptyAction={filterMode === 'issued' ? () => router.push('/clusters') : undefined}
      />

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl">
          <p className="text-sm text-red-400">Failed to load certificates: {String(error)}</p>
        </div>
      )}
    </div>
  );
}


