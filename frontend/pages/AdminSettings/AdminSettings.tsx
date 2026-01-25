import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Settings, Save, Globe, Mail, Phone,
    CreditCard, Shield, ChevronDown, CheckCircle
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { SmoothReveal } from '../../components/SmoothReveal';
import { useToast } from '../../components/toast';
import { useApp } from '../../store/Context';

export const AdminSettings: React.FC = () => {
    const { user } = useApp();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Initial State (Mock Data or from LocalStorage)
    const [settings, setSettings] = useState({
        storeName: 'Flipzokart',
        supportEmail: 'support@flipzokart.com',
        supportPhone: '+91 99999 99999',
        currency: 'INR',
        taxRate: '18',
        facebook: 'https://facebook.com/flipzokart',
        twitter: 'https://twitter.com/flipzokart',
        instagram: 'https://instagram.com/flipzokart'
    });

    useEffect(() => {
        const saved = localStorage.getItem('admin_settings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('admin_settings', JSON.stringify(settings));
            addToast('success', 'Settings saved successfully');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Settings className="text-[#2874F0]" size={20} /> Store Settings
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{user?.name?.split(' ')[0] || 'Admin'}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-4xl">
                    <form onSubmit={handleSave} className="space-y-8">

                        {/* General Settings */}
                        <SmoothReveal direction="up" delay={0}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Globe size={18} className="text-blue-500" /> General Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Store Name</label>
                                        <input
                                            type="text"
                                            name="storeName"
                                            value={settings.storeName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Support Email</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="email"
                                                name="supportEmail"
                                                value={settings.supportEmail}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                name="supportPhone"
                                                value={settings.supportPhone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SmoothReveal>

                        {/* Financial Settings */}
                        <SmoothReveal direction="up" delay={100}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <CreditCard size={18} className="text-green-500" /> Financial Settings
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Currency</label>
                                        <select
                                            name="currency"
                                            value={settings.currency}
                                            // @ts-ignore
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            name="taxRate"
                                            value={settings.taxRate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </SmoothReveal>

                        {/* Social Links */}
                        <SmoothReveal direction="up" delay={200}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Shield size={18} className="text-purple-500" /> Social Media
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Facebook URL</label>
                                        <input
                                            type="text"
                                            name="facebook"
                                            value={settings.facebook}
                                            onChange={handleChange}
                                            placeholder="https://facebook.com/..."
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Twitter URL</label>
                                        <input
                                            type="text"
                                            name="twitter"
                                            value={settings.twitter}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/..."
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Instagram URL</label>
                                        <input
                                            type="text"
                                            name="instagram"
                                            value={settings.instagram}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/..."
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-[#2874F0] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </SmoothReveal>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-[#2874F0] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};
