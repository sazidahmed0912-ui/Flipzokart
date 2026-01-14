
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import authService from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        const resetLink = `http://localhost:3000/#/reset-password?token=${result.resetToken}`;
        setResetLink(resetLink);
        setIsSubmitted(true);
      } else {
        alert('Failed to send reset link: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50">
      <div className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 p-10 lg:p-16 border border-gray-100 animate-in zoom-in-95 duration-500">
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary font-bold text-xs uppercase tracking-widest mb-10 transition-colors">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {isSubmitted ? (
          <div className="text-center space-y-6 py-4 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-dark">Password Reset Link Generated!</h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              We've generated a password reset link for <span className="text-dark font-bold">{email}</span>.
            </p>
            
            {resetLink && (
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-3">
                <p className="text-sm text-blue-700 font-medium">Click the link below to reset your password:</p>
                <a 
                  href={resetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-bold"
                >
                  Reset Password <ExternalLink size={16} />
                </a>
                <p className="text-xs text-blue-600 break-all">{resetLink}</p>
              </div>
            )}
            
            <div className="pt-6">
               <button onClick={() => setIsSubmitted(false)} className="text-primary font-bold hover:underline">Generate another link</button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-dark mb-3 tracking-tight">Forgot Password?</h1>
              <p className="text-gray-500 font-medium leading-relaxed">No worries! Enter your email and we'll send you a link to reset your password instantly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full bg-lightGray px-12 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary/20 transition-all font-semibold text-dark"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Send Reset Link <ArrowRight size={20} /></>
                )}
              </button>
            </form>

            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
               <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
               <p className="text-xs text-blue-700 leading-relaxed font-medium">
                 For security reasons, reset links expire after 30 minutes. If you don't recognize this action, please contact support immediately.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
