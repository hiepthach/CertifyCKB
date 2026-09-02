import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateList, CERTIFICATE_PRESETS } from '@/components/template/TemplateList';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn((key: string) => (key === 'cluster' ? 'cluster_123' : null)),
  }),
}));

describe('TemplateList Style Showcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the available certificate design presets', () => {
    render(<TemplateList clusterId="cluster_123" />);

    expect(screen.getAllByText(/Classic/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Modern/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Detailed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Badge/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Compact/i).length).toBeGreaterThan(0);

    expect(screen.getByText('Academic Classic')).toBeInTheDocument();
    expect(screen.getByText('Modern Tech')).toBeInTheDocument();
    expect(screen.getByText('Executive Detailed')).toBeInTheDocument();
    expect(screen.getByText('Achievement Badge')).toBeInTheDocument();
    expect(screen.getByText('Compact Diploma')).toBeInTheDocument();
  });

  it('displays cluster name on certificate presets when provided', () => {
    render(<TemplateList clusterId="cluster_123" clusterName="Nervos University" />);

    const clusterNameElements = screen.getAllByText('Nervos University');
    expect(clusterNameElements.length).toBeGreaterThan(0);
  });

  it('navigates to issue page when "Issue With This Style" is clicked', () => {
    render(<TemplateList clusterId="cluster_123" clusterName="Nervos University" />);

    const issueButtons = screen.getAllByRole('button', { name: /Issue With This Style/i });
    expect(issueButtons.length).toBe(CERTIFICATE_PRESETS.length);

    // Click the first one (Academic Classic: layout: classic, theme: gold)
    fireEvent.click(issueButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/certificates/issue?cluster=cluster_123&layout=classic&theme=gold');

    // Click the second one (Modern Tech: layout: modern, theme: blue)
    fireEvent.click(issueButtons[1]);
    expect(mockPush).toHaveBeenCalledWith('/certificates/issue?cluster=cluster_123&layout=modern&theme=blue');
  });

  it('opens preview modal when Preview button is clicked and allows issuing from modal', () => {
    render(<TemplateList clusterId="cluster_123" clusterName="Nervos University" />);

    const previewButtons = screen.getAllByRole('button', { name: /^Preview$/i });
    expect(previewButtons.length).toBe(CERTIFICATE_PRESETS.length);

    // Click preview for Executive Detailed (3rd preset: layout: detailed, theme: purple)
    fireEvent.click(previewButtons[2]);

    // Check modal opened with preset name
    expect(screen.getByText(/Preview: Executive Detailed/i)).toBeInTheDocument();

    // Find Issue button in modal
    const modalIssueButton = screen.getByRole('button', { name: /Use This Style to Issue/i });
    fireEvent.click(modalIssueButton);

    expect(mockPush).toHaveBeenCalledWith('/certificates/issue?cluster=cluster_123&layout=detailed&theme=purple');
  });
});
