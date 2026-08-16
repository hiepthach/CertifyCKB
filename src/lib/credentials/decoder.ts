import type { CertificateDNA } from '@/types';

/**
 * Parse JSON string to CertificateDNA
 */
export function decodeCertificateDNA(jsonString: string): CertificateDNA {
  const parsed = JSON.parse(jsonString);

  // Validate required fields
  if (!parsed['@context'] || !parsed.id || !parsed.type || !parsed.issuer || !parsed.credentialSubject) {
    throw new Error('Invalid certificate DNA: missing required fields');
  }

  // Validate @context
  if (!Array.isArray(parsed['@context'])) {
    throw new Error('Invalid certificate DNA: @context must be an array');
  }

  // Validate type
  if (!Array.isArray(parsed.type) || !parsed.type.includes('VerifiableCredential')) {
    throw new Error('Invalid certificate DNA: must be a VerifiableCredential');
  }

  return parsed as CertificateDNA;
}

/**
 * Check if certificate has expired
 */
export function isExpired(certificate: CertificateDNA): boolean {
  if (!certificate.expirationDate) {
    return false;
  }

  const expirationDate = new Date(certificate.expirationDate);
  const now = new Date();
  return now > expirationDate;
}

/**
 * Check if certificate is revoked
 */
export function isRevoked(certificate: CertificateDNA): boolean {
  return !!certificate.credentialStatus;
}

/**
 * Get certificate expiration status
 */
export function getExpirationStatus(certificate: CertificateDNA): {
  isExpired: boolean;
  expirationDate?: string;
  daysUntilExpiration?: number;
} {
  if (!certificate.expirationDate) {
    return { isExpired: false };
  }

  const expirationDate = new Date(certificate.expirationDate);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isExpired: diffTime < 0,
    expirationDate: certificate.expirationDate,
    daysUntilExpiration,
  };
}

/**
 * Format certificate for display
 */
export function formatCertificateDisplay(certificate: CertificateDNA): {
  title: string;
  recipient: string;
  course: string;
  issuer: string;
  date: string;
  status: 'active' | 'expired' | 'revoked';
} {
  const subject = certificate.credentialSubject;
  const expirationStatus = getExpirationStatus(certificate);

  let status: 'active' | 'expired' | 'revoked' = 'active';
  if (isRevoked(certificate)) {
    status = 'revoked';
  } else if (expirationStatus.isExpired) {
    status = 'expired';
  }

  return {
    title: subject.courseName || 'Course Certificate',
    recipient: subject.name || 'Unknown Recipient',
    course: subject.courseName || 'Unknown Course',
    issuer: certificate.issuer.name || certificate.issuer.id,
    date: new Date(certificate.issuanceDate).toLocaleDateString(),
    status,
  };
}

/**
 * Validate DNA format without full parsing
 */
export function isValidDNAFormat(data: unknown): data is CertificateDNA {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const dna = data as Record<string, unknown>;

  return (
    Array.isArray(dna['@context']) &&
    typeof dna.id === 'string' &&
    Array.isArray(dna.type) &&
    dna.type.includes('VerifiableCredential') &&
    typeof dna.issuer === 'object' &&
    dna.issuer !== null &&
    typeof (dna.issuer as Record<string, unknown>).id === 'string' &&
    typeof dna.credentialSubject === 'object' &&
    dna.credentialSubject !== null
  );
}
