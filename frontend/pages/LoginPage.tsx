import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/Context';
import authService from '../services/authService';
import { SmoothReveal } from '../components/SmoothReveal';
import { useToast } from '../components/toast';

export const LoginPage: React.FC = () => {
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
      setTimer(300); // 5 minutes (same as backend TTL)
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
      addToast('success', '✅ Login successful!');
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
        background: '#f1f3f6',
        color: '#1F2937'
      }}
    >
      <SmoothReveal duration="500">
        <div className="flex flex-col md:flex-row w-full max-w-[850px] bg-white rounded-[4px] shadow-lg overflow-hidden min-h-[520px]">

          {/* Left Panel - Branding */}
          <div className="w-full md:w-[40%] bg-[#2874F0] p-10 flex flex-col justify-between text-white relative">
            <div>
              <h2 className="text-[28px] font-semibold mb-4 leading-tight">Login</h2>
              <p className="text-[18px] text-[#dbdbdb] leading-relaxed">
                Get access to your Orders, Wishlist and Recommendations
              </p>
            </div>
            <div className="mt-10 flex justify-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold opacity-50">
                FZ
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full md:w-[60%] p-10 flex flex-col justify-center relative">

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="w-full">
                <div className="relative mb-6">
                  <input
                    type="email"
                    className="w-full border-b-[1px] border-[#e0e0e0] py-2 focus:border-[#2874F0] outline-none text-[15px] peer transition-colors bg-transparent z-10 relative"
                    placeholder=" "
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <label className={`absolute left-0 top-2 text-[#878787] text-[15px] transition-all duration-200 pointer-events-none ${email ? '-top-3 text-[12px] text-[#878787]' : 'peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-[12px] peer-focus:text-[#878787]'}`}>
                    Enter Email Address
                  </label>
                </div>

                <p className="text-[12px] text-[#878787] mb-8">
                  By continuing, you agree to Fzokart's <span className="text-[#2874F0] cursor-pointer hover:underline">Terms of Use</span> and <span className="text-[#2874F0] cursor-pointer hover:underline">Privacy Policy</span>.
                </p>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-[#FB641B] text-white py-3.5 text-[15px] font-medium rounded-[2px] shadow-sm hover:shadow-md transition-shadow disabled:opacity-70"
                >
                  {isLoading ? 'Sending OTP...' : 'Request OTP'}
                </button>

              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="w-full">
                <div className="mb-6">
                  <p className="text-[14px] text-center mb-6 text-[#212121]">
                    Please enter the OTP sent to <br />
                    <span className="font-semibold">{email}</span>
                    <span className="text-[#2874F0] font-medium cursor-pointer ml-2 hover:underline" onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}>Change</span>
                  </p>

                  <div className="flex justify-center gap-3 mb-8">
                    {otp.map((data, index) => {
                      return (
                        <input
                          className="w-10 h-10 border border-[#e0e0e0] rounded text-center text-lg focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] outline-none transition-all"
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
                  className="w-full bg-[#FB641B] text-white py-3.5 text-[15px] font-medium rounded-[2px] shadow-sm hover:shadow-md transition-shadow disabled:opacity-70 mb-4"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>

                <div className="text-center mt-6">
                  {timer > 0 ? (
                    <p className="text-[14px] text-[#878787]">
                      Resend OTP in <span className="text-[#2874F0] font-medium font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[14px] text-[#2874F0] font-medium cursor-pointer hover:underline bg-transparent border-none p-0"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

          </div>
        </div>
      </SmoothReveal>
    </div>
  );
};
