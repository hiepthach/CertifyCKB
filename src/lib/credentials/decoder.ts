/**
 * Decoder - W3C VC Certificate DNA Decoding
 *
 * Decodes W3C Verifiable Credential JSON into CertificateDNA objects.
 * Includes validation, expiration checking, and format verification.
 */

import type { CertificateDNA, CertificateDisplay } from '@/types';

/**
 * Decode JSON string to CertificateDNA
 */
export function decodeCertificateDNA(json: string): CertificateDNA {
  let data: unknown;

  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Invalid certificate DNA: invalid JSON');
  }

  if (!isValidDNAFormat(data)) {
    throw new Error('Invalid certificate DNA: missing required fields');
  }

  return data;
}

/**
 * Check if certificate is expired
 */
export function isExpired(dna: CertificateDNA): boolean {
  if (!dna.expirationDate) {
    return false;
  }
  return new Date(dna.expirationDate) < new Date();
}

/**
 * Check if certificate is revoked
 * Soft revocation: checks the revoked flag in credentialStatus
 */
export function isRevoked(dna: CertificateDNA): boolean {
  return dna.credentialStatus?.revoked === true;
}

/**
 * Get expiration status with days remaining
 */
export function getExpirationStatus(dna: CertificateDNA): {
  isExpired: boolean;
  expirationDate?: string;
  daysUntilExpiration?: number;
} {
  if (!dna.expirationDate) {
    return { isExpired: false };
  }

  const expDate = new Date(dna.expirationDate);
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isExpired: daysUntilExpiration < 0,
    expirationDate: dna.expirationDate,
    daysUntilExpiration,
  };
}

/**
 * Format certificate for display
 */
export function formatCertificateDisplay(dna: CertificateDNA): CertificateDisplay {
  const subject = dna.credentialSubject as Record<string, unknown>;

  let status: 'active' | 'expired' | 'revoked' = 'active';

  if (isRevoked(dna)) {
    status = 'revoked';
  } else if (isExpired(dna)) {
    status = 'expired';
  }

  return {
    title: (subject.courseName as string) || 'Unknown Course',
    recipient: (subject.name as string) || 'Unknown Recipient',
    course: (subject.courseName as string) || 'Unknown Course',
    issuer: dna.issuer.name || 'Unknown Issuer',
    date: dna.issuanceDate,
    status,
  };
}

/**
 * Validate DNA format
 */
export function isValidDNAFormat(data: unknown): data is CertificateDNA {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const dna = data as Record<string, unknown>;

  // Check required fields
  if (!Array.isArray(dna['@context']) || dna['@context'].length === 0) {
    return false;
  }

  if (!dna['id'] || typeof dna['id'] !== 'string') {
    return false;
  }

  if (!Array.isArray(dna['type']) || !dna['type'].includes('VerifiableCredential')) {
    return false;
  }

  if (!dna['issuer'] || typeof dna['issuer'] !== 'object') {
    return false;
  }

  const issuer = dna['issuer'] as Record<string, unknown>;
  if (!issuer['id'] || typeof issuer['id'] !== 'string') {
    return false;
  }

  if (!dna['credentialSubject'] || typeof dna['credentialSubject'] !== 'object') {
    return false;
  }

  return true;
}
