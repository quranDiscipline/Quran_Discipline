// ─── Shared Types — Quran Discipline Academy ───────────────────────────────

export type UserRole = 'admin' | 'teacher' | 'student';
export type Sex = 'male' | 'female';
export type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';
export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ProfileChangeStatus = 'pending' | 'approved' | 'rejected';
export type PackageType =
  | 'foundation'
  | 'mastery'
  | 'advanced'
  | 'group_basic'
  | 'group_premium';
export type CourseType = 'memorization' | 'islamic_studies' | 'understanding';
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  sex: Sex;
  profilePictureUrl: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
