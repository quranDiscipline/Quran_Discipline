import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from './FAQ';

describe('FAQ', () => {
  it('renders FAQ section with header', () => {
    const mockContent = { items: [] };
    render(<FAQ content={mockContent} />);

    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders default questions when no content provided', () => {
    const mockContent = { items: [] };
    render(<FAQ content={mockContent} />);

    expect(screen.getByText('How do I get started?')).toBeInTheDocument();
    expect(screen.getByText('What age groups do you teach?')).toBeInTheDocument();
    expect(screen.getByText('Do I need any prior knowledge?')).toBeInTheDocument();
  });

  it('renders provided questions when content is supplied', () => {
    const mockContent = {
      items: [
        { q: 'Custom Question 1?', a: 'Custom Answer 1' },
        { q: 'Custom Question 2?', a: 'Custom Answer 2' },
      ],
    };
    render(<FAQ content={mockContent} />);

    expect(screen.getByText('Custom Question 1?')).toBeInTheDocument();
    expect(screen.getByText('Custom Question 2?')).toBeInTheDocument();
    expect(screen.queryByText('How do I get started?')).not.toBeInTheDocument();
  });

  it('has all items closed by default', () => {
    const mockContent = { items: [] };
    const { container } = render(<FAQ content={mockContent} />);

    const firstQuestion = screen.getByText('How do I get started?');

    expect(firstQuestion).toBeInTheDocument();
    // Check that no answer elements have max-h-96 (which indicates open state)
    const openAnswers = container.querySelectorAll('.max-h-96');
    expect(openAnswers).toHaveLength(0);
  });

  it('opens an item when clicked', async () => {
    const user = userEvent.setup();
    const mockContent = { items: [] };
    const { container } = render(<FAQ content={mockContent} />);

    const firstQuestion = screen.getByText('How do I get started?');
    await user.click(firstQuestion);

    // Check that answer has max-h-96 class (open state)
    const openAnswers = container.querySelectorAll('.max-h-96');
    expect(openAnswers).toHaveLength(1);
    expect(openAnswers[0]).toHaveTextContent(/Simply book a free/);
  });

  it('closes an item when clicked again', async () => {
    const user = userEvent.setup();
    const mockContent = { items: [] };
    const { container } = render(<FAQ content={mockContent} />);

    const firstQuestion = screen.getByText('How do I get started?');

    // Open
    await user.click(firstQuestion);
    let openAnswers = container.querySelectorAll('.max-h-96');
    expect(openAnswers).toHaveLength(1);

    // Close
    await user.click(firstQuestion);
    openAnswers = container.querySelectorAll('.max-h-96');
    expect(openAnswers).toHaveLength(0);
  });

  it('only keeps one item open at a time (controlled accordion)', async () => {
    const user = userEvent.setup();
    const mockContent = { items: [] };
    const { container } = render(<FAQ content={mockContent} />);

    const firstQuestion = screen.getByText('How do I get started?');
    const secondQuestion = screen.getByText('What age groups do you teach?');

    // Open first item
    await user.click(firstQuestion);
    let openAnswers = container.querySelectorAll('.max-h-96');
    expect(openAnswers).toHaveLength(1);
    expect(openAnswers[0]).toHaveTextContent(/Simply book a free/);

    // Open second item - first should close
    await user.click(secondQuestion);
    openAnswers = container.querySelectorAll('.max-h-96');
    expect(openAnswers).toHaveLength(1);
    expect(openAnswers[0]).toHaveTextContent(/We welcome students of all ages/);
  });

  it('has the correct section ID for navigation', () => {
    const mockContent = { items: [] };
    const { container } = render(<FAQ content={mockContent} />);
    const section = container.querySelector('#faq');
    expect(section).toBeInTheDocument();
  });
});
