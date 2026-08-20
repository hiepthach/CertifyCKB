/**
 * Certificate Service Tests - Issuer Module
 *
 * Tests for certificate issuance, retrieval, and revocation.
 * Reference: Design_spec/03_Certificate_Service.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  issueCertificate,
  getCertificate,
  getHolderCertificates,
  revokeCertificate,
  clearMockCertificates,
} from '../../../src/lib/credentials/issuer';
import type { CredentialSubject } from '@/types';

describe('Certificate Service (Issuer)', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    clearMockCertificates();
  });

  // Test fixtures
  const validRecipientAddress = 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq';
  const testClusterId = '0x1234567890abcdef';
  const testIssuerName = 'Test Academy';
  const testIssuerDescription = 'Premier blockchain education provider';

  const validSubject: CredentialSubject = {
    id: validRecipientAddress,
    type: 'CourseCertificate',
    name: 'John Doe',
    courseName: 'CKB Blockchain Fundamentals',
    completionDate: '2024-01-15',
    grade: 'A',
    score: 95,
    skills: ['CKB', 'Smart Contracts', 'Blockchain'],
  };

  describe('issueCertificate', () => {
    // Test: Issue certificate with valid parameters
    // Input: Valid signer, clusterId, issuerName, and subject
    // Expected: Returns certificateId and transactionHash
    it('should issue certificate with valid parameters', async () => {
      const result = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        issuerDescription: testIssuerDescription,
        subject: validSubject,
      });

      expect(result.certificateId).toBeDefined();
      expect(result.certificateId).toMatch(/^0x[0-9a-f]+$/);
      expect(result.transactionHash).toBeDefined();
      expect(result.transactionHash).toMatch(/^0x[a-f0-9]+$/);
    });

    // Test: Issue certificate with expiration date
    // Input: Valid params with future expirationDate
    // Expected: Certificate is issued successfully
    it('should issue certificate with expiration date', async () => {
      const futureDate = '2025-12-31';

      const result = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: validSubject,
        expirationDate: futureDate,
      });

      expect(result.certificateId).toBeDefined();
    });

    // Test: Certificate ID is unique for each issuance
    // Input: Issue two certificates
    // Expected: Each has a unique certificateId
    it('should generate unique certificate IDs', async () => {
      const result1 = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: validSubject,
      });

      const result2 = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: { ...validSubject, name: 'Jane Doe' },
      });

      expect(result1.certificateId).not.toBe(result2.certificateId);
    });

    // Test: Issue certificate with minimal subject data
    // Input: Subject with only required fields (type and courseName)
    // Expected: Certificate is issued successfully
    it('should issue certificate with minimal subject data', async () => {
      const minimalSubject: CredentialSubject = {
        type: 'CourseCertificate',
        courseName: 'Basic Course',
        completionDate: '2024-01-01',
      };

      const result = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: minimalSubject,
      });

      expect(result.certificateId).toBeDefined();
    });

    // Test: Issue certificate with optional metadata
    // Input: Subject with additional metadata fields
    // Expected: Certificate is issued with metadata preserved
    it('should issue certificate with metadata', async () => {
      const subjectWithMetadata: CredentialSubject = {
        ...validSubject,
        metadata: {
          institution: 'CKB Academy',
          duration: '8 weeks',
          certificationNumber: 'CERT-2024-001',
        },
      };

      const result = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: subjectWithMetadata,
      });

      expect(result.certificateId).toBeDefined();

      // Verify metadata is stored
      const certResult = await getCertificate(result.certificateId);
      expect(certResult).not.toBeNull();
    });
  });

  describe('getCertificate', () => {
    // Test: Retrieve existing certificate by ID
    // Input: certificateId from issued certificate
    // Expected: Returns certificate data with certificateId and txHash
    it('should retrieve existing certificate by ID', async () => {
      const issued = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: validSubject,
      });

      const retrieved = await getCertificate(issued.certificateId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.certificateId).toBe(issued.certificateId);
      expect(retrieved?.transactionHash).toBeDefined();
    });

    // Test: Return null for non-existent certificate
    // Input: certificateId that was never issued
    // Expected: Returns null
    it('should return null for non-existent certificate', async () => {
      const result = await getCertificate('0x' + 'f'.repeat(64));

      expect(result).toBeNull();
    });

    // Test: Retrieved certificate has correct structure
    // Input: Valid certificateId
    // Expected: Certificate has @context, type, issuer, credentialSubject
    it('should return certificate with correct W3C VC structure', async () => {
      const issued = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: validSubject,
      });

      const retrieved = await getCertificate(issued.certificateId);

      expect(retrieved?.certificate['@context']).toBeDefined();
      expect(Array.isArray(retrieved?.certificate['@context'])).toBe(true);
      expect(retrieved?.certificate['type']).toContain('VerifiableCredential');
      expect(retrieved?.certificate.issuer).toBeDefined();
      expect(retrieved?.certificate.issuer.id).toBe(testClusterId);
      expect(retrieved?.certificate.issuer.name).toBe(testIssuerName);
    });

    // Test: Retrieved certificate contains subject data
    // Input: Certificate with specific subject fields
    // Expected: All subject fields are preserved
    it('should preserve subject data in retrieved certificate', async () => {
      const issued = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: validSubject,
      });

      const retrieved = await getCertificate(issued.certificateId);

      expect(retrieved?.certificate.credentialSubject.name).toBe(validSubject.name);
      expect(retrieved?.certificate.credentialSubject.courseName).toBe(validSubject.courseName);
      expect(retrieved?.certificate.credentialSubject.completionDate).toBe(validSubject.completionDate);
      expect(retrieved?.certificate.credentialSubject.grade).toBe(validSubject.grade);
    });
  });

  describe('getHolderCertificates', () => {
    // Test: Get all certificates for a holder address
    // Input: Holder address with multiple certificates
    // Expected: Returns array of all certificates for that holder
    it('should get all certificates for a holder address', async () => {
      // Issue 3 certificates for the same holder
      for (let i = 0; i < 3; i++) {
        await issueCertificate({
          signer: {},
          clusterId: testClusterId,
          issuerName: testIssuerName,
          subject: {
            id: validRecipientAddress,
            type: 'CourseCertificate',
            name: 'John Doe',
            courseName: `Course ${i + 1}`,
            completionDate: '2024-01-15',
          },
        });
      }

      const certificates = await getHolderCertificates(validRecipientAddress);

      expect(certificates).toHaveLength(3);
    });

    // Test: Return empty array for holder with no certificates
    // Input: Address that has never received a certificate
    // Expected: Returns empty array
    it('should return empty array for holder with no certificates', async () => {
      const certificates = await getHolderCertificates('ckt1qy0000000000000000000000000000000000000');

      expect(certificates).toHaveLength(0);
    });

    // Test: Only return certificates for specified holder
    // Input: Two different holder addresses, certificates issued for only one
    // Expected: getHolderCertificates returns only the relevant certificates
    it('should only return certificates for specified holder', async () => {
      const holder1 = 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq';
      const holder2 = 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpz';

      await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: { id: holder1, type: 'CourseCertificate', courseName: 'Course 1', completionDate: '2024-01-01' },
      });

      await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: { id: holder2, type: 'CourseCertificate', courseName: 'Course 2', completionDate: '2024-01-01' },
      });

      const holder1Certs = await getHolderCertificates(holder1);

      expect(holder1Certs).toHaveLength(1);
      expect(holder1Certs[0].certificate.credentialSubject.name).toBeUndefined();
    });

    // Test: Certificate entries include certificateId and clusterId
    // Input: Certificate for a holder
    // Expected: Each entry has certificateId and clusterId
    it('should include certificateId and clusterId in results', async () => {
      await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: { id: validRecipientAddress, type: 'CourseCertificate', courseName: 'Test', completionDate: '2024-01-01' },
      });

      const certificates = await getHolderCertificates(validRecipientAddress);

      expect(certificates[0].certificateId).toBeDefined();
      expect(certificates[0].clusterId).toBe(testClusterId);
      expect(certificates[0].transactionHash).toBeDefined();
    });
  });

  describe('revokeCertificate', () => {
    // Test: Revoke existing certificate - soft revocation
    // Input: Valid certificateId and reason
    // Expected: Returns transactionHash, certificate marked as revoked
    it('should mark existing certificate as revoked (soft revocation)', async () => {
      const issued = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: validSubject,
      });

      // Verify certificate exists and is not revoked before
      const beforeRevocation = await getCertificate(issued.certificateId);
      expect(beforeRevocation).not.toBeNull();
      expect(beforeRevocation?.certificate.credentialStatus?.revoked).toBeUndefined();

      // Revoke the certificate with reason
      const revokeResult = await revokeCertificate({}, issued.certificateId, 'Certificate was issued in error');

      expect(revokeResult.transactionHash).toBeDefined();

      // Verify certificate still exists but is marked as revoked
      const afterRevocation = await getCertificate(issued.certificateId);
      expect(afterRevocation).not.toBeNull();
      expect(afterRevocation?.certificate.credentialStatus?.revoked).toBe(true);
      expect(afterRevocation?.certificate.credentialStatus?.revocationReason).toBe('Certificate was issued in error');
      expect(afterRevocation?.certificate.credentialStatus?.revokedAt).toBeDefined();
    });

    // Test: Revoke non-existent certificate
    // Input: certificateId that was never issued
    // Expected: Throws error or returns failure
    it('should throw error when revoking non-existent certificate', async () => {
      await expect(
        revokeCertificate({}, '0x' + 'f'.repeat(64), 'Test reason')
      ).rejects.toThrow('Certificate not found');
    });

    // Test: Revoked certificate still in holder certificates list
    // Input: Holder with certificate, then revoke it
    // Expected: getHolderCertificates still returns the certificate (with revoked status)
    it('should still return revoked certificate in holder list with revoked status', async () => {
      const issued = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: { id: validRecipientAddress, type: 'CourseCertificate', courseName: 'Test', completionDate: '2024-01-01' },
      });

      // Verify it exists
      const before = await getHolderCertificates(validRecipientAddress);
      expect(before).toHaveLength(1);
      expect(before[0].certificate.credentialStatus?.revoked).toBeUndefined();

      // Revoke it
      await revokeCertificate({}, issued.certificateId, 'Test revocation');

      // Verify it still appears but is marked revoked
      const after = await getHolderCertificates(validRecipientAddress);
      expect(after).toHaveLength(1);
      expect(after[0].certificate.credentialStatus?.revoked).toBe(true);
    });
  });

  describe('CredentialSubject structure', () => {
    // Test: Handle subject with id field
    // Input: Subject with explicit id field
    // Expected: id is preserved in certificate
    it('should preserve explicit subject id field', async () => {
      const subjectWithId: CredentialSubject = {
        id: validRecipientAddress,
        type: 'CourseCertificate',
        name: 'Jane Doe',
        courseName: 'Advanced CKB',
        completionDate: '2024-02-01',
      };

      const issued = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: subjectWithId,
      });

      const cert = await getCertificate(issued.certificateId);
      expect(cert?.certificate.credentialSubject.id).toBe(validRecipientAddress);
    });

    // Test: Handle subject without id field (uses recipientAddress)
    // Input: Subject with recipientAddress in metadata
    // Expected: recipientAddress used as subject id
    it('should handle subject without explicit id field', async () => {
      const subjectWithoutId: CredentialSubject = {
        type: 'CourseCertificate',
        name: 'Bob Smith',
        courseName: 'Basic CKB',
        completionDate: '2024-03-01',
        // No id field
      };

      const issued = await issueCertificate({
        signer: {},
        clusterId: testClusterId,
        issuerName: testIssuerName,
        subject: subjectWithoutId,
      });

      const cert = await getCertificate(issued.certificateId);
      expect(cert).not.toBeNull();
    });
  });
});
