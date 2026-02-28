import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className = '' }: LoginFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('admin@qurandiscipline.academy');
  const [password, setPassword] = useState('Admin@1234');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('Submitting login form...', { email });

    try {
      const response = await authApi.login({ email, password });
      console.log('Login successful:', response);

      // Update auth store
      const store = useAuthStore.getState();
      store.setUser(response.user);
      store.setAccessToken(response.accessToken);

      // Redirect based on role
      switch (response.user.role) {
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
      console.error('Login failed:', err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-11 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:outline-none disabled:opacity-50"
          placeholder="Enter your email"
          disabled={isLoading}
        />
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
