import type { VerificationResult, VerificationHistory, CertificateDNA } from '@/types';
import { decodeCertificateDNA, isExpired, isRevoked } from './decoder';
import { getDefaultClient } from '@/lib/ckb/client';
import { getCluster } from './cluster';

/**
 * Verify a certificate by its ID
 */
export async function verifyCertificate(certificateId: string): Promise<VerificationResult> {
  const client = getDefaultClient();
  const errors: string[] = [];

  try {
    // Step 1: Find the Spore cell for this certificate
    const cells = await client.findCells({
      script: {
        codeHash: process.env.NEXT_PUBLIC_SPORE_CODE_HASH || '',
        hashType: 'data2',
        args: certificateId,
      },
      scriptType: 'type',
    });

    if (cells.length === 0) {
      return {
        valid: false,
        certificateId,
        issuer: { id: '', name: '' },
        certificate: {
          isExpired: false,
          isRevoked: false,
          issuanceDate: '',
        },
        errors: ['Certificate not found on chain'],
      };
    }

    const cell = cells[0];
    const data = cell.outputData;

    if (!data) {
      return {
        valid: false,
        certificateId,
        issuer: { id: '', name: '' },
        certificate: {
          isExpired: false,
          isRevoked: false,
          issuanceDate: '',
        },
        errors: ['Certificate data is empty'],
      };
    }

    // Step 2: Decode and validate the certificate DNA
    let certificate: CertificateDNA;
    try {
      certificate = decodeCertificateDNA(data);
    } catch (error) {
      return {
        valid: false,
        certificateId,
        issuer: { id: '', name: '' },
        certificate: {
          isExpired: false,
          isRevoked: false,
          issuanceDate: '',
        },
        errors: ['Invalid certificate format'],
      };
    }

    // Step 3: Verify issuer (cluster) exists
    const issuerId = certificate.issuer.id;
    let issuerName = certificate.issuer.name || 'Unknown';

    if (issuerId) {
      const cluster = await getCluster(issuerId);
      if (cluster) {
        issuerName = cluster.name;
      }
    }

    // Step 4: Check expiration
    const expired = isExpired(certificate);

    // Step 5: Check revocation
    const revoked = isRevoked(certificate);

    // Overall validity
    const valid = !expired && !revoked;

    return {
      valid,
      certificateId,
      issuer: {
        id: issuerId,
        name: issuerName,
      },
      certificate: {
        isExpired: expired,
        isRevoked: revoked,
        issuanceDate: certificate.issuanceDate,
        expirationDate: certificate.expirationDate,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      valid: false,
      certificateId,
      issuer: { id: '', name: '' },
      certificate: {
        isExpired: false,
        isRevoked: false,
        issuanceDate: '',
      },
      errors: [error instanceof Error ? error.message : 'Verification failed'],
    };
  }
}

/**
 * Get verification history for a certificate
 */
export async function getVerificationHistory(certificateId: string): Promise<VerificationHistory[]> {
  // For MVP, this would store verification events off-chain
  // or query a verification registry contract
  // Return empty for now
  console.log('Getting verification history for:', certificateId);
  return [];
}
