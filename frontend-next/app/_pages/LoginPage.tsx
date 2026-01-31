"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OtpInput } from '@/app/components/OtpInput';
import { useApp } from '@/app/store/Context';
import authService from '@/app/services/authService';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { useToast } from '@/app/components/toast';
import { Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  isAdmin?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isAdmin }) => {
  const { setUser } = useApp();
  const router = useRouter();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!email.includes('@')) {
      addToast('error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendEmailOtp(email);
      setOtpSent(true);
      setTimer(300); // 5 minutes
      addToast('success', 'OTP Sent to your email!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');
    const hasPassword = password.trim().length > 0;
    const hasOtp = otpCode.length === 6;

    if (!email) {
      addToast('error', 'Email is required');
      return;
    }

    if (!hasPassword && !hasOtp) {
      addToast('error', 'Please enter Password OR valid OTP');
      return;
    }

    setIsLoading(true);
    try {
      let user;

      if (hasPassword) {
        // LOGIN WITH PASSWORD
        console.log('Logging in with Password...');
        user = await authService.login({ email, password });
      } else {
        // LOGIN WITH OTP
        console.log('Logging in with OTP...');
        user = await authService.verifyEmailOtp(email, otpCode);
      }

      setUser(user);
      addToast('success', '✅ Login successful!');
      router.push(user.role === 'admin' ? '/admin' : '/profile');

    } catch (err: any) {
      addToast('error', err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-0 md:p-4 font-sans"
      style={{
        background: 'linear-gradient(135deg, #1e63d6 0%, #6fb6ff 100%)', // Legacy Gradient
        color: '#1F2937'
      }}
    >
      <SmoothReveal duration="500" className="w-full md:w-auto">
        <div
          className="w-full md:max-w-[1100px] h-auto min-h-screen md:min-h-[560px] flex flex-col md:flex-row md:rounded-[18px] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.25)', // Legacy Glassmorphism
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
          }}
        >
          {/* Left Panel */}
          <div
            className="w-full md:w-[45%] lg:w-[40%] p-6 py-8 md:p-12 text-white flex flex-col justify-center min-h-[30vh] md:min-h-auto"
            style={{ background: 'linear-gradient(180deg, #2874F0 0%, #4f9cff 100%)' }}
          >
            <div className="flex items-center gap-2.5 font-bold text-[16px] md:text-[22px] mb-4 md:mb-10">
              <div className="w-9 h-9 bg-[#F9C74F] text-[#1f3fbf] font-extrabold flex items-center justify-center rounded-lg">F</div>
              Fzokart
            </div>

            <h1 className="text-[18px] md:text-[30px] font-bold mb-2 md:mb-3 leading-tight">{isAdmin ? 'Admin Login' : 'Login'}</h1>
            <p className="text-[12px] md:text-[15px] leading-relaxed opacity-95">
              Get access to your<br />
              Orders, Wishlist and<br />
              Recommendations
            </p>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-transparent -mt-6 md:mt-0">
            {/* Login Card */}
            <SmoothReveal direction="up" delay={200} className="w-full md:w-auto md:max-w-[360px]">
              <div
                className="p-5 md:p-7 rounded-xl md:rounded-2xl w-[94%] md:w-full mx-auto shadow-sm md:shadow-none"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)' // Kept consistent but handled via style for blur
                }}
              >
                <h2 className="text-[17px] md:text-[20px] font-bold mb-[5px] text-[#1F2937]">Welcome Back!</h2>
                <p className="text-[12px] md:text-[13px] text-[#4B5563] mb-[15px] md:mb-[20px]">Login with Password OR OTP</p>

                <form onSubmit={handleLogin}>
                  <div className="space-y-3 md:space-y-5 mb-[20px]">

                    {/* EMAIL INPUT */}
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      className="w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />

                    {/* PASSWORD INPUT */}
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 pr-10 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 md:top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} className="md:w-[18px] md:h-[18px]" /> : <Eye size={16} className="md:w-[18px] md:h-[18px]" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 my-2 text-[#6B7280] text-[11px] md:text-[12px] font-medium before:h-[1px] before:flex-1 before:bg-[#d1d5db] after:h-[1px] after:flex-1 after:bg-[#d1d5db]">
                      OR LOGIN WITH OTP
                    </div>

                    {/* OTP SECTION */}
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] md:text-[12px] font-semibold text-[#4B5563]">OTP Code</label>
                        {otpSent ? (
                          timer > 0 ? (
                            <span className="text-[11px] text-[#2874F0] font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="text-[11px] text-[#2874F0] font-bold cursor-pointer hover:underline bg-transparent border-none p-0"
                            >
                              RESEND OTP
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isLoading || !email}
                            className="text-[11px] text-[#2874F0] font-bold cursor-pointer hover:underline bg-transparent border-none p-0 disabled:opacity-50"
                          >
                            GET OTP
                          </button>
                        )}
                      </div>

                      {/* CONDITIONAL OTP INPUTS */}
                      {otpSent && (
                        <div className="w-full">
                          <OtpInput
                            length={6}
                            value={otp}
                            onChange={setOtp}
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </div>


                  </div>

                  {/* LOGIN / VERIFY BUTTON */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[44px] md:h-11 rounded-[10px] border-none bg-[#F9C74F] text-[#1F2937] font-semibold text-[14px] md:text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 flex items-center justify-center mb-4"
                  >
                    {isLoading ? 'Processing...' : (otpSent ? 'Verify OTP' : 'Login')}
                  </button>

                  <p className="text-[10px] md:text-[11px] text-[#878787] mb-2 text-center">
                    By continuing, you agree to Fzokart's <Link href="/terms-of-service" className="text-[#2874F0] cursor-pointer hover:underline">Terms of Use</Link> and <Link href="/privacy-policy" className="text-[#2874F0] cursor-pointer hover:underline">Privacy Policy</Link>.
                  </p>

                  <div className="text-[12px] md:text-[13px] text-[#2874F0] text-center">
                    New to Fzokart? <Link href="/signup" className="font-bold hover:underline" style={{ color: '#FF3333' }}>Sign up</Link>
                  </div>
                </form>
              </div>
            </SmoothReveal>
          </div>
        </div>
      </SmoothReveal>
    </div>
  );
};
