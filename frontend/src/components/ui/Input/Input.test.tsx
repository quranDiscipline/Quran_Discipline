import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders input with correct type', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('shows error message when error prop provided', () => {
    render(<Input error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows helper text when provided', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(
      <Input error="Email is required" helperText="Enter your email address" />,
    );
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    render(<Input type="password" label="Password" />);
    const user = userEvent.setup();

    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input?.type).toBe('password');

    await user.click(toggleButton);
    expect(input?.type).toBe('text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input?.type).toBe('password');
  });

  it('calls onChange with correct value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={onChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'hello');

    expect(onChange).toHaveBeenCalled();
  });

  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">X</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">Y</span>} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('has correct id generated from label', () => {
    render(<Input label="Full Name" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Full Name');
    expect(input).toHaveAttribute('id', 'full-name');
    expect(label).toHaveAttribute('for', 'full-name');
  });

  it('uses custom id when provided', () => {
    render(<Input label="Email" id="custom-email-id" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email');
    expect(input).toHaveAttribute('id', 'custom-email-id');
    expect(label).toHaveAttribute('for', 'custom-email-id');
  });
});
