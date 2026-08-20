/**
 * Card Component Tests
 *
 * Tests for Card component with variants, padding options,
 * and content rendering.
 * Reference: Design_spec/08_UI_Components.md
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../../src/components/ui';

describe('Card', () => {
  // Test: Render card with default props
  // Input: Card with children, no props
  // Expected: Card renders with default variant and padding
  it('should render card with default props', () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText(/card content/i);

    expect(card).toBeInTheDocument();
    expect(card.tagName).toBe('DIV');
  });

  // Test: Render card with default variant
  // Input: Card with variant="default" or default
  // Expected: Card has default styling (slate border)
  it('should render default variant', () => {
    render(<Card variant="default">Default Card</Card>);
    const card = screen.getByText(/default card/i);

    expect(card.className).toContain('bg-slate-800');
    expect(card.className).toContain('border-slate-700');
  });

  // Test: Render card with highlighted variant
  // Input: Card with variant="highlighted"
  // Expected: Card has highlighted styling (blue border)
  it('should render highlighted variant', () => {
    render(<Card variant="highlighted">Highlighted</Card>);
    const card = screen.getByText(/highlighted/i);

    expect(card.className).toContain('bg-slate-800');
    expect(card.className).toContain('border-blue-500');
  });

  // Test: Render card with interactive variant
  // Input: Card with variant="interactive"
  // Expected: Card has interactive styling (hover border, cursor)
  it('should render interactive variant', () => {
    render(<Card variant="interactive">Interactive</Card>);
    const card = screen.getByText(/interactive/i);

    expect(card.className).toContain('cursor-pointer');
    expect(card.className).toContain('hover:border-slate-500');
  });

  // Test: Render card with no padding
  // Input: Card with padding="none"
  // Expected: Card has no padding
  it('should render with no padding', () => {
    render(<Card padding="none">No Padding</Card>);
    const card = screen.getByText(/no padding/i);

    // Should not have p- classes
    expect(card.className).not.toContain('p-3');
    expect(card.className).not.toContain('p-4');
    expect(card.className).not.toContain('p-6');
  });

  // Test: Render card with small padding
  // Input: Card with padding="sm"
  // Expected: Card has small padding (p-3)
  it('should render with small padding', () => {
    render(<Card padding="sm">Small Padding</Card>);
    const card = screen.getByText(/small padding/i);

    expect(card.className).toContain('p-3');
  });

  // Test: Render card with medium padding (default)
  // Input: Card with padding="md" or default
  // Expected: Card has medium padding (p-4)
  it('should render with medium padding', () => {
    render(<Card padding="md">Medium Padding</Card>);
    const card = screen.getByText(/medium padding/i);

    expect(card.className).toContain('p-4');
  });

  // Test: Render card with large padding
  // Input: Card with padding="lg"
  // Expected: Card has large padding (p-6)
  it('should render with large padding', () => {
    render(<Card padding="lg">Large Padding</Card>);
    const card = screen.getByText(/large padding/i);

    expect(card.className).toContain('p-6');
  });

  // Test: Apply border styling
  // Input: Card component
  // Expected: Card has border class
  it('should have border styling', () => {
    render(<Card>With Border</Card>);
    const card = screen.getByText(/with border/i);

    expect(card.className).toContain('border');
  });

  // Test: Apply rounded styling
  // Input: Card component
  // Expected: Card has rounded-lg class
  it('should have rounded corners', () => {
    render(<Card>Rounded</Card>);
    const card = screen.getByText(/rounded/i);

    expect(card.className).toContain('rounded-lg');
  });

  // Test: Render with complex content
  // Input: Card with multiple child elements
  // Expected: Card renders all children
  it('should render with complex content', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  // Test: Apply custom className
  // Input: Card with custom className
  // Expected: Custom className is applied
  it('should apply custom className', () => {
    render(<Card className="custom-card">Custom</Card>);
    const card = screen.getByText(/custom/i);

    expect(card.className).toContain('custom-card');
  });

  // Test: Apply id attribute
  // Input: Card with id prop
  // Expected: Card has correct id attribute
  it('should apply id attribute', () => {
    render(<Card id="my-card">With ID</Card>);
    const card = screen.getByText(/with id/i);

    expect(card.id).toBe('my-card');
  });

  // Test: Handle click events for interactive card
  // Input: Interactive Card with onClick
  // Expected: onClick is called when card is clicked
  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(
      <Card variant="interactive" onClick={handleClick}>
        Clickable
      </Card>
    );
    const card = screen.getByText(/clickable/i);

    card.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
