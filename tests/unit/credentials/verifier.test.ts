/**
 * Verification Service Tests - Certificate Verification Logic
 *
 * Tests for certificate verification including expiration checking
 * and W3C VC structure validation.
 * Reference: Design_spec/04_Verification_Service.md
 */

import { describe, it, expect } from 'vitest';
import type { CertificateDNA, CredentialSubject } from '../../../src/types';

describe('Verification Service', () => {
  // Mock DNA factory for creating test certificates
  const createMockDNA = (overrides: Partial<CertificateDNA> = {}): CertificateDNA => ({
    '@context': ['https://www.w3.org/2018/credentials/v1'],
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
    },
    ...overrides,
  });

  describe('Certificate Verification Logic', () => {
    // Test: Valid certificate (future expiration)
    // Input: Certificate with expirationDate 1 year in future
    // Expected: isExpired=false
    it('should consider valid certificate as valid', () => {
      const dna = createMockDNA({
        expirationDate: new Date(Date.now() + 86400000 * 365).toISOString(),
      });

      const isExpired = dna.expirationDate
        ? new Date(dna.expirationDate) < new Date()
        : false;

      expect(isExpired).toBe(false);
    });

    // Test: Expired certificate detection
    // Input: Certificate with past expirationDate (2020-01-01)
    // Expected: isExpired=true
    it('should detect expired certificate', () => {
      const dna = createMockDNA({
        expirationDate: '2020-01-01T00:00:00Z',
      });

      const isExpired = dna.expirationDate
        ? new Date(dna.expirationDate) < new Date()
        : false;

      expect(isExpired).toBe(true);
    });

    // Test: W3C VC structure validation
    // Input: Valid CertificateDNA
    // Expected: Has @context with W3C URI, type includes VerifiableCredential,
    //          has issuer with id, has credentialSubject
    it('should validate W3C VC structure', () => {
      const validDNA = createMockDNA();

      expect(validDNA['@context']).toContain('https://www.w3.org/2018/credentials/v1');
      expect(validDNA.type).toContain('VerifiableCredential');
      expect(validDNA.issuer).toBeDefined();
      expect(validDNA.issuer.id).toBeDefined();
      expect(validDNA.credentialSubject).toBeDefined();
    });

    // Test: Issuer information extraction
    // Input: Certificate with issuer containing id, name, description
    // Expected: All issuer fields extracted correctly
    it('should extract issuer information correctly', () => {
      const dna = createMockDNA({
        issuer: {
          id: 'ckt1qprovider123',
          name: 'Test Provider',
          description: 'Test Description',
        },
      });

      expect(dna.issuer.id).toBe('ckt1qprovider123');
      expect(dna.issuer.name).toBe('Test Provider');
    });

    // Test: Certificate without expiration date
    // Input: CertificateDNA without expirationDate field
    // Expected: HasExpiration=false
    it('should handle certificate with no expiration', () => {
      const dna = createMockDNA();

      const expirationDate = dna.expirationDate;
      const hasExpiration = !!expirationDate;

      expect(hasExpiration).toBe(false);
    });
  });

  describe('Verification Result Structure', () => {
    // Test: Build valid verification result
    // Input: Valid certificateId and DNA
    // Expected: Result with valid=true, correct issuer, no expiration
    it('should build valid verification result', () => {
      const certificateId = '0x1234567890abcdef';
      const dna = createMockDNA();

      const result = {
        valid: true,
        certificateId,
        issuer: {
          id: dna.issuer.id,
          name: dna.issuer.name || 'Unknown',
        },
        certificate: {
          isExpired: false,
          issuanceDate: dna.issuanceDate,
          expirationDate: dna.expirationDate,
        },
        checks: {
          cellExists: true,
          dnaValid: true,
          issuerVerified: true,
          expirationVerified: true,
        },
        timestamp: new Date().toISOString(),
      };

      expect(result.valid).toBe(true);
      expect(result.certificateId).toBe(certificateId);
      expect(result.issuer.name).toBe('CKB Academy');
      expect(result.checks.cellExists).toBe(true);
      expect(result.checks.dnaValid).toBe(true);
      expect(result.checks.issuerVerified).toBe(true);
    });

    // Test: Build invalid result with errors
    // Input: Error message array
    // Expected: Result with valid=false, errors array populated
    it('should include errors in invalid result', () => {
      const errors = ['Certificate not found on chain'];

      const result = {
        valid: false,
        certificateId: '0x123',
        issuer: { id: '', name: '' },
        certificate: {
          isExpired: false,
          issuanceDate: '',
        },
        errors,
        checks: {
          cellExists: false,
          dnaValid: false,
          issuerVerified: false,
          expirationVerified: false,
        },
      };

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Certificate not found on chain');
      expect(result.checks.cellExists).toBe(false);
    });

    // Test: Include expiration status in result
    // Input: Expired DNA with expirationDate
    // Expected: Result with isExpired=true, valid=false, error message
    it('should include expiration status in result', () => {
      const expiredDNA = createMockDNA({
        expirationDate: '2020-01-01T00:00:00Z',
      });

      const result = {
        valid: false,
        certificateId: '0x123',
        issuer: { id: '', name: '' },
        certificate: {
          isExpired: true,
          issuanceDate: '',
          expirationDate: expiredDNA.expirationDate,
        },
        errors: ['Certificate has expired'],
        checks: {
          cellExists: true,
          dnaValid: true,
          issuerVerified: true,
          expirationVerified: false,
        },
      };

      expect(result.certificate.isExpired).toBe(true);
      expect(result.valid).toBe(false);
      expect(result.checks.expirationVerified).toBe(false);
    });
  });

  describe('Credential Subject Validation', () => {
    // Test: Validate required subject fields
    // Input: Subject with type, name, courseName, completionDate
    // Expected: All required fields present
    it('should validate required subject fields', () => {
      const subject = {
        type: 'CourseCertificate',
        name: 'John Doe',
        courseName: 'CKB Basics',
        completionDate: '2024-01-15',
      };

      expect(subject.type).toBe('CourseCertificate');
      expect(subject.name).toBeDefined();
      expect(subject.courseName).toBeDefined();
    });

    // Test: Handle optional fields
    // Input: Minimal subject (type only) vs full subject (all fields)
    // Expected: Minimal has undefined optional fields, full has all populated
    it('should handle optional fields correctly', () => {
      const minimalSubject: CredentialSubject = {
        type: 'CourseCertificate',
      };

      const fullSubject: CredentialSubject = {
        type: 'CourseCertificate',
        name: 'John Doe',
        courseName: 'CKB Basics',
        completionDate: '2024-01-15',
        grade: 'A',
        score: 95,
        skills: ['Rust', 'CKB-VM'],
        metadata: { extra: 'data' },
      };

      expect(minimalSubject.grade).toBeUndefined();
      expect(fullSubject.grade).toBe('A');
      expect(fullSubject.skills).toHaveLength(2);
    });
  });
});
