import { useWallet } from '@/hooks/useWallet';
import { useQuery } from '@tanstack/react-query';
import { getProviderClusters } from '@/lib/credentials';

export function useIssuerClusters() {
  const { address, client } = useWallet();

  const { data: clusters = [], isLoading, error } = useQuery({
    queryKey: ['issuer-clusters', address],
    queryFn: () => (address ? getProviderClusters(address, client) : []),
    enabled: !!address,
    staleTime: 30_000,
  });

  return { clusters, isLoading: isLoading && !!address, error };
}
