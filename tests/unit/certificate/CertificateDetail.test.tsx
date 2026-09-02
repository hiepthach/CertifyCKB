import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CertificateDetail } from '@/components/certificate/CertificateDetail';
import type { CertificateDNA } from '@/types';

describe('CertificateDetail Component View Toggle', () => {
  const mockCert: CertificateDNA = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: '0xabcdef1234567890',
    type: ['VerifiableCredential', 'CourseCertificate'],
    issuer: { id: 'ckt1cluster', name: 'CKB Academy' },
    issuanceDate: '2026-02-01T00:00:00Z',
    credentialSubject: {
      type: 'CourseCertificate',
      name: 'Grace Hopper',
      courseName: 'Compiler Construction on CKB-VM',
      completionDate: '2026-02-01',
      metadata: {
        layout: 'classic',
        theme: 'gold',
      },
    },
  };

  it('defaults to Visual Certificate view and displays student name', () => {
    render(
      <CertificateDetail
        certificate={mockCert}
        certificateId="cert_gh_123"
      />
    );

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print \/ Save PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /On-Chain Proof/i })).toBeInTheDocument();
  });

  it('switches to On-Chain Proof view when clicking technical tab', () => {
    render(
      <CertificateDetail
        certificate={mockCert}
        certificateId="cert_gh_123"
      />
    );

    const techTab = screen.getByRole('button', { name: /On-Chain Proof/i });
    fireEvent.click(techTab);

    expect(screen.getByText(/On-Chain Cryptographic Proof/i)).toBeInTheDocument();
    expect(screen.getByText(/Certificate ID/i)).toBeInTheDocument();
  });

  it('triggers window.print when clicking Print / Save PDF button', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <CertificateDetail
        certificate={mockCert}
        certificateId="cert_gh_123"
      />
    );

    const printButton = screen.getByRole('button', { name: /Print \/ Save PDF/i });
    fireEvent.click(printButton);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('renders certificate with issuer visual metadata in visual view', () => {
    render(
      <CertificateDetail
        certificate={mockCert}
        certificateId="cert_gh_123"
      />
    );

    // Initial classic layout and gold theme from mockCert metadata are rendered
    expect(screen.getByText(/CERTIFICATE OF COMPLETION/i)).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Compiler Construction on CKB-VM')).toBeInTheDocument();
  });

  it('opens melt modal when Melt & Reclaim CKB is clicked', () => {
    const mockMelt = vi.fn();
    render(
      <CertificateDetail
        certificate={mockCert}
        certificateId="cert_gh_123"
        onMelt={mockMelt}
      />
    );

    const meltBtn = screen.getByRole('button', { name: /Melt & Reclaim CKB/i });
    fireEvent.click(meltBtn);

    expect(screen.getByText(/permanently destroy/i)).toBeInTheDocument();
  });
});
