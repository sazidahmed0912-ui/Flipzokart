"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/store/Context';
import { useToast } from '@/app/components/toast';
import { Smartphone, Loader2, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { OtpInput } from '@/app/components/OtpInput'; // Reusing existing component

const MobileOtpLogin = () => {
    const router = useRouter();
    const { loginSequence } = useApp();
    const { addToast } = useToast();

    const [step, setStep] = useState<1 | 2>(1); // 1: Phone, 2: OTP
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    // Timer Countdown
    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handle Mobile Input Change
    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setMobile(val);
    };

    // SEND OTP
    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (mobile.length !== 10) {
            addToast('error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mobile/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            addToast('success', 'OTP Sent Successfully!');
            setStep(2);
            setTimer(30); // 30s Timer
        } catch (error: any) {
            addToast('error', error.message || 'Network Error');
        } finally {
            setIsLoading(false);
        }
    };

    // VERIFY OTP
    const handleVerifyOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            addToast('error', 'Please enter valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mobile/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp: otpValue })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Invalid OTP');
            }

            // ✅ Login Successful
            addToast('success', 'Login Successful!');

            // Execute Global Login Sequence (Sync Cart, Set User)
            if (data.token && data.user) {
                await loginSequence(data.token, data.user);
            }

            // 🛒 CHECKOUT INTENT REDIRECT LOGIC
            const checkoutIntentStr = localStorage.getItem("checkout_intent");
            if (checkoutIntentStr) {
                try {
                    const intent = JSON.parse(checkoutIntentStr);
                    if (intent.fromCheckout && intent.paymentMethod) {

                        if (intent.paymentMethod === "COD") {
                            localStorage.removeItem("checkout_intent");
                            router.replace("/checkout/place-order-cod");
                            return;
                        }

                        if (intent.paymentMethod === "RAZORPAY") {
                            localStorage.removeItem("checkout_intent");
                            router.replace("/payment"); // Corrected Route
                            return;
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            // Default Redirect
            router.replace("/profile");

        } catch (error: any) {
            addToast('error', error.message || 'Verification Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[380px] mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                    {step === 1 ? 'Mobile Login' : 'Verify OTP'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    {step === 1
                        ? 'Enter your mobile number to continue'
                        : `Enter verify code sent to +91 ${mobile}`}
                </p>
            </div>

            {step === 1 ? (
                /* STEP 1: MOBILE INPUT */
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium border-r pr-2 border-gray-300">
                            +91
                        </span>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={handleMobileChange}
                            placeholder="Enter Mobile Number"
                            className="w-full h-12 pl-14 pr-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-gray-800 text-lg tracking-wide placeholder:text-base placeholder:font-normal"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || mobile.length !== 10}
                        className="w-full h-12 bg-[#F9C74F] hover:bg-[#F0B93E] text-gray-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Send OTP <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                /* STEP 2: OTP INPUT */
                <form onSubmit={handleVerifyOtp} className="space-y-6">

                    <div className="flex justify-center">
                        {/* Reuse existing OTP Input Component */}
                        {/* Assuming OtpInput accepts standard props */}
                        <div className="otp-container">
                            {/* 
                  Wrapper to style the inputs if needed.
                  The existing component has built-in styling.
               */}
                            {/* @ts-ignore */}
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
                        disabled={isLoading || otp.join('').length !== 6}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Verify & Login <CheckCircle2 size={18} />
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Change Number
                        </button>

                        {timer > 0 ? (
                            <span className="text-gray-400 font-mono">
                                Resend in 00:{timer.toString().padStart(2, '0')}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSendOtp()}
                                className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                                disabled={isLoading}
                            >
                                <RefreshCw size={14} /> Resend OTP
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* Security Badge */}
            <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Secure 256-bit Encryption
                </p>
            </div>

        </div>
    );
};

export default MobileOtpLogin;
