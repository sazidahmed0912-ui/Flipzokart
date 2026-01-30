"use client";
import React, { useState } from 'react';
import {
    Bell, CheckCircle, Info, AlertTriangle, XCircle,
    Trash2, ChevronDown, Clock
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { useNotifications } from '@/app/store/NotificationContext';
import { useApp } from '@/app/store/Context';

export const AdminNotifications: React.FC = () => {
    const { user } = useApp();
    const { notifications, clearNotification, markAsRead } = useNotifications();
    const [filter, setFilter] = useState('All');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const filtered = notifications.filter(n => {
        if (filter === 'All') return true;
        return n.type === filter;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={20} />;
            case 'error': return <XCircle className="text-red-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Bell className="text-[#2874F0]" size={20} /> Notifications Center
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

                <div className="p-8 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {['All', 'info', 'success', 'warning', 'error'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filtered.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <Bell size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No notifications found</p>
                            </div>
                        ) : (
                            filtered.map((note, idx) => (
                                <SmoothReveal key={note._id || idx} direction="up" delay={idx * 50}>
                                    <div className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 ${note.isRead ? 'opacity-70' : ''}`}>
                                        <div className={`p-3 rounded-lg h-fit ${note.type === 'error' ? 'bg-red-50' :
                                                note.type === 'success' ? 'bg-green-50' :
                                                    note.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                                            }`}>
                                            {getIcon(note.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-bold text-gray-800">{note.message}</h3>
                                                <button
                                                    onClick={() => clearNotification(note._id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(note.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </SmoothReveal>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
