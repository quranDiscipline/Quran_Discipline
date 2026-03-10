import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// In-memory token storage (refresh token in httpOnly cookie, access token in memory)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Send cookies with all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip token refresh for auth endpoints (login, refresh-token, etc.)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    // If 401 and haven't retried yet, and not an auth endpoint
    // Attempt refresh for ANY 401 (even if accessToken is null, might have refresh token cookie)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        if (refreshResponse.data?.data?.accessToken) {
          setAccessToken(refreshResponse.data.data.accessToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        setAccessToken(null);

        // Only redirect if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          // Clear any persisted auth state
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Transform error to consistent format
    const apiError: ApiError = {
      success: false,
      error: {
        message: error.response?.data?.error?.message || 'An unexpected error occurred',
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        statusCode: error.response?.status || 500,
        details: error.response?.data?.error?.details,
      },
    };

    return Promise.reject(apiError);
  },
);

export { api };
export default api;
