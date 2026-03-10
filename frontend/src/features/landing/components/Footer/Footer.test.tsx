import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

// Mock window.open
global.open = vi.fn();

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default content when no content is provided', () => {
    render(<Footer />);

    expect(screen.getByText('Quran Discipline Academy')).toBeInTheDocument();
    expect(screen.getByText(/Discipline Transforms/i)).toBeInTheDocument();
    expect(screen.getByText('Quran Memorization')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('info@qurandiscipline.academy')).toBeInTheDocument();
    expect(screen.getByText('Online Worldwide')).toBeInTheDocument();
  });

  it('renders CMS content when provided', () => {
    const cmsContent = {
      brandName: 'Custom Academy',
      brandDescription: 'Custom description',
      tagline: 'Custom Tagline',
      programLinks: [
        { name: 'Program 1', href: '#prog1' },
        { name: 'Program 2', href: '#prog2' },
      ],
      companyLinks: [
        { name: 'Link 1', href: '#link1' },
      ],
      contactEmail: 'test@example.com',
      contactLocation: 'Test Location',
      socialLinks: {
        facebook: 'https://facebook.com/test',
        instagram: 'https://instagram.com/test',
        twitter: 'https://twitter.com/test',
        youtube: 'https://youtube.com/test',
      },
    };

    render(<Footer content={cmsContent} />);

    expect(screen.getByText('Custom Academy')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByText('Program 1')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('renders social icons with clickable buttons', () => {
    render(<Footer />);

    const facebookButton = screen.getByLabelText('Visit our facebook page');
    const instagramButton = screen.getByLabelText('Visit our instagram page');
    const twitterButton = screen.getByLabelText('Visit our twitter page');
    const youtubeButton = screen.getByLabelText('Visit our youtube page');

    expect(facebookButton).toBeInTheDocument();
    expect(instagramButton).toBeInTheDocument();
    expect(twitterButton).toBeInTheDocument();
    expect(youtubeButton).toBeInTheDocument();
  });
});
