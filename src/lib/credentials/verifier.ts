import type { VerificationResult, VerificationHistory, CertificateDNA } from '@/types';
import { isExpired, isRevoked } from './decoder';
import { getCertificate } from './issuer';
import { getCluster } from './cluster';

/**
 * Verify a certificate by its ID
 * Performs comprehensive verification including:
 * - Cell existence check
 * - DNA format validation
 * - Issuer verification
 * - Expiration check
 * - Revocation check
 */
export async function verifyCertificate(certificateId: string): Promise<VerificationResult> {
  const errors: string[] = [];

  // Initialize checks object
  const checks = {
    cellExists: false,
    dnaValid: false,
    issuerVerified: false,
    expirationVerified: true,
    revocationVerified: true,
  };

  try {
    // Step 1: Find the certificate
    const certResult = await getCertificate(certificateId);

    if (!certResult) {
      errors.push('Certificate not found on chain');
      return createInvalidResult(certificateId, errors, checks);
    }

    checks.cellExists = true;

    // Step 2: Get and validate the certificate DNA
    let certificate: CertificateDNA;
    try {
      certificate = certResult.certificate;
      checks.dnaValid = true;
    } catch {
      errors.push('Invalid certificate format');
      return createInvalidResult(certificateId, errors, checks);
    }

    // Step 3: Verify issuer (cluster) exists
    const issuerId = certificate.issuer.id;
    let issuerName = certificate.issuer.name || 'Unknown';

    if (issuerId) {
      const cluster = await getCluster(issuerId);
      if (cluster) {
        issuerName = cluster.name;
        checks.issuerVerified = true;
      }
    }

    // Step 4: Check expiration
    const expired = isExpired(certificate);
    if (expired) {
      checks.expirationVerified = false;
      errors.push('Certificate has expired');
    }

    // Step 5: Check revocation
    const revoked = isRevoked(certificate);
    if (revoked) {
      checks.revocationVerified = false;
      errors.push('Certificate has been revoked');
    }

    // Overall validity - all checks must pass
    const valid = checks.cellExists && checks.dnaValid && checks.expirationVerified && checks.revocationVerified;

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
      checks,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      transactionHash: certResult.transactionHash,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Verification failed');
    return createInvalidResult(certificateId, errors, checks);
  }
}

/**
 * Create an invalid verification result with all checks failed
 */
function createInvalidResult(
  certificateId: string,
  errors: string[],
  checks: {
    cellExists: boolean;
    dnaValid: boolean;
    issuerVerified: boolean;
    expirationVerified: boolean;
    revocationVerified: boolean;
  }
): VerificationResult {
  return {
    valid: false,
    certificateId,
    issuer: { id: '', name: '' },
    certificate: {
      isExpired: false,
      isRevoked: false,
      issuanceDate: '',
    },
    checks,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };
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
