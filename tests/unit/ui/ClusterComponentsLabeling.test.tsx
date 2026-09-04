import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClusterList } from '@/components/cluster/ClusterList';
import { ClusterCard } from '@/components/cluster/ClusterCard';
import type { Cluster } from '@/types';

const mockCluster: Cluster = {
  id: '0x1234567890abcdef',
  clusterId: '0x1234567890abcdef',
  name: 'CKB Academy',
  description: 'Blockchain academy on CKB',
  creatorAddress: 'ckt1qzda0cr08m85hc8j972hp9ac9spn2x6hurys50ax32206funacq09q93vdyvt',
  createdAt: new Date().toISOString(),
};

describe('Cluster Components Domain Labeling', () => {
  it('renders "No institutions registered" in empty state', () => {
    render(<ClusterList clusters={[]} />);
    expect(screen.getByText('No institutions registered')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register Institution' })).toBeInTheDocument();
  });

  it('renders "Issue Certificate" and certificates count on ClusterCard', () => {
    render(<ClusterCard cluster={mockCluster} certificateCount={5} />);
    expect(screen.getByRole('button', { name: /Issue Certificate/i })).toBeInTheDocument();
    expect(screen.getByText(/5 Certificates issued/i)).toBeInTheDocument();
  });
});
