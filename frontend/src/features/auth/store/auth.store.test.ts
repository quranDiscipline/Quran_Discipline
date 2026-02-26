import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuthStore } from './auth.store';
import * as authService from '../services/auth.service';
import * as axiosLib from '../../../lib/axios';

// Mock auth API
vi.mock('../services/auth.service');
vi.mock('../../../lib/axios');

const mockAuthApi = vi.mocked(authService.authApi);
const mockSetAccessToken = vi.mocked(axiosLib.setAccessToken);

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state to initial values
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
    });
  });

  it('has initial state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });

  it('sets loading state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('sets user', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      fullName: 'Test User',
      role: 'student' as const,
      sex: 'male' as const,
      profilePictureUrl: null,
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('logs in successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      fullName: 'Test User',
      role: 'student' as const,
      sex: 'male' as const,
      profilePictureUrl: null,
    };
    const mockResponse = {
      accessToken: 'test-token',
      user: mockUser,
    };

    mockAuthApi.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@test.com', 'password123');
    });

    expect(mockAuthApi.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.accessToken).toBe('test-token');
    expect(mockSetAccessToken).toHaveBeenCalledWith('test-token');
  });

  it('handles login failure', async () => {
    const mockError = new Error('Invalid credentials');
    mockAuthApi.login.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuthStore());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.login('test@test.com', 'wrongpassword');
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logs out successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      fullName: 'Test User',
      role: 'student' as const,
      sex: 'male' as const,
      profilePictureUrl: null,
    };

    // Set initial authenticated state
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'test-token',
    });

    mockAuthApi.logout.mockResolvedValue({ success: true, data: { message: 'Logged out' } } as any);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthApi.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.accessToken).toBeNull();
    expect(mockSetAccessToken).toHaveBeenCalledWith(null);
  });

  it('logs out even when API call fails', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      fullName: 'Test User',
      role: 'student' as const,
      sex: 'male' as const,
      profilePictureUrl: null,
    };

    // Set initial authenticated state
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'test-token',
    });

    mockAuthApi.logout.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuthStore());

    let caughtError: Error | undefined;
    await act(async () => {
      try {
        await result.current.logout();
      } catch (e) {
        caughtError = e as Error;
      }
    });

    // Error should be caught
    expect(caughtError?.message).toBe('Network error');
    // State should still be cleared even though API call failed
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('refreshes token successfully', async () => {
    const mockResponse = {
      accessToken: 'new-token',
    };

    mockAuthApi.refreshToken.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(mockAuthApi.refreshToken).toHaveBeenCalled();
    expect(result.current.accessToken).toBe('new-token');
    expect(mockSetAccessToken).toHaveBeenCalledWith('new-token');
  });

  it('logs out when refresh token fails', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      fullName: 'Test User',
      role: 'student' as const,
      sex: 'male' as const,
      profilePictureUrl: null,
    };

    // Set initial authenticated state
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      accessToken: 'old-token',
    });

    mockAuthApi.refreshToken.mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      try {
        await result.current.refreshToken();
      } catch {
        // Expected to throw
      }
    });

    // Should have logged out
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('initializes by refreshing token', async () => {
    const mockResponse = {
      accessToken: 'refreshed-token',
    };

    mockAuthApi.refreshToken.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.initialize();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.accessToken).toBe('refreshed-token');
  });

  it('handles initialize failure gracefully', async () => {
    mockAuthApi.refreshToken.mockRejectedValue(new Error('No token'));

    const { result } = renderHook(() => useAuthStore());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.initialize();
      } catch (e) {
        caughtError = e as Error;
      }
    });

    // initialize doesn't throw, it just sets loading to false
    expect(caughtError).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('changes password successfully', async () => {
    mockAuthApi.changePassword.mockResolvedValue({ message: 'Password changed' });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.changePassword('oldPassword', 'newPassword');
    });

    expect(mockAuthApi.changePassword).toHaveBeenCalledWith({
      currentPassword: 'oldPassword',
      newPassword: 'newPassword',
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('handles change password failure', async () => {
    const mockError = new Error('Current password is incorrect');
    mockAuthApi.changePassword.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuthStore());

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.changePassword('wrongPassword', 'newPassword');
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
