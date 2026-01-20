import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{
        background: 'linear-gradient(135deg, #1e63d6 0%, #6fb6ff 100%)',
        color: '#1F2937'
      }}
    >
      <div
        className="w-full max-w-[1100px] h-auto min-h-[560px] flex flex-col md:flex-row rounded-[18px] overflow-hidden animate-[fadeIn_0.6s_ease]"
        style={{
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
        }}
      >

        {/* Left Panel */}
        <div
          className="w-full md:w-[45%] lg:w-[40%] p-12 text-white flex flex-col justify-center"
          style={{ background: 'linear-gradient(180deg, #2874F0 0%, #4f9cff 100%)' }}
        >
          <div className="flex items-center gap-2.5 font-bold text-[22px] mb-10">
            <div className="w-9 h-9 bg-[#F9C74F] text-[#1f3fbf] font-extrabold flex items-center justify-center rounded-lg">f</div>
            Flipzokart
          </div>

          <h1 className="text-[30px] font-bold mb-3 leading-tight">Login</h1>
          <p className="text-[15px] leading-relaxed opacity-95">
            Get access to your<br />
            Orders, Wishlist and<br />
            Recommendations
          </p>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center p-8 bg-transparent">

          <div
            className="w-full max-w-[360px] p-7 rounded-2xl animate-[slideUp_0.6s_ease]"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
            }}
          >
            <h2 className="text-[20px] font-bold mb-[18px] text-[#1F2937]">Login</h2>

            {error && (
              <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Email / Mobile"
                required
                className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm mb-3.5 outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                required
                className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm mb-3.5 outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-[10px] border-none bg-[#2874F0] text-white font-semibold text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? 'Processing...' : 'Login'}
              </button>

              <div className="mt-3.5 text-[13px] text-[#2874F0] cursor-pointer hover:underline text-right">
                <Link to="/forgot-password">Forgot?</Link>
              </div>

              <div className="mt-[18px] text-[13px] text-[#2874F0] text-center">
                New to Flipzokart? <Link to="/signup" className="font-bold hover:underline">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
