import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingSection } from './PricingSection';
import { MemoryRouter } from 'react-router-dom';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter(component: React.ReactElement) {
  return render(<MemoryRouter>{component}</MemoryRouter>);
}

describe('PricingSection', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders both pricing cards', () => {
    renderWithRouter(<PricingSection />);

    expect(screen.getByText('Group Classes')).toBeInTheDocument();
    expect(screen.getByText('Private 1-on-1')).toBeInTheDocument();
  });

  it('displays "Most Popular" badge on private plan', () => {
    renderWithRouter(<PricingSection />);

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('displays correct prices', () => {
    renderWithRouter(<PricingSection />);

    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('displays pricing period', () => {
    renderWithRouter(<PricingSection />);

    const periods = screen.getAllByText('/per month');
    expect(periods).toHaveLength(2);
  });

  it('renders features for each plan', () => {
    renderWithRouter(<PricingSection />);

    // Group features
    expect(screen.getByText('Small groups (3-5 students)')).toBeInTheDocument();

    // Private features
    expect(screen.getByText('Individual attention')).toBeInTheDocument();
    expect(screen.getByText('30-minute sessions')).toBeInTheDocument();
  });

  it('navigates to booking page when clicking group plan button', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PricingSection />);

    const groupButton = screen.getByRole('button', { name: 'Start Group Classes' });
    await user.click(groupButton);

    expect(mockNavigate).toHaveBeenCalledWith('/book', {
      state: { preferredPackage: 'group' },
    });
  });

  it('navigates to booking page when clicking private plan button', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PricingSection />);

    const privateButton = screen.getByRole('button', { name: 'Start Private Classes' });
    await user.click(privateButton);

    expect(mockNavigate).toHaveBeenCalledWith('/book', {
      state: { preferredPackage: 'private' },
    });
  });

  it('displays discount information', () => {
    renderWithRouter(<PricingSection />);

    expect(screen.getByText(/Family discount/)).toBeInTheDocument();
    expect(screen.getByText(/Annual discount/)).toBeInTheDocument();
  });

  it('has the correct section ID for navigation', () => {
    const { container } = renderWithRouter(<PricingSection />);
    const section = container.querySelector('#pricing');
    expect(section).toBeInTheDocument();
  });
});
