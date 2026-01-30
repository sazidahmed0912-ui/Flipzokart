"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from '@/app/services/authService';

export const ResetPasswordPage: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      alert("Failed to reset password. Token may be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50">
      <div className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 p-10 lg:p-16 border border-gray-100">
        {isSuccess ? (
          <div className="text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold text-dark">Password Updated!</h2>
            <p className="text-gray-500">Your security credentials have been updated. Redirecting to login...</p>
            <Link href="/login" className="inline-block text-primary font-bold hover:underline">Click here if not redirected</Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-dark tracking-tight mb-2">Secure Reset</h1>
              <p className="text-gray-500">Create a strong, unique password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Save Password <ArrowRight size={20} /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
