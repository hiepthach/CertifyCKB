/**
 * Encoder - W3C VC Certificate DNA Encoding
 *
 * Encodes certificate data into W3C Verifiable Credential format
 * for storage on CKB via Spore Protocol.
 */

import type { CertificateDNA } from '@/types';

/**
 * Encode certificate data into W3C VC format
 */
export function encodeCertificateDNA(params: {
  id: string;
  issuer: { id: string; name?: string; description?: string };
  subject: {
    type: string;
    name?: string;
    courseName?: string;
    completionDate?: string;
    grade?: string;
    score?: number;
    skills?: string[];
  };
  issuanceDate?: string;
  expirationDate?: string;
}): CertificateDNA {
  const { id, issuer, subject, issuanceDate, expirationDate } = params;

  const dna: CertificateDNA = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.org',
    ],
    id,
    type: ['VerifiableCredential', subject.type],
    issuer: {
      id: issuer.id,
      name: issuer.name,
    },
    issuanceDate: issuanceDate || new Date().toISOString(),
    credentialSubject: {
      type: subject.type,
    },
  };

  // Add optional subject fields
  if (subject.name) {
    (dna.credentialSubject as Record<string, unknown>).name = subject.name;
  }
  if (subject.courseName) {
    (dna.credentialSubject as Record<string, unknown>).courseName = subject.courseName;
  }
  if (subject.completionDate) {
    (dna.credentialSubject as Record<string, unknown>).completionDate = subject.completionDate;
  }
  if (subject.grade) {
    (dna.credentialSubject as Record<string, unknown>).grade = subject.grade;
  }
  if (subject.score !== undefined) {
    (dna.credentialSubject as Record<string, unknown>).score = subject.score;
  }
  if (subject.skills) {
    (dna.credentialSubject as Record<string, unknown>).skills = subject.skills;
  }

  // Add expiration date if provided
  if (expirationDate) {
    dna.expirationDate = expirationDate;
  }

  return dna;
}

/**
 * Generate unique certificate ID
 */
export function generateCertificateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}`;
}

/**
 * Serialize DNA to JSON string
 */
export function serializeDNA(dna: CertificateDNA): string {
  return JSON.stringify(dna);
}

/**
 * Get DNA size in bytes
 */
export function getDNASize(dna: CertificateDNA): number {
  const serialized = serializeDNA(dna);
  return new TextEncoder().encode(serialized).length;
}
