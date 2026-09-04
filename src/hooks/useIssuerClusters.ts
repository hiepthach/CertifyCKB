import { useQuery } from '@tanstack/react-query';
import { getProviderClusters } from '@/lib/credentials';

export function useIssuerClusters() {
  const { data: clusters = [], isLoading, error } = useQuery({
    queryKey: ['issuer-clusters'],
    queryFn: () => getProviderClusters(),
  });

  return { clusters, isLoading, error };
}
