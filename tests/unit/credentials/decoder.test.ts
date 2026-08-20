/**
 * Decoder Tests - W3C VC Certificate DNA Decoding
 *
 * Tests for decoding W3C Verifiable Credential JSON into CertificateDNA objects.
 * Includes validation, expiration checking, and format verification.
 * Reference: https://www.w3.org/TR/vc-data-model/
 */

import { describe, it, expect } from 'vitest';
import {
  decodeCertificateDNA,
  isExpired,
  isRevoked,
  getExpirationStatus,
  formatCertificateDisplay,
  isValidDNAFormat,
} from '../../../src/lib/credentials/decoder';
import type { CertificateDNA } from '../../../src/types';

describe('Decoder', () => {
  // Shared valid DNA fixture used across multiple tests
  const validDNA: CertificateDNA = {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://schema.org'],
    id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: ['VerifiableCredential', 'CourseCertificate'],
    issuer: {
      id: 'ckt1qcluster123',
      name: 'CKB Academy',
    },
    issuanceDate: '2024-01-15T10:00:00Z',
    credentialSubject: {
      type: 'CourseCertificate',
      name: 'John Doe',
      courseName: 'CKB Basics',
      completionDate: '2024-01-15',
      grade: 'A',
      score: 95,
      skills: ['Rust', 'CKB-VM'],
    },
  };

  describe('decodeCertificateDNA', () => {
    // Test: Decode valid JSON to CertificateDNA object
    // Input: Valid JSON string with all required W3C VC fields
    // Expected: Returns CertificateDNA object with correct field values
    it('should decode valid JSON to CertificateDNA', () => {
      const json = JSON.stringify(validDNA);
      const result = decodeCertificateDNA(json);

      expect(result).toBeDefined();
      expect(result.id).toBe(validDNA.id);
      expect(result.issuer.name).toBe('CKB Academy');
      expect(result.credentialSubject.name).toBe('John Doe');
    });

    // Test: Handle invalid JSON input
    // Input: Malformed JSON string (not valid JSON)
    // Expected: Throws error with "Invalid certificate DNA" message
    it('should throw error for invalid JSON', () => {
      expect(() => decodeCertificateDNA('not valid json')).toThrow('Invalid certificate DNA');
    });

    // Test: Handle missing @context field
    // Input: JSON with @context field set to undefined
    // Expected: Throws error for missing required field
    it('should throw error for missing @context', () => {
      const invalidDNA = { ...validDNA, '@context': undefined };
      expect(() => decodeCertificateDNA(JSON.stringify(invalidDNA))).toThrow();
    });

    // Test: Handle missing type field
    // Input: JSON with type field set to undefined
    // Expected: Throws error for missing required field
    it('should throw error for missing required fields', () => {
      const invalidDNA = { ...validDNA, type: undefined };
      expect(() => decodeCertificateDNA(JSON.stringify(invalidDNA))).toThrow();
    });
  });

  describe('isExpired', () => {
    // Test: Certificate without expiration date
    // Input: CertificateDNA without expirationDate field
    // Expected: Returns false (not expired)
    it('should return false for certificate without expiration', () => {
      expect(isExpired(validDNA)).toBe(false);
    });

    // Test: Certificate with future expiration date
    // Input: CertificateDNA with expirationDate 1 year in future
    // Expected: Returns false (not expired)
    it('should return false for certificate with future expiration', () => {
      const futureDNA: CertificateDNA = {
        ...validDNA,
        expirationDate: new Date(Date.now() + 86400000 * 365).toISOString(),
      };
      expect(isExpired(futureDNA)).toBe(false);
    });

    // Test: Certificate with past expiration date
    // Input: CertificateDNA with expirationDate in the past (2020-01-01)
    // Expected: Returns true (expired)
    it('should return true for certificate with past expiration', () => {
      const pastDNA: CertificateDNA = {
        ...validDNA,
        expirationDate: '2020-01-01T00:00:00Z',
      };
      expect(isExpired(pastDNA)).toBe(true);
    });
  });

  describe('isRevoked', () => {
    // Test: Certificate without revocation status
    // Input: CertificateDNA without credentialStatus field
    // Expected: Returns false (not revoked)
    it('should return false for certificate without status', () => {
      expect(isRevoked(validDNA)).toBe(false);
    });

    // Test: Certificate with revocation status
    // Input: CertificateDNA with credentialStatus containing revocation info
    // Expected: Returns true (revoked)
    it('should return true for revoked certificate', () => {
      const revokedDNA: CertificateDNA = {
        ...validDNA,
        credentialStatus: {
          id: 'https://example.com/revocations/1',
          type: 'RevocationList2023Status',
          revoked: true,
        },
      };
      expect(isRevoked(revokedDNA)).toBe(true);
    });
  });

  describe('getExpirationStatus', () => {
    // Test: Certificate without expiration date
    // Input: CertificateDNA without expirationDate
    // Expected: Returns object with isExpired=false, no expirationDate
    it('should return not expired when no expiration date', () => {
      const status = getExpirationStatus(validDNA);
      expect(status.isExpired).toBe(false);
      expect(status.expirationDate).toBeUndefined();
    });

    // Test: Certificate with future expiration
    // Input: CertificateDNA with expirationDate 30 days in future
    // Expected: Returns isExpired=false, daysUntilExpiration > 0
    it('should return correct expiration status', () => {
      const futureDNA: CertificateDNA = {
        ...validDNA,
        expirationDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      };
      const status = getExpirationStatus(futureDNA);
      expect(status.isExpired).toBe(false);
      expect(status.daysUntilExpiration).toBeGreaterThan(0);
    });

    // Test: Certificate with expiration 10 days from now
    // Input: CertificateDNA with expirationDate 10 days in future
    // Expected: Returns daysUntilExpiration approximately 10 (±1 day tolerance)
    it('should return positive days until expiration', () => {
      const futureDNA: CertificateDNA = {
        ...validDNA,
        expirationDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      };
      const status = getExpirationStatus(futureDNA);
      // Allow ±1 day tolerance for timing
      expect(status.daysUntilExpiration).toBeGreaterThanOrEqual(9);
      expect(status.daysUntilExpiration).toBeLessThanOrEqual(11);
    });
  });

  describe('formatCertificateDisplay', () => {
    // Test: Format valid certificate for display
    // Input: Valid CertificateDNA with all fields
    // Expected: Returns formatted object with title, recipient, course, issuer, date, status
    it('should format valid certificate correctly', () => {
      const display = formatCertificateDisplay(validDNA);

      expect(display.title).toBe('CKB Basics');
      expect(display.recipient).toBe('John Doe');
      expect(display.course).toBe('CKB Basics');
      expect(display.issuer).toBe('CKB Academy');
      expect(display.status).toBe('active');
    });

    // Test: Handle missing fields with defaults
    // Input: CertificateDNA with minimal fields (no name, no courseName)
    // Expected: Returns 'Unknown Recipient' and 'Unknown Course'
    it('should return Unknown for missing fields', () => {
      const minimalDNA: CertificateDNA = {
        ...validDNA,
        issuer: { id: 'ckt1q123' },
        credentialSubject: { type: 'CourseCertificate' },
      };
      const display = formatCertificateDisplay(minimalDNA);

      expect(display.recipient).toBe('Unknown Recipient');
      expect(display.course).toBe('Unknown Course');
    });

    // Test: Expired certificate status
    // Input: CertificateDNA with past expirationDate
    // Expected: Returns status='expired'
    it('should return expired status for expired certificate', () => {
      const expiredDNA: CertificateDNA = {
        ...validDNA,
        expirationDate: '2020-01-01T00:00:00Z',
      };
      const display = formatCertificateDisplay(expiredDNA);
      expect(display.status).toBe('expired');
    });

    // Test: Revoked certificate status
    // Input: CertificateDNA with credentialStatus.revoked = true
    // Expected: Returns status='revoked'
    it('should return revoked status for revoked certificate', () => {
      const revokedDNA: CertificateDNA = {
        ...validDNA,
        credentialStatus: {
          id: 'https://example.com/revocation/1',
          type: 'RevocationList2023Status',
          revoked: true,
          revocationReason: 'Issued in error',
        },
      };
      const display = formatCertificateDisplay(revokedDNA);
      expect(display.status).toBe('revoked');
    });
  });

  describe('isValidDNAFormat', () => {
    // Test: Valid DNA object passes validation
    // Input: Valid CertificateDNA object
    // Expected: Returns true
    it('should return true for valid DNA object', () => {
      expect(isValidDNAFormat(validDNA)).toBe(true);
    });

    // Test: null input fails validation
    // Input: null
    // Expected: Returns false
    it('should return false for null', () => {
      expect(isValidDNAFormat(null)).toBe(false);
    });

    // Test: undefined input fails validation
    // Input: undefined
    // Expected: Returns false
    it('should return false for undefined', () => {
      expect(isValidDNAFormat(undefined)).toBe(false);
    });

    // Test: Primitive values fail validation
    // Input: String or number
    // Expected: Returns false
    it('should return false for non-object', () => {
      expect(isValidDNAFormat('string')).toBe(false);
      expect(isValidDNAFormat(123)).toBe(false);
    });

    // Test: Missing required fields fail validation
    // Input: Empty object or partial objects
    // Expected: Returns false
    it('should return false for object missing required fields', () => {
      expect(isValidDNAFormat({})).toBe(false);
      expect(isValidDNAFormat({ '@context': [] })).toBe(false);
      expect(isValidDNAFormat({ id: '0x123', type: [] })).toBe(false);
    });

    // Test: VC without VerifiableCredential type fails
    // Input: DNA with wrong type array
    // Expected: Returns false
    it('should return false for VC without VerifiableCredential type', () => {
      const invalidDNA = {
        ...validDNA,
        type: ['SomeOtherType'],
      };
      expect(isValidDNAFormat(invalidDNA)).toBe(false);
    });
  });
});
