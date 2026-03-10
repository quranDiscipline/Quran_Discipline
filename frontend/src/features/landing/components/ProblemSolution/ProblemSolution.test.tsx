import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProblemSolution } from './ProblemSolution';

describe('ProblemSolution', () => {
  it('renders default content when no content is provided', () => {
    render(<ProblemSolution />);

    expect(screen.getByText('The Struggle Is Real')).toBeInTheDocument();
    expect(screen.getByText('Sound Familiar?')).toBeInTheDocument();
    expect(screen.getByText('Discipline That Works')).toBeInTheDocument();
    expect(screen.getByText('The Difference')).toBeInTheDocument();
    expect(screen.getByText(/Started but lost motivation/)).toBeInTheDocument();
    expect(screen.getByText(/Personal teacher — accountability/)).toBeInTheDocument();
  });

  it('renders CMS content when provided', () => {
    const cmsContent = {
      problemHeadline: 'Custom Problem',
      problemSubheadline: 'Custom Problem Sub',
      problems: ['Problem 1', 'Problem 2'],
      solutionHeadline: 'Custom Solution',
      solutionSubheadline: 'Custom Solution Sub',
      solutions: ['Solution 1', 'Solution 2'],
    };

    render(<ProblemSolution content={cmsContent} />);

    expect(screen.getByText('Custom Problem')).toBeInTheDocument();
    expect(screen.getByText('Custom Problem Sub')).toBeInTheDocument();
    expect(screen.getByText('Custom Solution')).toBeInTheDocument();
    expect(screen.getByText('Custom Solution Sub')).toBeInTheDocument();
    expect(screen.getByText('Problem 1')).toBeInTheDocument();
    expect(screen.getByText('Solution 1')).toBeInTheDocument();
  });

  it('has the correct section id', () => {
    const { container } = render(<ProblemSolution />);
    const section = container.querySelector('#about');
    expect(section).toBeInTheDocument();
  });
});
