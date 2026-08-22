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
    id?: string;
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
  const subjectRecord = dna.credentialSubject as unknown as Record<string, unknown>;

  if (subject.id) {
    subjectRecord.id = subject.id;
  }
  if (subject.name) {
    subjectRecord.name = subject.name;
  }
  if (subject.courseName) {
    subjectRecord.courseName = subject.courseName;
  }
  if (subject.completionDate) {
    subjectRecord.completionDate = subject.completionDate;
  }
  if (subject.grade) {
    subjectRecord.grade = subject.grade;
  }
  if (subject.score !== undefined) {
    subjectRecord.score = subject.score;
  }
  if (subject.skills) {
    subjectRecord.skills = subject.skills;
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
