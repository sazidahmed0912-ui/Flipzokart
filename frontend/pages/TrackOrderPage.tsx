import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { normalizeOrder } from '../utils/orderHelper';
import {
    Check, MapPin, CreditCard, FileText,
    ChevronRight, HelpCircle, Package, Truck, AlertCircle,
    Download, MoreHorizontal
} from 'lucide-react';

import { useToast } from '../components/toast';

export const TrackOrderPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const socket = useSocket(token);

    const fetchTrackingInfo = useCallback(async (isPolling = false) => {
        if (!trackingId) return;
        try {
            // Background polling shouldn't set loading to true
            if (!isPolling && !order) setLoading(true);

            const { data } = await API.get(`/api/tracking/${trackingId}`);
            if (data) {
                // DATA NORMALIZATION: Use shared utility (Single Source of Truth)
                const rawOrder = data.trackingData || data;
                const normalizedOrder = normalizeOrder(rawOrder);

                // Ensure specific fields required by this page are present if normalizeOrder puts them elsewhere
                // normalizeOrder puts totals in 'totals' object, but UI uses 'grandTotal'.
                // Let's ensure compatibility or update UI. 
                // Updating UI is better, but to be safe and strictly fix data binding without breaking existing UI access patterns too much:
                // We'll flatten potentially needed fields if UI expects them at root.
                // Actually, let's update the UI to use the robust structure or map it here.
                // Mapping here is safer for "Minimal changes" rule.

                // Re-enforce page-specific needs if normalizeOrder missed them (it shouldn't, but let's be safe)
                // normalizeOrder returns 'items', 'address', 'payment', 'totals'.

                // Map back to flat structure for existing UI components in this file if they access strict paths
                const orderForUI = {
                    ...normalizedOrder,
                    // Aliases for UI compatibility
                    grandTotal: normalizedOrder.totals?.grandTotal || normalizedOrder.totalAmount,
                    total: normalizedOrder.totals?.grandTotal, // some UI might check .total
                    shippingFee: normalizedOrder.totals?.shipping,
                    shippingAddress: normalizedOrder.address, // UI uses shippingAddress
                    paymentMethod: normalizedOrder.payment?.method,
                    orderId: normalizedOrder.id // UI uses order.orderId
                };

                setOrder(orderForUI);
                setError('');
            } else {
                if (!order) setError("Order not found");
            }
        } catch (err) {
            console.error("Tracking API failed:", err);
            if (!order) setError('Order details not available.');
        } finally {
            if (!isPolling) setLoading(false);
        }
    }, [trackingId]); // Removed 'order' dependency to allow stable reference, handle 'order' check inside if needed for loading logic

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            const id = order.orderId || order._id || order.id;
            await API.put(`/api/order/${id}/status`, { status: 'Cancelled' });
            fetchTrackingInfo(); // Refresh data
        } catch (err) {
            console.error("Failed to cancel order", err);
            alert("Failed to cancel order. Please try again or contact support.");
        }
    };

    const handleNeedHelp = () => {
        // Link to help center
        navigate('/help-center');
    };

    const handleTrackRefresh = async () => {
        setLoading(true);
        await fetchTrackingInfo();
        addToast('info', 'Order status refreshed');
    };

    // Initial Fetch
    useEffect(() => {
        fetchTrackingInfo();
    }, [fetchTrackingInfo]);

    // Build Polling Mechanism (Safe Fallback)
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchTrackingInfo(true);
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(intervalId);
    }, [fetchTrackingInfo]);

    // Real-time updates via Socket
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = (data: any) => {
            console.log("Socket Update Received:", data);
            // Optimally, check if data.orderId matches trackingId
            if (data.type === 'orderStatusUpdate') {
                fetchTrackingInfo(true);
                // Optional: Toast limited to once per meaningful update?
                // addToast('info', 'Order update received'); 
            }
        };

        socket.on('notification', handleUpdate);

        return () => {
            socket.off('notification', handleUpdate);
        };
    }, [socket, fetchTrackingInfo]);

    if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
    if (error || !order) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">{error || 'Order not found'}</div>;

    // --- Helpers ---
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    // Status Logic
    // Backend uses: Pending, Processing, Shipped, Out for Delivery, Delivered
    // We Map 'Packed' to 'Processing' if needed, or just use Processing.
    const steps = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    // Normalize status for UI: If backend says "Packed", map to "Processing"
    const displayStatus = order.status === 'Packed' ? 'Processing' : order.status;
    const currentStepIndex = steps.indexOf(displayStatus) === -1 ? 0 : steps.indexOf(displayStatus);

    // Determine progress width for the horizontal stepper
    const getProgressWidth = () => {
        const total = steps.length - 1;
        const width = (currentStepIndex / total) * 100;
        return `${width}%`;
    };

    const isCancelled = order.status === 'Cancelled';

    const renderAddress = () => {
        const addr = order.shippingAddress;
        if (!addr) return <p className="text-sm text-gray-500">Address not available</p>;

        // If it's a simple string (legacy or fallback)
        if (order.shippingAddressIsString || (typeof addr === 'string')) {
            return <p className="text-sm text-gray-600">{typeof addr === 'string' ? addr : addr.address}</p>;
        }

        return (
            <div className="space-y-1">
                <p className="font-bold text-sm text-gray-900">{addr.name || order.user?.name || order.userName}</p>
                <p className="text-sm text-gray-600">{addr.address || addr.street}</p>
                <p className="text-sm text-gray-600">
                    {addr.city ? `${addr.city}, ` : ''}{addr.state} {addr.pincode ? `- ${addr.pincode}` : ''}
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">Phone:</span>
                    <span className="text-sm text-gray-600">{addr.phone || order.user?.phone}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F1F3F6] p-4 md:p-8 font-sans text-sm">
            <div className="max-w-[1000px] mx-auto">

                {/* Header Info */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-gray-900 font-semibold">Order ID: {order.orderId || order._id}</div>
                    {/* Only show 'Placed on' if available */}
                    <div className="text-gray-500 font-medium">
                        {order.createdAt && `Placed on ${formatDate(order.createdAt)}`}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                    <button
                        onClick={handleTrackRefresh}
                        className="bg-[#FFD814] text-black px-6 py-2 rounded-md font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        Track Order
                    </button>
                </div>

                {/* Horizontal Stepper (Top) */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6 relative overflow-hidden">
                    {/* Steps */}
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-[14px] left-0 w-full h-[3px] bg-gray-200 hidden md:block z-0"></div>
                        <div
                            className="absolute top-[14px] left-0 h-[3px] bg-green-500 hidden md:block z-0 transition-all duration-500"
                            style={{ width: isCancelled ? '0%' : getProgressWidth() }}
                        ></div>

                        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                            {!isCancelled && steps.map((step, idx) => {
                                const stepIdx = steps.indexOf(step);
                                const isCompleted = stepIdx <= currentStepIndex;

                                return (
                                    <div key={step} className="flex md:flex-col items-center gap-3 md:gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                                             ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-transparent'}
                                         `}>
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                        <span className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                            {/* Cancelled State */}
                            {isCancelled && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                                        <Check size={16} />
                                    </div>
                                    <span className="font-bold text-red-600">Cancelled</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Arriving By Banner */}
                {!isCancelled && (
                    <div className="bg-[#effcf5] border border-[#dcfce7] p-4 rounded-sm mb-4 flex justify-between items-center px-6">
                        <div className="flex items-center gap-2">
                            <span className="text-base text-gray-800">Arriving by <span className="font-bold text-green-700">{order.expectedDelivery ? formatDate(order.expectedDelivery) : 'Tomorrow'}</span></span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">₹{(order.grandTotal !== undefined ? order.grandTotal : (order.total || 0)).toLocaleString('en-IN')}</div>
                    </div>
                )}


                {/* Product Information */}
                <div className="bg-white rounded-sm shadow-sm mb-4">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Product Information</h3>
                        <button className="text-[#2874F0] font-medium text-sm flex items-center gap-1 hover:underline">
                            <HelpCircle size={16} /> Need Help?
                        </button>
                    </div>

                    {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className={`p-4 md:p-6 flex flex-col md:flex-row gap-6 ${idx !== 0 ? 'border-t border-gray-100' : ''}`}>
                            <div className="w-32 h-32 flex-shrink-0 border border-gray-200 p-2 flex items-center justify-center">
                                <img
                                    src={item.image || "https://via.placeholder.com/150"}
                                    alt={item.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row justify-between mb-4">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-gray-900 text-lg hover:text-[#2874F0] cursor-pointer line-clamp-1">{item.name}</h4>
                                        <p className="text-gray-500 text-xs">Ordered on {formatDate(order.createdAt)}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                                                Qty: {item.quantity}
                                            </div>
                                            <div className="text-xl font-bold text-gray-900">₹{item.price.toLocaleString()}</div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Seller: <span className="font-medium text-gray-700">{item.sellerName || 'Alpha Mobiles'}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col gap-3 justify-center md:justify-start min-w-[150px]">
                                <button
                                    onClick={handleNeedHelp}
                                    className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 font-medium py-2 px-4 rounded hover:shadow-sm transition-all text-sm w-full"
                                >
                                    <HelpCircle size={16} className="text-[#2874F0]" /> Need help?
                                </button>
                                {order.status === 'Pending' && (
                                    <button
                                        onClick={handleCancelOrder}
                                        className="bg-white border border-gray-300 text-gray-800 font-medium py-2 px-4 rounded hover:shadow-sm transition-all text-sm w-full"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                <button className="bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded hover:shadow-sm transition-all w-full flex justify-center">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Grid: Address, Payment, Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Delivery Address */}
                    <div className="bg-white p-6 rounded-sm shadow-sm h-full">
                        <h3 className="font-bold text-base text-gray-900 mb-4">Delivery Address</h3>
                        {renderAddress()}
                    </div>

                    {/* Price Details Column */}
                    <div className="bg-white p-6 rounded-sm shadow-sm h-full flex flex-col">
                        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Price Details</h3>
                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-900">Price ({order.items?.length || 0} items)</span>
                                <span className="font-medium text-gray-900">₹{(order.grandTotal).toLocaleString()}</span>
                            </div>
                            {/* Placeholder for potential discount if available in future */}
                            {/* <div className="flex justify-between items-center text-sm">
                                 <span className="text-gray-900">Discount</span>
                                 <span className="font-medium text-green-600">- ₹0</span>
                             </div> */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-900">Delivery Charges</span>
                                <span className="font-medium text-green-600">Free</span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-2 pt-3 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total Amount</span>
                                <span className="font-bold text-lg text-gray-900">₹{(order.grandTotal).toLocaleString()}</span>
                            </div>

                            <div className="text-xs text-green-700 font-medium bg-green-50 p-2 rounded">
                                You will save ₹500 on this order
                            </div>
                        </div>

                        {/* Invoice & Actions */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <CreditCard size={14} />
                                <span>Payment Mode: <span className="font-bold text-gray-700">{order.paymentMethod || order.paymentMode || 'COD'}</span></span>
                            </div>

                            <button

                                onClick={() => {
                                    const targetId = order.orderId || trackingId;
                                    if (targetId) navigate(`/invoice/${targetId}`);
                                }}
                                disabled={!order.orderId && !trackingId}
                                className={`w-full flex items-center justify-center gap-2 border border-gray-300 rounded-[2px] py-2 text-sm font-bold text-gray-700 transition-colors ${(!order.orderId && !trackingId) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                <Download size={16} className="text-[#2874F0]" /> Download Invoice
                            </button>
                            <button
                                onClick={handleTrackRefresh}
                                className="w-full bg-[#FB641B] text-white font-bold py-3 rounded-[2px] text-sm hover:bg-[#e65a17] transition-colors shadow-sm uppercase"
                            >
                                Track Order
                            </button>
                        </div>
                    </div>

                    {/* Shipping Progress Detail */}
                    <div className="bg-white p-6 rounded-sm shadow-sm h-full relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-base text-gray-900">Shipping Progress</h3>
                            <span className="text-blue-600 text-sm cursor-pointer font-medium">More v</span>
                        </div>

                        <div className="relative pl-3 border-l-2 border-dashed border-gray-200 space-y-6">
                            {/* Current Status */}
                            <div className="relative">
                                <div className="absolute -left-[19px] top-0 w-4 h-4 rounded-full bg-green-500 border-[3px] border-white ring-1 ring-green-500"></div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{displayStatus}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Arriving by {order.expectedDelivery ? formatDate(order.expectedDelivery) : 'Tomorrow'}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            {/* Previous (Shipped) */}
                            {['Shipped', 'Out for Delivery', 'Delivered'].includes(displayStatus) && (
                                <div className="relative opacity-60">
                                    <div className="absolute -left-[19px] top-0 w-4 h-4 rounded-full bg-gray-400 border-[3px] border-white ring-1 ring-gray-400"></div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-800">Shipped</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Your item has been shipped</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{order.createdAt ? formatDate(order.createdAt) : ''}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Help */}
                <div className="mt-8 flex justify-start">
                    <button
                        onClick={handleNeedHelp}
                        className="bg-[#FFD814] text-black font-medium py-2 px-8 rounded shadow-sm hover:opacity-90"
                    >
                        Need Help?
                    </button>
                </div>

            </div>
        </div>
    );
};
