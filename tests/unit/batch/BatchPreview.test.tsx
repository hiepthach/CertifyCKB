import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BatchPreview } from '@/components/batch/BatchPreview';
import type { BatchEntry } from '@/types';

const mockEntries: BatchEntry[] = [
  {
    row: 1,
    recipientAddress: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqv',
    recipientName: 'Alice Developer',
    courseName: 'CKB Blockchain Masterclass',
    completionDate: '2026-03-01',
    valid: true,
  },
  {
    row: 2,
    recipientAddress: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqw',
    recipientName: 'Bob Builder',
    courseName: 'Spore DOB Protocol Deep Dive',
    completionDate: '2026-03-02',
    layout: 'modern',
    theme: 'purple',
    customTitle: 'DOB SPECIALIST',
    valid: true,
  },
  {
    row: 3,
    recipientAddress: 'invalid_address',
    recipientName: 'Charlie Error',
    courseName: 'Intro to Web3',
    completionDate: '2026-03-03',
    valid: false,
    errors: ['Invalid CKB address format'],
  },
];

describe('BatchPreview Component', () => {
  it('renders stats, table with Style column, and default style selector', () => {
    render(
      <BatchPreview
        entries={mockEntries}
        estimatedCost="302 CKB"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Stats
    expect(screen.getAllByText('Valid').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Invalid').length).toBeGreaterThanOrEqual(1);

    // Table headers including Style
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();

    // Row styles in table
    expect(screen.getAllByText('(Global)').length).toBe(2);
    expect(screen.getByText('modern')).toBeInTheDocument();

    // Style & Appearance section
    expect(screen.getByText(/Batch Certificate Style & Appearance/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Individual entries with custom layout or customTitle in CSV\/JSON will override this default style/i
      )
    ).toBeInTheDocument();

    // Layout options
    expect(screen.getByRole('button', { name: /Classic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Modern/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compact/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Detailed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Badge/i })).toBeInTheDocument();

    // Theme options
    expect(screen.getByRole('button', { name: /Blue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purple/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Green/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Red/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Custom/i })).toBeInTheDocument();
  });

  it('renders live certificate preview for the first valid entry', () => {
    render(
      <BatchPreview
        entries={mockEntries}
        estimatedCost="302 CKB"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/Live Certificate Preview/i)).toBeInTheDocument();
    // First valid entry is Alice Developer which appears in both table and live preview
    const aliceOccurrences = screen.getAllByText('Alice Developer');
    expect(aliceOccurrences.length).toBeGreaterThanOrEqual(2);

    const courseOccurrences = screen.getAllByText('CKB Blockchain Masterclass');
    expect(courseOccurrences.length).toBeGreaterThanOrEqual(2);
  });

  it('passes defaultStyle to onConfirm when clicking confirm button', () => {
    const handleConfirm = vi.fn();
    render(
      <BatchPreview
        entries={mockEntries}
        estimatedCost="302 CKB"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: 'classic',
        theme: 'blue',
      })
    );
  });

  it('updates defaultStyle when selecting layout, theme, and custom title, and passes them on confirm', () => {
    const handleConfirm = vi.fn();
    render(
      <BatchPreview
        entries={mockEntries}
        estimatedCost="302 CKB"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    // Select 'detailed' layout
    const detailedLayoutBtn = screen.getByRole('button', { name: /Detailed/i });
    fireEvent.click(detailedLayoutBtn);

    // Select 'gold' theme
    const goldThemeBtn = screen.getByRole('button', { name: /Gold/i });
    fireEvent.click(goldThemeBtn);

    // Enter custom title
    const customTitleInput = screen.getByPlaceholderText(/e\.g\. DIPLOMA, CERTIFICATE OF EXCELLENCE/i);
    fireEvent.change(customTitleInput, { target: { value: 'HONORARY FELLOW' } });

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: 'detailed',
        theme: 'gold',
        customTitle: 'HONORARY FELLOW',
      })
    );
  });

  it('shows custom color picker when theme is custom and updates customColor', () => {
    const handleConfirm = vi.fn();
    render(
      <BatchPreview
        entries={mockEntries}
        estimatedCost="302 CKB"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    // Select 'custom' theme
    const customThemeBtn = screen.getByRole('button', { name: /Custom/i });
    fireEvent.click(customThemeBtn);

    // Custom hex input should now appear
    const hexInput = screen.getByPlaceholderText('#1E40AF');
    expect(hexInput).toBeInTheDocument();

    fireEvent.change(hexInput, { target: { value: '#FF5733' } });

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'custom',
        customColor: '#FF5733',
      })
    );
  });

  it('calls onCancel when clicking cancel button', () => {
    const handleCancel = vi.fn();
    render(
      <BatchPreview
        entries={mockEntries}
        estimatedCost="302 CKB"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('disables confirm button when all entries are invalid', () => {
    const invalidEntries: BatchEntry[] = [
      {
        row: 1,
        recipientAddress: 'invalid_addr',
        courseName: 'Course 1',
        completionDate: '2026-03-01',
        valid: false,
        errors: ['Invalid address'],
      },
    ];

    render(
      <BatchPreview
        entries={invalidEntries}
        estimatedCost="0 CKB"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Issue 0 Certificates/i });
    expect(confirmButton).toBeDisabled();
  });
});
