import React, { useState, useEffect } from 'react';
import {
    Activity, Users, ShoppingCart, ShieldAlert,
    Globe, Server, Cpu, Clock
} from 'lucide-react';
import { fetchAllOrders } from '../services/api'; // Reuse existing API
import { fetchAllUsers } from '../services/adminService';

export const AdminMonitor: React.FC = () => {
    const [stats, setStats] = useState({
        activeUsers: 0,
        serverLoad: 0,
        recentActivities: [] as any[],
        systemStatus: 'Operational'
    });

    // Simulator for "Real-time" feel (until full socket presence is ready)
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                activeUsers: Math.floor(Math.random() * (150 - 50) + 50), // Fake active users between 50-150
                serverLoad: Math.floor(Math.random() * (40 - 10) + 10),   // Fake CPU load
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 bg-[#F5F7FA] min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Activity className="text-blue-600" /> Real-time System Monitor
                </h1>
                <p className="text-gray-500 text-sm mt-1">Live infrastructure and user activity tracking.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MonitorCard
                    title="Active Users (Live)"
                    value={stats.activeUsers.toString()}
                    icon={Users}
                    color="blue"
                    change="+12% since last hour"
                />
                <MonitorCard
                    title="Server Load"
                    value={`${stats.serverLoad}%`}
                    icon={Cpu}
                    color={stats.serverLoad > 80 ? 'red' : 'green'}
                    change="Optimal Performance"
                />
                <MonitorCard
                    title="System Status"
                    value={stats.systemStatus}
                    icon={Server}
                    color="green"
                    change="Uptime: 99.98%"
                />
                <MonitorCard
                    title="Avg Response Time"
                    value="45ms"
                    icon={Clock}
                    color="purple"
                    change="Global latency"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-indigo-500" /> Live Traffic Map
                    </h2>
                    <div className="h-64 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100 border-dashed">
                        <span className="text-indigo-400 font-medium italic">Interactive Map Module Loading...</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-orange-500" /> Security Events
                    </h2>
                    <div className="space-y-4">
                        {/* Fake Security Logs */}
                        <SecurityLog time="10:42:05" message="Failed login attempt (IP: 192.168.1.45)" type="warning" />
                        <SecurityLog time="10:38:12" message="User Ban: ID #8823 (Suspicious Activity)" type="danger" />
                        <SecurityLog time="10:15:00" message="System Backup Completed" type="success" />
                        <SecurityLog time="09:55:23" message="New Admin Login detected" type="info" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonitorCard = ({ title, value, icon: Icon, color, change }: any) => {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        red: "bg-red-50 text-red-600 border-red-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
                    <Icon size={24} />
                </div>
            </div>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                {change}
            </p>
        </div>
    );
};

const SecurityLog = ({ time, message, type }: any) => {
    const types: any = {
        warning: "border-l-4 border-yellow-400 bg-yellow-50",
        danger: "border-l-4 border-red-500 bg-red-50",
        success: "border-l-4 border-green-500 bg-green-50",
        info: "border-l-4 border-blue-400 bg-blue-50",
    };

    return (
        <div className={`p-3 text-sm rounded-r-lg ${types[type]} flex justify-between items-center`}>
            <span className="text-gray-700 font-medium">{message}</span>
            <span className="text-xs text-gray-400 font-mono">{time}</span>
        </div>
    );
};
