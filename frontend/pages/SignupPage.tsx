
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../store/Context';
import authService from '../services/authService';

export const SignupPage: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.register(formData);
      setUser(user);
      navigate('/profile');
      alert("Account created successfully! Welcome.");
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-semibold text-[#1F2937]">Create your Flipzokart account</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2874F0] focus:border-transparent transition-all"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                name="phone"
                type="tel"
                required
                placeholder="Enter your 10-digit phone number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2874F0] focus:border-transparent transition-all"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2874F0] focus:border-transparent transition-all"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input 
                name="password"
                type="password"
                required
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2874F0] focus:border-transparent transition-all"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="text-xs text-gray-500 pt-2">
                By continuing, you agree to Flipzokart's{' '}
                <Link to="/terms" className="font-semibold text-[#2874F0] hover:underline">Terms of Use</Link> and{' '}
                <Link to="/privacy" className="font-semibold text-[#2874F0] hover:underline">Privacy Policy</Link>.
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2874F0] text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Signup'
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#2874F0] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
