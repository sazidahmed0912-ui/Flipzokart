"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/store/Context';
import authService from '@/app/services/authService';
import { useToast } from '@/app/components/toast';
import { OtpInput } from '@/app/components/OtpInput';
import { Eye, EyeOff, X, ArrowRight, Lock, Mail, User as UserIcon, Phone } from 'lucide-react';
import MobileOtpLogin from '@/app/components/MobileOtpLogin';
import Modal from '@/app/components/Modal';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    message?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, message }) => {
    const { setUser } = useApp();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginOtp, setLoginOtp] = useState(['', '', '', '', '', '']);
    const [loginOtpSent, setLoginOtpSent] = useState(false);
    const [loginTimer, setLoginTimer] = useState(0);

    // Signup State
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [signupOtp, setSignupOtp] = useState(['', '', '', '', '', '']);
    const [signupStep, setSignupStep] = useState(1); // 1: Details, 2: Verify
    const [signupTimer, setSignupTimer] = useState(0);

    // Timers
    useEffect(() => {
        let interval: any;
        if (loginTimer > 0) interval = setInterval(() => setLoginTimer(p => p - 1), 1000);
        return () => clearInterval(interval);
    }, [loginTimer]);

    useEffect(() => {
        let interval: any;
        if (signupTimer > 0) interval = setInterval(() => setSignupTimer(p => p - 1), 1000);
        return () => clearInterval(interval);
    }, [signupTimer]);

    // --- LOGIN LOGIC ---
    const handleLoginSendOtp = async () => {
        if (!loginEmail.includes('@')) return addToast('error', 'Valid email required for OTP');
        setIsLoading(true);
        try {
            await authService.sendEmailOtp(loginEmail);
            setLoginOtpSent(true);
            setLoginTimer(300);
            addToast('success', 'OTP Sent!');
        } catch (e: any) {
            addToast('error', e.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail) return addToast('error', 'Email is required');

        const otpCode = loginOtp.join('');
        const hasPassword = loginPassword.trim().length > 0;
        const hasOtp = otpCode.length === 6;

        if (!hasPassword && !hasOtp) return addToast('error', 'Enter Password OR OTP');

        setIsLoading(true);
        try {
            let user;
            if (hasPassword) {
                user = await authService.login({ email: loginEmail, password: loginPassword });
            } else {
                user = await authService.verifyEmailOtp(loginEmail, otpCode);
            }
            setUser(user);
            addToast('success', 'Welcome back!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            if (err.response?.status === 404 || err.message?.includes("Sign Up first")) {
                addToast('error', 'Account does not exist. Please Signup.');
                setActiveTab('signup');
                setSignupEmail(loginEmail);
            } else {
                addToast('error', err.response?.data?.message || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- SIGNUP LOGIC ---
    const handleSignupSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signupName || !signupEmail.includes('@') || !signupPassword) return addToast('error', 'Fill all fields');

        setIsLoading(true);
        try {
            // Quick check if exists (optional optimisation, but authService usually handles it)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-exists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupEmail })
            });
            const data = await res.json();
            if (data.exists) {
                addToast('warning', 'Email already exists. Please Login.');
                setActiveTab('login');
                setLoginEmail(signupEmail);
                setIsLoading(false);
                return;
            }

            await authService.sendEmailOtp(signupEmail);
            setSignupStep(2);
            setSignupTimer(300);
            addToast('success', 'OTP Sent to email!');
        } catch (e: any) {
            addToast('error', e.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = signupOtp.join('');
        if (otpCode.length !== 6) return addToast('error', 'Enter 6-digit OTP');

        setIsLoading(true);
        try {
            const user = await authService.verifyEmailOtp(signupEmail, otpCode, {
                name: signupName,
                password: signupPassword,
                phone: '' // Optional or add field if strict
            });
            setUser(user);
            addToast('success', 'Account Created!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (e: any) {
            addToast('error', e.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X size={20} />
                </button>

                {/* Dynamic Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
                    <h2 className="text-xl font-bold mb-1">
                        {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
                    </h2>
                    <p className="text-blue-100 text-xs">
                        {message || (activeTab === 'login' ? 'Login to continue your order' : 'Signup to place your order securely')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors
                    ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}
                `}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors
                    ${activeTab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}
                `}
                    >
                        Signup
                    </button>
                </div>

                <div className="p-6">

                    {/* LOGIN FORM */}
                    {activeTab === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div className="space-y-3">
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                        value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                    />
                                </div>

                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type={showLoginPassword ? "text" : "password"}
                                        placeholder="Password (Optional for OTP)"
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 my-2 text-xs text-gray-400 font-medium before:h-[1px] before:flex-1 before:bg-gray-200 after:h-[1px] after:flex-1 after:bg-gray-200">
                                OR LOGIN WITH OTP
                            </div>

                            <div className="space-y-3">
                                {!loginOtpSent ? (
                                    <button
                                        type="button"
                                        onClick={handleLoginSendOtp}
                                        disabled={!loginEmail || isLoading}
                                        className="text-blue-600 text-xs font-bold hover:underline w-full text-center"
                                    >
                                        Get OTP on Email
                                    </button>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Enter OTP</label>
                                        <OtpInput length={6} value={loginOtp} onChange={setLoginOtp} disabled={isLoading} />
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-gray-400">Sent to {loginEmail}</span>
                                            {loginTimer > 0 ? (
                                                <span className="text-[10px] text-gray-400">Resend in {loginTimer}s</span>
                                            ) : (
                                                <button type="button" onClick={handleLoginSendOtp} className="text-[10px] text-blue-600 font-bold">Resend</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#ff9f00] hover:bg-[#ff9000] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                            >
                                {isLoading ? 'Processing...' : 'Login & Continue'}
                                {!isLoading && <ArrowRight size={16} />}
                            </button>
                        </form>
                    )}


                    {/* SIGNUP FORM */}
                    {activeTab === 'signup' && (
                        <form onSubmit={signupStep === 1 ? handleSignupSendOtp : handleSignupVerify} className="space-y-4">
                            {signupStep === 1 ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                                    <div className="relative">
                                        <UserIcon size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                            value={signupName}
                                            onChange={e => setSignupName(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                            value={signupEmail}
                                            onChange={e => setSignupEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type={showSignupPassword ? "text" : "password"}
                                            placeholder="Set Password"
                                            required
                                            className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                            value={signupPassword}
                                            onChange={e => setSignupPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#ff9f00] hover:bg-[#ff9000] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        {isLoading ? 'Sending OTP...' : 'Send OTP & Verify'}
                                        {!isLoading && <ArrowRight size={16} />}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Enter OTP sent to <span className="font-bold text-gray-800">{signupEmail}</span></p>
                                        <button
                                            type="button"
                                            onClick={() => setSignupStep(1)}
                                            className="text-xs text-blue-600 hover:underline mt-1"
                                        >
                                            Change Email
                                        </button>
                                    </div>

                                    <OtpInput length={6} value={signupOtp} onChange={setSignupOtp} disabled={isLoading} />

                                    <div className="text-center">
                                        {signupTimer > 0 ? (
                                            <span className="text-xs text-gray-400">Resend in {signupTimer}s</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleSignupSendOtp}
                                                className="text-xs text-blue-600 font-bold hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#ff9f00] hover:bg-[#ff9000] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? 'Creating Account...' : 'Verify & Place Order'}
                                        {!isLoading && <ArrowRight size={16} />}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                    <p className="text-[10px] text-gray-400">
                        By continuing, you agree to Fzokart's Terms of Use and Privacy Policy.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AuthModal;
