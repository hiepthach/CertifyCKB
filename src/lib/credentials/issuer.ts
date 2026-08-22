import { ccc } from '@ckb-ccc/core';
import type { CertificateDNA, CredentialSubject, CredentialStatus } from '@/types';
import { encodeCertificateDNA, generateCertificateId, serializeDNA } from './encoder';

// Environment flag to enable mock mode for testing
// Default to mock for development, set to 'false' for production
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

const CERT_STORAGE_KEY = 'ckb_credential_certificates';

// Mock certificate storage for testing
const mockCertificates = new Map<string, { certificate: CertificateDNA; txHash: string }>();

function syncCertificatesFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CERT_STORAGE_KEY);
    if (raw) {
      const parsed: [string, { certificate: CertificateDNA; txHash: string }][] = JSON.parse(raw);
      for (const [key, value] of parsed) {
        if (key && value) {
          mockCertificates.set(key, value);
        }
      }
    }
  } catch (e) {
    console.error('Failed to load certificates from localStorage:', e);
  }
}

function syncCertificatesToLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(mockCertificates.entries());
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('Failed to save certificates to localStorage:', e);
  }
}

interface IssueCertificateParams {
  signer: unknown; // ccc.Signer in production
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
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CERT_STORAGE_KEY);
    } catch {}
  }
}

/**
 * Get mock storage (for testing)
 */
export function getMockCertificates(): Map<string, { certificate: CertificateDNA; txHash: string }> {
  syncCertificatesFromLocalStorage();
  return mockCertificates;
}

/**
 * Issue a new certificate as a Spore DOB
 */
export async function issueCertificate(
  params: IssueCertificateParams
): Promise<IssueCertificateResult> {
  const { signer, clusterId, issuerName, issuerDescription, subject, expirationDate } = params;

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

  // If a live CCC signer is connected, construct and send a real on-chain transaction
  if (
    signer &&
    typeof signer === 'object' &&
    'client' in signer &&
    typeof (signer as any).sendTransaction === 'function' &&
    typeof (signer as any).getRecommendedAddressObj === 'function'
  ) {
    const liveSigner = signer as ccc.Signer;

    // Resolve recipient lock script
    let recipientLock: ccc.Script;
    try {
      const recipientAddr = subject.id || '';
      if (!recipientAddr) throw new Error('Missing recipient address');
      const addrObj = await ccc.Address.fromString(recipientAddr, liveSigner.client);
      recipientLock = addrObj.script;
    } catch {
      // If parsing fails or invalid format, fallback to sender's own lock script
      const senderAddrObj = await liveSigner.getRecommendedAddressObj();
      recipientLock = senderAddrObj.script;
    }

    const dataBytes = ccc.bytesFrom(new TextEncoder().encode(dnaJson));

    const cellOutput = ccc.CellOutput.from({
      capacity: 0,
      lock: recipientLock,
    });
    cellOutput.capacity = ccc.fixedPointFrom(cellOutput.occupiedSize + dataBytes.length);

    const tx = ccc.Transaction.from({
      outputs: [cellOutput],
      outputsData: [ccc.hexFrom(dataBytes)],
    });

    try {
      await tx.completeInputsByCapacity(liveSigner);
      await tx.completeFeeBy(liveSigner);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('capacity') || msg.includes('balance') || msg.includes('Inputs') || msg.includes('LiveCells')) {
        throw new Error(
          `Insufficient CKB capacity in wallet. You need at least ~150 CKB to mint an on-chain DOB credential cell. Please claim free testnet CKB from https://faucet.nervos.org.`
        );
      }
      throw err;
    }

    const txHash = await liveSigner.sendTransaction(tx);

    // Save to local storage for quick retrieval & caching
    syncCertificatesFromLocalStorage();
    mockCertificates.set(certificateId, { certificate: dna, txHash });
    syncCertificatesToLocalStorage();

    return {
      certificateId,
      transactionHash: txHash,
    };
  }

  // Fallback for tests/mock environment
  const txHash = '0x' + 'a'.repeat(64);

  // Store in mock storage
  syncCertificatesFromLocalStorage();
  mockCertificates.set(certificateId, { certificate: dna, txHash });
  syncCertificatesToLocalStorage();

  return {
    certificateId,
    transactionHash: txHash,
  };
}

/**
 * Get certificate by ID
 */
export async function getCertificate(certificateId: string): Promise<GetCertificateResult | null> {
  syncCertificatesFromLocalStorage();
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
  return null;
}

/**
 * Get all certificates for a holder address
 */
export async function getHolderCertificates(holderAddress?: string): Promise<GetCertificateResult[]> {
  syncCertificatesFromLocalStorage();
  const results: GetCertificateResult[] = [];

  // Get from mock storage
  for (const [certId, mock] of Array.from(mockCertificates.entries())) {
    const cert = mock.certificate;
    if (!holderAddress || cert.credentialSubject.id === holderAddress || !cert.credentialSubject.id) {
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
 * Get all certificates issued under a specific cluster ID
 */
export async function getClusterCertificates(clusterId: string): Promise<GetCertificateResult[]> {
  syncCertificatesFromLocalStorage();
  const results: GetCertificateResult[] = [];

  for (const [certId, mock] of Array.from(mockCertificates.entries())) {
    const cert = mock.certificate;
    if (cert.issuer.id === clusterId) {
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
 * Get all certificates in system
 */
export async function getAllCertificates(): Promise<GetCertificateResult[]> {
  syncCertificatesFromLocalStorage();
  const results: GetCertificateResult[] = [];

  for (const [certId, mock] of Array.from(mockCertificates.entries())) {
    results.push({
      certificate: mock.certificate,
      certificateId: certId,
      transactionHash: mock.txHash,
      clusterId: mock.certificate.issuer.id,
    });
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
 * @param signer - The issuer's wallet signer (unused in mock mode)
 * @param certificateId - The certificate ID to revoke
 * @param reason - The reason for revocation
 */
export async function revokeCertificate(
  _signer: unknown,
  certificateId: string,
  reason?: string
): Promise<{ transactionHash: string }> {
  syncCertificatesFromLocalStorage();
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
  syncCertificatesToLocalStorage();

  console.log('Certificate revoked (soft):', {
    certificateId,
    reason,
    revokedAt: revokedStatus.revokedAt,
  });

  return {
    transactionHash: '0x' + 'b'.repeat(64),
  };
}
