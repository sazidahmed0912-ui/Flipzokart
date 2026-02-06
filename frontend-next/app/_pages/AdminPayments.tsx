"use client";
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import {
    Search, Bell, LogOut, ChevronDown,
    ArrowDownLeft, ArrowUpRight,
    Filter, Download, MoreHorizontal, CheckCircle,
    Clock, XCircle, Eye
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { useSocket } from '@/app/hooks/useSocket';
import Link from 'next/link';

export const AdminPayments: React.FC = () => {
    const { user, logout } = useApp();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const socket = useSocket(token);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Interactive States
    const [showFilter, setShowFilter] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await import('@/app/services/api').then(mod => mod.fetchAllOrders());
                const orders = res.data;

                const formatted = orders.map((order: any) => ({
                    id: order.razorpayPaymentId || `TRX-${order._id.slice(-6)}`,
                    orderId: order._id, // Full ID for linking
                    displayOrderId: `ORD-${order._id.slice(-6).toUpperCase()}`,
                    rawDate: new Date(order.createdAt),
                    date: new Date(order.createdAt).toLocaleDateString(),
                    customer: order.userName || 'Unknown',
                    amount: order.total,
                    status: order.paymentStatus === 'PAID' ? 'Success' :
                        order.paymentStatus === 'FAILED' ? 'Failed' : 'Pending',
                    method: order.paymentMethod
                }));
                setTransactions(formatted);
            } catch (error) {
                console.error("Failed to fetch payments:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Real-Time Listener
    useEffect(() => {
        if (!socket) return;

        const handleNewPayment = (data: any) => {
            console.log("💰 New Payment Received:", data);
            setTransactions(prev => [{
                ...data,
                displayOrderId: `ORD-${data.orderId.slice(-6).toUpperCase()}`,
                rawDate: new Date(),
                date: new Date().toLocaleDateString(),
                status: data.status === 'PAID' ? 'Success' : data.status
            }, ...prev]);
        };

        socket.on('payment:new', handleNewPayment);

        return () => {
            socket.off('payment:new', handleNewPayment);
        };
    }, [socket]);

    // Export Handler
    const handleExport = () => {
        const headers = ['Transaction ID', 'Order ID', 'Customer', 'Date', 'Amount', 'Method', 'Status'];
        const csvRows = [headers.join(',')];

        filteredTransactions.forEach(t => {
            const row = [
                t.id,
                t.displayOrderId,
                `"${t.customer}"`,
                t.date,
                t.amount,
                t.method,
                t.status
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.customer?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewAll = () => {
        setSearchTerm('');
        setStatusFilter('All');
    };

    // Stats Calculation
    const stats = {
        revenue: transactions.filter(t => t.status === 'Success').reduce((acc, t) => acc + t.amount, 0),
        pendingCount: transactions.filter(t => t.status === 'Pending').length,
        refunds: transactions.filter(t => t.status === 'Failed' || t.status === 'Refunded').reduce((acc, t) => acc + t.amount, 0)
    };

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
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]" onClick={() => {
            setShowFilter(false);
            setActiveActionId(null);
            setIsProfileOpen(false);
        }}>
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
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="/admin/notifications">
                                <button className="relative p-2 text-gray-500 hover:text-[#2874F0] transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6161] rounded-full ring-2 ring-white"></span>
                                </button>
                            </Link>

                            <div className="relative" onClick={(e) => e.stopPropagation()}>
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
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setShowFilter(!showFilter)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-colors ${statusFilter !== 'All' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Filter size={16} /> {statusFilter === 'All' ? 'Filter' : statusFilter}
                                </button>
                                {showFilter && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-20">
                                        {['All', 'Success', 'Pending', 'Failed'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => { setStatusFilter(status); setShowFilter(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${statusFilter === status ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white rounded-xl text-sm font-semibold hover:bg-[#1a60d6] transition-colors shadow-lg shadow-blue-500/20"
                            >
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
                                <h3 className="text-2xl font-bold text-gray-800">₹{stats.revenue.toLocaleString()}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Revenue</p>
                            </div>
                        </SmoothReveal>

                        <SmoothReveal direction="up" delay={300}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                                        <Clock size={22} />
                                    </div>
                                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">{stats.pendingCount} Pending</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">₹{stats.revenue > 0 ? (stats.revenue * 0.1).toLocaleString() : 0}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Pending Settlements (Est)</p>
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
                                <h3 className="text-2xl font-bold text-gray-800">₹{stats.refunds.toLocaleString()}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Refunds</p>
                            </div>
                        </SmoothReveal>
                    </div>

                    {/* Transactions Table */}
                    <SmoothReveal direction="up" delay={500}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            style={{ minHeight: '400px' }} // Min height to prevent cutoff
                        >
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                                <button
                                    onClick={handleViewAll}
                                    className="text-sm font-semibold text-[#2874F0] hover:underline"
                                >
                                    View All
                                </button>
                            </div>

                            <div className="overflow-x-auto" style={{ minHeight: '300px' }}>
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
                                        {loading ? (
                                            <tr><td colSpan={7} className="text-center py-10">Loading transactions...</td></tr>
                                        ) : filteredTransactions.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-10 text-gray-400">No transactions found</td></tr>
                                        ) : (
                                            filteredTransactions.map((trx, index) => (
                                                <tr key={trx.id || index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-800 text-sm">{trx.id}</span>
                                                            <span className="text-xs text-gray-400">{trx.displayOrderId || trx.orderId}</span>
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
                                                        ₹{trx.amount?.toLocaleString()}
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
                                                    <td className="px-6 py-4 text-right relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveActionId(activeActionId === trx.id ? null : trx.id);
                                                            }}
                                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                        {/* Action Menu */}
                                                        {activeActionId === trx.id && (
                                                            <div className="absolute right-0 top-10 z-50 w-32 bg-white border border-gray-100 rounded-xl shadow-xl py-1">
                                                                <Link
                                                                    href={`/admin/orders/${trx.orderId}`}
                                                                    className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#2874F0] flex items-center gap-2"
                                                                >
                                                                    <Eye size={14} /> View Order
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
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
