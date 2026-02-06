"use client";
import React, { useEffect, useState, useCallback } from 'react';

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import API from '@/app/services/api';
import { useSocket } from '@/app/hooks/useSocket';
import { normalizeOrder } from '@/app/utils/orderHelper';
import { resolveProductImage } from '@/app/utils/imageHelper';
import {
    Check, MapPin, CreditCard, FileText,
    ChevronRight, HelpCircle, Package, Truck, AlertCircle,
    Download, MoreHorizontal
} from 'lucide-react';

import { useToast } from '@/app/components/toast';

export const TrackOrderPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const router = useRouter();
    const { addToast } = useToast();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const socket = useSocket(token);

    const processOrderData = (data: any) => {
        if (data) {
            // The backend returns { items, address, ... trackingData: { events } }
            // We want the ROOT object (or data.data/data.order wrapper), NOT trackingData
            const rawOrder = data.data || data.order || data;
            const normalizedOrder = normalizeOrder(rawOrder);

            // Ensure specific fields required by this page are present if normalizeOrder puts them elsewhere
            // normalizeOrder puts totals in 'totals' object, but UI uses 'grandTotal'.
            const orderForUI = {
                ...normalizedOrder,
                // Aliases for UI compatibility
                grandTotal: normalizedOrder.totals?.grandTotal || normalizedOrder.totalAmount || 0,
                total: normalizedOrder.totals?.grandTotal || 0, // some UI might check .total
                shippingFee: normalizedOrder.totals?.shipping || 0,
                shippingAddress: normalizedOrder.address, // UI uses shippingAddress
                paymentMethod: normalizedOrder.payment?.method,
                orderId: normalizedOrder.id, // UI uses order.orderId
                // Real-Time Fields
                currentLocation: rawOrder.currentLocation || normalizedOrder.currentLocation,
                statusHistory: rawOrder.statusHistory || normalizedOrder.statusHistory
            };

            setOrder(orderForUI);
            setError('');
        }
    };

    const fetchTrackingInfo = useCallback(async (isPolling = false) => {
        if (!trackingId) return;

        // Background polling shouldn't set loading to true
        if (!isPolling && !order) setLoading(true);

        try {
            // Try Tracking API first
            const { data } = await API.get(`/api/tracking/${trackingId}`);
            processOrderData(data);
        } catch (trackingError) {
            console.warn("Tracking API failed, falling back to Order API...", trackingError);
            try {
                // Fallback to Order API
                const { data } = await API.get(`/api/order/${trackingId}`);
                processOrderData(data);
            } catch (orderError) {
                console.error("Both Tracking and Order APIs failed:", orderError);
                if (!order) setError('Order not found or access denied.');
            }
        } finally {
            if (!isPolling) setLoading(false);
        }
    }, [trackingId]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            // Prioritize _id (MongoDB ID) over orderId (which could be a string like 'ORD-123')
            // Using || chain to be safe
            const id = order._id || order.id || order.orderId;

            if (!id) {
                alert("Order ID missing. Please refresh the page.");
                return;
            }

            console.log("Cancelling order with ID:", id); // Debug log

            await API.put(`/api/order/${id}/status`, { status: 'Cancelled' });

            addToast('success', 'Order cancelled successfully');
            fetchTrackingInfo(); // Refresh data
        } catch (err: any) {
            console.error("Failed to cancel order", err);
            const errorMessage = err.response?.data?.message || "Failed to cancel order. Please connect with support.";
            alert(errorMessage);
        }
    };

    const handleNeedHelp = () => {
        // Link to help center
        router.push('/help-center');
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

    // Build Polling Mechanism (Fail-Safe Fallback)
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchTrackingInfo(true);
        }, 20000); // Fail-safe: 20 seconds

        return () => clearInterval(intervalId);
    }, [fetchTrackingInfo]);

    // Real-time updates via Socket (Ultra Lock Protocol)
    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (data: any) => {
            // Check matching order ID
            if (data.orderId === trackingId || (order && data.orderId === order.orderId) || (order && data.orderId === order._id)) {
                console.log("⚡ SOCKET: ORDER_STATUS_UPDATED", data);
                setOrder((prev: any) => prev ? {
                    ...prev,
                    status: data.status,
                    currentLocation: data.location || prev.currentLocation,
                    statusHistory: prev.statusHistory ? [...prev.statusHistory, { status: data.status, timestamp: data.time || new Date(), note: data.message }] : []
                } : prev);
                addToast('info', `Order status updated: ${data.status}`);
            }
        };

        const handleLocationUpdate = (data: any) => {
            if (data.orderId === trackingId || (order && data.orderId === order.orderId) || (order && data.orderId === order._id)) {
                // console.log("⚡ SOCKET: ORDER_LOCATION_UPDATED", data); // reduce log spam
                // Update location instantly
                setOrder((prev: any) => prev ? {
                    ...prev,
                    currentLocation: data.location
                } : prev);
            }
        };

        socket.on('ORDER_STATUS_UPDATED', handleStatusUpdate);
        socket.on('ORDER_LOCATION_UPDATED', handleLocationUpdate);

        // Also listen to legacy event just in case
        // socket.on('notification', ...);

        return () => {
            socket.off('ORDER_STATUS_UPDATED', handleStatusUpdate);
            socket.off('ORDER_LOCATION_UPDATED', handleLocationUpdate);
        };
    }, [socket, trackingId, order, addToast]);

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
                <div className="flex justify-between items-start mb-6">
                    <div className="text-gray-900 font-semibold mt-2">Order ID: {order.orderId || order._id}</div>
                    {/* Only show 'Placed on' if available */}
                    <div className="flex flex-col items-end gap-2 mt-4">
                        <div className="text-gray-500 font-medium">
                            {order.createdAt ? `Placed on ${formatDate(order.createdAt)}` : ''}
                        </div>
                        <button
                            onClick={handleTrackRefresh}
                            className="mt-2 bg-[#FFD814] text-black px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                        >
                            Track Order
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
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

                {/* Live Location Map - NEW ADDITION */}
                {['Shipped', 'Out for Delivery'].includes(displayStatus) && !isCancelled && (
                    <div className="bg-white p-6 rounded-md shadow-sm mb-6 relative overflow-hidden animate-in fade-in duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <h3 className="font-bold text-lg text-gray-800">Live Delivery Status</h3>
                        </div>

                        <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner group">
                            {order.currentLocation && order.currentLocation.lat ? (
                                <>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={`https://maps.google.com/maps?q=${order.currentLocation.lat},${order.currentLocation.lng}&z=15&output=embed`}
                                        className="grayscale-[0%] opacity-90 transition-opacity"
                                        allowFullScreen
                                    ></iframe>

                                    {/* Location Card */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-lg flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                            <MapPin className="text-red-500" size={20} fill="currentColor" fillOpacity={0.2} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Current Location</p>
                                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                                {order.currentLocation.address || "Location updated just now"}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Updated {order.currentLocation.updatedAt ? new Date(order.currentLocation.updatedAt).toLocaleTimeString() : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 bg-gray-50">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 animate-pulse">
                                        <Truck size={32} className="text-blue-400" />
                                    </div>
                                    <p className="text-base font-semibold text-gray-600">Waiting for location update...</p>
                                    <p className="text-sm text-gray-400 mt-1">The delivery agent hasn't shared their location yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Arriving By Banner */}
                {!isCancelled && (
                    <div className="bg-[#effcf5] border border-[#dcfce7] p-4 rounded-sm mb-4 flex justify-between items-center px-6">
                        <div className="flex items-center gap-2">
                            <span className="text-base text-gray-800">Arriving by <span className="font-bold text-green-700">{order.expectedDelivery ? formatDate(order.expectedDelivery) : 'Tomorrow'}</span></span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">₹{(order.grandTotal || order.total || 0).toLocaleString('en-IN')}</div>
                    </div>
                )}


                {!searchParams.get('view')?.includes('shipping_label') && (
                    <div className="bg-white rounded-sm shadow-sm mb-4">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">Product Information</h3>
                        </div>

                        {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className={`p-4 md:p-6 flex flex-col md:flex-row gap-6 ${idx !== 0 ? 'border-t border-gray-100' : ''}`}>
                                <div className="w-32 h-32 flex-shrink-0 border border-gray-200 p-2 flex items-center justify-center">
                                    <img
                                        src={resolveProductImage(item)}
                                        alt={item.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row justify-between mb-4">
                                        <div className="space-y-1">
                                            <h4 className="font-medium text-gray-900 text-lg hover:text-[#2874F0] cursor-pointer line-clamp-1">{item.name || item.productName}</h4>

                                            {/* STRICT VARIANT SNAPSHOTS */}
                                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                                                {item.color && (
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">
                                                        Color: <span className="font-medium text-gray-800">{item.color}</span>
                                                    </span>
                                                )}
                                                {item.size && (
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">
                                                        Size: <span className="font-medium text-gray-800">{item.size}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-500 text-xs mt-2">Ordered on {formatDate(order.createdAt)}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                                                    Qty: {item.quantity}
                                                </div>
                                                <div className="text-xl font-bold text-gray-900">₹{(item.price || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Seller: <span className="font-medium text-gray-700">{item.sellerName || 'Alpha Mobiles'}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col gap-3 justify-center md:justify-start min-w-[150px]">
                                    {order.status === 'Pending' && (
                                        <button
                                            onClick={handleCancelOrder}
                                            className="bg-white border border-gray-300 text-gray-800 font-medium py-2 px-4 rounded hover:shadow-sm transition-all text-sm w-full"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNeedHelp}
                                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 font-medium py-2 px-4 rounded hover:shadow-sm transition-all text-sm w-full"
                                    >
                                        <HelpCircle size={16} className="text-[#2874F0]" /> Need help?
                                    </button>
                                    <button className="bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded hover:shadow-sm transition-all w-full flex justify-center">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                                <span className="text-gray-900">Items Price</span>
                                <span className="font-medium text-gray-900">₹{(order.totals?.itemsPrice || 0).toLocaleString('en-IN')}</span>
                            </div>
                            {(order.totals?.discount || 0) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-900">Discount</span>
                                    <span className="font-medium text-green-600">- ₹{(order.totals?.discount || 0).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {(order.totals?.tax || 0) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-900">Tax / GST</span>
                                    <span className="font-medium text-gray-900">₹{(order.totals?.tax).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {(order.totals?.platformFee || 0) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-900">Platform Fee</span>
                                    <span className="font-medium text-gray-900">₹{(order.totals?.platformFee).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-900">Delivery Charges</span>
                                <span className="font-medium text-green-600">
                                    {(order.totals?.shipping || 0) === 0 ? 'Free' : `₹${(order.totals?.shipping || 0).toLocaleString('en-IN')}`}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-2 pt-3 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total Amount</span>
                                <span className="font-bold text-lg text-gray-900">₹{(order.totals?.grandTotal || 0).toLocaleString('en-IN')}</span>
                            </div>

                            {(order.totals?.discount || 0) > 0 && (
                                <div className="text-xs text-green-700 font-medium bg-green-50 p-2 rounded">
                                    You saved ₹{(order.totals?.discount).toLocaleString('en-IN')} on this order
                                </div>
                            )}
                        </div>

                        {/* Invoice & Actions */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <CreditCard size={14} />
                                <span>Payment Mode: <span className="font-bold text-gray-700">{order.paymentMethod || order.paymentMode || 'COD'}</span></span>
                            </div>

                            {!searchParams.get('view')?.includes('shipping_label') && (
                                <button

                                    onClick={() => {
                                        const targetId = order.orderId || trackingId;
                                        if (targetId) router.push(`/invoice/${targetId}`);
                                    }}
                                    disabled={!order.orderId && !trackingId}
                                    className={`w-full flex items-center justify-center gap-2 border border-gray-300 rounded-[2px] py-2 text-sm font-bold text-gray-700 transition-colors ${(!order.orderId && !trackingId) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                >
                                    <Download size={16} className="text-[#2874F0]" /> Download Invoice
                                </button>
                            )}

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
                                    {order.statusHistory && order.statusHistory.length > 0 && (
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {new Date(order.statusHistory[order.statusHistory.length - 1].timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
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

                </div>

            </div>
        </div>
    );
};

// Helper for XCircle since I missed it in step imports
function XCircle({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
    )
}
