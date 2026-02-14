"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { OtpInput } from '@/app/components/OtpInput';
import { useApp } from '@/app/store/Context';
import MobileOtpLogin from '@/app/components/MobileOtpLogin';
import authService from '@/app/services/authService';
import { createOrder } from '@/app/services/api';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { useToast } from '@/app/components/toast';
import { Eye, EyeOff, Smartphone, CheckCircle } from 'lucide-react';
import Script from 'next/script';

export const SignupPage: React.FC = () => {
  const { setUser, loginSequence } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      // 🟢 DUPLICATE CHECK: Email
      const exists = await checkUserExists('email', email);
      if (exists) {
        addToast("error", "This email is already registered. Redirecting to login...");
        router.push("/login");
        setIsLoading(false);
        return;
      }

      await authService.sendEmailOtp(email, 'signup');
      setStep(2);
      setTimer(300); // 5 minutes
      addToast('success', 'OTP Sent to your verified email!');
    } catch (err: any) {
      if (err.message === "Email already exists" || err.message === "This email is already registered. Please log in.") {
        addToast("error", "This email is already registered. Redirecting you to login…");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        addToast('error', err.message || 'Failed to send OTP');
      }
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
      // 🟢 ULTRA-LOCK SEQ
      const token = localStorage.getItem("token");
      if (token && user) {
        await loginSequence(token, user);
      } else {
        setUser(user);
      }
      addToast('success', '✅ Registration successful!');

      // 🛒 CHECKOUT INTENT LOGIC
      const checkoutIntentStr = localStorage.getItem("checkout_intent");
      if (checkoutIntentStr) {
        try {
          const intent = JSON.parse(checkoutIntentStr);
          if (intent.fromCheckout && intent.paymentMethod) {
            addToast('success', 'Redirecting to checkout...');

            if (intent.paymentMethod === "COD") {
              // Don't clear yet if needed by next page? 
              // Actually PlaceOrderCodPage doesn't read intent, it reads pendingOrder.
              // So we can clear intent here.
              localStorage.removeItem("checkout_intent");
              router.push("/checkout/place-order-cod");
              return;
            }

            if (intent.paymentMethod === "RAZORPAY") {
              localStorage.removeItem("checkout_intent");
              router.push("/payment");
              return;
            }
          }
        } catch (e) {
          console.error("Intent Parse Error", e);
        }
      }

      // 🛒 AUTO-ORDER LOGIC (Legacy / Fallback)
      const pendingOrder = localStorage.getItem("pendingOrder");
      // ... keep existing auto-order as backup or for other flows? 
      // User said "Direct Signup -> No checkout redirect".
      // So if NO intent, we should NOT redirect to checkout even if pendingOrder exists?
      // Actually, if pendingOrder exists but NO intent, it might be an abandoned cart.
      // But let's stick to the requested "Direct Signup (without payment page) -> NORMAL redirect".

      const redirectPath = searchParams.get('redirect');
      if (redirectPath && redirectPath !== 'place-order' && redirectPath !== 'checkout') {
        router.push(decodeURIComponent(redirectPath));
      } else {
        router.push('/');
      }
    } catch (err: any) {
      if (err.message === "Email already exists") {
        addToast("error", "This email is already registered. Redirecting to login...");
        router.push("/login");
      } else {
        addToast('error', err.message || 'Invalid OTP');
      }
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
                          {/* 🟢 USE SHARED COMPONENT FOR ROBUSTNESS */}
                          <div className="w-full">
                            <MobileOtpLogin />
                          </div>

                          <div className="flex items-center gap-2 my-3">
                            <div className="h-[1px] flex-1 bg-gray-300"></div>
                            <span className="text-[11px] text-gray-500 uppercase">OR</span>
                            <div className="h-[1px] flex-1 bg-gray-300"></div>
                          </div>

                        </div>
                      )}

                      <div className="space-y-2 md:space-y-4 mb-[15px] md:mb-[18px]">

                        {/* 🟢 Form Header for Mobile Signup */}
                        {isMobileVerified && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                            <h3 className="text-sm font-semibold text-blue-800">Complete Registration</h3>
                            <p className="text-xs text-blue-600">Please fill the remaining details.</p>
                          </div>
                        )}

                        {/* Name Input */}
                        <div>
                          <label className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">Full Name</label>
                          <input
                            type="text"
                            placeholder="Enter Full Name"
                            required
                            className="w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Mobile Number Input - ONLY SHOW IF VERIFIED (via Widget) */}
                        {isMobileVerified && (
                          <div className="relative">
                            <label className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">Mobile Number (Verified)</label>
                            <input
                              type="tel"
                              placeholder="Mobile Number"
                              className={`w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all ${isMobileVerified ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                              value={phone}
                              onChange={(e) => !isMobileVerified && setPhone(e.target.value)}
                              disabled={isLoading || isMobileVerified}
                            />
                            <CheckCircle size={18} className="absolute right-3 top-8 text-green-500" />
                          </div>
                        )}

                        {/* Email Input */}
                        <div>
                          <label className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">Email Address</label>
                          <input
                            type="email"
                            placeholder="Enter Email Address"
                            required
                            className="w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                          <label className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">Password</label>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Set a Password"
                            required
                            className="w-full h-[42px] md:h-11 rounded-[10px] border border-[#d1d5db] px-3.5 pr-10 text-[13px] md:text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-8 md:top-8 text-gray-400 hover:text-gray-600"
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
                        Already have an account? <Link href={searchParams.get('redirect') ? `/login?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : '/login'} className="font-bold hover:underline" style={{ color: '#FF3333' }}>Login</Link>
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
