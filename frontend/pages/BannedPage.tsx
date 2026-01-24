import React, { useState, useEffect } from 'react';
import { useApp } from '../store/Context';
import { Clock, ShieldAlert, Send } from 'lucide-react';
import API from '../services/api';

export const BannedPage: React.FC = () => {
    const { user, logout } = useApp();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [appealText, setAppealText] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Real-time Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!user || user.status === 'Active') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">You are not banned!</h1>
                    <p className="text-gray-500 mb-4">Redirecting...</p>
                    <a href="/" className="text-blue-600 hover:underline">Go Home</a>
                </div>
            </div>
        );
    }

    const isSuspended = user.status === 'Suspended';
    const unbanDate = user.suspensionEnd ? new Date(user.suspensionEnd) : null;

    const handleAppeal = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/api/user/appeal', { message: appealText, userId: user.id });
            setSubmitted(true);
        } catch (error: any) {
            console.error('Appeal error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Failed to submit appeal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 animate-fade-in-up">
                <div className="bg-red-600 p-6 text-center text-white">
                    <ShieldAlert size={60} className="mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl font-bold uppercase tracking-wide">
                        Account {user.status}
                    </h1>
                    <p className="mt-2 text-red-100 font-medium opacity-90">
                        Access to flipzokart has been restricted.
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Timers Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Current Time</p>
                            <div className="text-xl font-mono font-bold text-gray-800">
                                {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                                {currentTime.toLocaleDateString()}
                            </div>
                        </div>

                        {isSuspended && unbanDate ? (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center">
                                <p className="text-xs font-bold text-orange-600 uppercase mb-1">Unban Date</p>
                                <div className="text-xl font-mono font-bold text-orange-800">
                                    {/* Using same formatting logic for consistency, although unban date is static, user might want it to look 'real time' formatted */}
                                    {unbanDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-xs text-orange-600 font-medium">
                                    {unbanDate.toLocaleDateString()}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center flex flex-col justify-center">
                                <p className="text-xs font-bold text-red-600 uppercase">Permanent Ban</p>
                                <p className="text-sm text-red-800 mt-1">Please contact support or appeal.</p>
                            </div>
                        )}
                    </div>

                    {/* Reason Section */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Detailed Reason</h3>
                        <p className="text-gray-800 text-base leading-relaxed">
                            {user.banReason || "Violation of Terms of Service. Irregular activity detected on your account."}
                        </p>
                    </div>

                    {/* Appeal Form */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Send size={18} className="text-blue-600" /> Appeal for Unban
                        </h3>

                        {submitted ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center">
                                <p className="font-bold">Appeal Submitted Successfully</p>
                                <p className="text-sm mt-1">Our admins will review your request shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleAppeal} className="space-y-4">
                                <textarea
                                    value={appealText}
                                    onChange={(e) => setAppealText(e.target.value)}
                                    placeholder="Explain why your account should be unbanned..."
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none h-32 resize-none text-sm"
                                    required
                                />
                                <div className="flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="text-gray-500 hover:text-gray-700 font-semibold text-sm px-4"
                                    >
                                        Logout
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Submit Appeal'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
