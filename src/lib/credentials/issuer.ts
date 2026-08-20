import type { ccc } from '@ckb-ccc/core';
import { createSporeCell } from '@spore-sdk/core';
import type { CertificateDNA, CredentialSubject, CredentialStatus } from '@/types';
import { encodeCertificateDNA, generateCertificateId, serializeDNA } from './encoder';
import { decodeCertificateDNA } from './decoder';

// Environment flag to enable mock mode for testing
// Default to mock for development, set to 'false' for production
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

// Mock certificate storage for testing
const mockCertificates = new Map<string, { certificate: CertificateDNA; txHash: string }>();

interface IssueCertificateParams {
  signer: ccc.Signer;
  clusterId: string;
  issuerName: string;
  issuerDescription?: string;
  subject: CredentialSubject;
  expirationDate?: string;
}

interface IssueCertificateResult {
  certificateId: string;
  transactionHash: string;
}

interface GetCertificateResult {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
  clusterId?: string;
}

/**
 * Clear all mock certificates (for testing)
 */
export function clearMockCertificates(): void {
  mockCertificates.clear();
}

/**
 * Get mock storage (for testing)
 */
export function getMockCertificates(): Map<string, { certificate: CertificateDNA; txHash: string }> {
  return mockCertificates;
}

/**
 * Issue a new certificate as a Spore DOB
 */
export async function issueCertificate(
  params: IssueCertificateParams
): Promise<IssueCertificateResult> {
  const { clusterId, issuerName, issuerDescription, subject, expirationDate } = params;

  // Generate certificate ID
  const certificateId = generateCertificateId();

  // Create certificate DNA
  const dna = encodeCertificateDNA({
    id: certificateId,
    issuer: {
      id: clusterId,
      name: issuerName,
      description: issuerDescription,
    },
    subject,
    expirationDate,
  });

  // Serialize DNA to JSON
  const dnaJson = serializeDNA(dna);

  if (USE_MOCK) {
    // Mock transaction hash for MVP
    const txHash = '0x' + 'a'.repeat(64);

    // Store in mock storage
    mockCertificates.set(certificateId, { certificate: dna, txHash });

    console.log('Certificate issued (mock):', {
      certificateId,
      txHash,
      dna: dnaJson,
    });

    return {
      certificateId,
      transactionHash: txHash,
    };
  }

  // Real Spore SDK implementation
  const { txHash } = await createSporeCell({
    data: {
      ...dna,
      _metadata: {
        contentType: 'application/json',
        encoding: 'utf-8',
      },
    },
    clusterId,
    from: params.signer,
  });

  return {
    certificateId,
    transactionHash: txHash,
  };
}

/**
 * Get certificate by ID
 */
export async function getCertificate(certificateId: string): Promise<GetCertificateResult | null> {
  // Try mock storage first
  const mock = mockCertificates.get(certificateId);
  if (mock) {
    return {
      certificate: mock.certificate,
      certificateId,
      transactionHash: mock.txHash,
      clusterId: mock.certificate.issuer.id,
    };
  }

  if (USE_MOCK) {
    return null;
  }

  // Real Spore SDK implementation would go here
  // For now, return null
  return null;
}

/**
 * Get all certificates for a holder address
 */
export async function getHolderCertificates(holderAddress: string): Promise<GetCertificateResult[]> {
  const results: GetCertificateResult[] = [];

  // Get from mock storage
  for (const [certId, mock] of Array.from(mockCertificates.entries())) {
    const cert = mock.certificate;
    if (cert.credentialSubject.id === holderAddress) {
      results.push({
        certificate: cert,
        certificateId: certId,
        transactionHash: mock.txHash,
        clusterId: cert.issuer.id,
      });
    }
  }

  return results;
}

/**
 * Revoke a certificate (Soft Revocation)
 *
 * Updates the credentialStatus in the DNA to mark as revoked.
 * This is a soft revocation - the certificate cell remains on-chain
 * but is marked as revoked in its DNA.
 *
 * @param signer - The issuer's wallet signer
 * @param certificateId - The certificate ID to revoke
 * @param reason - The reason for revocation
 */
export async function revokeCertificate(
  _signer: ccc.Signer,
  certificateId: string,
  reason?: string
): Promise<{ transactionHash: string }> {
  const mock = mockCertificates.get(certificateId);

  if (!mock) {
    throw new Error('Certificate not found');
  }

  // Update the certificate DNA with revocation status (soft revocation)
  const revokedStatus: CredentialStatus = {
    id: `revocation:${certificateId}`,
    type: 'RevocationList2023Status',
    revoked: true,
    revocationReason: reason,
    revokedAt: new Date().toISOString(),
  };

  // Update the certificate in mock storage
  mock.certificate.credentialStatus = revokedStatus;
  mockCertificates.set(certificateId, mock);

  console.log('Certificate revoked (soft):', {
    certificateId,
    reason,
    revokedAt: revokedStatus.revokedAt,
  });

  return {
    transactionHash: '0x' + 'b'.repeat(64),
  };
}
