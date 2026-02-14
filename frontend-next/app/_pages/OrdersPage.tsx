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
import { resolveProductImage } from '@/app/utils/imageHelper';

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
            <div className="max-w-[1200px] mx-auto px-0 md:px-4 py-4 md:py-8 flex flex-col lg:flex-row gap-4 md:gap-6">

                {/* ──────── LEFT SIDEBAR ──────── */}
                <div className="hidden lg:block">
                    <ProfileSidebar />
                </div>
                {/* Mobile Sidebar Trigger (Optional or handle via Layout) - For now assuming Sidebar handles itself or hidden on mobile main view */}

                {/* ──────── MAIN CONTENT ──────── */}
                <div className="flex-1 space-y-4 px-3 md:px-0">

                    {/* Filter Tabs & Search */}
                    <div className="flex flex-col gap-3 mb-2">
                        {/* Search Bar - Top on Mobile */}
                        <div className="relative w-full bg-white rounded-lg shadow-sm">
                            <input
                                type="text"
                                placeholder="Search your orders here"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2874F0]"
                            />
                            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        </div>

                        {/* Tabs - Scrollable on Mobile */}
                        <div className="flex bg-white rounded-lg shadow-sm p-1 gap-2 w-full overflow-x-auto no-scrollbar">
                            {['All', 'In Progress', 'Delivered', 'Cancelled'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab
                                        ? 'bg-[#2874F0] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orders List */}
                    <SmoothReveal>
                        {loading && orders.length === 0 ? (
                            <div className="text-center py-12">Loading orders...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center flex flex-col items-center justify-center">
                                <ShoppingBag size={48} className="text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-800">No orders found</h3>
                                <p className="text-sm text-gray-500 mb-6">Change filters or go shopping!</p>
                                <button onClick={() => router.push('/shop')} className="bg-[#2874F0] text-white px-8 py-3 rounded-lg font-bold shadow-sm hover:bg-blue-600 transition-colors w-full md:w-auto">
                                    Shop Now
                                </button>
                            </div>
                        ) : (
                            filteredOrders.map((order: any) => (
                                <div key={order._id || order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 mb-4 md:mb-6 overflow-hidden">
                                    {/* Order Header */}
                                    <div className="bg-gray-50/50 px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                        <div className="flex justify-between md:justify-start items-center md:gap-8 w-full md:w-auto">

                                            {/* Mobile: Order ID & Date compact */}
                                            <div className="flex flex-col md:hidden">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Order ID</span>
                                                <span className="text-xs font-semibold text-gray-900">#{(order._id || order.id).slice(-8).toUpperCase()}</span>
                                            </div>

                                            <div className="flex flex-col items-end md:items-start">
                                                <span className="text-[10px] md:text-xs text-gray-400 uppercase font-medium tracking-wide">Total Amount</span>
                                                <span className="text-sm md:text-base font-bold text-gray-900">₹{order.total?.toLocaleString() || order.items?.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0).toLocaleString()}</span>
                                            </div>

                                            <div className="hidden md:flex flex-col">
                                                <span className="text-xs text-gray-400 uppercase font-medium tracking-wide">Placed On</span>
                                                <span className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-xs text-gray-500">
                                            Order # {order._id || order.id}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    {(!order.items || order.items.length === 0) ? (
                                        <div className="p-6 text-center text-gray-500 bg-gray-50 italic">
                                            No products found in this order
                                        </div>
                                    ) : (
                                        order.items.map((item: any, idx: number) => (
                                            <div key={idx} className={`p-3 md:p-6 flex flex-col gap-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>

                                                {/* Top Row: Image + Details + Price/Status */}
                                                <div className="flex gap-3 md:gap-6">
                                                    {/* Image */}
                                                    <div className="w-[72px] h-[72px] md:w-32 md:h-32 flex-shrink-0 border border-gray-100 rounded-lg p-1 bg-white cursor-pointer" onClick={() => router.push(`/product/${item.productId}`)}>
                                                        <img
                                                            src={resolveProductImage(item)}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h3 className="text-sm md:text-lg font-bold text-gray-800 leading-snug line-clamp-2 cursor-pointer hover:text-[#2874F0]" onClick={() => router.push(`/product/${item.productId}`)}>
                                                                    {item.productName || item.name}
                                                                </h3>
                                                                <div className="md:hidden text-sm font-bold text-gray-900 whitespace-nowrap">
                                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                                </div>
                                                            </div>

                                                            {/* Meta */}
                                                            <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2 space-x-2 md:space-x-4">
                                                                {(item.color || item.selectedVariants?.Color || item.selectedVariants?.Colour) &&
                                                                    <span className="inline-flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                                                                        Main: <span className="font-medium text-gray-900">{item.color || item.selectedVariants?.Color || item.selectedVariants?.Colour}</span>
                                                                    </span>
                                                                }
                                                                {(item.size || item.selectedVariants?.Size) &&
                                                                    <span className="inline-flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                                                                        Size: <span className="font-medium text-gray-900">{item.size || item.selectedVariants?.Size}</span>
                                                                    </span>
                                                                }
                                                                <span className="inline-flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                                                                    Qty: <span className="font-medium text-gray-900">{item.quantity}</span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Status & Price (Desktop) */}
                                                        <div className="mt-2 md:mt-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                {order.status === 'Cancelled' ? (
                                                                    <XCircle size={16} className="text-red-500 md:w-5 md:h-5" />
                                                                ) : order.status === 'Delivered' ? (
                                                                    <CheckCircle size={16} className="text-green-600 md:w-5 md:h-5" />
                                                                ) : (
                                                                    <Truck size={16} className="text-[#2874F0] md:w-5 md:h-5" />
                                                                )}
                                                                <span className={`text-xs md:text-base font-bold ${order.status === 'Cancelled' ? 'text-red-600' : order.status === 'Delivered' ? 'text-green-700' : 'text-gray-900'}`}>
                                                                    {order.status === 'Delivered' ? `Delivered on ${new Date(order.updatedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}` : order.status}
                                                                </span>
                                                            </div>
                                                            <div className="hidden md:block text-xl font-bold text-gray-900">
                                                                ₹{(item.price * item.quantity).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Actions */}
                                                <div className="flex flex-col md:flex-row md:justify-end gap-2 md:mt-2">
                                                    <button
                                                        onClick={() => {
                                                            const idToTrack = order.trackingId || order.orderNumber || order.id || order._id;
                                                            if (idToTrack) {
                                                                router.push(`/track/${idToTrack}`);
                                                            } else {
                                                                alert("Tracking not available");
                                                            }
                                                        }}
                                                        className="w-full md:w-auto border border-gray-300 font-semibold py-2.5 md:py-2 px-6 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                                                    >
                                                        View Details
                                                    </button>

                                                    {order.status === 'Pending' && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order._id || order.id)}
                                                            className="w-full md:w-auto bg-white border border-red-200 text-red-600 font-semibold py-2.5 md:py-2 px-6 rounded-lg text-sm hover:bg-red-50 transition-colors active:scale-95"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                    {(order.status?.toLowerCase().trim() === 'delivered') && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/product/${item.productId}`)
                                                                }}
                                                                className="w-full md:w-auto bg-[#2874F0] text-white font-semibold py-2.5 md:py-2 px-6 rounded-lg text-sm shadow-sm hover:bg-blue-600 transition-colors active:scale-95"
                                                            >
                                                                Buy Again
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const confirmReturn = window.confirm("Do you want to initiate a return?");
                                                                    if (confirmReturn) alert("Return Initiated");
                                                                }}
                                                                className="w-full md:w-auto bg-white border border-gray-300 text-gray-800 font-medium py-2 px-6 rounded hover:bg-gray-50 transition-colors text-sm w-full md:w-auto shadow-sm flex items-center justify-center gap-2"
                                                            >
                                                                <RotateCcw size={14} className="text-[#2874F0]" /> Return
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Desktop Progress Bar (Hidden on Mobile usually, or Simplified) */}
                                                <div className="hidden md:block mt-2">
                                                    {/* Existing Progress Bar Logic kept for Desktop */}
                                                    {['Pending', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
                                                        <div className="relative w-full max-w-md mt-4">
                                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                                                            <div className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: getProgressWidth(order.status) }}></div>
                                                            <div className="relative z-10 flex justify-between w-full">
                                                                {['Pending', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, sIdx) => (
                                                                    <div key={sIdx} className="flex flex-col items-center gap-1">
                                                                        <div className={`w-3 h-3 rounded-full border-2 ${['Pending', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(order.status) >= sIdx ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
                                                                        <span className="text-xs text-gray-500 font-medium absolute top-4 whitespace-nowrap">{step === 'Pending' ? 'Ordered' : step}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}

                                </div >
                            ))
                        )}
                    </SmoothReveal >
                </div >
            </div >
        </div >
    );
};

export default OrdersPage;
