// Types for Admin Portal
export interface DashboardStats {
  totalActiveStudents: number;
  totalTeachers: number;
  totalRevenueThisMonth: number;
  newEnrollmentsThisMonth: number;
  pendingBookingRequests: number;
  pendingProfileChanges: number;
  sessionsTodayCount: number;
  averageRating: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  enrollments: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
}

export interface Teacher {
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    sex: 'male' | 'female';
    phoneNumber: string | null;
    whatsappNumber: string | null;
    country: string | null;
    profilePictureUrl: string | null;
    isActive: boolean;
    createdAt: string;
  };
  sex: 'male' | 'female';
  bio: string | null;
  qualifications: string[];
  specializations: string[];
  hourlyRate: number | null;
  totalStudents: number;
  rating: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    sex: 'male' | 'female';
    country: string | null;
    phoneNumber: string | null;
    whatsappNumber: string | null;
    profilePictureUrl: string | null;
    isActive: boolean;
  };
  sex: 'male' | 'female';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  subscriptionStatus: 'trial' | 'active' | 'paused' | 'cancelled';
  enrolledDate: string;
  totalSessionsCompleted: number;
  enrollments?: Enrollment[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  courseType: 'memorization' | 'islamic_studies' | 'understanding';
  durationMonths: number;
  priceMonthly: number;
  maxStudentsPerGroup: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  packageType: 'foundation' | 'mastery' | 'advanced' | 'group_basic' | 'group_premium';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progressPercentage: number;
  createdAt: string;
  student?: { user: { fullName: string } };
  course?: { title: string };
  teacher?: { user: { fullName: string } };
}

export interface BookingRequest {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  sex: 'male' | 'female';
  country: string;
  currentLevel: string;
  preferredPackage: string;
  preferredTeacherSex: string | null;
  message: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  assignedToId: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  zoomLink: string | null;
  assignedTo?: { user: { fullName: string } } | null;
  createdAt: string;
}

export interface ProfileChange {
  id: string;
  teacherId: string;
  requestedChanges: Record<string, any>;
  changeType: 'bio' | 'qualifications' | 'specializations' | 'photo' | 'multiple';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
  adminNotes: string | null;
  teacher: {
    user: {
      fullName: string;
      email: string;
    };
  };
}

export interface Payment {
  id: string;
  studentId: string;
  enrollmentId: string;
  amount: number;
  currency: string;
  paymentMethod: 'paypal' | 'bank_transfer';
  transactionId: string | null;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptUrl: string | null;
  createdAt: string;
  student?: { user: { fullName: string; email: string } };
  enrollment?: { course: { title: string } };
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
