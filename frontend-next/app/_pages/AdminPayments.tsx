"use client";
import React, { useState } from 'react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import {
    Search, Bell, User, LogOut, ChevronDown,
    IndianRupee, ArrowDownLeft, ArrowUpRight,
    Filter, Download, MoreHorizontal, CheckCircle,
    Clock, XCircle
} from 'lucide-react';
import { useApp } from '@/app/store/Context';

// Mock Data for Payments
const mockTransactions = [
    { id: 'TRX-9871', orderId: 'ORD-1024', customer: 'Rahul Sharma', amount: 2499, date: '2024-03-10', status: 'Success', method: 'UPI' },
    { id: 'TRX-9872', orderId: 'ORD-1025', customer: 'Priya Patel', amount: 850, date: '2024-03-10', status: 'Pending', method: 'Card' },
    { id: 'TRX-9873', orderId: 'ORD-1026', customer: 'Amit Singh', amount: 12999, date: '2024-03-09', status: 'Success', method: 'NetBanking' },
    { id: 'TRX-9874', orderId: 'ORD-1027', customer: 'Sneha Gupta', amount: 450, date: '2024-03-09', status: 'Failed', method: 'UPI' },
    { id: 'TRX-9875', orderId: 'ORD-1028', customer: 'Vikram Malhotra', amount: 5999, date: '2024-03-08', status: 'Success', method: 'COD' },
    { id: 'TRX-9876', orderId: 'ORD-1029', customer: 'Anjali Verma', amount: 1200, date: '2024-03-08', status: 'Refunded', method: 'Card' },
    { id: 'TRX-9877', orderId: 'ORD-1030', customer: 'Rohit Kumar', amount: 3499, date: '2024-03-07', status: 'Success', method: 'UPI' },
];

export const AdminPayments: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Success': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Failed': return 'bg-red-100 text-red-700';
            case 'Refunded': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar */}
                <SmoothReveal direction="down" duration="500" className="sticky top-0 z-30">
                    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
                            <Search size={18} className="text-[#2874F0]" />
                            <input
                                type="text"
                                placeholder="Search by transaction ID, Order ID..."
                                className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="relative p-2 text-gray-500 hover:text-[#2874F0] transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6161] rounded-full ring-2 ring-white"></span>
                            </button>

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

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                                        <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                </SmoothReveal>

                <div className="p-8 space-y-8">
                    {/* Header */}
                    <SmoothReveal direction="down" delay={100} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Payments & Transactions</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage and monitor all financial transactions.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white rounded-xl text-sm font-semibold hover:bg-[#1a60d6] transition-colors shadow-lg shadow-blue-500/20">
                                <Download size={16} /> Export Report
                            </button>
                        </div>
                    </SmoothReveal>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SmoothReveal direction="up" delay={200}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-green-100 text-green-600">
                                        <ArrowDownLeft size={22} />
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">₹4,25,900</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Revenue</p>
                            </div>
                        </SmoothReveal>

                        <SmoothReveal direction="up" delay={300}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                                        <Clock size={22} />
                                    </div>
                                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">8 Pending</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">₹12,450</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Pending Settlements</p>
                            </div>
                        </SmoothReveal>

                        <SmoothReveal direction="up" delay={400}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-red-100 text-red-600">
                                        <ArrowUpRight size={22} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Last 30 Days</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">₹2,100</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Refunds</p>
                            </div>
                        </SmoothReveal>
                    </div>

                    {/* Transactions Table */}
                    <SmoothReveal direction="up" delay={500}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                                <button className="text-sm font-semibold text-[#2874F0] hover:underline">View All</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {mockTransactions.map((trx, index) => (
                                            <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800 text-sm">{trx.id}</span>
                                                        <span className="text-xs text-gray-400">{trx.orderId}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                            {trx.customer.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{trx.customer}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {trx.date}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-800">
                                                    ₹{trx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {trx.method}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(trx.status)}`}>
                                                        {trx.status === 'Success' && <CheckCircle size={12} className="mr-1" />}
                                                        {trx.status === 'Pending' && <Clock size={12} className="mr-1" />}
                                                        {trx.status === 'Failed' && <XCircle size={12} className="mr-1" />}
                                                        {trx.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
