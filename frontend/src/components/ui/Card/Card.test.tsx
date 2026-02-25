import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content').closest('div.bg-white, div.rounded-xl') as HTMLElement;
    expect(card?.className).toContain('custom-class');
  });

  it('adds hover styles when hover prop is true', () => {
    render(<Card hover>Content</Card>);
    const card = screen.getByText('Content').closest('div[class*="hover:shadow"]') as HTMLElement;
    expect(card).toBeTruthy();
  });

  it('does not add hover styles by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('div');
    expect(card?.className).not.toContain('hover:shadow-card-hover');
  });

  it('applies correct padding styles', () => {
    const { rerender, container } = render(<Card padding="sm">Content</Card>);
    let card = container.querySelector('div');
    expect(card?.className).toContain('p-4');

    rerender(<Card padding="md">Content</Card>);
    card = container.querySelector('div');
    expect(card?.className).toContain('p-6');

    rerender(<Card padding="lg">Content</Card>);
    card = container.querySelector('div');
    expect(card?.className).toContain('p-8');

    rerender(<Card padding="none">Content</Card>);
    card = container.querySelector('div');
    expect(card?.className).not.toContain('p-4');
    expect(card?.className).not.toContain('p-6');
    expect(card?.className).not.toContain('p-8');
  });

  it('has default card base styles', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('div');
    expect(card?.className).toContain('bg-white');
    expect(card?.className).toContain('rounded-xl');
    expect(card?.className).toContain('border');
    expect(card?.className).toContain('border-gray-200');
    expect(card?.className).toContain('shadow-sm');
  });
});
