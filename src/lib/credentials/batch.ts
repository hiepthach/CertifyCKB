/**
 * Batch Issuance - CSV/JSON Parsing and Validation
 *
 * Handles batch certificate issuance including file parsing,
 * entry validation, and fee estimation.
 */

import Papa from 'papaparse';
import type { BatchEntry, BatchValidationResult, BatchPreview } from '@/types';

const CKB_PER_CERTIFICATE = 151;
const LARGE_BATCH_THRESHOLD = 100;

/**
 * Parse batch file (CSV or JSON)
 */
export async function parseBatchFile(file: File): Promise<{
  totalRows: number;
  entries: BatchEntry[];
}> {
  const content = await file.text();
  const filename = file.name.toLowerCase();

  if (filename.endsWith('.csv')) {
    return parseCSV(content);
  } else if (filename.endsWith('.json')) {
    return parseJSON(content);
  } else {
    throw new Error('Unsupported file format');
  }
}

/**
 * Parse CSV content (exported for testing)
 */
export function parseCSV(content: string): {
  totalRows: number;
  entries: BatchEntry[];
} {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });

  const entries: BatchEntry[] = result.data.map((row: Record<string, string>, index: number) => ({
    row: index + 1,
    recipientAddress: row.recipientAddress || '',
    recipientName: row.recipientName || '',
    courseName: row.courseName || '',
    completionDate: row.completionDate || '',
    grade: row.grade || undefined,
    score: row.score ? parseInt(row.score, 10) : undefined,
    errors: [],
    valid: false,
  }));

  return {
    totalRows: entries.length,
    entries,
  };
}

/**
 * Parse JSON content (exported for testing)
 */
export function parseJSON(content: string): {
  totalRows: number;
  entries: BatchEntry[];
} {
  const data = JSON.parse(content);

  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of entries');
  }

  const entries: BatchEntry[] = data.map((item: Record<string, unknown>, index: number) => ({
    row: index + 1,
    recipientAddress: (item.recipientAddress as string) || '',
    recipientName: (item.recipientName as string) || '',
    courseName: (item.courseName as string) || '',
    completionDate: (item.completionDate as string) || '',
    grade: item.grade as string | undefined,
    score: item.score as number | undefined,
    errors: [],
    valid: false,
  }));

  return {
    totalRows: entries.length,
    entries,
  };
}

/**
 * Validate batch entries
 */
export function validateBatchEntries(entries: BatchEntry[]): BatchValidationResult {
  const validated = entries.map((entry) => validateEntry(entry));
  const allValid = validated.every((e) => e.valid);

  return {
    valid: allValid,
    entries: validated,
  };
}

/**
 * Validate single entry (exported for testing)
 */
export function validateEntry(entry: BatchEntry): BatchEntry {
  const errors: string[] = [];

  // Validate address
  if (!entry.recipientAddress || !entry.recipientAddress.startsWith('ckt')) {
    errors.push('Invalid CKB address format');
  }

  // Validate course name
  if (!entry.courseName || entry.courseName.trim() === '') {
    errors.push('Course name is required');
  }

  // Validate date
  if (entry.completionDate) {
    const date = new Date(entry.completionDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  return {
    ...entry,
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Preview batch issuance
 */
export function previewBatch(
  entries: BatchEntry[],
  clusterId: string
): BatchPreview {
  const validEntries = entries.filter((e) => e.valid);
  const invalidEntries = entries.filter((e) => !e.valid);
  const warnings: string[] = [];

  // Add warnings
  if (invalidEntries.length > 0) {
    warnings.push(`${invalidEntries.length} entries have validation errors and will be skipped`);
  }

  if (entries.length > LARGE_BATCH_THRESHOLD) {
    warnings.push('Large batch may take several minutes to process');
  }

  return {
    clusterId,
    totalEntries: entries.length,
    validEntries,
    invalidEntries,
    estimatedFee: `${validEntries.length * CKB_PER_CERTIFICATE} CKB`,
    warnings,
  };
}
