"use client";
import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import {
    Package,
    Search,
    Filter,
    ChevronDown,
    ShoppingBag,
    Truck,
    CheckCircle,
    XCircle,
    RotateCcw
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import API from '@/app/services/api';
import ProfileSidebar from '@/app/components/Profile/ProfileSidebar';

const OrdersPage: React.FC = () => {
    const router = useRouter();
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Assuming API endpoint
                const { data } = await API.get('/api/order/my-orders');
                setOrders(data.orders || []);
            } catch (error) {
                console.error("Failed to fetch orders", error);
                // Fallback or empty state
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === 'All' || order.status === activeTab || (activeTab === 'In Progress' && ['Pending', 'Shipped', 'Out for Delivery'].includes(order.status));
        // Safe search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            order._id?.toLowerCase().includes(searchLower) ||
            order.items?.some((item: any) => item.name.toLowerCase().includes(searchLower));

        return matchesTab && matchesSearch;
    });

    const getProgressWidth = (status: string) => {
        switch (status) {
            case 'Pending': return '5%';
            case 'Shipped': return '50%';
            case 'Out for Delivery': return '80%';
            case 'Delivered': return '100%';
            default: return '0%';
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            await API.put(`/api/order/${orderId}/status`, { status: 'Cancelled' });

            // Optimistically update UI or refetch
            setOrders(prev => prev.map(o => o._id === orderId || o.id === orderId ? { ...o, status: 'Cancelled' } : o));
            // addToast('success', 'Order cancelled'); // If toast is available, checking imports.. no useToast here.
            alert("Order cancelled successfully");
        } catch (err: any) {
            console.error("Failed to cancel order", err);
            const msg = err.response?.data?.message || "Failed to cancel order";
            alert(msg);
        }
    };

    return (
        <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
            <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* ──────── LEFT SIDEBAR ──────── */}
                <ProfileSidebar />

                {/* ──────── MAIN CONTENT ──────── */}
                <div className="flex-1 space-y-4">

                    {/* Filter Tabs & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                        <div className="flex bg-white rounded-[2px] shadow-sm p-1 gap-1 w-full md:w-auto overflow-x-auto">
                            {['All', 'In Progress', 'Delivered', 'Cancelled'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-[2px] text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                        ? 'bg-[#2874F0] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64 bg-white rounded-[2px] shadow-sm">
                            <input
                                type="text"
                                placeholder="Search your orders here"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-[2px] focus:outline-none focus:border-[#2874F0]"
                            />
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Orders List */}
                    <SmoothReveal>
                        {loading && orders.length === 0 ? (
                            <div className="text-center py-12">Loading orders...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-[2px] shadow-sm p-12 text-center flex flex-col items-center justify-center">
                                <ShoppingBag size={48} className="text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-800">No orders found</h3>
                                <p className="text-gray-500 mb-6">Change filters or go shopping!</p>
                                <button onClick={() => router.push('/shop')} className="bg-[#2874F0] text-white px-8 py-2.5 rounded-[2px] font-bold shadow-sm hover:bg-blue-600 transition-colors">
                                    Shop Now
                                </button>
                            </div>
                        ) : (
                            filteredOrders.map((order: any) => (
                                <div key={order._id || order.id} className="bg-white rounded-[8px] shadow-sm hover:shadow-md transition-shadow border border-gray-200 mb-6 overflow-hidden">
                                    {/* Order Header */}
                                    <div className="bg-[#fff] px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 uppercase font-medium tracking-wide">Order Placed</span>
                                                <span className="text-sm font-medium text-gray-900 mt-1">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 uppercase font-medium tracking-wide">Total</span>
                                                <span className="text-sm font-medium text-gray-900 mt-1">₹{order.total?.toLocaleString() || order.items?.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Order # {order._id || order.id}</span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    {(!order.items || order.items.length === 0) ? (
                                        <div className="p-6 text-center text-gray-500 bg-gray-50 italic">
                                            No products found in this order
                                        </div>
                                    ) : (
                                        order.items.map((item: any, idx: number) => (
                                            <div key={idx} className={`p-6 flex flex-col lg:flex-row gap-6 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                                                {/* Left: Image */}
                                                <div className="w-32 h-32 flex-shrink-0 border border-gray-200 rounded-md p-2 flex items-center justify-center bg-white cursor-pointer" onClick={() => router.push(`/product/${item.productId}`)}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="max-w-full max-h-full object-contain hover:scale-105 transition-transform"
                                                    />
                                                </div>

                                                {/* Middle: Details & Status */}
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg hover:text-[#2874F0] cursor-pointer line-clamp-2" onClick={() => router.push(`/product/${item.productId}`)}>
                                                            {item.name}
                                                        </h3>
                                                        <div className="text-sm text-gray-500 mt-1 flex gap-3">
                                                            {item.selectedVariants?.Color && <span>Color: <span className="text-gray-900 font-medium">{item.selectedVariants.Color}</span></span>}
                                                            {item.selectedVariants?.Size && <span>Size: <span className="text-gray-900 font-medium">{item.selectedVariants.Size}</span></span>}
                                                            <span>Qty: <span className="text-gray-900 font-medium">{item.quantity}</span></span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {order.status === 'Cancelled' ? (
                                                                <XCircle size={18} className="text-red-500" />
                                                            ) : order.status === 'Delivered' ? (
                                                                <CheckCircle size={18} className="text-green-600" />
                                                            ) : (
                                                                <Truck size={18} className="text-[#2874F0]" />
                                                            )}
                                                            <span className={`font-bold text-base ${order.status === 'Cancelled' ? 'text-red-600' : order.status === 'Delivered' ? 'text-green-600' : 'text-gray-900'}`}>
                                                                {order.status === 'Delivered' ? `Delivered on ${new Date(order.updatedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}` : order.status}
                                                            </span>
                                                        </div>

                                                        {/* Progress Bar (Only standard statuses) */}
                                                        {['Pending', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
                                                            <div className="relative w-full max-w-md mt-4">
                                                                {/* Line */}
                                                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                                                                <div className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: getProgressWidth(order.status) }}></div>

                                                                {/* Dots */}
                                                                <div className="relative z-10 flex justify-between w-full">
                                                                    {/* Ordered */}
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <div className={`w-3 h-3 rounded-full border-2 ${['Pending', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
                                                                        <span className="text-xs text-gray-500 font-medium absolute top-4 whitespace-nowrap">Ordered</span>
                                                                    </div>
                                                                    {/* Shipped */}
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <div className={`w-3 h-3 rounded-full border-2 ${['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
                                                                        <span className="text-xs text-gray-500 font-medium absolute top-4 whitespace-nowrap">Shipped</span>
                                                                    </div>
                                                                    {/* Out for Delivery */}
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <div className={`w-3 h-3 rounded-full border-2 ${['Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
                                                                        <span className="text-xs text-gray-500 font-medium absolute top-4 whitespace-nowrap">Out for Delivery</span>
                                                                    </div>
                                                                    {/* Delivered */}
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <div className={`w-3 h-3 rounded-full border-2 ${['Delivered'].includes(order.status) ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
                                                                        <span className="text-xs text-gray-500 font-medium absolute top-4 whitespace-nowrap">Delivered</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Price & Actions */}
                                                <div className="flex flex-col items-end gap-4 min-w-[180px]">
                                                    <div className="text-xl font-bold text-gray-900">₹{(item.price || 0).toLocaleString()}</div>

                                                    <div className="flex flex-row items-center gap-2 mt-2">


                                                        <button
                                                            onClick={() => {
                                                                const idToTrack = order.trackingId || order.orderNumber || order.id || order._id;
                                                                if (idToTrack) {
                                                                    router.push(`/track/${idToTrack}`);
                                                                } else {
                                                                    alert("Tracking not available");
                                                                }
                                                            }}
                                                            className={`border border-gray-300 font-medium py-1.5 px-4 rounded-[2px] text-sm transition-colors whitespace-nowrap hover:bg-gray-50 text-gray-800`}
                                                        >
                                                            View Details
                                                        </button>

                                                        {order.status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order._id || order.id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-6 rounded-[2px] text-sm shadow-sm transition-colors whitespace-nowrap"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}

                                                        {order.status === 'Delivered' && (
                                                            <button className="bg-[#2874F0] hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-[4px] text-sm transition-colors shadow-sm whitespace-nowrap">
                                                                Buy Again
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )))}
                                </div>
                            ))
                        )}
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
