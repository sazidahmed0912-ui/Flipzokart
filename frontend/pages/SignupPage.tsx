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
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[1000px] bg-transparent flex flex-col md:flex-row shadow-none md:h-[600px] overflow-hidden">

        {/* Left Panel - Blue Gradient */}
        <div className="w-full md:w-[40%] bg-[#2874F0] p-10 flex flex-col justify-between text-white md:rounded-l-sm">
          <div>
            <h1 className="text-3xl font-bold mb-6 leading-tight">Looks like you're new here!</h1>
            <p className="text-lg font-medium text-gray-200 leading-relaxed">
              Sign up with your mobile number to get started
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-full h-40 bg-contain bg-no-repeat bg-center opacity-90" style={{ backgroundImage: 'url("https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png")' }}></div>
          </div>
        </div>

        {/* Right Panel - Glass Card Area */}
        <div className="w-full md:w-[60%] bg-white p-10 md:p-14 md:rounded-r-sm relative border border-gray-100 shadow-sm flex flex-col justify-center">

          <div className="absolute inset-0 bg-white/75 backdrop-blur-[18px]" style={{ zIndex: 0 }}></div>

          <div className="relative z-10 w-full max-w-sm mx-auto">

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-fade-in shadow-sm">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">

              {/* Full Name */}
              <div className="group">
                <div className="relative">
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder=" "
                    className="peer w-full px-0 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#2874F0] transition-colors text-gray-800 placeholder-transparent"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <label
                    className="absolute left-0 top-3 text-gray-500 text-base transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#2874F0] peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-not-placeholder-shown:-top-3.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500 cursor-text"
                  >
                    Full Name
                  </label>
                </div>
              </div>

              {/* Phone Number */}
              <div className="group">
                <div className="relative">
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder=" "
                    className="peer w-full px-0 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#2874F0] transition-colors text-gray-800 placeholder-transparent"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <label
                    className="absolute left-0 top-3 text-gray-500 text-base transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#2874F0] peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-not-placeholder-shown:-top-3.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500 cursor-text"
                  >
                    Phone Number
                  </label>
                </div>
              </div>

              {/* Email Address */}
              <div className="group">
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder=" "
                    className="peer w-full px-0 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#2874F0] transition-colors text-gray-800 placeholder-transparent"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <label
                    className="absolute left-0 top-3 text-gray-500 text-base transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#2874F0] peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-not-placeholder-shown:-top-3.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500 cursor-text"
                  >
                    Email Address
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder=" "
                    className="peer w-full px-0 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#2874F0] transition-colors text-gray-800 placeholder-transparent"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <label
                    className="absolute left-0 top-3 text-gray-500 text-base transition-all duration-200 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#2874F0] peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-not-placeholder-shown:-top-3.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-gray-500 cursor-text"
                  >
                    Password
                  </label>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4 leading-relaxed">
                By continuing, you agree to Flipzokart's <Link to="/terms" className="text-[#2874F0] font-medium hover:underline">Terms of Use</Link> and <Link to="/privacy" className="text-[#2874F0] font-medium hover:underline">Privacy Policy</Link>.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FB641B] text-white py-3.5 rounded-[2px] font-semibold text-[15px] shadow-[0_2px_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] transition-shadow disabled:opacity-70 mt-4"
                style={{ backgroundColor: '#FB641B' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Signup'
                )}
              </button>

              <div className="hidden">
                {/* Hidden elements if any needed for strict compliance, but existing logic didn't have much else */}
              </div>

              <div className="mt-8 text-center relative">
                <Link to="/login" className="px-8 py-3 bg-white text-[#2874F0] font-medium text-sm hover:underline shadow-md border border-gray-100 rounded-[2px]">
                  Existing User? Log in
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
