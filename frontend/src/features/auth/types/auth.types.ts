// Shared auth types
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
  sex: 'male' | 'female';
  profilePictureUrl: string | null;
  mustChangePassword?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
