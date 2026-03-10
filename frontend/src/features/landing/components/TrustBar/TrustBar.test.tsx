import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TrustBar } from './TrustBar';

// Mock the useCountUp hook
vi.mock('../../hooks/useCountUp', () => ({
  useCountUp: () => ({
    formattedValue: '15+',
    elementRef: vi.fn(),
  }),
}));

describe('TrustBar', () => {
  it('renders default stats when no content is provided', () => {
    render(<TrustBar />);

    expect(screen.getByText('Certified Teachers')).toBeInTheDocument();
    expect(screen.getByText('Students Worldwide')).toBeInTheDocument();
    expect(screen.getByText('Countries Served')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
  });

  it('renders CMS content when provided', () => {
    const cmsContent = {
      items: [
        { icon: 'shield-check', text: 'Al-Azhar Certified Teachers' },
        { icon: 'video', text: 'Live 1-on-1 Zoom Sessions' },
        { icon: 'book-open', text: 'Structured Curriculum' },
        { icon: 'users', text: 'Small Group Options' },
      ],
    };

    render(<TrustBar content={cmsContent} />);

    expect(screen.getByText('Al-Azhar Certified Teachers')).toBeInTheDocument();
    expect(screen.getByText('Live 1-on-1 Zoom Sessions')).toBeInTheDocument();
    expect(screen.getByText('Structured Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Small Group Options')).toBeInTheDocument();
  });

  it('has the correct id for intersection observer', () => {
    const { container } = render(<TrustBar />);
    const trustBar = container.querySelector('#trust-bar');
    expect(trustBar).toBeInTheDocument();
  });
});
