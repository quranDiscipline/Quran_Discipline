import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';

interface TestItem {
  id: string;
  name: string;
  email: string;
  status: string;
}

const mockData: TestItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

const mockColumns: Column<TestItem>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (item) => <span data-testid={`status-${item.id}`}>{item.status}</span>,
  },
];

describe('DataTable', () => {
  it('renders headers correctly', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders custom cell render function', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByTestId('status-1')).toHaveTextContent('active');
    expect(screen.getByTestId('status-2')).toHaveTextContent('inactive');
  });

  it('shows empty message when no data', () => {
    render(<DataTable columns={mockColumns} data={[]} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(
      <DataTable columns={mockColumns} data={[]} emptyMessage="No teachers found" />
    );

    expect(screen.getByText('No teachers found')).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(
      <DataTable columns={mockColumns} data={[]} isLoading={true} />
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders search input when search prop is provided', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        search={{ value: '', onChange: onSearchChange }}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, 'John');
    // Search input calls onChange on each keystroke
    expect(onSearchChange).toHaveBeenCalled();
  });

  it('renders search with custom placeholder', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        search={{ value: '', onChange: vi.fn(), placeholder: 'Search teachers...' }}
      />
    );

    expect(screen.getByPlaceholderText('Search teachers...')).toBeInTheDocument();
  });

  it('shows clear button when search has value', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        search={{ value: 'test', onChange: vi.fn() }}
      />
    );

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('renders pagination controls when pagination is provided', () => {
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
          onPageChange,
        }}
      />
    );

    expect(screen.getByText(/Showing 21 to 40 of 50 results/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/ })).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3,
          onPageChange,
        }}
      />
    );

    const prevButton = screen.getByRole('button', { name: /Previous/ });
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 3,
          limit: 20,
          total: 50,
          totalPages: 3,
          onPageChange,
        }}
      />
    );

    const nextButton = screen.getByRole('button', { name: /Next/ });
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when pagination button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
          onPageChange,
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: /Next/ }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('renders action buttons when actions prop is provided', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actions={(item) => (
          <button data-testid={`edit-${item.id}`}>Edit</button>
        )}
      />
    );

    expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    expect(screen.getByTestId('edit-2')).toBeInTheDocument();
    expect(screen.getByTestId('edit-3')).toBeInTheDocument();
  });

  it('renders Actions header when actions prop is provided', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actions={() => <button>Edit</button>}
      />
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
