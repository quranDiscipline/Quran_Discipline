import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';

// Mock auth store helper for testing
const mockAuthState = vi.fn();

vi.mock('../../features/auth/store/auth.store', () => ({
  useAuthStore: () => mockAuthState(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestComponent = () => <div>Protected Content</div>;

  it('shows loading spinner when isLoading is true', () => {
    mockAuthState.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockAuthState.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<TestComponent />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockAuthState.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
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
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('redirects to change-password when mustChangePassword is true', () => {
    mockAuthState.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'student' as const,
        sex: 'male' as const,
        profilePictureUrl: null,
        mustChangePassword: true,
      },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<TestComponent />} />
          </Route>
          <Route path="/change-password" element={<div>Change Password</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/change password/i)).toBeInTheDocument();
  });
});

describe('RoleRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestComponent = () => <div>Role Protected Content</div>;

  it('renders children when user has correct role', () => {
    mockAuthState.mockReturnValue({
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
        <RoleRoute allowedRoles={['admin']}>
          <TestComponent />
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/role protected content/i)).toBeInTheDocument();
  });

  it('does not render children when user has wrong role', () => {
    mockAuthState.mockReturnValue({
      user: {
        id: '1',
        email: 'student@test.com',
        fullName: 'Student User',
        role: 'student' as const,
        sex: 'male' as const,
        profilePictureUrl: null,
      },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles={['admin']}>
          <TestComponent />
        </RoleRoute>
      </MemoryRouter>
    );

    const redirectedText = screen.queryByText(/role protected content/i);
    expect(redirectedText).not.toBeInTheDocument();
  });

  it('does not render children when user is not logged in', () => {
    mockAuthState.mockReturnValue({
      user: null,
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles={['admin']}>
          <TestComponent />
        </RoleRoute>
      </MemoryRouter>
    );

    const redirectedText = screen.queryByText(/role protected content/i);
    expect(redirectedText).not.toBeInTheDocument();
  });
});
