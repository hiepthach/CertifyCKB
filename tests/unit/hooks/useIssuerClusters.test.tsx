import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIssuerClusters } from '@/hooks/useIssuerClusters';
import * as credentialsLib from '@/lib/credentials';

const mockClusters = [
  { id: '1', clusterId: '0xabc', name: 'CKB Academy', description: 'desc', createdAt: '2024-01-01' },
  { id: '2', clusterId: '0xdef', name: 'Nervos U', description: 'desc2', createdAt: '2024-01-02' },
];

vi.mock('@/lib/credentials', async (importOriginal) => {
  const actual = await importOriginal<typeof credentialsLib>();
  return {
    ...actual,
    getProviderClusters: vi.fn(),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useIssuerClusters', () => {
  it('returns clusters from getProviderClusters', async () => {
    vi.mocked(credentialsLib.getProviderClusters).mockResolvedValue(mockClusters);

    const { result } = renderHook(() => useIssuerClusters(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.clusters).toEqual(mockClusters);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles error state', async () => {
    vi.mocked(credentialsLib.getProviderClusters).mockRejectedValue(new Error('fetch failed'));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const errorWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useIssuerClusters(), {
      wrapper: errorWrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    expect(result.current.clusters).toEqual([]);
  });
});
