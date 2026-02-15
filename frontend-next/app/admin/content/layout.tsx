'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Layers } from 'lucide-react';

const tabs = [
    { name: 'Homepage Banners', path: '/admin/content/banners', icon: ImageIcon },
    { name: 'Home Categories', path: '/admin/content/home-categories', icon: LayoutDashboard },
    { name: 'Category Content', path: '/admin/content/categories', icon: Layers },
];

export default function ContentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-white border-b px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Website Content Manager</h1>
                <div className="flex gap-2">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.path);
                        return (
                            <Link
                                key={tab.path}
                                href={tab.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-[#2874F0] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {children}
            </div>
        </div>
    );
}
