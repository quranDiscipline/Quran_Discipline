import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedTestimonials, type TestimonialItem } from './animated-testimonials';

describe('AnimatedTestimonials', () => {
  const mockTestimonials: TestimonialItem[] = [
    {
      quote: 'Test quote 1',
      name: 'John Doe',
      designation: 'Student from USA 🇺🇸',
      src: 'https://example.com/image1.jpg',
    },
    {
      quote: 'Test quote 2',
      name: 'Jane Smith',
      designation: 'Student from UK 🇬🇧',
      src: 'https://example.com/image2.jpg',
    },
    {
      quote: 'Test quote 3',
      name: 'Bob Johnson',
      designation: 'Student from Canada 🇨🇦',
      src: 'https://example.com/image3.jpg',
    },
  ];

  it('renders without crashing', () => {
    const { container } = render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays the first testimonial by default', () => {
    render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Student from USA 🇺🇸')).toBeInTheDocument();
    // Quote is split into individual spans for word animation
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('quote')).toBeInTheDocument();
  });

  it('shows navigation buttons', () => {
    render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument();
    expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument();
  });

  it('displays correct number of dot indicators', () => {
    render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    const dots = screen.getAllByRole('button', { name: /Go to testimonial/ });
    expect(dots).toHaveLength(3);
  });

  it('dot indicators are clickable', () => {
    render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    const dots = screen.getAllByRole('button', { name: /Go to testimonial/ });
    expect(dots[0]).toBeEnabled();
  });

  it('renders testimonial images with correct alt text', () => {
    render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('alt', 'John Doe');
  });

  it('highlights the first dot indicator as active', () => {
    render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    const dots = screen.getAllByRole('button', { name: /Go to testimonial/ });

    // First dot should have active class (wider)
    expect(dots[0]).toHaveClass('w-6');
    // Other dots should have inactive class
    expect(dots[1]).toHaveClass('w-1.5');
  });

  it('renders nothing when testimonials array is empty', () => {
    const { container } = render(<AnimatedTestimonials testimonials={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when testimonials array is undefined', () => {
    const { container } = render(<AnimatedTestimonials testimonials={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <AnimatedTestimonials testimonials={mockTestimonials} className="custom-class" />,
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('navigation buttons have accessible labels', () => {
    render(<AnimatedTestimonials testimonials={mockTestimonials} />);
    expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument();
    expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument();
  });
});
