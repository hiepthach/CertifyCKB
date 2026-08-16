/**
 * Encoder Tests - W3C VC Certificate DNA Encoding
 *
 * Tests for encoding certificate data into W3C Verifiable Credential format.
 * Reference: https://www.w3.org/TR/vc-data-model/
 */

import { describe, it, expect } from 'vitest';
import {
  encodeCertificateDNA,
  generateCertificateId,
  serializeDNA,
  getDNASize,
} from '../../../src/lib/credentials/encoder';
import type { CertificateDNA } from '../../../src/types';

describe('Encoder', () => {
  describe('encodeCertificateDNA', () => {
    // Test: Encode valid certificate data with all fields
    // Input: Complete CertificateData with all required and optional fields
    // Expected: Valid CertificateDNA with proper W3C VC structure
    it('should encode valid certificate data', () => {
      const result = encodeCertificateDNA({
        id: '0x1234567890abcdef',
        issuer: {
          id: 'ckt1qcluster123',
          name: 'CKB Academy',
        },
        subject: {
          type: 'CourseCertificate',
          name: 'John Doe',
          courseName: 'CKB Basics',
          completionDate: '2024-01-15',
        },
        issuanceDate: '2024-01-15T10:00:00Z',
      });

      // Verify @context contains required W3C URIs
      expect(result['@context']).toContain('https://www.w3.org/2018/credentials/v1');
      expect(result['@context']).toContain('https://schema.org');

      // Verify type includes VerifiableCredential and custom type
      expect(result.type).toContain('VerifiableCredential');
      expect(result.type).toContain('CourseCertificate');

      // Verify issuer fields
      expect(result.issuer.id).toBe('ckt1qcluster123');
      expect(result.issuer.name).toBe('CKB Academy');

      // Verify subject fields
      expect(result.credentialSubject.name).toBe('John Doe');
      expect(result.credentialSubject.courseName).toBe('CKB Basics');
    });

    // Test: Encode with only required fields (minimal data)
    // Input: Only id, issuer.id, and subject.type
    // Expected: Valid DNA with minimal required fields populated
    it('should encode minimal data with required fields only', () => {
      const result = encodeCertificateDNA({
        id: '0xabcdef1234567890',
        issuer: {
          id: 'ckt1qprovider',
        },
        subject: {
          type: 'CourseCertificate',
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('0xabcdef1234567890');
      expect(result.issuer.id).toBe('ckt1qprovider');
      expect(result.credentialSubject.type).toBe('CourseCertificate');
    });

    // Test: Include expiration date when provided
    // Input: CertificateDNA params with expirationDate
    // Expected: Result includes expirationDate field
    it('should include expiration date when provided', () => {
      const result = encodeCertificateDNA({
        id: '0x123',
        issuer: { id: 'ckt1qissuer' },
        subject: { type: 'CourseCertificate' },
        expirationDate: '2025-01-15T10:00:00Z',
      });

      expect(result.expirationDate).toBe('2025-01-15T10:00:00Z');
    });

    // Test: Omit expiration date when not provided
    // Input: CertificateDNA params without expirationDate
    // Expected: Result does not have expirationDate field
    it('should not include expiration date when not provided', () => {
      const result = encodeCertificateDNA({
        id: '0x123',
        issuer: { id: 'ckt1qissuer' },
        subject: { type: 'CourseCertificate' },
      });

      expect(result.expirationDate).toBeUndefined();
    });
  });

  describe('generateCertificateId', () => {
    // Test: Generate unique IDs for each call
    // Input: None (no parameters)
    // Expected: Two generated IDs are different
    it('should generate a unique ID', () => {
      const id1 = generateCertificateId();
      const id2 = generateCertificateId();

      // Verify format: 0x prefix + 32 hex characters
      expect(id1).toMatch(/^0x[a-f0-9]{32}$/);
      expect(id2).toMatch(/^0x[a-f0-9]{32}$/);

      // Verify uniqueness
      expect(id1).not.toBe(id2);
    });

    // Test: ID starts with 0x prefix
    // Input: None
    // Expected: Generated ID starts with '0x'
    it('should start with 0x prefix', () => {
      const id = generateCertificateId();
      expect(id.startsWith('0x')).toBe(true);
    });

    // Test: ID has correct length
    // Input: None
    // Expected: ID length is 34 characters (0x + 32 hex chars)
    it('should have correct length', () => {
      const id = generateCertificateId();
      // 0x prefix (2) + 32 hex characters = 34 total
      expect(id.length).toBe(34);
    });
  });

  describe('serializeDNA', () => {
    // Test: Serialize DNA to valid JSON string
    // Input: Valid CertificateDNA object
    // Expected: Returns JSON string that can be parsed
    it('should serialize DNA to JSON string', () => {
      const dna = encodeCertificateDNA({
        id: '0x1234567890abcdef',
        issuer: { id: 'ckt1qissuer', name: 'Test Issuer' },
        subject: { type: 'CourseCertificate', name: 'Test' },
      });

      const serialized = serializeDNA(dna);

      // Verify it's a string
      expect(typeof serialized).toBe('string');

      // Verify it can be parsed as valid JSON
      expect(() => JSON.parse(serialized)).not.toThrow();
    });
  });

  describe('getDNASize', () => {
    // Test: Calculate correct byte size of DNA
    // Input: CertificateDNA object
    // Expected: Returns byte length matching TextEncoder output
    it('should return correct size in bytes', () => {
      const dna = encodeCertificateDNA({
        id: '0x1234567890abcdef',
        issuer: { id: 'ckt1qissuer' },
        subject: { type: 'CourseCertificate' },
      });

      const size = getDNASize(dna);
      const serialized = serializeDNA(dna);
      const expectedSize = new TextEncoder().encode(serialized).length;

      expect(size).toBe(expectedSize);
    });
  });
});
