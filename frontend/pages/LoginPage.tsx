
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { useApp } from '../store/Context';
import { authService } from '../services/authService';

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
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50">
      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col md:flex-row border border-gray-100 animate-in zoom-in-95 duration-500">
        
        {/* Left Side: Branding/Promo */}
        <div className="md:w-1/2 bg-dark p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <Link to="/" className="text-3xl font-bold tracking-tighter mb-8 block">
              FLIPZO<span className="text-primary">KART</span>
            </Link>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Join the <span className="text-primary italic">Premium</span> Marketplace.
            </h2>
            <p className="text-gray-400 text-lg">
              Unlock exclusive deals, track your orders in real-time, and experience lightning-fast delivery across India.
            </p>
          </div>

          <div className="relative z-10 space-y-4 pt-10">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm font-medium">Verified & Secure Payments</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-dark mb-2">Welcome Back</h1>
            <p className="text-gray-400 font-medium">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold text-dark"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold text-dark"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold px-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-dark transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" />
                Remember Me
              </label>
              <Link to="/forgot-password" size={16} className="text-primary hover:underline">Forgot Password?</Link>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
