import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InstitutionSelector } from '@/components/certificate/InstitutionSelector';
import * as useIssuerClustersModule from '@/hooks/useIssuerClusters';

const mockClusters = [
  { id: '1', clusterId: '0xabc', name: 'CKB Academy', description: 'desc', createdAt: '2024-01-01' },
  { id: '2', clusterId: '0xdef', name: 'Nervos U', description: 'desc2', createdAt: '2024-01-02' },
];

vi.mock('@/hooks/useIssuerClusters', () => ({
  useIssuerClusters: vi.fn(() => ({
    clusters: mockClusters,
    isLoading: false,
    error: null,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('InstitutionSelector', () => {
  it('renders cluster names as options', () => {
    const onChange = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <InstitutionSelector value={null} onChange={onChange} />
      </QueryClientProvider>
    );

    expect(screen.getByText('CKB Academy')).toBeInTheDocument();
    expect(screen.getByText('Nervos U')).toBeInTheDocument();
  });

  it('shows "Select an institution" as placeholder', () => {
    const onChange = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <InstitutionSelector value={null} onChange={onChange} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Select an institution')).toBeInTheDocument();
  });

  it('calls onChange with clusterId when option is selected', () => {
    const onChange = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <InstitutionSelector value={null} onChange={onChange} />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '0xabc' } });
    expect(onChange).toHaveBeenCalledWith('0xabc');
  });
});
