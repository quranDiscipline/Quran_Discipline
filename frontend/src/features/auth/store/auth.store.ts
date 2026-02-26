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
        set({ user, isAuthenticated: true, isLoading: false }),

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
            accessToken: response.accessToken,
          });

          setAccessToken(response.accessToken);
        } catch (error) {
          // If refresh fails, logout the user
          await useAuthStore.getState().logout();
          throw error;
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          await useAuthStore.getState().refreshToken();
        } catch {
          // No valid refresh token - user is logged out
        } finally {
          set({ isLoading: false });
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
      // Only persist non-sensitive info - token and loading state are in memory only
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
