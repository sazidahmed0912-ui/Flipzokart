"use client";
import React, { useState, useEffect } from 'react';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import ProfileSidebar from '@/app/components/Profile/ProfileSidebar'; // Shared Sidebar
import authService from '@/app/services/authService';
import { useLanguage } from '@/app/store/LanguageContext';
import { Smartphone } from 'lucide-react';

const SecurityPage = () => {
    const { t } = useLanguage();
    const [devices, setDevices] = useState<any[]>([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const fetchedDevices = await authService.getDeviceHistory();
                setDevices(fetchedDevices);
            } catch (e) { console.error(e); }
        };
        fetchDevices();
    }, []);

    return (
        <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
            <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* Shared Sidebar */}
                <ProfileSidebar />

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <SmoothReveal direction="down" delay={100}>
                        <h1 className="text-2xl font-bold text-[#1F2937]">{t('account_security')}</h1>
                    </SmoothReveal>

                    <SmoothReveal direction="up" delay={200}>
                        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8">
                            <h3 className="text-lg font-bold text-[#1F2937] mb-6">{t('login_security')}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700">Account Password</h4>
                                    <p className="text-sm text-gray-500">Secure your account by updating your password regularly.</p>
                                    <ChangePasswordForm t={t} />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700">Device History</h4>
                                    {devices.length === 0 ? <div className="text-sm text-gray-400">No login history found.</div> : (
                                        devices.map((device, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                                                <Smartphone size={24} className="text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-800">{device.device}</div>
                                                    <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Last active: {new Date(device.lastLogin).toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};

const ChangePasswordForm = ({ t }: any) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (newPassword !== confirmPassword) {
            setMsg({ type: "error", text: "New passwords do not match" });
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            setMsg({ type: "success", text: "Password updated successfully" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMsg({ type: "error", text: error.message || "Failed to update password" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePasswordChange} className="space-y-3">
            {msg.text && (
                <div className={`text-xs p-2 rounded ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {msg.text}
                </div>
            )}
            <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
            />
            <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
            />
            <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
                {loading ? "Updating..." : t('save_changes')}
            </button>
        </form>
    );
};

export default SecurityPage;
