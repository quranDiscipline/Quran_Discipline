import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { BookingCTASection } from './BookingCTASection';

// Mock useNavigate
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => vi.fn(),
}));

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('BookingCTASection', () => {
  it('renders default content when no content is provided', () => {
    const { container } = renderWithRouter(<BookingCTASection />);

    // Check that the component renders
    expect(container.querySelector('section')).toBeInTheDocument();

    // Check for key elements with more flexible matchers
    expect(screen.getByText(/Start Your Quran Journey/i)).toBeInTheDocument();
    expect(screen.getByText(/No commitment required/i)).toBeInTheDocument();
    expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/free assessment/i)).toBeInTheDocument();
  });

  it('renders CMS content when provided', () => {
    const cmsContent = {
      headline: 'Custom Headline',
      subheadline: 'Custom subheadline text',
      rating: '5.0/5 from 500+ reviews',
      buttonText: 'Custom Button Text',
      trustText: 'Custom trust text',
      features: [
        { icon: 'calendar', text: 'Feature 1' },
        { icon: 'clock', text: 'Feature 2' },
      ],
    };

    renderWithRouter(<BookingCTASection content={cmsContent} />);

    expect(screen.getByText('Custom Headline')).toBeInTheDocument();
    expect(screen.getByText('Custom subheadline text')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });
});
