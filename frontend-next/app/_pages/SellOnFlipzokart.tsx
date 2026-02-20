"use client";
import React, { useState, useEffect } from 'react';
import SellerWizard from '@/app/components/Seller/SellerWizard';
import { OtpInput } from '@/app/components/OtpInput';
import authService from '@/app/services/authService';
import { useApp } from '@/app/store/Context';
import { useToast } from '@/app/components/toast';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    TrendingUp,
    IndianRupee,
    Truck,
    ShieldCheck,
    Headphones,
    FileText,
    UploadCloud,
    Mail,
    LogIn,
    Loader2,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';

const SellOnFlipzokart: React.FC = () => {
    const [startWizard, setStartWizard] = useState(false);

    // ─── Seller Login State ────────────────────────────────────────────────
    const [loginEmail, setLoginEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { loginSequence, user, isInitialized } = useApp();
    const { addToast } = useToast();
    const router = useRouter();

    // ─── Auto-redirect: Already logged-in seller → Dashboard directly ──────
    useEffect(() => {
        if (isInitialized && user) {
            router.replace('/dashboard');
        }
    }, [isInitialized, user]);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Helper: agar already logged in hai toh dashboard, else wizard
    const handleSellerCta = () => {
        if (user) {
            router.push('/dashboard');
        } else {
            setStartWizard(true);
        }
    };

    const handleSendOtp = async () => {
        if (!loginEmail.includes('@')) {
            addToast('error', 'Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        try {
            await authService.sendEmailOtp(loginEmail);
            setOtpSent(true);
            setTimer(300);
            addToast('success', 'OTP sent to your email!');
        } catch (err: any) {
            addToast('error', err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) {
            addToast('error', 'Please enter the 6-digit OTP');
            return;
        }
        setIsLoading(true);
        try {
            const user = await authService.verifyEmailOtp(loginEmail, otpCode);
            const token = localStorage.getItem('token');
            if (token && user) {
                await loginSequence(token, user);
            }
            addToast('success', '✅ Login successful! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 800);
        } catch (err: any) {
            if (err.message?.includes('Sign Up first') || err.response?.status === 404) {
                addToast('error', '🚫 No seller account found. Please register first.');
            } else {
                addToast('error', err.response?.data?.message || err.message || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Show spinner until context hydrates (prevent flash of login form for logged-in sellers)
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#2874F0]">
                <Loader2 size={40} className="animate-spin text-white" />
            </div>
        );
    }

    if (startWizard) {
        return <SellerWizard />;
    }

    // Formatted timer: MM:SS
    const timerDisplay = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`;

    // Landing Page
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section */}
            <div className="relative bg-[#2874F0] overflow-hidden">
                {/* Decorative Pattern Background */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1a60d6] to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-white space-y-6">
                            <div className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-bold text-sm tracking-wide shadow-md">
                                <TrendingUp size={16} />
                                <span>#1 Seller Platform in India</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                Sell Online to <br />
                                <span className="text-yellow-400">50 Crore+ Indians</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 font-medium">
                                Growth ki nayi shuruwat karo with Flipzokart.
                            </p>
                            <p className="text-blue-200 max-w-lg">
                                Join 14 Lakh+ sellers who trust Flipzokart to grow their business across India. 0% Commission for first 30 days!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <button
                                    onClick={handleSellerCta}
                                    className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-yellow-400/30 flex items-center justify-center gap-2"
                                >
                                    Start Selling <ArrowRight size={20} />
                                </button>
                                <button className="px-8 py-4 rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* ─── Existing Seller Login Card ──────────────────────────────── */}
                        <div className="flex justify-center">
                            <div
                                className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                                style={{
                                    background: 'rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                }}
                            >
                                {/* Card Header */}
                                <div className="px-7 pt-7 pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <LogIn size={18} className="text-yellow-300" />
                                        <h2 className="text-white font-bold text-lg">Existing Seller Login</h2>
                                    </div>
                                    <p className="text-blue-200 text-sm">
                                        Apna seller account access karo via Email &amp; OTP
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/15 mx-7" />

                                {/* Form */}
                                <form onSubmit={handleVerifyOtp} className="px-7 py-6 space-y-4">
                                    {/* Email Input */}
                                    <div>
                                        <label className="text-blue-100 text-xs font-semibold mb-1.5 block uppercase tracking-wider">
                                            Registered Email
                                        </label>
                                        <div className="relative flex items-center">
                                            <Mail size={16} className="absolute left-3.5 text-blue-300 pointer-events-none" />
                                            <input
                                                type="email"
                                                placeholder="seller@email.com"
                                                value={loginEmail}
                                                onChange={e => setLoginEmail(e.target.value)}
                                                disabled={isLoading || otpSent}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.15)',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    color: '#fff',
                                                }}
                                                onFocus={e => {
                                                    e.target.style.background = 'rgba(255,255,255,0.22)';
                                                    e.target.style.borderColor = '#F9C74F';
                                                }}
                                                onBlur={e => {
                                                    e.target.style.background = 'rgba(255,255,255,0.15)';
                                                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                                }}
                                            />
                                            {otpSent && (
                                                <CheckCircle2 size={16} className="absolute right-3.5 text-green-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* OTP Section */}
                                    {!otpSent ? (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={isLoading || !loginEmail.includes('@')}
                                            className="w-full py-3 rounded-xl font-bold text-blue-900 text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.98]"
                                            style={{ background: '#F9C74F' }}
                                        >
                                            {isLoading ? (
                                                <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
                                            ) : (
                                                <><Mail size={16} /> Send OTP to Email</>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* OTP label + resend */}
                                            <div className="flex items-center justify-between">
                                                <label className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
                                                    Enter OTP
                                                </label>
                                                <div className="text-xs">
                                                    {timer > 0 ? (
                                                        <span className="text-yellow-300 font-mono font-semibold">{timerDisplay}</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleSendOtp}
                                                            disabled={isLoading}
                                                            className="text-yellow-300 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
                                                        >
                                                            Resend OTP
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* OTP Input Boxes */}
                                            <div style={{ '--otp-color': '#1F2937' } as React.CSSProperties}>
                                                <OtpInput
                                                    length={6}
                                                    value={otp}
                                                    onChange={setOtp}
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            {/* Verify Button */}
                                            <button
                                                type="submit"
                                                disabled={isLoading || otp.join('').length < 6}
                                                className="w-full py-3 rounded-xl font-bold text-blue-900 text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.98]"
                                                style={{ background: '#F9C74F' }}
                                            >
                                                {isLoading ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                                                ) : (
                                                    <><LogIn size={16} /> Login to Seller Panel</>
                                                )}
                                            </button>

                                            {/* Change email */}
                                            <button
                                                type="button"
                                                onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setTimer(0); }}
                                                className="w-full text-xs text-blue-200 hover:text-white transition-colors text-center bg-transparent border-none cursor-pointer"
                                            >
                                                ← Change email address
                                            </button>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 text-blue-300 text-xs font-medium before:h-px before:flex-1 before:bg-white/20 after:h-px after:flex-1 after:bg-white/20">
                                        New Seller?
                                    </div>

                                    {/* Register CTA */}
                                    <button
                                        type="button"
                                        onClick={handleSellerCta}
                                        className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all border-2 border-white/30 hover:bg-white/10 active:scale-[0.98]"
                                    >
                                        Register as Seller <ChevronRight size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                        {/* ─── End Login Card ──────────────────────────────────────────── */}
                    </div>
                </div>

                {/* Curved Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="fill-white w-full h-auto block">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* 3 Steps Process Section */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Selling in 3 Simple Steps</h2>
                    <p className="text-xl text-gray-600">Bus 3 steps aur aapka business online!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 -z-10"></div>

                    {/* Step 1 */}
                    <div
                        className="flex flex-col items-center text-center group cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-all"
                        onClick={handleSellerCta}
                    >
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FileText size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">1. Register Account</h3>
                        <p className="text-gray-600 px-6">Enter your GST &amp; PAN details. Verified in minutes.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">2. Upload Products</h3>
                        <p className="text-gray-600 px-6">Upload your catalogue and set your prices.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <IndianRupee size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">3. Start Earning</h3>
                        <p className="text-gray-600 px-6">Get orders and receive payments every 7 days.</p>
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                    <button
                        onClick={handleSellerCta}
                        className="bg-[#2874F0] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#1a60d6] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        Start Your Seller Journey
                    </button>
                </div>
            </div>

            {/* Why Sell With Us? (Benefits) */}
            <div className="bg-blue-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Why Sellers Choose Flipzokart?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <IndianRupee size={28} />, title: "Lowest Cost", desc: "Sell with minimal commission fees." },
                            { icon: <Truck size={28} />, title: "Pan-India Reach", desc: "Deliver to 19,000+ pincodes." },
                            { icon: <ShieldCheck size={28} />, title: "Secure Payments", desc: "Regular settlements directly to bank." },
                            { icon: <Headphones size={28} />, title: "Seller Support", desc: "24/7 dedicated support for you." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                                <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonial / Trust */}
            <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Trusted by Indians Like You</h2>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-600 rounded-full mb-6 border-4 border-gray-700 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')" }}></div>
                        <blockquote className="text-xl md:text-2xl font-medium italic mb-6">
                            "Flipzokart helped me take my small handicraft business from Jaipur to customers in Kerala. The payments are always on time!"
                        </blockquote>
                        <cite className="not-italic font-bold text-lg text-yellow-400">- Rajesh Kumar, Jaipur Attributes</cite>
                    </div>
                </div>
            </div>

            {/* Sticky CTA for Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
                <button
                    onClick={handleSellerCta}
                    className="w-full bg-[#2874F0] text-white font-bold py-3 rounded-lg shadow-lg"
                >
                    Start Selling Now
                </button>
            </div>
        </div>
    );
};

export default SellOnFlipzokart;
