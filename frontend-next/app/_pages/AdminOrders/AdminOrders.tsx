"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
;
import {
    Search, Filter, ChevronDown, Download, Eye,
    CheckCircle, Clock, XCircle, Truck, Package,
    ChevronLeft, ChevronRight, Calendar, Trash2, Edit2, MapPin, Loader2, ExternalLink
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchAllOrders, deleteOrder, updateOrderStatus, updateOrderLocation } from '@/app/services/adminService';
import { useApp } from '@/app/store/Context';
import { resolveProductImage } from '@/app/utils/imageHelper';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/app/components/LocationPickerMap'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-xs">Loading Interactive Map...</div>
});

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
    currentLocation?: { lat: number; lng: number; address: string };
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
    const [isUpdating, setIsUpdating] = useState(false);

    // Modal State
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [statusData, setStatusData] = useState({ status: '', note: '' });
    const [locationData, setLocationData] = useState({ lat: 0, lng: 0, address: '' });

    useEffect(() => {
        loadOrders();
    }, []);

    // ... existing loadOrders ...

    const openStatusModal = (order: Order) => {
        setSelectedOrder(order);
        setStatusData({ status: order.status, note: '' });
        setIsStatusOpen(true);
    };

    const openLocationModal = (order: Order) => {
        setSelectedOrder(order);
        setLocationData(order.currentLocation || { lat: 0, lng: 0, address: '' });
        setIsLocationOpen(true);
    };

    const handleStatusSubmit = async () => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            await updateOrderStatus(selectedOrder._id, statusData.status, statusData.note);
            // Optimistic update
            const updatedOrders = orders.map(o => o._id === selectedOrder._id ? { ...o, status: statusData.status } : o);
            setOrders(updatedOrders);
            setFilteredOrders(updatedOrders); // Re-apply filters if needed
            setIsStatusOpen(false);
        } catch (error) {
            console.error("Status Update Failed", error);
            alert("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLocationSubmit = async () => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            await updateOrderLocation(selectedOrder._id, locationData);
            // Optimistic update (optional deep update)
            const updatedOrders = orders.map(o => o._id === selectedOrder._id ? { ...o, currentLocation: locationData } : o);
            setOrders(updatedOrders);
            setIsLocationOpen(false);
        } catch (error) {
            console.error("Location Update Failed", error);
            alert("Failed to update location");
        } finally {
            setIsUpdating(false);
        }
    };

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
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Status Update Button */}
                                                        <button
                                                            onClick={() => openStatusModal(order)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-all shadow-sm"
                                                            title="Update Status"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>

                                                        {/* Location Update Button */}
                                                        <button
                                                            onClick={() => openLocationModal(order)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all shadow-sm"
                                                            title="Update Location"
                                                        >
                                                            <MapPin size={14} />
                                                        </button>

                                                        <Link href={`/admin/orders/${order._id}`}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-[#2874F0] hover:border-[#2874F0] transition-all shadow-sm group-hover:shadow-md"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(order._id)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-600 transition-all shadow-sm group-hover:shadow-md"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="py-12 text-center">
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

            {/* Status Update Modal */}
            {isStatusOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Update Order Status</h3>
                            <button onClick={() => setIsStatusOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <XCircle size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">New Status</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={statusData.status}
                                    onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                                >
                                    {['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Note (Optional)</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-24"
                                    placeholder="Add a note about this status update..."
                                    value={statusData.note}
                                    onChange={(e) => setStatusData({ ...statusData, note: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleStatusSubmit}
                                disabled={isUpdating}
                                className="w-full bg-[#2874F0] text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Update Modal */}
            {isLocationOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Update Live Location</h3>
                            <button onClick={() => setIsLocationOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <XCircle size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Auto Actions */}
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => {
                                        const btn = document.getElementById('gps-btn');

                                        // 0. Permission Pre-Check (Optional but helpful)
                                        if (navigator.permissions && navigator.permissions.query) {
                                            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                                                if (result.state === 'denied') {
                                                    alert("⚠️ Geo-Location is BLOCKED.\n\nPlease click the 'Lock' icon 🔒 in your browser address bar and set Location to 'Allow'.");
                                                    return;
                                                }
                                            });
                                        }

                                        if (navigator.geolocation) {
                                            if (btn) btn.innerText = "Requesting Access...";
                                            navigator.geolocation.getCurrentPosition(
                                                async (position) => {
                                                    const { latitude, longitude, accuracy } = position.coords;
                                                    // 1. Set Coords
                                                    setLocationData(prev => ({
                                                        ...prev,
                                                        lat: latitude,
                                                        lng: longitude
                                                    }));

                                                    // 2. Reverse Geocode (Get Address from GPS)
                                                    if (btn) btn.innerText = "Fetching Address...";
                                                    let addressText = "";
                                                    try {
                                                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                                        const data = await res.json();
                                                        if (data && data.address) {
                                                            // Construct specific address with PIN Code priority
                                                            const addr = data.address;
                                                            const parts = [
                                                                addr.road || addr.pedestrian,
                                                                addr.suburb || addr.neighbourhood,
                                                                addr.city || addr.town || addr.village,
                                                                addr.state,
                                                                addr.postcode
                                                            ].filter(Boolean);
                                                            addressText = parts.join(', ');

                                                            setLocationData(prev => ({
                                                                ...prev,
                                                                lat: latitude,
                                                                lng: longitude,
                                                                address: addressText || data.display_name
                                                            }));
                                                        } else if (data && data.display_name) {
                                                            addressText = data.display_name;
                                                            setLocationData(prev => ({
                                                                ...prev,
                                                                lat: latitude,
                                                                lng: longitude,
                                                                address: data.display_name
                                                            }));
                                                        }
                                                    } catch (err) {
                                                        console.error("Reverse geocode failed", err);
                                                    }

                                                    const accuracyMsg = accuracy < 20 ? "High Accuracy" : `Accuracy: ~${Math.round(accuracy)}m`;
                                                    const colorClass = accuracy < 20 ? "text-green-600" : "text-amber-600";

                                                    if (btn) btn.innerHTML = `<div class="flex flex-col items-center leading-none"><span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> GPS Acquired</span><span class="text-[10px] ${colorClass}">${accuracyMsg}</span></div>`;
                                                },
                                                (error) => {
                                                    let msg = "Error fetching location.";
                                                    if (error.code === 1) msg = "Location Permission Denied. \n\n1. Click the Lock icon 🔒 in URL bar.\n2. Turn on 'Location'.\n3. Refresh page.";
                                                    alert(msg);
                                                    if (btn) btn.innerText = "Permission Denied";
                                                },
                                                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                                            );
                                        } else {
                                            alert("Geolocation is not supported by this browser.");
                                        }
                                    }}
                                    id="gps-btn"
                                    className="flex-1 bg-green-50 text-green-700 text-xs font-bold py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1 border border-green-100"
                                >
                                    <MapPin size={14} /> Get Current GPS
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!locationData.address) return alert("Please enter an address first");
                                        const btn = document.getElementById('geo-btn');
                                        if (btn) btn.innerText = "Searching...";

                                        try {
                                            // Nominatim OpenStreetMap (Free, no key)
                                            // Strategy 1: Full Address
                                            let query = locationData.address;
                                            let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                                            let data = await res.json();

                                            // Strategy 2: Fallback (Remove house numbers/specifics)
                                            if (!data || data.length === 0) {
                                                const parts = query.split(',').slice(1).join(',').trim();
                                                if (parts.length > 5) {
                                                    console.log("Retrying with:", parts);
                                                    res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(parts)}&limit=1`);
                                                    data = await res.json();
                                                }
                                            }

                                            // Strategy 3: Try ZIP Code only if present
                                            if (!data || data.length === 0) {
                                                const zipMatch = query.match(/\b\d{6}\b/); // Indian 6-digit PIN
                                                if (zipMatch) {
                                                    console.log("Retrying with ZIP:", zipMatch[0]);
                                                    res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipMatch[0]}&country=India&limit=1`);
                                                    data = await res.json();
                                                }
                                            }

                                            if (data && data.length > 0) {
                                                setLocationData({
                                                    ...locationData,
                                                    lat: parseFloat(data[0].lat),
                                                    lng: parseFloat(data[0].lon)
                                                });
                                                if (btn) btn.innerHTML = '<span class="text-green-700 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Found!</span>';
                                            } else {
                                                alert("Address not found! Try entering just 'City, State' or 'Zipcode'.");
                                                if (btn) btn.innerText = "Not Found";
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert("Failed to geocode address");
                                            if (btn) btn.innerText = "Error";
                                        }
                                    }}
                                    id="geo-btn"
                                    className="flex-1 bg-orange-50 text-orange-700 text-xs font-bold py-2 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-1 border border-orange-100"
                                >
                                    <Search size={14} /> Fetch Coords
                                </button>
                            </div>

                            {/* Interactive Map */}
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Fine-tune Location (Drag Marker)</label>
                                <LocationPickerMap
                                    lat={locationData.lat}
                                    lng={locationData.lng}
                                    onLocationSelect={(lat, lng) => setLocationData({ ...locationData, lat, lng })}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">* Use GPS or Search first, then drag marker for exact spot.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="28.7041"
                                        value={locationData.lat}
                                        onChange={(e) => setLocationData({ ...locationData, lat: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="77.1025"
                                        value={locationData.lng}
                                        onChange={(e) => setLocationData({ ...locationData, lng: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            {/* Verify Link */}
                            {locationData.lat !== 0 && (
                                <div className="text-right">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${locationData.lat},${locationData.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center justify-end gap-1"
                                    >
                                        Verify on Google Maps <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Current Address</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-20"
                                    placeholder="e.g. Near City Center, New Delhi"
                                    value={locationData.address}
                                    onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleLocationSubmit}
                                disabled={isUpdating}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <><MapPin size={18} /> Update Location</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
