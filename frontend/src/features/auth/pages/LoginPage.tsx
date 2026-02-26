import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Quran Discipline Academy</h1>
          <p className="text-2xl text-primary-100 mb-8">
            "Discipline Transforms. Consistency Wins."
          </p>
          <ul className="space-y-4 text-primary-100">
            <li className="flex items-start gap-3">
              <span className="text-primary-300">•</span>
              <span>Structured Quran memorization program</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-300">•</span>
              <span>Qualified teachers from Al-Azhar</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-300">•</span>
              <span>Flexible scheduling for busy lives</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-8">Sign in to your account</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
