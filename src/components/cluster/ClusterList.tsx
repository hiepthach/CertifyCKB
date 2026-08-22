'use client';

import { ClusterCard } from './ClusterCard';
import { EmptyState } from '@/components/ui';
import { Spinner } from '@/components/ui';
import type { Cluster } from '@/types';

interface ClusterListProps {
  clusters: Cluster[];
  certificateCounts?: Record<string, number>;
  loading?: boolean;
  onManage?: (cluster: Cluster) => void;
  onIssue?: (cluster: Cluster) => void;
  onCreateNew?: () => void;
}

export function ClusterList({
  clusters,
  certificateCounts = {},
  loading = false,
  onManage,
  onIssue,
  onCreateNew,
}: ClusterListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner label="Loading clusters..." />
      </div>
    );
  }

  if (clusters.length === 0) {
    return (
      <EmptyState
        icon="🏛️"
        title="No clusters created"
        description="Create a cluster to start issuing certificates. Each cluster represents a course provider organization."
        action={{
          label: 'Create Cluster',
          onClick: onCreateNew || (() => {}),
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clusters.map((cluster) => (
        <ClusterCard
          key={cluster.clusterId}
          cluster={cluster}
          certificateCount={certificateCounts[cluster.clusterId] || 0}
          onManage={() => onManage?.(cluster)}
          onIssue={() => onIssue?.(cluster)}
        />
      ))}
    </div>
  );
}
