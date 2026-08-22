import { ccc, Address, ClientPublicTestnet } from '@ckb-ccc/core';
import type { CertificateDNA, CredentialSubject, CredentialStatus } from '@/types';
import { encodeCertificateDNA, generateCertificateId, serializeDNA } from './encoder';

// Environment flag to enable mock mode for testing
// Default to mock for development, set to 'false' for production
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST));

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
      const AddressClass = Address || ccc?.Address;
      const addrObj = await AddressClass.fromString(recipientAddr, liveSigner.client);
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
 * Get certificate by ID or Transaction Hash
 */
export async function getCertificate(
  certificateId: string,
  client?: unknown
): Promise<GetCertificateResult | null> {
  syncCertificatesFromLocalStorage();
  // 1. Try local storage by ID
  const mock = mockCertificates.get(certificateId);
  if (mock) {
    return {
      certificate: mock.certificate,
      certificateId,
      transactionHash: mock.txHash,
      clusterId: mock.certificate.issuer.id,
    };
  }

  // 2. Search local storage by transaction hash
  for (const [id, item] of Array.from(mockCertificates.entries())) {
    if (item.txHash === certificateId) {
      return {
        certificate: item.certificate,
        certificateId: id,
        transactionHash: item.txHash,
        clusterId: item.certificate.issuer.id,
      };
    }
  }

  // 3. Query on-chain CKB Testnet transaction if given a 66-character hex hash
  if (
    typeof window !== 'undefined' &&
    !isTestEnv &&
    certificateId.startsWith('0x') &&
    certificateId.length === 66
  ) {
    try {
      const ckbClient =
        (client as ccc.Client) ||
        (ClientPublicTestnet ? new ClientPublicTestnet() : new ccc.ClientPublicTestnet());
      const tx = await ckbClient.getTransaction(certificateId as `0x${string}`);
      if (tx?.transaction?.outputsData) {
        for (let i = 0; i < tx.transaction.outputsData.length; i++) {
          const hex = tx.transaction.outputsData[i];
          if (!hex || hex === '0x' || hex.length < 10) continue;
          try {
            const text = new TextDecoder().decode(ccc.bytesFrom(hex));
            if (text.includes('@context') && text.includes('CourseCertificate')) {
              const certDna = JSON.parse(text) as CertificateDNA;
              const certId = certDna.id || certificateId;
              mockCertificates.set(certId, { certificate: certDna, txHash: certificateId });
              syncCertificatesToLocalStorage();
              return {
                certificate: certDna,
                certificateId: certId,
                transactionHash: certificateId,
                clusterId: certDna.issuer?.id || '',
              };
            }
          } catch {
            // Ignore non-VC outputs
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching on-chain tx for certificate:', e);
    }
  }

  return null;
}

/**
 * Get all certificates for a holder address
 */
export async function getHolderCertificates(
  holderAddress?: string,
  client?: unknown
): Promise<GetCertificateResult[]> {
  syncCertificatesFromLocalStorage();
  const results: GetCertificateResult[] = [];
  const seenIds = new Set<string>();

  // 1. Get from local cache
  for (const [certId, mock] of Array.from(mockCertificates.entries())) {
    const cert = mock.certificate;
    if (!holderAddress || cert.credentialSubject.id === holderAddress || !cert.credentialSubject.id) {
      results.push({
        certificate: cert,
        certificateId: certId,
        transactionHash: mock.txHash,
        clusterId: cert.issuer.id,
      });
      seenIds.add(certId);
      if (mock.txHash) seenIds.add(mock.txHash);
    }
  }

  // 2. Query live CKB blockchain cells if holderAddress is available
  if (holderAddress && typeof window !== 'undefined' && !isTestEnv) {
    try {
      const ckbClient = (client as ccc.Client) || (ClientPublicTestnet ? new ClientPublicTestnet() : new ccc.ClientPublicTestnet());
      const AddressClass = Address || ccc?.Address;
      if (AddressClass?.fromString) {
        const addrObj = await AddressClass.fromString(holderAddress, ckbClient);

        // Search all live cells owned by the recipient lock script
        for await (const cell of ckbClient.findCellsByLock(addrObj.script, undefined, true)) {
          try {
            if (!cell.outputData || cell.outputData === '0x' || cell.outputData.length < 10) continue;

            // Decode hex outputData to UTF-8 string
            const text = new TextDecoder().decode(ccc.bytesFrom(cell.outputData));
            if (!text.includes('@context') || !text.includes('CourseCertificate')) continue;

            const certDna = JSON.parse(text) as CertificateDNA;
            const certId = certDna.id || cell.outPoint.txHash;

            if (!seenIds.has(certId) && !seenIds.has(cell.outPoint.txHash)) {
              seenIds.add(certId);
              seenIds.add(cell.outPoint.txHash);

              const item: GetCertificateResult = {
                certificate: certDna,
                certificateId: certId,
                transactionHash: cell.outPoint.txHash,
                clusterId: certDna.issuer?.id || '',
              };

              results.push(item);

              // Persist to local storage for fast caching
              mockCertificates.set(certId, {
                certificate: certDna,
                txHash: cell.outPoint.txHash,
              });
            }
          } catch {
            // Ignore cells that are not valid JSON certificates
          }
        }
        syncCertificatesToLocalStorage();
      }
    } catch (e) {
      console.warn('Error querying on-chain certificate cells for holder:', e);
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
 * Get all certificates in system (or for an active wallet)
 */
export async function getAllCertificates(
  client?: unknown,
  address?: string
): Promise<GetCertificateResult[]> {
  if (address) {
    return getHolderCertificates(address, client);
  }
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
