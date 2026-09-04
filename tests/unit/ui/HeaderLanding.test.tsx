import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({
    open: vi.fn(),
    disconnect: vi.fn(),
    address: null,
    isConnected: false,
  }),
}));

vi.mock('@/components/wallet/NetworkSelector', () => ({
  NetworkSelector: () => <div data-testid="network-selector" />,
}));

describe('Header & Navigation Domain Labeling', () => {
  it('renders "Institutions" navigation link instead of "Clusters"', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: 'Institutions' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/clusters');
    expect(screen.queryByRole('link', { name: 'Clusters' })).not.toBeInTheDocument();
  });
});
