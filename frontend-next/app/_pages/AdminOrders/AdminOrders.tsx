"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
;
import {
    Search, Filter, ChevronDown, Download, Eye,
    CheckCircle, Clock, XCircle, Truck, Package,
    ChevronLeft, ChevronRight, Calendar, Trash2
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchAllOrders, deleteOrder } from '@/app/services/adminService';
import { useApp } from '@/app/store/Context';
import { resolveProductImage } from '@/app/utils/imageHelper';

interface Order {
    id: string;
    _id: string;
    userName: string;
    email: string;
    total: number;
    status: string;
    orderStatus?: string; // some logic uses orderStatus
    createdAt: string;
    items: any[];
    paymentMethod: string;
}

export const AdminOrders: React.FC = () => {
    const { user, logout } = useApp();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState('All');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const { data } = await fetchAllOrders();
            // Normalize 'status' vs 'orderStatus' 
            const normalizedData = data.map((o: any) => ({
                ...o,
                status: o.orderStatus || o.status // Ensure consistency
            }));
            setOrders(normalizedData);
            setFilteredOrders(normalizedData);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
            try {
                await deleteOrder(id);
                setOrders(prev => prev.filter(o => o._id !== id));
                setFilteredOrders(prev => prev.filter(o => o._id !== id));
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete order");
            }
        }
    };

    useEffect(() => {
        let results = orders;

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(o =>
                o._id.toLowerCase().includes(lower) ||
                o.userName.toLowerCase().includes(lower) ||
                o.email?.toLowerCase().includes(lower)
            );
        }

        // Status Filter
        if (statusFilter !== 'All') {
            results = results.filter(o => o.status === statusFilter);
        }

        // Date Filter (Simple logic for demo)
        if (dateFilter !== 'All') {
            const now = new Date();
            if (dateFilter === 'Today') {
                results = results.filter(o => new Date(o.createdAt).getDate() === now.getDate());
            } else if (dateFilter === 'This Month') {
                results = results.filter(o => new Date(o.createdAt).getMonth() === now.getMonth());
            }
        }

        setFilteredOrders(results);
    }, [searchTerm, statusFilter, dateFilter, orders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
            case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Out for Delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={14} />;
            case 'Processing': return <Clock size={14} />;
            case 'Shipped': return <Truck size={14} />;
            case 'Out for Delivery': return <Truck size={14} />;
            case 'Cancelled': return <XCircle size={14} />;
            default: return <Package size={14} />;
        }
    };

    if (loading) return <CircularGlassSpinner />;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
                        <Search size={18} className="text-[#2874F0]" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer, Email..."
                            className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

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
                    <SmoothReveal direction="down">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders</p>
                            </div>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                                onClick={() => alert("CSV Export coming in Phase 13!")}
                            >
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </SmoothReveal>

                    {/* Filters */}
                    <SmoothReveal direction="up" delay={100}>
                        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <Filter size={16} className="text-gray-500" />
                                <span className="text-xs font-bold text-gray-700">Filter By:</span>
                            </div>

                            {['All', 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === status
                                        ? 'bg-[#2874F0] text-white shadow-md shadow-blue-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}

                            <div className="ml-auto flex items-center gap-2">
                                <select
                                    className="bg-gray-50 border-none text-xs font-bold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="All">All Time</option>
                                    <option value="Today">Today</option>
                                    <option value="This Month">This Month</option>
                                </select>
                            </div>
                        </div>
                    </SmoothReveal>

                    {/* Table */}
                    <SmoothReveal direction="up" delay={200}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 relative">
                                                        {order.items && order.items.length > 0 ? (
                                                            <Image
                                                                src={resolveProductImage(order.items[0])}
                                                                alt="Product"
                                                                width={40}
                                                                height={40}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-mono text-xs font-bold text-gray-600">#{order._id.substring(20)}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                            {order.userName?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-800">{order.userName}</p>
                                                            <p className="text-[10px] text-gray-400">{order.email || 'No Email'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Calendar size={12} />
                                                        <span className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{order.paymentMethod}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-bold text-gray-800">₹{order.total?.toLocaleString()}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Link href={`/admin/orders/${order._id}`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-[#2874F0] hover:border-[#2874F0] transition-all shadow-sm group-hover:shadow-md"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-600 transition-all shadow-sm group-hover:shadow-md ml-2"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center">
                                                    <Package size={48} className="mx-auto text-gray-200 mb-3" />
                                                    <p className="text-gray-400 font-medium">No orders found matching your filters.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (Mock) */}
                            <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-400">Showing {filteredOrders.length} orders</p>
                                <div className="flex gap-2">
                                    <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
                                    <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
