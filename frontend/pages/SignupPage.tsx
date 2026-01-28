import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/Context';
import authService from '../services/authService';
import { SmoothReveal } from '../components/SmoothReveal';
import { useToast } from '../components/toast';

export const SignupPage: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!email.includes('@')) {
      addToast('error', 'Please enter a valid email address');
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

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
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
      const user = await authService.verifyEmailOtp(email, otpCode);
      setUser(user);
      addToast('success', '✅ Registration successful!');
      navigate(user.role === 'admin' ? '/admin' : '/profile');
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

            <h1 className="text-[30px] font-bold mb-3 leading-tight">Login</h1>
            <p className="text-[15px] leading-relaxed opacity-95">
              Get access to your<br />
              Orders, Wishlist and<br />
              Recommendations
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
                    <div className="mb-[18px]">
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full h-11 rounded-[10px] border-none bg-[#F9C74F] text-[#1F2937] font-semibold text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 flex items-center justify-center"
                    >
                      {isLoading ? 'Sending OTP...' : 'Continue'}
                    </button>

                    <div className="mt-[18px] text-[13px] text-[#2874F0] text-center">
                      Already have an account? <Link to="/login" className="font-bold hover:underline" style={{ color: '#FF3333' }}>Login</Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-6">
                      <p className="text-[13px] text-center mb-4 text-[#4B5563]">
                        Enter OTP sent to <span className="font-semibold text-[#1F2937]">{email}</span>
                        <span className="text-[#2874F0] font-medium cursor-pointer ml-2 hover:underline" onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}>Change</span>
                      </p>

                      <div className="flex justify-center gap-2 mb-6">
                        {otp.map((data, index) => {
                          return (
                            <input
                              className="w-10 h-10 border border-[#d1d5db] rounded-[8px] text-center text-lg bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] outline-none transition-all"
                              type="text"
                              name="otp"
                              maxLength={1}
                              key={index}
                              value={data}
                              onChange={e => handleOtpChange(e.target, index)}
                              onFocus={e => e.target.select()}
                            />
                          );
                        })}
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
