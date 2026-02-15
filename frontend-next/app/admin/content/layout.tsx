'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Layers, Smartphone, Monitor } from 'lucide-react';
import axios from 'axios';
import { StatsCards } from './_components/StatsCards';

const tabs = [
    { name: 'Homepage Banners', path: '/admin/content/banners', icon: ImageIcon },
    { name: 'Home Categories', path: '/admin/content/home-categories', icon: LayoutDashboard },
    { name: 'Category Content', path: '/admin/content/categories', icon: Layers },
];

export default function ContentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stats on mount and whenever a child might update data (could use context, but simple fetch here works for now)
        fetchStats();
    }, [pathname]); // Refetch on tab change to keep fresh

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/content/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-white border-b px-6 py-6 pb-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Website Content Manager</h1>
                    <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">{new Date().toLocaleDateString()}</div>
                </div>

                {/* Dashboard Stats */}
                <StatsCards stats={stats} loading={loading} />

                {/* Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-4 md:pb-0">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.path);
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.path}
                                href={tab.path}
                                className={`flex items-center gap-2 px-5 py-3 rounded-t-lg text-sm font-medium transition-all border-b-2 whitespace-nowrap ${isActive
                                        ? 'border-[#2874F0] text-[#2874F0] bg-blue-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </div>
        </div>
    );
}
