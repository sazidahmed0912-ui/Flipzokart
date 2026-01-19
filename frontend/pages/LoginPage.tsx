
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../store/Context';
import authService from '../services/authService';

export const LoginPage: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authService.login({ email, password });
      setUser(user);
      navigate(user.role === 'admin' ? '/admin' : '/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-[#1F2937]">Login to Flipzokart</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email or Mobile</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email or mobile"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2874F0] focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password"  className="text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2874F0] focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
               <div className="text-right">
                <Link to="/forgot-password" className="text-xs font-semibold text-[#2874F0] hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2874F0] text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="relative my-8">
            <hr className="border-gray-300" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2 text-sm text-gray-500">OR</span>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              New to Flipzokart?{' '}
              <Link to="/signup" className="font-semibold text-[#2874F0] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
