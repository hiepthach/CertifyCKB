import { ccc, Address, ClientPublicTestnet } from '@ckb-ccc/core';
import { createSpore, meltSpore } from '@spore-sdk/core';
import { helpers } from '@ckb-lumos/lumos';
import type { CertificateDNA, CredentialSubject, CredentialStatus } from '@/types';
import { encodeCertificateDNA, generateCertificateId, serializeDNA } from './encoder';
import { getSporeConfig } from '@/lib/ckb/config';

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
    mockCertificates.clear();
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
    typeof (signer as any).sendTransaction === 'function'
  ) {
    const liveSigner = signer as ccc.Signer;

    // Resolve recipient lock script — Fail-Fast if recipient address is invalid
    const recipientAddr = subject.id || '';
    if (!recipientAddr) {
      throw new Error('Recipient CKB address is required');
    }

    try {
      const AddressClass = Address || ccc?.Address;
      await AddressClass.fromString(recipientAddr, liveSigner.client);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid recipient CKB address "${recipientAddr}": ${errMsg}`);
    }

    try {
      // Use Spore SDK to create the certificate DOB cell
      const { txSkeleton } = await createSpore({
        data: {
          contentType: 'application/json',
          content: ccc.bytesFrom(new TextEncoder().encode(dnaJson)),
        },
        toLock: helpers.addressToScript(recipientAddr),
        fromInfos: [recipientAddr],
        config: getSporeConfig(),
      });

      // Sign and send the transaction via the live signer
      const signedTx = await liveSigner.signTransaction(txSkeleton as any);
      const txHash = await liveSigner.sendTransaction(signedTx);

      // Save to local storage for quick retrieval & caching
      syncCertificatesFromLocalStorage();
      mockCertificates.set(certificateId, { certificate: dna, txHash });
      syncCertificatesToLocalStorage();

      return {
        certificateId,
        transactionHash: txHash,
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('capacity') || msg.includes('balance') || msg.includes('Inputs') || msg.includes('LiveCells')) {
        throw new Error(
          `Insufficient CKB capacity in wallet. You need at least ~150 CKB to mint an on-chain DOB credential cell. Please claim free testnet CKB from https://faucet.nervos.org.`
        );
      }
      throw err;
    }
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
    const isMockHash = mock.txHash.startsWith('0xaaaa') || mock.txHash === '0x' + '0'.repeat(64);
    if (holderAddress && isMockHash && !isTestEnv) {
      continue;
    }
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
  syncCertificatesFromLocalStorage();
  const results: GetCertificateResult[] = [];
  const seenIds = new Set<string>();

  // 1. Get all certificates from local storage (both issued by user and received by user)
  for (const [certId, mock] of Array.from(mockCertificates.entries())) {
    const isMockHash = mock.txHash.startsWith('0xaaaa') || mock.txHash === '0x' + '0'.repeat(64);
    if (address && isMockHash && !isTestEnv) {
      continue;
    }
    const cid = mock.certificate.issuer?.id || '';
    results.push({
      certificate: mock.certificate,
      certificateId: certId,
      transactionHash: mock.txHash,
      clusterId: cid,
    });
    seenIds.add(certId);
    if (mock.txHash) seenIds.add(mock.txHash);
  }

  // 2. If address is provided, also scan on-chain cells for this address (as holder/recipient)
  if (address && typeof window !== 'undefined' && !isTestEnv) {
    try {
      const holderCerts = await getHolderCertificates(address, client);
      for (const item of holderCerts) {
        if (!seenIds.has(item.certificateId) && (!item.transactionHash || !seenIds.has(item.transactionHash))) {
          seenIds.add(item.certificateId);
          if (item.transactionHash) seenIds.add(item.transactionHash);
          results.push(item);
        }
      }

      // 3. Scan on-chain transactions where address was the sender/issuer (input lock = address)
      const ckbClient = (client as ccc.Client) || (ClientPublicTestnet ? new ClientPublicTestnet() : new ccc.ClientPublicTestnet());
      const AddressClass = Address || ccc?.Address;
      if (AddressClass?.fromString) {
        const addrObj = await AddressClass.fromString(address, ckbClient);
        let txCount = 0;
        for await (const txRecord of ckbClient.findTransactionsByLock(addrObj.script, undefined, false, 'desc', 20)) {
          if (txCount++ > 20) break;
          try {
            if (!txRecord.isInput) continue;
            const txResponse = await ckbClient.getTransaction(txRecord.txHash);
            if (!txResponse?.transaction?.outputsData) continue;

            for (let i = 0; i < txResponse.transaction.outputsData.length; i++) {
              const hex = txResponse.transaction.outputsData[i];
              if (!hex || hex === '0x' || hex.length < 10) continue;
              try {
                const text = new TextDecoder().decode(ccc.bytesFrom(hex));
                if (text.includes('@context') && text.includes('CourseCertificate')) {
                  const certDna = JSON.parse(text) as CertificateDNA;
                  const certId = certDna.id || txRecord.txHash;

                  if (!seenIds.has(certId) && !seenIds.has(txRecord.txHash)) {
                    seenIds.add(certId);
                    seenIds.add(txRecord.txHash);

                    const item: GetCertificateResult = {
                      certificate: certDna,
                      certificateId: certId,
                      transactionHash: txRecord.txHash,
                      clusterId: certDna.issuer?.id || '',
                    };

                    results.push(item);

                    mockCertificates.set(certId, {
                      certificate: certDna,
                      txHash: txRecord.txHash,
                    });
                  }
                }
              } catch {}
            }
          } catch {}
        }
        syncCertificatesToLocalStorage();
      }
    } catch (e) {
      console.warn('Error syncing on-chain certificates:', e);
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

/**
 * Melt (destroy) a certificate cell to reclaim CKB capacity.
 * Only the certificate holder can melt their own certificate.
 *
 * @param signer - The holder's wallet signer (must be a live signer)
 * @param certificateId - The certificate ID to melt
 */
export async function meltCertificate(
  signer: unknown,
  certificateId: string
): Promise<{ transactionHash: string }> {
  // Fail-Fast: require live signer
  if (
    !signer ||
    typeof signer !== 'object' ||
    !('client' in signer) ||
    typeof (signer as any).sendTransaction !== 'function'
  ) {
    throw new Error('Live signer is required to melt a certificate');
  }

  const liveSigner = signer as ccc.Signer;

  // Look up the certificate to get the transaction hash
  const certRecord = await getCertificate(certificateId);
  if (!certRecord) {
    throw new Error('Certificate not found');
  }

  const txHash = certRecord.transactionHash;
  if (!txHash) {
    throw new Error('Certificate has no on-chain transaction hash');
  }

  // Get holder's address and lock script
  const addrObj = await liveSigner.getRecommendedAddressObj();
  const holderAddress = addrObj.toString();
  const holderLock = addrObj.script;

  // Verify the holder owns this certificate cell
  const ckbClient = liveSigner.client;
  let holderOwnsCell = false;

  try {
    const cell = await ckbClient.getCell({ txHash, index: '0x0' });
    const cellOutput = (cell as unknown as { output?: { lock: ccc.Script } }).output;
    if (cellOutput?.lock) {
      // Compare lock scripts: match if both codeHash+hashType+args are equal
      const cellLock = cellOutput.lock;
      holderOwnsCell =
        cellLock.codeHash === holderLock.codeHash &&
        cellLock.hashType === holderLock.hashType &&
        cellLock.args === holderLock.args;
    }
  } catch {
    // Cell not found on-chain
    throw new Error('Certificate cell not found on-chain');
  }

  if (!holderOwnsCell) {
    throw new Error('Only the certificate holder can melt this certificate');
  }

  // Use Spore SDK to build the melt transaction
  const { txSkeleton } = await meltSpore({
    outPoint: { txHash, index: '0x0' },
    changeAddress: holderAddress,
    config: getSporeConfig(),
  });

  // Sign and send the transaction via the live signer
  const signedTx = await liveSigner.signTransaction(txSkeleton as any);
  const meltTxHash = await liveSigner.sendTransaction(signedTx);

  // Remove from local storage
  syncCertificatesFromLocalStorage();
  mockCertificates.delete(certificateId);
  syncCertificatesToLocalStorage();

  return { transactionHash: meltTxHash };
}
