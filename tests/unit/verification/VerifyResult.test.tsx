import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerifyResult } from '@/components/verification/VerifyResult';
import type { VerificationResult } from '@/types';

describe('VerifyResult Visual Certificate View', () => {
  const validResult: VerificationResult = {
    valid: true,
    certificateId: 'cert_1234567890',
    issuer: { id: 'ckt1issuer', name: 'Open University' },
    certificate: {
      isExpired: false,
      issuanceDate: '2026-03-01T00:00:00Z',
    },
    checks: {
      cellExists: true,
      dnaValid: true,
      issuerVerified: true,
      expirationVerified: true,
    },
  };

  it('renders View Visual Certificate action on authentic credential', () => {
    const handleViewDetails = vi.fn();
    render(<VerifyResult result={validResult} onViewDetails={handleViewDetails} />);

    const viewButton = screen.getByRole('button', { name: /View Visual Certificate/i });
    expect(viewButton).toBeInTheDocument();

    fireEvent.click(viewButton);
    expect(handleViewDetails).toHaveBeenCalled();
  });
});
