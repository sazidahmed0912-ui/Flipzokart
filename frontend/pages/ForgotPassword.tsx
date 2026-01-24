import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { SmoothReveal } from '../components/SmoothReveal';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mocking API call or using real one if available
      // Note: User didn't ask to fix logic, just UI, but I'll keep the logic.
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
        // Fallback for demo if API fails
        alert('Failed to send reset link: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{
        background: 'linear-gradient(135deg, #1e63d6 0%, #6fb6ff 100%)',
        color: '#1F2937'
      }}
    >
      <SmoothReveal duration="500">
        <div
          className="w-full max-w-[1100px] h-auto min-h-[560px] flex flex-col md:flex-row rounded-[18px] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.25)',
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

            <h1 className="text-[30px] font-bold mb-3 leading-tight">Forgot Password</h1>
            <p className="text-[15px] leading-relaxed opacity-95">
              Get access to your<br />
              Orders, Wishlist and<br />
              Recommendations
            </p>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex items-center justify-center p-8 bg-transparent">
            <SmoothReveal direction="up" delay={200} className="w-full max-w-[400px]">
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
                {isSubmitted ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-[#1F2937]">Link Sent!</h2>
                    <p className="text-sm text-gray-600">
                      We've sent a reset link to <span className="font-bold">{email}</span>.
                    </p>
                    {resetLink && (
                      <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-100 mt-4 text-left">
                        <p className="text-xs text-blue-800 font-bold mb-1">Demo Link:</p>
                        <a href={resetLink} className="text-xs text-blue-600 break-all hover:underline">{resetLink}</a>
                      </div>
                    )}
                    <button onClick={() => setIsSubmitted(false)} className="text-[#2874F0] text-sm font-bold hover:underline mt-4">
                      Try another email
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-[20px] font-bold mb-[5px] text-[#1F2937]">Reset Password</h2>
                    <p className="text-[13px] text-[#4B5563] mb-[18px]">Enter your email to receive a recovery link</p>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <input
                          type="email"
                          required
                          placeholder="Enter your email"
                          className="w-full h-11 rounded-[10px] border border-[#d1d5db] px-3.5 text-sm outline-none bg-white focus:border-[#2874F0] focus:ring-[3px] focus:ring-[rgba(40,116,240,0.15)] transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 rounded-[10px] border-none bg-[#2874F0] text-white font-semibold text-[15px] cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(40,116,240,0.35)] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Sending...' : 'Send Link'}
                      </button>

                      <div className="mt-[18px] text-[13px] text-center">
                        <Link to="/login" className="text-[#2874F0] font-bold hover:underline flex items-center justify-center gap-1">
                          <ArrowLeft size={14} /> Back to Login
                        </Link>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </SmoothReveal>
          </div>
        </div>
      </SmoothReveal>
    </div>
  );
};
