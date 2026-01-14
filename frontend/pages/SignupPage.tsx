
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon, Phone, Smartphone, AlertCircle } from 'lucide-react';
import { useApp } from '../store/Context';
import { authService } from '../services/authService';

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
    setFormData(prev => ({ ...prev, [name]: value }));
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
      alert("Account created successfully! Welcome to Flipzokart.");
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 lg:p-12 bg-gray-50/50">
      <div className="w-full max-w-6xl bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col md:flex-row border border-gray-100 animate-in zoom-in-95 duration-500">
        
        {/* Left Branding Panel */}
        <div className="md:w-5/12 bg-dark p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <Link to="/" className="text-3xl font-bold tracking-tighter mb-16 block group">
              FLIPZO<span className="text-primary group-hover:text-white transition-colors">KART</span>
            </Link>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
              Experience <span className="text-primary italic">Better</span> Shopping.
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 bg-white/5 text-primary rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg">Trusted Marketplace</p>
                  <p className="text-sm text-gray-400">Shop with confidence across thousands of verified Indian sellers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Signup Form */}
        <div className="md:w-7/12 p-8 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-bold text-dark mb-3 tracking-tight">Create Your Account</h1>
            <p className="text-gray-400 font-medium">Join our community of 1M+ active shoppers.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5 w-full max-w-md mx-auto md:mx-0">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="name"
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="phone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="email"
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-center md:text-left text-sm text-gray-500 font-medium">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
