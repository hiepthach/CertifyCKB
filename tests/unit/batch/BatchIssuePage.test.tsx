import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BatchIssuePage from '@/app/certificates/issue/batch/page';
import * as credentialsLib from '@/lib/credentials';
import * as walletHook from '@/hooks/useWallet';
import type { Cluster, BatchEntry, BatchIssueResult } from '@/types';

const mockPush = vi.fn();
const mockBack = vi.fn();
let mockClusterParam: string | null = 'cluster_123';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'cluster' ? mockClusterParam : null),
  }),
}));

vi.mock('@/hooks/useWallet');
vi.mock('@/lib/credentials', async (importOriginal) => {
  const actual = await importOriginal<typeof credentialsLib>();
  return {
    ...actual,
    getCluster: vi.fn(),
    parseBatchFile: vi.fn(),
    issueBatchCertificates: vi.fn(),
  };
});

const mockCluster: Cluster = {
  id: '0x1234567890abcdef1234567890abcdef12345678',
  clusterId: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Acme Certification Academy',
  description: 'Official Certification Provider',
  creatorAddress: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqv',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockSigner = {
  address: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqv',
};

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
    valid: true,
  },
];

const mockIssueResult: BatchIssueResult = {
  total: 2,
  successful: 2,
  failed: 0,
  certificates: [
    {
      row: 1,
      recipientAddress: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqv',
      success: true,
      certificateId: 'cert_1',
    },
    {
      row: 2,
      recipientAddress: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqw',
      success: true,
      certificateId: 'cert_2',
    },
  ],
  errors: [],
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('BatchIssuePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClusterParam = 'cluster_123';

    vi.mocked(walletHook.useWallet).mockReturnValue({
      signer: mockSigner as any,
      address: mockSigner.address,
      isLoadingAddress: false,
    } as any);

    vi.mocked(credentialsLib.getCluster).mockResolvedValue(mockCluster);
    vi.mocked(credentialsLib.parseBatchFile).mockResolvedValue({
      totalRows: 2,
      entries: mockEntries,
    });
    vi.mocked(credentialsLib.issueBatchCertificates).mockResolvedValue(mockIssueResult);
  });

  it('renders "Institution Not Selected" when cluster query parameter is missing', async () => {
    mockClusterParam = null;

    renderWithClient(<BatchIssuePage />);

    expect(await screen.findByText(/Institution Not Selected/i)).toBeInTheDocument();
    expect(screen.getByText(/Please select an issuing institution before batch issuing certificates/i)).toBeInTheDocument();

    const goButton = screen.getByRole('button', { name: /Go to Issue Certificates/i });
    fireEvent.click(goButton);
    expect(mockPush).toHaveBeenCalledWith('/certificates/issue');
  });

  it('renders loading state when wallet address is resolving', () => {
    vi.mocked(walletHook.useWallet).mockReturnValue({
      signer: null,
      address: null,
      isLoadingAddress: true,
    } as any);

    renderWithClient(<BatchIssuePage />);
    expect(screen.getByText(/Resolving wallet address\.\.\./i)).toBeInTheDocument();
  });

  it('forwards custom defaultStyle to issueBatchCertificates when user customizes style and confirms', async () => {
    const { container } = renderWithClient(<BatchIssuePage />);

    // Wait for cluster info to be displayed
    expect(await screen.findByText('Acme Certification Academy')).toBeInTheDocument();

    // Upload batch file
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const mockFile = new File(['mock content'], 'batch.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Wait for preview step to load
    expect(await screen.findByText(/Batch Certificate Style & Appearance/i)).toBeInTheDocument();
    expect(screen.getAllByText('Alice Developer').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bob Builder').length).toBeGreaterThanOrEqual(1);

    // Select 'modern' layout
    const modernBtn = screen.getByRole('button', { name: /Modern/i });
    fireEvent.click(modernBtn);

    // Select 'gold' theme
    const goldBtn = screen.getByRole('button', { name: /Gold/i });
    fireEvent.click(goldBtn);

    // Enter custom title 'HONORS'
    const customTitleInput = screen.getByPlaceholderText(/e\.g\. DIPLOMA, CERTIFICATE OF EXCELLENCE/i);
    fireEvent.change(customTitleInput, { target: { value: 'HONORS' } });

    // Confirm issue
    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    // Verify issueBatchCertificates was called with selected defaultStyle
    await waitFor(() => {
      expect(credentialsLib.issueBatchCertificates).toHaveBeenCalledTimes(1);
    });

    expect(credentialsLib.issueBatchCertificates).toHaveBeenCalledWith(
      mockSigner,
      expect.objectContaining({
        clusterId: 'cluster_123',
        issuerName: 'Acme Certification Academy',
        issuerDescription: 'Official Certification Provider',
        entries: expect.arrayContaining([
          expect.objectContaining({ recipientName: 'Alice Developer' }),
          expect.objectContaining({ recipientName: 'Bob Builder' }),
        ]),
        defaultStyle: expect.objectContaining({
          layout: 'modern',
          theme: 'gold',
          customTitle: 'HONORS',
        }),
      }),
      expect.any(Function)
    );

    // Verify results step is shown
    expect(await screen.findByText(/All Certificates Issued Successfully!/i)).toBeInTheDocument();
  });

  it('forwards default style (classic / blue) when no style modifications are made', async () => {
    const { container } = renderWithClient(<BatchIssuePage />);

    expect(await screen.findByText('Acme Certification Academy')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock content'], 'batch.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByText(/Batch Certificate Style & Appearance/i)).toBeInTheDocument();

    // Confirm without modifying styles
    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(credentialsLib.issueBatchCertificates).toHaveBeenCalledTimes(1);
    });

    expect(credentialsLib.issueBatchCertificates).toHaveBeenCalledWith(
      mockSigner,
      expect.objectContaining({
        defaultStyle: expect.objectContaining({
          layout: 'classic',
          theme: 'blue',
        }),
      }),
      expect.any(Function)
    );
  });

  it('forwards custom theme with customColor when selected', async () => {
    const { container } = renderWithClient(<BatchIssuePage />);

    expect(await screen.findByText('Acme Certification Academy')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock content'], 'batch.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByText(/Batch Certificate Style & Appearance/i)).toBeInTheDocument();

    // Select 'custom' theme
    const customThemeBtn = screen.getByRole('button', { name: /Custom/i });
    fireEvent.click(customThemeBtn);

    // Enter custom hex color
    const hexInput = screen.getByPlaceholderText('#1E40AF');
    fireEvent.change(hexInput, { target: { value: '#9933FF' } });

    // Confirm issue
    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(credentialsLib.issueBatchCertificates).toHaveBeenCalledTimes(1);
    });

    expect(credentialsLib.issueBatchCertificates).toHaveBeenCalledWith(
      mockSigner,
      expect.objectContaining({
        defaultStyle: expect.objectContaining({
          theme: 'custom',
          customColor: '#9933FF',
        }),
      }),
      expect.any(Function)
    );
  });

  it('displays error banner when batch issuance fails and allows retry', async () => {
    vi.mocked(credentialsLib.issueBatchCertificates).mockRejectedValue(
      new Error('Blockchain node unavailable')
    );

    const { container } = renderWithClient(<BatchIssuePage />);

    expect(await screen.findByText('Acme Certification Academy')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock content'], 'batch.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByText(/Batch Certificate Style & Appearance/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    expect(await screen.findByText(/Failed to issue certificates: Blockchain node unavailable/i)).toBeInTheDocument();

    const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(tryAgainBtn);

    // After clicking Try Again, should return to upload step
    expect(await screen.findByText(/Drop file here or click to browse/i)).toBeInTheDocument();
  });

  it('resets step back to upload when user cancels from preview', async () => {
    const { container } = renderWithClient(<BatchIssuePage />);

    expect(await screen.findByText('Acme Certification Academy')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock content'], 'batch.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByText(/Batch Certificate Style & Appearance/i)).toBeInTheDocument();

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Verify we are back on upload step
    expect(await screen.findByText(/Drop file here or click to browse/i)).toBeInTheDocument();
  });

  it('displays detailed error breakdown, row numbers, and error reasons when some certificates fail', async () => {
    vi.mocked(credentialsLib.issueBatchCertificates).mockResolvedValue({
      total: 2,
      successful: 1,
      failed: 1,
      certificates: [
        {
          row: 1,
          recipientAddress: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqv',
          recipientName: 'Alice Developer',
          success: true,
          certificateId: 'cert_1',
        },
        {
          row: 2,
          recipientAddress: 'ckt1qzda0cr08m85hc8j9ngns49pn30ep606x4qp8nd500w494ps2qscq2fnsqw',
          recipientName: 'Bob Builder',
          success: false,
          error: 'Insufficient capacity: Wallet needs 151 CKB',
        },
      ],
      errors: [
        {
          code: 'ISSUANCE_FAILED',
          message: 'Row 2 [Bob Builder]: Insufficient capacity: Wallet needs 151 CKB',
          row: 2,
        },
      ],
    });

    const { container } = renderWithClient(<BatchIssuePage />);

    expect(await screen.findByText('Acme Certification Academy')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['mock content'], 'batch.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByText(/Batch Certificate Style & Appearance/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Issue 2 Certificates/i });
    fireEvent.click(confirmButton);

    // Verify Partially Completed title
    expect(await screen.findByText(/Partially Completed/i)).toBeInTheDocument();

    // Verify Error Breakdown Box
    expect(screen.getByText(/Issuance Error Details \(1 failed certificate\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Row #2 • Bob Builder/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Insufficient capacity: Wallet needs 151 CKB/i).length).toBeGreaterThanOrEqual(1);

    // Verify copy button
    expect(screen.getByRole('button', { name: /Copy Error Log/i })).toBeInTheDocument();

    // Verify actionable troubleshooting hint & faucet link
    expect(screen.getByText(/Wallet has insufficient CKB capacity/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get free testnet CKB from Faucet/i })).toHaveAttribute(
      'href',
      'https://faucet.nervos.org'
    );
  });
});
