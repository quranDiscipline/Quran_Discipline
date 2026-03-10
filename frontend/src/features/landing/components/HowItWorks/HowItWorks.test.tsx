import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HowItWorks } from './HowItWorks';

describe('HowItWorks', () => {
  it('renders default content when no content is provided', () => {
    render(<HowItWorks />);

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Simple Process')).toBeInTheDocument();
    expect(screen.getByText('Book Free Assessment')).toBeInTheDocument();
    expect(screen.getByText('Get Matched')).toBeInTheDocument();
    expect(screen.getByText('Start Learning')).toBeInTheDocument();
  });

  it('renders CMS content when provided', () => {
    const cmsContent = {
      headline: 'Custom Headline',
      subheadline: 'Custom subheadline text',
      steps: [
        {
          icon: 'calendar',
          number: 1,
          title: 'Step One',
          description: 'First step description',
        },
        {
          icon: 'clock',
          number: 2,
          title: 'Step Two',
          description: 'Second step description',
        },
      ],
    };

    render(<HowItWorks content={cmsContent} />);

    expect(screen.getByText('Custom Headline')).toBeInTheDocument();
    expect(screen.getByText('Custom subheadline text')).toBeInTheDocument();
    expect(screen.getByText('Step One')).toBeInTheDocument();
    expect(screen.getByText('Step Two')).toBeInTheDocument();
    expect(screen.getByText('First step description')).toBeInTheDocument();
    expect(screen.getByText('Second step description')).toBeInTheDocument();
  });

  it('has the correct section id', () => {
    const { container } = render(<HowItWorks />);
    const section = container.querySelector('#how-it-works');
    expect(section).toBeInTheDocument();
  });
});
