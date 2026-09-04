'use client';

import { useIssuerClusters } from '@/hooks/useIssuerClusters';
import { ChevronDown } from 'lucide-react';

interface InstitutionSelectorProps {
  value: string | null;
  onChange: (clusterId: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function InstitutionSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: InstitutionSelectorProps) {
  const { clusters, isLoading } = useIssuerClusters();

  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || isLoading}
        className="w-full appearance-none bg-midnight-plum border border-fog-line/15 text-bone-white text-sm rounded-xl px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-lavender-spark/40 focus:border-lavender-spark/50 transition-all duration-200 cursor-pointer"
      >
        <option value="">
          {isLoading ? 'Loading institutions...' : 'Select an institution'}
        </option>
        {clusters.map((cluster) => (
          <option key={cluster.id || cluster.clusterId} value={cluster.clusterId || cluster.id}>
            {cluster.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mid-ash pointer-events-none" />
    </div>
  );
}
