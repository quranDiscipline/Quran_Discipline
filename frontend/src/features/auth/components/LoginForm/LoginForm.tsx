import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';

// Using native HTML validation for Phase 2 - will add Zod in Phase 3

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className = '' }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<{
    email: string;
    password: string;
  }>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    try {
      await login(data.email, data.password);

      // Redirect based on role
      const state = useAuthStore.getState();
      const role = state.user?.role;

      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details?.email?.[0] ||
        err.message ||
        'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', { required: true })}
          className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:outline-none disabled:opacity-50"
          placeholder="Enter your email"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password', { required: true })}
            className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:outline-none disabled:opacity-50 pr-10"
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full min-h-[44px] bg-primary text-white rounded-lg font-semibold hover:bg-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:-translate-y-0.5"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary-700 font-medium"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
}
