import api from '../../../lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '../types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<{ success: true; data: LoginResponse }>(
      '/auth/login',
      data,
      { withCredentials: true }, // Important for httpOnly cookie
    );
    return response.data.data;
  },

  logout: async (): Promise<{ success: true; data: { message: string } }> => {
    const response = await api.post('/auth/logout', null, {
      withCredentials: true,
    });
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<{ success: true; data: RefreshTokenResponse }>(
      '/auth/refresh-token',
      null,
      {
        withCredentials: true,
      },
    );
    return response.data.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ success: true; data: { message: string } }>(
      '/auth/forgot-password',
      data,
    );
    return response.data.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ success: true; data: { message: string } }>(
      '/auth/reset-password',
      data,
    );
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.patch<{ success: true; data: { message: string } }>(
      '/auth/change-password',
      data,
    );
    return response.data.data;
  },
};
