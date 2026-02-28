import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Total Students" value={150} icon={Users} />);

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders trend when provided', () => {
    render(
      <StatCard
        title="Active Students"
        value={100}
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
    );

    expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    expect(screen.getByText('+12% from last month')).toHaveClass('text-green-600');
  });

  it('renders negative trend with correct styling', () => {
    render(
      <StatCard
        title="Active Students"
        value={100}
        icon={Users}
        trend={{ value: 5, isPositive: false }}
      />
    );

    expect(screen.getByText(/5.*% from last month/)).toBeInTheDocument();
    const trendElement = screen.getByText(/% from last month/);
    expect(trendElement).toHaveClass('text-red-600');
  });

  it('does not render trend when not provided', () => {
    render(<StatCard title="Total Students" value={150} icon={Users} />);

    expect(screen.queryByText(/from last month/)).not.toBeInTheDocument();
  });

  it('renders icon with custom className', () => {
    const { container } = render(
      <StatCard
        title="Total Students"
        value={150}
        icon={Users}
        iconClassName="bg-blue-100 text-blue-600"
      />
    );

    const iconContainer = container.querySelector('.bg-blue-100');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('text-blue-600');
  });

  it('renders string value correctly', () => {
    render(<StatCard title="Revenue" value="$5,000" icon={Users} />);

    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });
});
