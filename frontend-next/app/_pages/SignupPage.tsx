"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OtpInput } from '@/app/components/OtpInput';
import { useApp } from '@/app/store/Context';
import authService from '@/app/services/authService';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { useToast } from '@/app/components/toast';

export const SignupPage: React.FC = () => {
  const { setUser } = useApp();
  const router = useRouter();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || !password.trim()) {
      addToast('error', 'Please fill all required fields correctly');
      return;
    }
    if (!acceptedTerms) {
      addToast('error', 'Please agree to the Terms & Conditions');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendEmailOtp(email);
      setStep(2);
      setTimer(300); // 5 minutes
      addToast('success', 'OTP Sent to your verified email!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };



  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      addToast('error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.verifyEmailOtp(email, otpCode, { name, phone, password });
      setUser(user);
      addToast('success', '✅ Registration successful!');
      router.push(user.role === 'admin' ? '/admin' : '/profile');
    } catch (err: any) {
      addToast('error', err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await authService.sendEmailOtp(email);
      setTimer(300);
      addToast('success', 'OTP Resent!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{
        background: 'linear-gradient(135deg, #1e63d6 0%, #6fb6ff 100%)', // Legacy Gradient
        color: '#1F2937'
      }}
    >
      <SmoothReveal duration="500">
        <div
          className="w-full max-w-[1100px] h-auto min-h-[560px] flex flex-col md:flex-row rounded-[18px] overflow-hidden"
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
            className="w-full md:w-[45%] lg:w-[40%] p-12 text-white flex flex-col justify-center"
            style={{ background: 'linear-gradient(180deg, #2874F0 0%, #4f9cff 100%)' }}
          >
            <div className="flex items-center gap-2.5 font-bold text-[22px] mb-10">
              <div className="w-9 h-9 bg-[#F9C74F] text-[#1f3fbf] font-extrabold flex items-center justify-center rounded-lg">F</div>
              Fzokart
            </div>

            <h1 className="text-[30px] font-bold mb-3 leading-tight">Signup</h1>
            <p className="text-[15px] leading-relaxed opacity-95">
              Sign up with your details<br />
              to get started today!
            </p>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex items-center justify-center p-8 bg-transparent">
            {/* Signup Card */}
            <SmoothReveal direction="up" delay={200} className="w-full max-w-[360px]">
              <div
                className="p-7 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                }}
              >
                <h2 className="text-[20px] font-bold mb-[5px] text-[#1F2937]">Looks like you're new here!</h2>
                <p className="text-[13px] text-[#4B5563] mb-[18px]">Sign up with your email to get started</p>

                {step === 1 ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="space-y-4 mb-[18px]">
                      {/* Name Input */}
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                      />

                      {/* Mobile Number Input */}
                      <input
                        type="tel"
                        placeholder="Mobile Number (Optional)"
                        className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                      />

                      {/* Email Input */}
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />

                      {/* Password Input */}
                      <input
                        type="password"
                        placeholder="Set Password"
                        required
                        className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-start gap-2 mb-4 px-1">
                      <input
                        type="checkbox"
                        id="terms-checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#2874F0] border-gray-300 rounded focus:ring-[#2874F0] cursor-pointer"
                      />
                      <label htmlFor="terms-checkbox" className="text-[12px] text-[#4B5563] leading-tight cursor-pointer">
                        I agree to Fzokart's <Link href="/terms-of-service" className="text-[#2874F0] hover:underline font-medium">Terms of Use</Link> and <Link href="/privacy-policy" className="text-[#2874F0] hover:underline font-medium">Privacy Policy</Link>.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email || !name || !password || !acceptedTerms}
                      className="w-full h-11 rounded-[10px] border-none bg-[#F9C74F] text-[#1F2937] font-semibold text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 flex items-center justify-center disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Sending OTP...' : 'Continue'}
                    </button>

                    <div className="mt-[18px] text-[13px] text-[#2874F0] text-center">
                      Already have an account? <Link href="/login" className="font-bold hover:underline" style={{ color: '#FF3333' }}>Login</Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-6">
                      <p className="text-[13px] text-center mb-4 text-[#4B5563]">
                        Enter OTP sent to <span className="font-semibold text-[#1F2937]">{email}</span>
                        <span className="text-[#2874F0] font-medium cursor-pointer ml-2 hover:underline" onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}>Change</span>
                      </p>

                      <div className="w-full mb-6">
                        <OtpInput
                          length={6}
                          value={otp}
                          onChange={setOtp}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-[10px] border-none bg-[#F9C74F] text-[#1F2937] font-semibold text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 mb-4 flex items-center justify-center"
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Signup'}
                    </button>

                    <div className="text-center mt-4">
                      {timer > 0 ? (
                        <p className="text-[13px] text-[#6B7280]">
                          Resend OTP in <span className="text-[#2874F0] font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-[13px] text-[#2874F0] font-medium cursor-pointer hover:underline bg-transparent border-none p-0"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </SmoothReveal>
          </div>
        </div>
      </SmoothReveal>
    </div>
  );
};
