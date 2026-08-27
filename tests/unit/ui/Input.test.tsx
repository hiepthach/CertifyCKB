/**
 * Input Component Tests
 *
 * Tests for Input component with label, error states,
 * helper text, and accessibility features.
 * Reference: Design_spec/08_UI_Components.md
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../../src/components/ui';

describe('Input', () => {
  // Test: Render input without label
  // Input: Input with no label prop
  // Expected: Input renders without label
  it('should render input without label', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText(/enter text/i);

    expect(input).toBeInTheDocument();
  });

  // Test: Render input with label
  // Input: Input with label="Email"
  // Expected: Input has associated label
  it('should render input with label', () => {
    render(<Input label="Email" />);
    const label = screen.getByText(/email/i);

    expect(label).toBeInTheDocument();
  });

  // Test: Associate label with input
  // Input: Input with label="Username"
  // Expected: Label has htmlFor matching input id
  it('should associate label with input', () => {
    render(<Input label="Username" />);
    const label = screen.getByText(/username/i);
    const input = screen.getByLabelText(/username/i);

    expect(label).toHaveAttribute('for');
    expect(input.id).toBe(label.getAttribute('for'));
  });

  // Test: Show required indicator
  // Input: Input with label and required=true
  // Expected: Label shows required asterisk
  it('should show required asterisk', () => {
    render(<Input label="Required Field" required />);
    const label = screen.getByText(/required field/i);

    expect(label).toHaveTextContent('*');
  });

  // Test: Show error message
  // Input: Input with error="Invalid input"
  // Expected: Error message is displayed
  it('should show error message', () => {
    render(<Input label="Email" error="Invalid email format" />);
    const error = screen.getByText(/invalid email format/i);

    expect(error).toBeInTheDocument();
    expect(error.className).toContain('text-red-400');
  });

  // Test: Input has error styling when error prop is set
  // Input: Input with error prop
  // Expected: Input has error border and focus styles
  it('should have error styling when error is present', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');

    expect(input.className).toContain('border-red-500');
    expect(input.className).toContain('focus:ring-red-500');
  });

  // Test: Show helper text when no error
  // Input: Input with helperText but no error
  // Expected: Helper text is displayed
  it('should show helper text when no error', () => {
    render(<Input label="Email" helperText="Enter your email address" />);
    const helper = screen.getByText(/enter your email address/i);

    expect(helper).toBeInTheDocument();
    expect(helper.className).toContain('text-ash-veil');
  });

  // Test: Hide helper text when error is shown
  // Input: Input with both error and helperText
  // Expected: Only error message is shown
  it('should hide helper text when error is present', () => {
    render(
      <Input
        label="Email"
        error="Invalid"
        helperText="Helper text"
      />
    );

    expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  // Test: Handle text input
  // Input: User types in input
  // Expected: Input value is updated
  it('should handle text input', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'John Doe');

    expect(input).toHaveValue('John Doe');
  });

  // Test: Apply disabled styling
  // Input: Input with disabled=true
  // Expected: Input is disabled and has disabled styling
  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText(/disabled/i);

    expect(input).toBeDisabled();
    expect(input.className).toContain('opacity-50');
    expect(input.className).toContain('cursor-not-allowed');
  });

  // Test: Apply placeholder styling
  // Input: Input with placeholder
  // Expected: Placeholder text is shown
  it('should show placeholder text', () => {
    render(<Input placeholder="Type here..." />);
    const input = screen.getByPlaceholderText(/type here/i);

    expect(input).toHaveAttribute('placeholder', 'Type here...');
  });

  // Test: Apply custom className
  // Input: Input with custom className
  // Expected: Custom className is applied
  it('should apply custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');

    expect(input.className).toContain('custom-input');
  });

  // Test: Apply default width styling
  // Input: Input component
  // Expected: Input has w-full class
  it('should have full width', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    expect(input.className).toContain('w-full');
  });

  // Test: Apply focus ring styling
  // Input: Input component
  // Expected: Input has focus ring styles
  it('should have focus ring styling', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    expect(input.className).toContain('focus:ring-2');
    expect(input.className).toContain('focus:ring-lavender');
  });

  // Test: Generate id from label
  // Input: Input with label="Email Address"
  // Expected: Input id is generated from label
  it('should generate id from label', () => {
    render(<Input label="Email Address" />);
    const input = screen.getByRole('textbox');

    expect(input.id).toBe('email-address');
  });

  // Test: Use provided id
  // Input: Input with id="custom-id"
  // Expected: Input uses provided id
  it('should use provided id', () => {
    render(<Input id="custom-id" />);
    const input = screen.getByRole('textbox');

    expect(input.id).toBe('custom-id');
  });

  // Test: Support different input types
  // Input: Input with type="email"
  // Expected: Input has type="email"
  it('should support different input types', () => {
    render(<Input type="email" placeholder="email@example.com" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('type', 'email');
  });

  // Test: Apply dark theme styling
  // Input: Input component
  // Expected: Input has dark theme colors
  it('should have dark theme styling', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    expect(input.className).toContain('bg-midnight-plum');
    expect(input.className).toContain('border-fog-line/15');
    expect(input.className).toContain('text-bone-white');
    expect(input.className).toContain('placeholder-mid-ash');
  });
});
