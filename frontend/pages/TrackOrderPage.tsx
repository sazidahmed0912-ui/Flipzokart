import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
    Check, MapPin, CreditCard, FileText,
    ChevronRight, HelpCircle, Package, Truck, AlertCircle,
    Download, MoreHorizontal
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
    const { trackingId } = useParams<{ trackingId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const socket = useSocket(null);

    const fetchTrackingInfo = async () => {
        try {
            const { data } = await API.get(`/api/tracking/${trackingId}`);
            if (data) {
                // Support both structures
                setOrder(data.trackingData || data);
            } else {
                setError("Order not found");
            }
        } catch (err) {
            console.error("Tracking API failed:", err);
            setError('Order details not available.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (trackingId) fetchTrackingInfo();
    }, [trackingId]);

    // Real-time updates
    useEffect(() => {
        if (socket && order) {
            socket.on('notification', (data: any) => {
                if (data.type === 'orderStatusUpdate') fetchTrackingInfo();
            });
            return () => { socket.off('notification'); };
        }
    }, [socket, order]);

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
    const steps = ['Pending', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);

    // Determine progress width for the horizontal stepper
    const getProgressWidth = () => {
        const total = steps.length - 1;
        const width = (currentStepIndex / total) * 100;
        return `${width}%`;
    };

    const isCancelled = order.status === 'Cancelled';

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
                    <button className="bg-[#FFD814] text-black px-6 py-2 rounded-md font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                        Track Order
                    </button>
                </div>

                {/* Horizontal Stepper (Top) */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6 relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10 px-4 md:px-12">
                        {/* Line Background */}
                        <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                        {/* Active Line (Green) */}
                        <div
                            className="absolute top-4 left-0 h-1 bg-green-500 -z-10 transition-all duration-500"
                            style={{ width: isCancelled ? '0%' : getProgressWidth() }}
                        ></div>

                        {/* Steps */}
                        {!isCancelled && steps.slice(0, 3).map((step, idx) => {
                            const isActive = steps.indexOf(step) <= currentStepIndex;
                            return (
                                <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                        {isActive && <Check size={16} strokeWidth={4} />}
                                    </div>
                                    <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step === 'Pending' ? 'Ordered' : step}</span>
                                </div>
                            );
                        })}
                        {/* If Cancelled */}
                        {isCancelled && (
                            <div className="flex flex-col items-center gap-2 bg-white px-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-red-500 border-red-500 text-white">
                                    <Check size={16} strokeWidth={4} />
                                </div>
                                <span className="font-medium text-red-600">Cancelled</span>
                            </div>
                        )}
                    </div>
                    {/* Expected Delivery Banner */}
                    {!isCancelled && order.expectedDelivery && (
                        <div className="mt-8 bg-[#F0FDF4] border border-green-100 p-4 rounded-md text-green-800 font-medium flex items-center gap-2">
                            <span>Arriving by {formatDate(order.expectedDelivery)}</span>
                            <span className="font-bold text-black ml-auto md:ml-4">₹{(order.grandTotal || order.total).toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* Product Information Card */}
                {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-[4px] shadow-sm border border-gray-200 mb-6 overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row gap-8">
                            {/* Product Image */}
                            <div className="w-32 h-32 flex-shrink-0 border border-gray-100 rounded-[2px] p-2 flex items-center justify-center bg-white">
                                <img
                                    src={item.image || "https://via.placeholder.com/150"}
                                    alt={item.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2 hover:text-[#2874F0] cursor-pointer transition-colors line-clamp-2">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-500 text-xs mb-3">
                                            {item.selectedVariants?.Color && <span className="mr-3">Color: <span className="font-medium text-gray-900">{item.selectedVariants.Color}</span></span>}
                                            {item.selectedVariants?.Size && <span className="mr-3">Size: <span className="font-medium text-gray-900">{item.selectedVariants.Size}</span></span>}
                                        </p>

                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="bg-[#26a541] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                4.2 <span className="text-[10px]">★</span>
                                            </div>
                                            <span className="text-gray-400 text-xs">(2,453 ratings)</span>
                                        </div>

                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-2xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <>
                                                    <span className="text-gray-500 line-through text-sm">₹{item.originalPrice.toLocaleString()}</span>
                                                    <span className="text-green-600 text-sm font-bold">
                                                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <span>Seller:</span>
                                    <span className="font-medium text-[#2874F0] cursor-pointer">{item.sellerName || 'Fzokart Seller'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="bg-white border-t border-gray-100 flex flex-wrap divide-x divide-gray-100">
                            {/* Track Action */}
                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                <button className="flex-1 py-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <Truck size={18} className="text-[#2874F0]" />
                                    Track
                                </button>
                            )}

                            {/* Cancel Action - Only if Pending */}
                            {order.status === 'Pending' && (
                                <button className="flex-1 py-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <AlertCircle size={18} className="text-red-500" />
                                    Cancel
                                </button>
                            )}

                            {/* Need Help */}
                            <button className="flex-1 py-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <HelpCircle size={18} className="text-gray-400" />
                                Need Help?
                            </button>
                        </div>
                    </div>
                ))}

                {/* Bottom Grid Layout - 3 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Column 1: Delivery Address */}
                    <div className="bg-white rounded-[4px] shadow-sm border border-gray-200 p-6 h-full">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-gray-400" />
                            Delivery Address
                        </h3>
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">{order.shippingAddress?.name || order.user?.name}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-[250px]">
                            {order.shippingAddress?.address}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-medium text-gray-900">{order.shippingAddress?.pincode}</span>
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <h5 className="font-semibold text-gray-900 text-sm mb-1">Phone number</h5>
                            <p className="text-sm text-gray-600">{order.shippingAddress?.phone || order.user?.phone}</p>
                        </div>
                    </div>

                    {/* Column 2: Payment & Invoice */}
                    <div className="bg-white rounded-[4px] shadow-sm border border-gray-200 p-6 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard size={18} className="text-gray-400" />
                                Payment Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Payment Mode</span>
                                    <span className="font-medium text-gray-900">{order.paymentMethod || 'Online'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-bold text-gray-900">₹{order.grandTotal?.toLocaleString() || order.total?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Transaction ID</span>
                                    <span className="font-medium text-gray-900">{order.paymentId || 'TXN123456789'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => navigate(`/invoice/${order.orderId || order._id}`)}
                                className="w-full border border-gray-300 rounded-[2px] py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <FileText size={16} className="text-[#2874F0]" />
                                Download Invoice
                            </button>
                        </div>
                    </div>

                    {/* Column 3: Shipping Progress (Vertical) */}
                    <div className="bg-white rounded-[4px] shadow-sm border border-gray-200 p-6 h-full">
                        <h3 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Truck size={18} className="text-gray-400" />
                            Shipping Progress
                        </h3>

                        <div className="relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute top-2 left-[7px] w-[2px] h-[calc(100%-20px)] bg-gray-100"></div>

                            {order.events ? order.events.map((event: any, idx: number) => (
                                <div key={idx} className="flex gap-4 mb-6 relative z-10 last:mb-0">
                                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${idx === 0 ? 'bg-green-500 border-green-500 shadow-sm' : 'bg-white border-gray-300'}`}>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${idx === 0 ? 'text-gray-900' : 'text-gray-500'}`}>{event.status}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(event.date)}</p>
                                    </div>
                                </div>
                            )) : (
                                <>
                                    <div className="flex gap-4 mb-6 relative z-10">
                                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-500 flex-shrink-0 mt-0.5 shadow-sm"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Order Placed</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Request received</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 relative z-10 opacity-60">
                                        <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Processing</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Your order is being processed</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
