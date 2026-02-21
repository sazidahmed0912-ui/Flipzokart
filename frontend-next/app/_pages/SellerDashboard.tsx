"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store, Package, IndianRupee, TrendingUp,
    LogOut, ChevronRight, BarChart2, Settings,
    ShoppingBag, Bell, Loader2, AlertCircle
} from 'lucide-react';

// ─── Seller Session Helpers (completely separate from main website) ────────────
export const getSellerToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('seller_token');
};

export const getSellerUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('seller_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const sellerLogout = (router: ReturnType<typeof useRouter>) => {
    // ONLY clears seller-specific keys — main website session is untouched
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_user');
    router.replace('/sell');
};
// ─────────────────────────────────────────────────────────────────────────────

const SellerDashboard: React.FC = () => {
    const router = useRouter();
    const [sellerUser, setSellerUser] = useState<any>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Guard: check seller_token on mount
    useEffect(() => {
        const token = getSellerToken();
        const user = getSellerUser();
        if (!token || !user) {
            // Not logged in as seller → back to sell page
            router.replace('/sell');
        } else {
            setSellerUser(user);
            setIsInitialized(true);
        }
    }, []);

    const handleLogout = () => {
        sellerLogout(router);
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#2874F0]">
                <Loader2 size={40} className="animate-spin text-white" />
            </div>
        );
    }

    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: BarChart2 },
        { id: 'products', label: 'My Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'earnings', label: 'Earnings', icon: IndianRupee },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Bar */}
            <header className="bg-[#2874F0] text-white px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-400 text-blue-900 font-extrabold flex items-center justify-center rounded-lg text-sm">F</div>
                    <div>
                        <span className="font-bold text-base">Fzokart Seller Panel</span>
                        <span className="ml-2 text-xs bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full font-bold">SELLER</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative hover:bg-white/10 p-2 rounded-full transition-colors">
                        <Bell size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold text-sm">
                            {sellerUser?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="text-sm font-semibold hidden sm:block">{sellerUser?.name || 'Seller'}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-56 min-h-[calc(100vh-64px)] bg-white border-r border-gray-100 shadow-sm hidden md:block">
                    <nav className="p-3 space-y-1 mt-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id
                                    ? 'bg-[#2874F0]/8 text-[#2874F0] border border-[#2874F0]/15'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} />
                                    {item.label}
                                </div>
                                {activeTab === item.id && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Welcome back, {sellerUser?.name?.split(' ')[0] || 'Seller'}! 👋
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Products', value: '0', icon: Package, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
                                    { label: 'Active Orders', value: '0', icon: ShoppingBag, color: 'green', bg: 'bg-green-50', text: 'text-green-600' },
                                    { label: 'This Month Earnings', value: '₹0', icon: IndianRupee, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
                                    { label: 'Growth', value: '0%', icon: TrendingUp, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`w-11 h-11 ${stat.bg} ${stat.text} rounded-xl flex items-center justify-center mb-4`}>
                                            <stat.icon size={22} />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Info Banner */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Store size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-1">Your Seller Account is Active</h3>
                                    <p className="text-blue-700 text-sm">
                                        Start listing your products to reach 50 Crore+ customers across India.
                                        Your seller ID: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">{sellerUser?.id || '-'}</code>
                                    </p>
                                </div>
                            </div>

                            {/* Logout Note */}
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                                <p className="text-sm text-amber-700">
                                    <strong>Note:</strong> Seller Panel logout sirf seller session clear karta hai — aapka main website login safe rahega.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'overview' && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="w-16 h-16 bg-gray-100 text-gray-300 rounded-2xl flex items-center justify-center mb-4">
                                {React.createElement(navItems.find(n => n.id === activeTab)?.icon || Package, { size: 28 })}
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">
                                {navItems.find(n => n.id === activeTab)?.label}
                            </h3>
                            <p className="text-gray-400 text-sm max-w-xs">
                                This section is coming soon. We're building great tools for you!
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SellerDashboard;
