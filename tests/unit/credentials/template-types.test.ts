import { describe, it, expect } from 'vitest';
import type { CertificateLayout, CertificateTheme, VisualStyleConfig, CredentialSubject } from '@/types';
import { encodeCertificateDNA } from '@/lib/credentials/encoder';

describe('Certificate Template Types & Encoder Preservation', () => {
  it('should accept valid layout, theme, customColor, and customTitle values', () => {
    const validConfig: VisualStyleConfig = {
      layout: 'classic',
      theme: 'custom',
      customColor: '#F26F21',
      customTitle: 'CHỨNG CHỈ TỐT NGHIỆP',
    };
    expect(validConfig.layout).toBe('classic');
    expect(validConfig.theme).toBe('custom');
    expect(validConfig.customColor).toBe('#F26F21');
    expect(validConfig.customTitle).toBe('CHỨNG CHỈ TỐT NGHIỆP');
  });

  it('should preserve metadata in encodeCertificateDNA', () => {
    const dna = encodeCertificateDNA({
      id: 'cert_123',
      issuer: { id: 'cluster_123', name: 'CKB Academy' },
      subject: {
        type: 'CourseCertificate',
        name: 'Alice Bob',
        courseName: 'CKB Smart Contracts',
        metadata: {
          layout: 'detailed',
          theme: 'custom',
          customColor: '#8B5CF6',
          customTitle: 'BẰNG KHEN XUẤT SẮC',
        },
      },
    });

    expect(dna.credentialSubject.metadata?.layout).toBe('detailed');
    expect(dna.credentialSubject.metadata?.theme).toBe('custom');
    expect(dna.credentialSubject.metadata?.customColor).toBe('#8B5CF6');
    expect(dna.credentialSubject.metadata?.customTitle).toBe('BẰNG KHEN XUẤT SẮC');
  });
});

