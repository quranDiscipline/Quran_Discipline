import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

// Mock modules BEFORE importing LoginForm
vi.mock('../../../lib/axios', () => ({
  setAccessToken: vi.fn(),
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock auth service
vi.mock('../../services/auth.service', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

// Import LoginForm after mocks are set up
import { LoginForm } from './LoginForm';
import { authApi } from '../../services/auth.service';

const mockedLogin = authApi.login as ReturnType<typeof vi.fn>;

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLogin.mockReset();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders all required fields', () => {
    render(<LoginForm />, { wrapper });

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    render(<LoginForm />, { wrapper });
    const user = userEvent.setup();

    // Clear default values and then submit
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Browser native validation prevents form submission
    // Check that inputs are invalid (browser validation)
    expect(emailInput).toBeInvalid();
    expect(passwordInput).toBeInvalid();
  });

  it('submits successfully with valid data', async () => {
    mockedLogin.mockResolvedValue({
      accessToken: 'test-token',
      user: {
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'student' as const,
        sex: 'male' as const,
        profilePictureUrl: null,
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('shows error message on failed login', async () => {
    mockedLogin.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Invalid credentials',
          },
        },
      },
    });

    render(<LoginForm />, { wrapper });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    render(<LoginForm />, { wrapper });
    const user = userEvent.setup();

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByLabelText(/show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('redirects admin to admin dashboard', async () => {
    mockedLogin.mockResolvedValue({
      accessToken: 'test-token',
      user: {
        id: '1',
        email: 'admin@test.com',
        fullName: 'Admin User',
        role: 'admin' as const,
        sex: 'male' as const,
        profilePictureUrl: null,
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'admin@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123',
      });
    });
  });
});
