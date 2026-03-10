// Types for Admin Portal
export interface DashboardStats {
  totalActiveStudents: number;
  totalTeachers: number;
  totalActiveTeachers?: number; // Alternative name
  totalRevenueThisMonth: number;
  newEnrollmentsThisMonth: number;
  pendingBookingRequests: number;
  pendingBookings?: number; // Alternative name
  pendingProfileChanges: number;
  sessionsTodayCount: number;
  averageRating: number;
  totalActiveCourses?: number;
  totalCourses?: number;
}

export interface StudentStats {
  totalSessions: number;
  completedSessions: number;
  currentStreak: number;
  progressOverview: {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    averageProgress: number;
  };
}

export interface TeacherStats {
  totalStudents: number;
  activeSessions: number;
  rating: number;
  joinedDate: string; // API returns string, not Date
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  enrollments: number;
}

export interface BreakdownItem {
  label: string;
  name?: string; // Alternative for chart components
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
  activeStudentsCount?: number; // From getTeacherStats
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
  country?: string | null; // Duplicate of user.country for convenience
  timezone?: string | null;
  packageType?: 'foundation' | 'mastery' | 'advanced' | 'group_basic' | 'group_premium';
  activeEnrollmentsCount?: number; // From _count
  enrollments?: Enrollment[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  courseType: 'memorization' | 'islamic_studies' | 'understanding';
  durationMonths: number;
  durationWeeks?: number; // Alternative duration unit
  priceMonthly: number;
  basePrice?: number; // Alternative pricing
  maxStudentsPerGroup: number | null;
  activeEnrollmentsCount?: number; // From _count
  imageUrl?: string | null; // Course thumbnail/image
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
  student?: { user: { fullName: string; email?: string } };
  course?: { title: string; courseType?: string };
  teacher?: { user: { fullName: string } };
}

export interface BookingRequest {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  phone?: string; // Alias for whatsappNumber
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
  assignedTeacher?: { user: { fullName: string } } | null; // Alternative name
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
  createdAt: string; // Added
  reviewedAt: string | null;
  reviewedById: string | null;
  adminNotes: string | null;
  teacher: {
    user: {
      fullName: string;
      email: string;
      profilePictureUrl?: string | null; // Added
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
  enrollment?: {
    course: { title: string };
    student?: { user: { fullName: string; email?: string } };
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
