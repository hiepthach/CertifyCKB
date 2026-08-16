/**
 * Batch Issuance Tests - CSV/JSON Parsing and Validation
 *
 * Tests for batch certificate issuance including file parsing,
 * entry validation, and fee estimation.
 * Reference: Design_spec/06_Batch_Issuance.md
 */

import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  parseJSON,
  validateBatchEntries,
  previewBatch,
} from '../../../src/lib/credentials/batch';
import type { BatchEntry } from '../../../src/types';

describe('Batch Issuance', () => {
  // Valid batch entry fixture for testing
  const validEntries: BatchEntry[] = [
    {
      row: 1,
      recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
      recipientName: 'John Doe',
      courseName: 'CKB Basics',
      completionDate: '2024-01-15',
      grade: 'A',
      score: 95,
      errors: [],
      valid: false,
    },
  ];

  describe('validateBatchEntries', () => {
    // Test: Validate all valid entries pass validation
    // Input: BatchEntry[] with valid address and required fields
    // Expected: All entries marked valid=true, errors=[]
    it('should validate all valid entries', () => {
      const result = validateBatchEntries(validEntries);

      expect(result.valid).toBe(true);
      expect(result.entries[0].valid).toBe(true);
      expect(result.entries[0].errors).toHaveLength(0);
    });

    // Test: Detect invalid CKB address format
    // Input: BatchEntry with address not starting with 'ckt'
    // Expected: Entry marked invalid with 'Invalid CKB address format' error
    it('should detect invalid address format', () => {
      const entriesWithBadAddress: BatchEntry[] = [
        {
          row: 1,
          recipientAddress: 'invalid_address',
          courseName: 'CKB Basics',
          completionDate: '2024-01-15',
          errors: [],
          valid: false,
        },
      ];

      const result = validateBatchEntries(entriesWithBadAddress);

      expect(result.valid).toBe(false);
      expect(result.entries[0].valid).toBe(false);
      expect(result.entries[0].errors).toContain('Invalid CKB address format');
    });

    // Test: Detect missing course name
    // Input: BatchEntry with empty courseName
    // Expected: Entry marked invalid with 'Course name is required' error
    it('should detect missing course name', () => {
      const entriesWithMissingCourse: BatchEntry[] = [
        {
          row: 1,
          recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
          courseName: '',
          completionDate: '2024-01-15',
          errors: [],
          valid: false,
        },
      ];

      const result = validateBatchEntries(entriesWithMissingCourse);

      expect(result.valid).toBe(false);
      expect(result.entries[0].errors).toContain('Course name is required');
    });

    // Test: Detect invalid date format
    // Input: BatchEntry with non-parseable date string
    // Expected: Entry marked invalid with 'Invalid date format' error
    it('should detect invalid date format', () => {
      const entriesWithBadDate: BatchEntry[] = [
        {
          row: 1,
          recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
          courseName: 'CKB Basics',
          completionDate: 'not-a-date',
          errors: [],
          valid: false,
        },
      ];

      const result = validateBatchEntries(entriesWithBadDate);

      expect(result.valid).toBe(false);
      expect(result.entries[0].errors).toContain('Invalid date format');
    });

    // Test: Track multiple errors per entry
    // Input: BatchEntry with invalid address, missing course, bad date
    // Expected: Entry has multiple errors, all tracked
    it('should validate multiple entries and track errors', () => {
      const mixedEntries: BatchEntry[] = [
        {
          row: 1,
          recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
          courseName: 'CKB Basics',
          completionDate: '2024-01-15',
          errors: [],
          valid: false,
        },
        {
          row: 2,
          recipientAddress: 'invalid',
          courseName: '',
          completionDate: 'bad-date',
          errors: [],
          valid: false,
        },
      ];

      const result = validateBatchEntries(mixedEntries);

      // First entry is valid
      expect(result.entries[0].valid).toBe(true);
      // Second entry has multiple errors
      expect(result.entries[1].valid).toBe(false);
      expect(result.entries[1].errors.length).toBeGreaterThan(1);
    });
  });

  describe('previewBatch', () => {
    // Two valid entries for fee calculation
    const twoValidEntries: BatchEntry[] = [
      {
        row: 1,
        recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
        recipientName: 'John Doe',
        courseName: 'CKB Basics',
        completionDate: '2024-01-15',
        errors: [],
        valid: true,
      },
      {
        row: 2,
        recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
        recipientName: 'Jane Smith',
        courseName: 'CKB Advanced',
        completionDate: '2024-01-16',
        errors: [],
        valid: true,
      },
    ];

    // Mixed entries: 2 valid + 1 invalid
    const mixedEntries: BatchEntry[] = [
      ...twoValidEntries,
      {
        row: 3,
        recipientAddress: 'invalid',
        courseName: '',
        completionDate: 'bad',
        errors: ['Invalid CKB address format', 'Course name is required'],
        valid: false,
      },
    ];

    // Test: Calculate fee estimate correctly
    // Input: 2 valid entries
    // Expected: Fee = 2 * 151 CKB = 302 CKB
    it('should calculate correct fee estimate', () => {
      const preview = previewBatch(twoValidEntries, 'cluster-123');

      // 2 entries * 151 CKB per certificate = 302 CKB
      expect(preview.estimatedFee).toBe('302 CKB');
    });

    // Test: Separate valid and invalid entries
    // Input: 3 entries (2 valid, 1 invalid)
    // Expected: validEntries=[2], invalidEntries=[1], totalEntries=3
    it('should separate valid and invalid entries', () => {
      const preview = previewBatch(mixedEntries, 'cluster-123');

      expect(preview.validEntries).toHaveLength(2);
      expect(preview.invalidEntries).toHaveLength(1);
      expect(preview.totalEntries).toBe(3);
    });

    // Test: Add warning for invalid entries
    // Input: Mixed entries with 1 invalid
    // Expected: Warning includes count of invalid entries
    it('should add warning for invalid entries', () => {
      const preview = previewBatch(mixedEntries, 'cluster-123');

      expect(preview.warnings).toContain('1 entries have validation errors and will be skipped');
    });

    // Test: Add warning for large batches
    // Input: 101 valid entries (>100 threshold)
    // Expected: Warning about processing time
    it('should add warning for large batches', () => {
      const largeEntries: BatchEntry[] = Array.from({ length: 101 }, (_, i) => ({
        row: i + 1,
        recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
        courseName: 'Course',
        completionDate: '2024-01-15',
        errors: [],
        valid: true,
      }));

      const preview = previewBatch(largeEntries, 'cluster-123');

      expect(preview.warnings).toContain('Large batch may take several minutes to process');
    });

    // Test: Handle empty entries
    // Input: Empty array
    // Expected: 0 CKB fee, empty arrays
    it('should handle empty entries', () => {
      const preview = previewBatch([], 'cluster-123');

      expect(preview.validEntries).toHaveLength(0);
      expect(preview.invalidEntries).toHaveLength(0);
      expect(preview.estimatedFee).toBe('0 CKB');
    });
  });

  describe('parseCSV', () => {
    // Test: Parse CSV content correctly
    // Input: CSV string with 2 certificate entries
    // Expected: Returns totalRows=2, entries with correct field values
    it('should parse CSV content correctly', () => {
      const csvContent = `recipientAddress,recipientName,courseName,completionDate,grade
ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq,John Doe,CKB Basics,2024-01-15,A
ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq,Jane Smith,CKB Advanced,2024-01-16,B+`;

      const result = parseCSV(csvContent);

      expect(result.totalRows).toBe(2);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].recipientName).toBe('John Doe');
      expect(result.entries[0].grade).toBe('A');
      expect(result.entries[1].courseName).toBe('CKB Advanced');
      expect(result.entries[1].grade).toBe('B+');
    });
  });

  describe('parseJSON', () => {
    // Test: Parse JSON content correctly
    // Input: JSON string with 1 certificate entry
    // Expected: Returns totalRows=1, entry with correct field values
    it('should parse JSON content correctly', () => {
      const jsonContent = JSON.stringify([
        {
          recipientAddress: 'ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq',
          recipientName: 'John Doe',
          courseName: 'CKB Basics',
          completionDate: '2024-01-15',
        },
      ]);

      const result = parseJSON(jsonContent);

      expect(result.totalRows).toBe(1);
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].recipientName).toBe('John Doe');
      expect(result.entries[0].courseName).toBe('CKB Basics');
    });

    // Test: Parse JSON array with multiple entries
    // Input: JSON array with 3 entries
    // Expected: Returns totalRows=3
    it('should parse multiple JSON entries', () => {
      const jsonContent = JSON.stringify([
        { recipientAddress: 'ckt1q1', recipientName: 'Alice', courseName: 'Course 1', completionDate: '2024-01-01' },
        { recipientAddress: 'ckt1q2', recipientName: 'Bob', courseName: 'Course 2', completionDate: '2024-01-02' },
        { recipientAddress: 'ckt1q3', recipientName: 'Charlie', courseName: 'Course 3', completionDate: '2024-01-03' },
      ]);

      const result = parseJSON(jsonContent);

      expect(result.totalRows).toBe(3);
      expect(result.entries[0].recipientName).toBe('Alice');
      expect(result.entries[2].recipientName).toBe('Charlie');
    });

    // Test: Handle JSON that is not an array
    // Input: JSON object instead of array
    // Expected: Throws error
    it('should throw error for non-array JSON', () => {
      const jsonContent = JSON.stringify({ name: 'test' });

      expect(() => parseJSON(jsonContent)).toThrow('JSON must be an array of entries');
    });
  });
});
