"use client";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { OtpInput } from '@/app/components/OtpInput'; // Ensure this component exists or use simple input

interface Step1Props {
    onSuccess: (token: string, userData: any) => void;
    API: any;
}

const Step1Register: React.FC<Step1Props> = ({ onSuccess, API }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // OTP States
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    useEffect(() => {
        let interval: any;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address first.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await API.post('/api/auth/send-email-otp', {
                email: formData.email,
                name: formData.name,
                type: 'seller_register'
            });
            setIsOtpSent(true);
            setOtpTimer(300); // 5 mins
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            return;
        }

        setError('');
        setVerifyingOtp(true);
        try {
            // Verify OTP
            const res = await API.post('/api/auth/verify-email-otp', { email: formData.email, otp: code });

            // If successful (doesn't throw)
            setIsEmailVerified(true);
            setIsOtpSent(false);
            setOtp(['', '', '', '', '', '']);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const validate = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password) return "All fields are required";
        if (formData.password.length < 8) return "Password must be at least 8 characters";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        if (!/^\d{10}$/.test(formData.phone)) return "Invalid phone number";
        if (!isEmailVerified) return "Please verify your email address to continue.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await API.post('/api/auth/seller/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password
            });

            // On success, pass token and user data up
            if (res.data.success) {
                onSuccess(res.data.token, res.data.user);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Create Seller Account</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your full name"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Section with Real-time OTP */}
                <div className="md:col-span-2">
                    {/* Make email full width or handle layout? Keeping consistent with original grid */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${isEmailVerified ? 'border-green-500 bg-green-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 outline-none pr-28`}
                            placeholder="name@example.com"
                            required
                            disabled={isEmailVerified || isOtpSent}
                        />
                        {isEmailVerified ? (
                            <div className="absolute right-3 top-3 text-green-600 flex items-center gap-1 font-medium text-sm">
                                <CheckCircle size={16} /> Verified
                            </div>
                        ) : (
                            !isOtpSent && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading || !formData.email}
                                    className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Get OTP'}
                                </button>
                            )
                        )}
                    </div>

                    {/* OTP Input Box (Below Email) */}
                    {isOtpSent && !isEmailVerified && (
                        <div className="mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-600">Enter Verification Code</label>
                                <span className="text-xs text-blue-600 font-mono">
                                    {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                            <div className="flex gap-2 justify-center mb-3">
                                {/* Plain OTP Input as requested, or reusable? Reusable is cleaner */}
                                <OtpInput length={6} value={otp} onChange={setOtp} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={verifyingOtp || otp.join('').length !== 6}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {verifyingOtp ? 'Verifying...' : 'Verify Email'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOtpSent(false)}
                                    className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium underline"
                                >
                                    Change Email
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="10-digit mobile number"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Complete address including pin code"
                    rows={2}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                        placeholder="Min 8 chars"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Re-enter password"
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !isEmailVerified}
                className="w-full bg-[#2874F0] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a60d6] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-500/30"
            >
                {loading ? 'Creating Account...' : 'Continue to Verification'}
            </button>
        </form>
    );
};

export default Step1Register;
