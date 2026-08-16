import type { CertificateDNA, CredentialSubject, Issuer } from '@/types';

/**
 * Encode certificate data into W3C VC JSON format
 */
export function encodeCertificateDNA(params: {
  id: string;
  issuer: Issuer;
  subject: CredentialSubject;
  issuanceDate?: string;
  expirationDate?: string;
}): CertificateDNA {
  const now = new Date().toISOString();

  const dna: CertificateDNA = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org',
    ],
    id: params.id,
    type: ['VerifiableCredential', 'CourseCertificate'],
    issuer: {
      id: params.issuer.id,
      name: params.issuer.name,
    },
    issuanceDate: params.issuanceDate || now,
    credentialSubject: {
      type: 'CourseCertificate',
      ...params.subject,
    },
  };

  if (params.expirationDate) {
    dna.expirationDate = params.expirationDate;
  }

  return dna;
}

/**
 * Generate a unique certificate ID
 */
export function generateCertificateId(): string {
  // Generate a random hex string prepended with '0x'
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}`;
}

/**
 * Serialize CertificateDNA to JSON string
 */
export function serializeDNA(dna: CertificateDNA): string {
  return JSON.stringify(dna);
}

/**
 * Get encoded DNA size in bytes
 */
export function getDNASize(dna: CertificateDNA): number {
  const serialized = serializeDNA(dna);
  return new TextEncoder().encode(serialized).length;
}
