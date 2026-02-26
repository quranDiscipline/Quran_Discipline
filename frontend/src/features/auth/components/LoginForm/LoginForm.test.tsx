import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '../../store/auth.store';

// Mock auth API
vi.mock('../../services/auth.service', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    const { authApi } = await import('../../services/auth.service');
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
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

    render(<LoginForm />, { wrapper });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/student/dashboard');
    });
  });

  it('shows error message on failed login', async () => {
    const { authApi } = await import('../../services/auth.service');
    (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValue({
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

    await user.type(screen.getByLabelText(/email address/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'wrongpassword');
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
    const { authApi } = await import('../../services/auth.service');
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
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

    render(<LoginForm />, { wrapper });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), 'admin@test.com');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });
});
