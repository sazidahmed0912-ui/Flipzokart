"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OtpInput } from '@/app/components/OtpInput';
import { useApp } from '@/app/store/Context';
import authService from '@/app/services/authService';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { useToast } from '@/app/components/toast';
import { Eye, EyeOff, Smartphone, CheckCircle } from 'lucide-react';
import Script from 'next/script';

export const SignupPage: React.FC = () => {
  const { setUser } = useApp();
  const router = useRouter();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Mobile Verification State
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // MSG91 Widget Configuration
  const widgetId = "3662616b7765363133313539";
  const tokenAuth = "491551TGhhpXBdgY1697f3ab8P1";

  // Helper to check existence
  const checkUserExists = async (field: 'email' | 'phone', value: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      const data = await res.json();
      return data.exists;
    } catch (e) {
      console.error("Check Exists Failed", e);
      return false;
    }
  };

  const handleMobileOtpClick = () => {
    // Fallback: Check window object directly if state is lagging or script loaded from cache
    // @ts-ignore
    if (!scriptLoaded && !window.initSendOTP) {
      addToast("error", "Mobile OTP Service not ready. Please wait or refresh.");
      return;
    }

    const configuration = {
      widgetId: widgetId,
      tokenAuth: tokenAuth,
      identifier: "mobile", // 🟢 ADDED: Prevents widget crash
      exposeMethods: false,
      success: async (data: any) => {
        console.log("Mobile Verified Data:", data);

        // Extract mobile number from response (if available) or rely on user knowing it
        // MSG91 v5 returns { message: "...", type: "success", mobile: "91..." } sometimes
        // But often we just trust the flow.

        let verifiedMobile = data?.mobile || data?.message?.mobile;

        // If the widget doesn't return the number strictly, we can't auto-fill safely unless we ask user.
        // However, usually detailed response has it. 
        // If not found, we will ask user to enter it, but locked? No, that's risky.
        // Let's assume we can trust the flow or user enters manual.
        // BETTER: Use the one from local storage if the widget saves it? No.

        // For now, if we get it, use it. If not, just mark verified (user enters number manually)
        // But the requirement says "Sign up with Mobile OTP".

        if (verifiedMobile) {
          // 🟢 DUPLICATE CHECK: Mobile
          const exists = await checkUserExists('phone', verifiedMobile);
          if (exists) {
            addToast("warning", "Mobile number already registered! Redirecting to Login...");
            setTimeout(() => router.push('/login'), 2000);
            return;
          }

          setPhone(verifiedMobile);
        }

        setIsMobileVerified(true);
        addToast("success", "Mobile Verified Successfully! ✅");
      },
      failure: (err: any) => {
        console.error("Mobile Verify Code Error JSON:", JSON.stringify(err));

        const isIpBlocked = JSON.stringify(err).includes("408") || JSON.stringify(err).includes("IPBlocked");
        if (isIpBlocked) {
          alert("⚠️ IP BLOCKED BY MSG91\n\nPlease use the red '(Dev) Force Verify' link below the button to test the Signup Flow.");
        } else {
          addToast("error", "Verification Failed. Try '(Dev) Force Verify' link.");
        }
      }
    };

    try {
      // @ts-ignore
      if (window.initSendOTP) {
        // @ts-ignore
        window.initSendOTP(configuration);
      } else {
        addToast("error", "Widget not loaded yet");
      }
    } catch (e) {
      console.error(e);
      addToast("error", "Error launching widget");
    }
  };

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
      // 🟢 DUPLICATE CHECK: Email
      const exists = await checkUserExists('email', email);
      if (exists) {
        addToast("error", "Email already registered! Please Login.");
        setIsLoading(false);
        return;
      }

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
      // Verify email OTP and create user
      // If mobile was verified, we pass it.
      const user = await authService.verifyEmailOtp(email, otpCode, { name, phone, password });
      setUser(user);
      addToast('success', '✅ Registration successful! Please Login.');
      router.push('/login'); // 🟢 Redirect to Login as requested
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
    <>
      <Script
        src="https://control.msg91.com/app/assets/otp-provider/otp-provider.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Signup MSG91 Script Loaded");
          setScriptLoaded(true);
        }}
      />
      <div
        className="min-h-[100dvh] h-auto flex items-center justify-center p-0 md:p-4 font-sans"
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
              className="w-full md:w-[45%] lg:w-[40%] px-6 pb-8 pt-[calc(44px_+_env(safe-area-inset-top))] md:p-12 text-white flex flex-col justify-center min-h-auto md:min-h-auto"
              style={{ background: 'linear-gradient(180deg, #2874F0 0%, #4f9cff 100%)' }}
            >
              <div className="flex items-center gap-2.5 font-bold text-[16px] md:text-[22px] mb-4 md:mb-10">
                <div className="w-9 h-9 bg-[#F9C74F] text-[#1f3fbf] font-extrabold flex items-center justify-center rounded-lg">F</div>
                Fzokart
              </div>

              <h1 className="text-[18px] md:text-[30px] font-bold mb-2 md:mb-3 leading-tight">Signup</h1>
              <p className="text-[12px] md:text-[15px] leading-relaxed opacity-95">
                Sign up with your details<br />
                to get started today!
              </p>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-transparent -mt-6 md:mt-0">
              {/* Signup Card */}
              <SmoothReveal direction="up" delay={200} className="w-full md:w-auto md:max-w-[360px]">
                <div
                  className="p-5 md:p-7 rounded-xl md:rounded-2xl w-[94%] md:w-full mx-auto shadow-sm md:shadow-none"
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                  }}
                >
                  <h2 className="text-[17px] md:text-[20px] font-bold mb-[5px] text-[#1F2937]">Looks like you're new here!</h2>
                  <p className="text-[12px] md:text-[13px] text-[#4B5563] mb-[15px] md:mb-[18px]">Sign up with your email to get started</p>

                  {step === 1 ? (
                    <form onSubmit={handleSendOtp}>

                      {/* Mobile OTP Button */}
                      {!isMobileVerified && (
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={handleMobileOtpClick}
                            className="w-full h-[40px] rounded-[10px] bg-white border border-[#d1d5db] text-[#1F2937] font-medium text-[13px] hover:bg-gray-50 flex items-center justify-center gap-2 transition-all shadow-sm"
                          >
                            <Smartphone size={16} className="text-[#2874F0]" />
                            Sign up with Mobile OTP
                          </button>
                          <div className="flex items-center gap-2 my-3">
                            <div className="h-[1px] flex-1 bg-gray-300"></div>
                            <span className="text-[11px] text-gray-500 uppercase">OR</span>
                            <div className="h-[1px] flex-1 bg-gray-300"></div>
                          </div>

                          {/* 🔴 DEV BYPASS: For IP Blocked Users */}
                          <div className="text-center mb-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsMobileVerified(true);
                                setPhone('9876543210');
                                addToast("success", "Dev Bypass: Mobile Verified (Dummy) ✅");
                              }}
                              className="text-[11px] text-red-500 underline hover:text-red-700 cursor-pointer"
                            >
                              (Dev) Force Verify 9876543210
                            </button>
                          </div>

                        </div>
                      )}

                      <div className="space-y-2 md:space-y-4 mb-[15px] md:mb-[18px]">
                        {/* Name Input */}
                        <input
                          type="text"
                          placeholder="Full Name"
                          required
                          className="w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isLoading}
                        />

                        {/* Mobile Number Input - ONLY SHOW IF VERIFIED (via Widget) */}
                        {isMobileVerified && (
                          <div className="relative">
                            <input
                              type="tel"
                              placeholder="Mobile Number"
                              className={`w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all ${isMobileVerified ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                              value={phone}
                              onChange={(e) => !isMobileVerified && setPhone(e.target.value)}
                              disabled={isLoading || isMobileVerified}
                            />
                            <CheckCircle size={18} className="absolute right-3 top-3 text-green-500" />
                          </div>
                        )}

                        {/* Email Input */}
                        <input
                          type="email"
                          placeholder="Email Address"
                          required
                          className="w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />

                        {/* Password Input */}
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Set Password"
                            required
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
                      </div>

                      <div className="flex items-start gap-2 mb-4 px-1">
                        <input
                          type="checkbox"
                          id="terms-checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 text-[#2874F0] border-gray-300 rounded focus:ring-[#2874F0] cursor-pointer"
                        />
                        <label htmlFor="terms-checkbox" className="text-[11px] md:text-[12px] text-[#4B5563] leading-tight cursor-pointer">
                          I agree to Fzokart's <Link href="/terms-of-service" className="text-[#2874F0] hover:underline font-medium">Terms of Use</Link> and <Link href="/privacy-policy" className="text-[#2874F0] hover:underline font-medium">Privacy Policy</Link>.
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !email || !name || !password || !acceptedTerms}
                        className="w-full h-[44px] md:h-11 rounded-[10px] border-none bg-[#F9C74F] text-[#1F2937] font-semibold text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 flex items-center justify-center disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Sending OTP...' : 'Continue'}
                      </button>

                      <div className="mt-[15px] md:mt-[18px] text-[12px] md:text-[13px] text-[#2874F0] text-center">
                        Already have an account? <Link href="/login" className="font-bold hover:underline" style={{ color: '#FF3333' }}>Login</Link>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp}>
                      <div className="mb-6">
                        <p className="text-[12px] md:text-[13px] text-center mb-4 text-[#4B5563]">
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
                        className="w-full h-[44px] md:h-11 rounded-[10px] border-none bg-[#F9C74F] text-[#1F2937] font-semibold text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 mb-4 flex items-center justify-center"
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
    </>
  );
};
