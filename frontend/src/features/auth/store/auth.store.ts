import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/auth.types';
import { authApi } from '../services/auth.service';
import { setAccessToken } from '../../../lib/axios';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

interface AuthActions {
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,

      // Actions
      setUser: (user: AuthUser) =>
        set({ user, isAuthenticated: true, isLoading: false }), // Set both for consistency

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
        // Also update axios instance
        setAccessToken(token);
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            accessToken: response.accessToken,
          });

          setAccessToken(response.accessToken);
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
          });
          setAccessToken(null);
        }
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();

          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.accessToken,
          });

          setAccessToken(response.accessToken);
        } catch (error) {
          // If refresh fails, clear auth state (but don't call logout API to avoid recursive calls)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
          });
          setAccessToken(null);
          throw error;
        }
      },

      initialize: async () => {
        // Try to refresh token using the httpOnly cookie
        set({ isLoading: true });
        try {
          const response = await authApi.refreshToken();
          // If successful, restore session
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            accessToken: response.accessToken,
          });
          setAccessToken(response.accessToken);
        } catch {
          // No valid refresh token - user is logged out, clear everything
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
          });
          setAccessToken(null);
          // Also clear localStorage
          localStorage.removeItem('quran-academy-auth');
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await authApi.changePassword({ currentPassword, newPassword });
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'quran-academy-auth',
      // Only persist user info (for welcome message, etc.) - NOT isAuthenticated
      // isAuthenticated should be derived from valid token
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
);
