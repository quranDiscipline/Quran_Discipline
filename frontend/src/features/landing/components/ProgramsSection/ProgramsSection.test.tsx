import { render, screen } from '@testing-library/react';
import { ProgramsSection } from './ProgramsSection';

describe('ProgramsSection', () => {
  it('renders the section with all 4 program cards', () => {
    render(<ProgramsSection />);

    // Check section header
    expect(screen.getByText('Our Programs')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Quranic Education')).toBeInTheDocument();

    // Check all 4 programs are rendered
    expect(screen.getByText('Quran Memorization')).toBeInTheDocument();
    expect(screen.getByText('Tajweed & Recitation')).toBeInTheDocument();
    expect(screen.getByText('Islamic Studies')).toBeInTheDocument();
    expect(screen.getByText('Tafsir (Quran Understanding)')).toBeInTheDocument();
  });

  it('renders Arabic titles for each program', () => {
    render(<ProgramsSection />);

    expect(screen.getByText('حفظ القرآن')).toBeInTheDocument();
    expect(screen.getByText('تجويد القرآن')).toBeInTheDocument();
    expect(screen.getByText('الدراسات الإسلامية')).toBeInTheDocument();
    expect(screen.getByText('تفسير القرآن')).toBeInTheDocument();
  });

  it('renders descriptions for each program', () => {
    render(<ProgramsSection />);

    expect(screen.getByText(/Memorize the Holy Quran/)).toBeInTheDocument();
    expect(screen.getByText(/Learn proper Quranic pronunciation/)).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive Islamic education/)).toBeInTheDocument();
    expect(screen.getByText(/Deepen your understanding/)).toBeInTheDocument();
  });

  it('renders features list for each program', () => {
    render(<ProgramsSection />);

    // Check some features
    expect(screen.getByText('Personalized memorization plan')).toBeInTheDocument();
    expect(screen.getByText('Master Arabic pronunciation')).toBeInTheDocument();
    expect(screen.getByText('Fiqh (Islamic jurisprudence)')).toBeInTheDocument();
    expect(screen.getByText('Word-by-word analysis')).toBeInTheDocument();
  });

  it('has the correct section ID for navigation', () => {
    const { container } = render(<ProgramsSection />);
    const section = container.querySelector('#programs');
    expect(section).toBeInTheDocument();
  });
});
