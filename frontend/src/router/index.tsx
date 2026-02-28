import { useState, useEffect } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from '../components/layout/ProtectedRoute';
import { AdminLayout } from '../components/layout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import {
  AdminDashboard,
  TeachersList,
  StudentsList,
  CoursesList,
  EnrollmentsList,
  BookingRequestsList,
  ProfileChangesList,
  PaymentsList,
} from '../features/admin';
import { authApi } from '../features/auth/services/auth.service';
import { useAuthStore } from '../features/auth/store/auth.store';

// Placeholder components for Phase 2
function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Quran Discipline Academy
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome! Learn Quran with discipline and consistency.
        </p>
        <a
          href="/login"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}

function DashboardPlaceholder({ role }: { role: string }) {
  const { logout } = useAuthStore.getState();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-primary mb-4">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Phase 2 — Authentication complete. Dashboard coming in Phase 3-5.
          </p>
          {import.meta.env.DEV && (
            <div className="bg-gray-100 rounded-lg p-4 text-sm">
              <p className="font-mono mb-2">Logged in as:</p>
              <code className="block">
                {JSON.stringify(useAuthStore.getState().user, null, 2)}
              </code>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="text-primary hover:text-primary-700 font-medium"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit request');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-primary mb-4">Check your email</h1>
          <p className="text-gray-600">
            If the email exists, a reset link has been sent.
          </p>
          <a href="/login" className="text-primary hover:text-primary-700 font-medium">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Forgot Password?</h1>
        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full min-h-[44px] bg-primary text-white rounded-lg font-semibold hover:bg-primary-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            Send Reset Link
          </button>
          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-primary hover:text-primary-700 font-medium"
            >
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSubmitted(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error?.message || 'Failed to reset password');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-primary mb-4">Password Reset Successful</h1>
          <p className="text-gray-600 mb-6">
            Your password has been reset. You can now log in with your new password.
          </p>
          <a
            href="/login"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <a
            href="/forgot-password"
            className="text-primary hover:text-primary-700 font-medium"
          >
            Request a new link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Reset Password</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              pattern="^(?=.*[A-Z])(?=.*\d)"
              title="Must contain at least 1 uppercase letter and 1 number"
              className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:outline-none"
              placeholder="Enter your new password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-primary text-white rounded-lg font-semibold hover:bg-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:-translate-y-0.5"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-primary hover:text-primary-700 font-medium"
            >
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <a
          href="/login"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      // Admin Routes
      {
        path: '/admin',
        element: (
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'teachers', element: <TeachersList /> },
          { path: 'students', element: <StudentsList /> },
          { path: 'courses', element: <CoursesList /> },
          { path: 'enrollments', element: <EnrollmentsList /> },
          { path: 'booking-requests', element: <BookingRequestsList /> },
          { path: 'profile-changes', element: <ProfileChangesList /> },
          { path: 'payments', element: <PaymentsList /> },
        ],
      },
      // Teacher Dashboard (placeholder)
      {
        path: '/teacher/dashboard',
        element: (
          <RoleRoute allowedRoles={['teacher']}>
            <DashboardPlaceholder role="teacher" />
          </RoleRoute>
        ),
      },
      // Student Dashboard (placeholder)
      {
        path: '/student/dashboard',
        element: (
          <RoleRoute allowedRoles={['student']}>
            <DashboardPlaceholder role="student" />
          </RoleRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
