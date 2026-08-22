/**
 * Badge Component Tests
 *
 * Tests for Badge component with variants, styling,
 * and display behavior.
 * Reference: Design_spec/08_UI_Components.md
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../../src/components/ui';

describe('Badge', () => {
  // Test: Render badge with default props
  // Input: Badge with children, no props
  // Expected: Badge renders with default (neutral) styles
  it('should render badge with default props', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText(/default/i);

    expect(badge).toBeInTheDocument();
  });

  // Test: Render badge with success variant
  // Input: Badge with variant="success"
  // Expected: Badge has success styling (emerald)
  it('should render success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText(/success/i);

    expect(badge.className).toContain('bg-emerald-950');
    expect(badge.className).toContain('text-emerald-400');
    expect(badge.className).toContain('border-emerald-800');
  });

  // Test: Render badge with warning variant
  // Input: Badge with variant="warning"
  // Expected: Badge has warning styling (amber)
  it('should render warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText(/warning/i);

    expect(badge.className).toContain('bg-amber-950');
    expect(badge.className).toContain('text-amber-400');
    expect(badge.className).toContain('border-amber-800');
  });

  // Test: Render badge with danger variant
  // Input: Badge with variant="danger"
  // Expected: Badge has danger styling (red)
  it('should render danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText(/danger/i);

    expect(badge.className).toContain('bg-red-950');
    expect(badge.className).toContain('text-red-400');
    expect(badge.className).toContain('border-red-800');
  });

  // Test: Render badge with lavender variant
  // Input: Badge with variant="lavender"
  // Expected: Badge has lavender styling (violet/iris accent)
  it('should render lavender variant', () => {
    render(<Badge variant="lavender">Lavender</Badge>);
    const badge = screen.getByText(/lavender/i);

    expect(badge.className).toContain('bg-deep-indigo');
    expect(badge.className).toContain('text-lavender');
    expect(badge.className).toContain('border-iris');
  });

  // Test: Render badge with neutral variant (default)
  // Input: Badge with variant="neutral" or default
  // Expected: Badge has neutral styling (midnight surface)
  it('should render neutral variant', () => {
    render(<Badge variant="neutral">Neutral</Badge>);
    const badge = screen.getByText(/neutral/i);

    expect(badge.className).toContain('bg-midnight');
    expect(badge.className).toContain('text-ash');
    expect(badge.className).toContain('border-dusk');
  });

  // Test: Render with custom className
  // Input: Badge with custom className
  // Expected: Custom className is applied
  it('should apply custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText(/custom/i);

    expect(badge.className).toContain('custom-badge');
  });

  // Test: Render with complex content
  // Input: Badge with multiple child elements
  // Expected: Badge renders all children
  it('should render with complex content', () => {
    render(
      <Badge variant="success">
        <span>Active</span>
        <span>Status</span>
      </Badge>
    );

    // Check both text nodes are rendered
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });

  // Test: Apply border styling
  // Input: Badge component
  // Expected: Badge has border class
  it('should have border styling', () => {
    render(<Badge>With Border</Badge>);
    const badge = screen.getByText(/with border/i);

    expect(badge.className).toContain('border');
  });

  // Test: Apply rounded-badge styling for pill shape
  // Input: Badge component
  // Expected: Badge has rounded-badge class (32px radius)
  it('should have pill shape', () => {
    render(<Badge>Pill Badge</Badge>);
    const badge = screen.getByText(/pill badge/i);

    expect(badge.className).toContain('rounded-badge');
  });

  // Test: Apply font size styling
  // Input: Badge component
  // Expected: Badge has text-xs class
  it('should have small text size', () => {
    render(<Badge>Small</Badge>);
    const badge = screen.getByText(/small/i);

    expect(badge.className).toContain('text-xs');
  });
});
