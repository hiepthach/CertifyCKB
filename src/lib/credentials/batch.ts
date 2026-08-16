import Papa from 'papaparse';
import type {
  BatchEntry,
  ParseBatchResult,
  BatchIssueParams,
  BatchIssueResult,
  BatchCertificateResult,
  BatchError,
  BatchPreview,
  ValidationResult,
} from '@/types';
import { issueCertificate } from './issuer';
import { ccc } from '@ckb-ccc/core';

/**
 * Parse a batch file (CSV or JSON)
 */
export async function parseBatchFile(file: File): Promise<ParseBatchResult> {
  const content = await file.text();
  const extension = file.name.split('.').pop()?.toLowerCase();

  let entries: Partial<BatchEntry>[] = [];

  if (extension === 'csv') {
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (result.errors.length > 0) {
      throw new Error(`CSV parsing error: ${result.errors[0].message}`);
    }

    entries = result.data as Partial<BatchEntry>[];
  } else if (extension === 'json') {
    try {
      const data = JSON.parse(content);
      entries = Array.isArray(data) ? data : [data];
    } catch {
      throw new Error('Invalid JSON format');
    }
  } else {
    throw new Error('Unsupported file format. Use CSV or JSON.');
  }

  // Process entries
  const processedEntries: BatchEntry[] = entries.map((entry, index) => ({
    row: index + 1,
    recipientAddress: entry.recipientAddress || '',
    recipientName: entry.recipientName,
    courseName: entry.courseName || '',
    completionDate: entry.completionDate || '',
    grade: entry.grade,
    score: entry.score,
    skills: entry.skills,
    metadata: entry.metadata,
    errors: [],
    valid: false,
  }));

  // Validate entries
  const validation = validateBatchEntries(processedEntries);

  return {
    entries: validation.entries,
    totalRows: processedEntries.length,
    validCount: validation.entries.filter((e) => e.valid).length,
    invalidCount: validation.entries.filter((e) => !e.valid).length,
  };
}

/**
 * Validate batch entries
 */
export function validateBatchEntries(
  entries: BatchEntry[]
): ValidationResult {
  const errors: BatchError[] = [];

  for (const entry of entries) {
    const entryErrors: string[] = [];

    // Validate address format (basic CKB address check)
    if (!entry.recipientAddress || !entry.recipientAddress.startsWith('ckt')) {
      entryErrors.push('Invalid CKB address format');
    }

    // Validate course name
    if (!entry.courseName || entry.courseName.trim().length === 0) {
      entryErrors.push('Course name is required');
    }

    // Validate completion date
    if (entry.completionDate) {
      const date = new Date(entry.completionDate);
      if (isNaN(date.getTime())) {
        entryErrors.push('Invalid date format');
      }
    }

    entry.errors = entryErrors;
    entry.valid = entryErrors.length === 0;
  }

  return {
    valid: entries.every((e) => e.valid),
    entries,
    errors,
  };
}

/**
 * Preview batch before issuing
 */
export function previewBatch(entries: BatchEntry[], clusterId: string): BatchPreview {
  const validEntries = entries.filter((e) => e.valid);
  const invalidEntries = entries.filter((e) => !e.valid);

  // Estimate fee: ~151 CKB per certificate (150 capacity + 1 fee buffer)
  const estimatedCKB = validEntries.length * 151;
  const estimatedFee = `${estimatedCKB.toLocaleString()} CKB`;

  const warnings: string[] = [];

  if (invalidEntries.length > 0) {
    warnings.push(`${invalidEntries.length} entries have validation errors and will be skipped`);
  }

  if (validEntries.length > 100) {
    warnings.push('Large batch may take several minutes to process');
  }

  return {
    totalEntries: entries.length,
    validEntries,
    invalidEntries,
    estimatedFee,
    warnings,
  };
}

/**
 * Issue certificates in batch
 */
export async function issueBatchCertificates(
  signer: ccc.Signer,
  params: BatchIssueParams,
  onProgress?: (progress: {
    current: number;
    total: number;
    currentAddress: string;
    status: 'encoding' | 'building' | 'signing' | 'sending';
  }) => void
): Promise<BatchIssueResult> {
  const { clusterId, issuerName, issuerDescription, entries, expirationDate } = params;

  const validEntries = entries.filter((e) => e.valid);
  const results: BatchCertificateResult[] = [];
  const errors: BatchError[] = [];

  for (let i = 0; i < validEntries.length; i++) {
    const entry = validEntries[i];

    onProgress?.({
      current: i + 1,
      total: validEntries.length,
      currentAddress: entry.recipientAddress,
      status: 'encoding',
    });

    try {
      const result = await issueCertificate({
        signer,
        clusterId,
        issuerName,
        issuerDescription,
        subject: {
          id: entry.recipientAddress,
          type: 'CourseCertificate',
          name: entry.recipientName,
          courseName: entry.courseName,
          completionDate: entry.completionDate,
          grade: entry.grade,
          score: entry.score,
          skills: entry.skills,
          metadata: entry.metadata,
        },
        expirationDate,
      });

      results.push({
        row: entry.row,
        recipientAddress: entry.recipientAddress,
        certificateId: result.certificateId,
        transactionHash: result.transactionHash,
        success: true,
      });
    } catch (error) {
      results.push({
        row: entry.row,
        recipientAddress: entry.recipientAddress,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      errors.push({
        code: 'ISSUANCE_FAILED',
        message: `Row ${entry.row}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        row: entry.row,
      });
    }

    onProgress?.({
      current: i + 1,
      total: validEntries.length,
      currentAddress: entry.recipientAddress,
      status: 'sending',
    });
  }

  return {
    total: validEntries.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    certificates: results,
    errors,
  };
}
