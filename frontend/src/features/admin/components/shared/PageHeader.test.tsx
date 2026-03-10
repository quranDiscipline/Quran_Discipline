import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title correctly', () => {
    render(<PageHeader title="Teachers" />);

    expect(screen.getByText('Teachers')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Teachers" subtitle="Manage your teaching staff" />);

    expect(screen.getByText('Manage your teaching staff')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Teachers" />);

    expect(screen.queryByText(/Manage/)).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const handleClick = vi.fn();
    render(
      <PageHeader
        title="Teachers"
        action={{ label: 'Add Teacher', onClick: handleClick }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Teacher' });
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PageHeader
        title="Teachers"
        action={{ label: 'Add Teacher', onClick: handleClick }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Teacher' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders action icon when provided', () => {
    render(
      <PageHeader
        title="Teachers"
        action={{
          label: 'Add Teacher',
          onClick: () => {},
          leftIcon: <span data-testid="action-icon">+</span>,
        }}
      />
    );

    expect(screen.getByTestId('action-icon')).toBeInTheDocument();
  });
});
