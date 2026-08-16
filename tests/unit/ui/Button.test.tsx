/**
 * Button Component Tests
 *
 * Tests for Button component with variants, sizes, loading state,
 * and accessibility features.
 * Reference: Design_spec/08_UI_Components.md
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../../../src/components/ui';

describe('Button', () => {
  // Test: Render button with default props
  // Input: Button with children, no props
  // Expected: Button renders with default styles
  it('should render button with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  // Test: Render button with primary variant
  // Input: Button with variant="primary"
  // Expected: Button has primary styling
  it('should render primary variant', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('bg-blue-600');
  });

  // Test: Render button with secondary variant
  // Input: Button with variant="secondary"
  // Expected: Button has secondary styling
  it('should render secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('bg-slate-700');
  });

  // Test: Render button with danger variant
  // Input: Button with variant="danger"
  // Expected: Button has danger styling
  it('should render danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('bg-red-600');
  });

  // Test: Render button with ghost variant
  // Input: Button with variant="ghost"
  // Expected: Button has ghost styling
  it('should render ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('bg-transparent');
  });

  // Test: Render button with small size
  // Input: Button with size="sm"
  // Expected: Button has small size styling
  it('should render small size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('px-3');
    expect(button.className).toContain('py-1.5');
  });

  // Test: Render button with medium size (default)
  // Input: Button with size="md" or default
  // Expected: Button has medium size styling
  it('should render medium size', () => {
    render(<Button size="md">Medium</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('px-4');
    expect(button.className).toContain('py-2');
  });

  // Test: Render button with large size
  // Input: Button with size="lg"
  // Expected: Button has large size styling
  it('should render large size', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('px-6');
    expect(button.className).toContain('py-3');
  });

  // Test: Show loading spinner when loading
  // Input: Button with loading=true
  // Expected: Button shows spinner and is disabled
  it('should show loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');

    // Check for disabled state
    expect(button).toBeDisabled();

    // Check for Loader2 icon (animate-spin class)
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  // Test: Disable button when loading
  // Input: Button with loading=true
  // Expected: Button has disabled attribute
  it('should be disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
  });

  // Test: Disable button with disabled prop
  // Input: Button with disabled=true
  // Expected: Button has disabled attribute and disabled styling
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button.className).toContain('opacity-50');
  });

  // Test: Apply full width styling
  // Input: Button with fullWidth=true
  // Expected: Button has w-full class
  it('should have full width when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('w-full');
  });

  // Test: Handle click events
  // Input: Button with onClick handler
  // Expected: onClick is called when button is clicked
  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');

    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test: Not call onClick when disabled
  // Input: Button with onClick and disabled=true
  // Expected: onClick is not called when clicked
  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button');

    button.click();

    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test: Apply custom className
  // Input: Button with custom className
  // Expected: Custom className is applied
  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('custom-class');
  });

  // Test: Render with icon and text
  // Input: Button with children including text
  // Expected: Button renders children correctly
  it('should render with children', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    const button = screen.getByRole('button');

    expect(button).toHaveTextContent('Icon');
    expect(button).toHaveTextContent('Text');
  });

  // Test: Have proper focus styles for accessibility
  // Input: Button component
  // Expected: Button has focus ring styles
  it('should have focus styles', () => {
    render(<Button>Focus</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('focus:ring-2');
    expect(button.className).toContain('focus:ring-blue-500');
  });
});
