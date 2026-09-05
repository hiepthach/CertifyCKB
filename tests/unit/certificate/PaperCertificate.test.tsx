import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaperCertificate, resolveThemeColors, PRESET_THEMES } from '@/components/certificate/PaperCertificate';
import type { CertificateDNA } from '@/types';

describe('PaperCertificate Component', () => {
  const mockCertificate: CertificateDNA = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: '0x1234567890abcdef',
    type: ['VerifiableCredential', 'CourseCertificate'],
    issuer: {
      id: 'ckt1qcluster',
      name: 'Nervos Academy',
    },
    issuanceDate: '2026-01-15T00:00:00Z',
    credentialSubject: {
      type: 'CourseCertificate',
      name: 'Ada Lovelace',
      courseName: 'CKB Script Architecture',
      completionDate: '2026-01-15',
      grade: 'A+',
      score: 98,
      skills: ['Rust', 'RISC-V'],
    },
  };

  it('renders student name, course title, and default title in classic layout', () => {
    render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="cert_12345"
        layout="classic"
        theme="gold"
      />
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('CKB Script Architecture')).toBeInTheDocument();
    expect(screen.getByText('Nervos Academy')).toBeInTheDocument();
    expect(screen.getByText(/CERTIFICATE OF COMPLETION/i)).toBeInTheDocument();
  });

  it('renders customTitle and customColor when provided', () => {
    const { container } = render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="cert_12345"
        layout="modern"
        theme="custom"
        customColor="#F26F21"
        customTitle="BẰNG KHEN DANH DỰ"
      />
    );

    expect(screen.getByText('BẰNG KHEN DANH DỰ')).toBeInTheDocument();
    expect(container.innerHTML).toContain('#F26F21');
  });

  it('renders badge layout correctly', () => {
    render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="cert_12345"
        layout="badge"
        theme="green"
      />
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(/CERTIFIED/i)).toBeInTheDocument();
  });

  it('renders compact layout correctly', () => {
    render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="cert_12345"
        layout="compact"
        theme="blue"
      />
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('CKB Script Architecture')).toBeInTheDocument();
  });

  it('renders detailed layout correctly with 3-column breakdown and skills', () => {
    render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="cert_12345"
        layout="detailed"
        theme="purple"
      />
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('CKB Script Architecture')).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
    expect(screen.getByText('RISC-V')).toBeInTheDocument();
  });

  it('does not render skills section when skills are not provided or empty', () => {
    const certWithoutSkills: CertificateDNA = {
      ...mockCertificate,
      credentialSubject: {
        ...mockCertificate.credentialSubject,
        skills: undefined,
      },
    };

    render(
      <PaperCertificate
        certificate={certWithoutSkills}
        certificateId="cert_no_skills"
        layout="classic"
      />
    );

    expect(screen.queryByText('Rust')).not.toBeInTheDocument();
    expect(screen.queryByText('RISC-V')).not.toBeInTheDocument();
  });

  it('includes the print-certificate-target class on the container', () => {
    const { container } = render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="cert_12345"
      />
    );

    const target = container.querySelector('.print-certificate-target');
    expect(target).not.toBeNull();
  });

  it('renders official verification seal with truncated certificateId and CKB DOB Verified', () => {
    render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="0x1234567890abcdef1234567890abcdef"
        layout="classic"
      />
    );

    expect(screen.getByText(/CKB DOB Verified/i)).toBeInTheDocument();
  });

  it('displays expired indicator when isExpired is true', () => {
    render(
      <PaperCertificate
        certificate={mockCertificate}
        certificateId="cert_12345"
        isExpired={true}
      />
    );

    expect(screen.getByText(/EXPIRED/i)).toBeInTheDocument();
  });

  it('falls back to certificate subject metadata when props are not passed', () => {
    const certWithMeta: CertificateDNA = {
      ...mockCertificate,
      credentialSubject: {
        ...mockCertificate.credentialSubject,
        metadata: {
          layout: 'badge',
          theme: 'red',
          customTitle: 'CHỨNG NHẬN ĐẶC BIỆT',
        },
      },
    };

    render(
      <PaperCertificate
        certificate={certWithMeta}
        certificateId="cert_meta_1"
      />
    );

    expect(screen.getByText('CHỨNG NHẬN ĐẶC BIỆT')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  describe('resolveThemeColors helper', () => {
    it('returns preset colors for predefined themes', () => {
      expect(resolveThemeColors('blue')).toEqual(PRESET_THEMES.blue);
      expect(resolveThemeColors('purple')).toEqual(PRESET_THEMES.purple);
      expect(resolveThemeColors('green')).toEqual(PRESET_THEMES.green);
      expect(resolveThemeColors('gold')).toEqual(PRESET_THEMES.gold);
      expect(resolveThemeColors('red')).toEqual(PRESET_THEMES.red);
    });

    it('calculates custom theme colors for 6-digit and 3-digit hex values', () => {
      const colors6 = resolveThemeColors('custom', '#F26F21');
      expect(colors6.primary).toBe('#F26F21');
      expect(colors6.bg).toContain('rgba(242, 111, 33, 0.08)');

      const colors3 = resolveThemeColors('custom', '#F00');
      expect(colors3.primary).toBe('#F00');
      expect(colors3.bg).toContain('rgba(255, 0, 0, 0.08)');
    });

    it('falls back to blue theme for invalid custom hex or unknown theme', () => {
      const invalidCustom = resolveThemeColors('custom', 'invalid-hex');
      expect(invalidCustom).toEqual(PRESET_THEMES.blue);

      const undefinedTheme = resolveThemeColors(undefined);
      expect(undefinedTheme).toEqual(PRESET_THEMES.blue);
    });
  });
});
