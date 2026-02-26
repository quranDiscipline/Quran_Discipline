import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from './useAuth';
import { useAuthStore } from '../store/auth.store';

// Mock the auth store
vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns auth state from store', () => {
    const mockState = {
      user: {
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'student' as const,
        sex: 'male' as const,
        profilePictureUrl: null,
      },
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'test-token',
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      setAccessToken: vi.fn(),
      initialize: vi.fn(),
      changePassword: vi.fn(),
      setUser: vi.fn(),
      setLoading: vi.fn(),
    };

    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockState);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockState.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns login function from store', () => {
    const mockLogin = vi.fn();
    const mockState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      login: mockLogin,
      logout: vi.fn(),
      refreshToken: vi.fn(),
      setAccessToken: vi.fn(),
      initialize: vi.fn(),
      changePassword: vi.fn(),
      setUser: vi.fn(),
      setLoading: vi.fn(),
    };

    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockState);

    const { result } = renderHook(() => useAuth());

    expect(result.current.login).toBe(mockLogin);
  });

  it('returns logout function from store', () => {
    const mockLogout = vi.fn();
    const mockState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      login: vi.fn(),
      logout: mockLogout,
      refreshToken: vi.fn(),
      setAccessToken: vi.fn(),
      initialize: vi.fn(),
      changePassword: vi.fn(),
      setUser: vi.fn(),
      setLoading: vi.fn(),
    };

    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockState);

    const { result } = renderHook(() => useAuth());

    expect(result.current.logout).toBe(mockLogout);
  });

  it('returns changePassword function from store', () => {
    const mockChangePassword = vi.fn();
    const mockState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      setAccessToken: vi.fn(),
      initialize: vi.fn(),
      changePassword: mockChangePassword,
      setUser: vi.fn(),
      setLoading: vi.fn(),
    };

    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockState);

    const { result } = renderHook(() => useAuth());

    expect(result.current.changePassword).toBeDefined();
    expect(typeof result.current.changePassword).toBe('function');
  });

  it('returns changePassword function from store', () => {
    const mockChangePassword = vi.fn();
    const mockState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      setAccessToken: vi.fn(),
      initialize: vi.fn(),
      changePassword: mockChangePassword,
      setUser: vi.fn(),
      setLoading: vi.fn(),
    };

    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockState);

    const { result } = renderHook(() => useAuth());

    expect(result.current.changePassword).toBe(mockChangePassword);
  });
});
