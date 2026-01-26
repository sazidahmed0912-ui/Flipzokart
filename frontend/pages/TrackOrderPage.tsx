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
                    {/* Steps */}
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-[14px] left-0 w-full h-[3px] bg-gray-200 hidden md:block z-0"></div>
                        <div
                            className="absolute top-[14px] left-0 h-[3px] bg-green-500 hidden md:block z-0 transition-all duration-500"
                            style={{ width: isCancelled ? '0%' : getProgressWidth() }}
                        ></div>

                        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                            {!isCancelled && steps.filter(s => s !== 'Packed').map((step, idx) => {
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
                                <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 font-medium py-2 px-4 rounded hover:shadow-sm transition-all text-sm w-full">
                                    <HelpCircle size={16} className="text-[#2874F0]" /> Need help?
                                </button>
                                {order.status === 'Pending' && (
                                    <button className="bg-white border border-gray-300 text-gray-800 font-medium py-2 px-4 rounded hover:shadow-sm transition-all text-sm w-full">
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
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-900">{order.shippingAddress?.name || order.user?.name}</p>
                            <p className="text-sm text-gray-600">{order.shippingAddress?.address}</p>
                            <p className="text-sm text-gray-600">
                                {order.shippingAddress?.city}{order.shippingAddress?.city && ', '}{order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900">Phone:</span>
                                <span className="text-sm text-gray-600">{order.shippingAddress?.phone || order.user?.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white p-6 rounded-sm shadow-sm h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-base text-gray-900">Payment</h3>
                            <button
                                onClick={() => {
                                    const id = order.orderId || order._id || order.id;
                                    if (id) navigate(`/invoice/${id}`);
                                }}
                                disabled={!order.orderId && !order._id && !order.id}
                                className={`flex items-center gap-1 text-[#2874F0] text-sm font-bold border border-gray-200 px-2 py-1 rounded transition-colors ${(!order.orderId && !order._id && !order.id) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                            >
                                <Download size={14} /> Download Invoice
                            </button>
                        </div>
                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex justify-between">
                                <span className="text-gray-600 text-sm">Total Amount :</span>
                                <span className="font-bold text-gray-900 text-lg">₹{(order.grandTotal !== undefined ? order.grandTotal : (order.total || 0)).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 text-sm">Payment :</span>
                                <span className="font-medium text-gray-900">{order.paymentMethod || 'Credit/Debit Card'}</span>
                            </div>
                            {order.paymentId && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <CreditCard size={16} /> XXXX {order.paymentId.slice(-4)}
                                </div>
                            )}
                        </div>
                        <button className="w-full bg-[#2874F0] text-white font-bold py-3 rounded text-sm hover:bg-blue-600 transition-colors shadow-sm">
                            Track Order
                        </button>
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
                                    <p className="font-bold text-sm text-gray-900">{order.status}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Arriving by {order.expectedDelivery ? formatDate(order.expectedDelivery) : 'Tomorrow'}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            {/* Previous (Shipped) */}
                            {['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
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
                    <button className="bg-[#FFD814] text-black font-medium py-2 px-8 rounded shadow-sm hover:opacity-90">
                        Need Help?
                    </button>
                </div>

            </div>
        </div>
    );
};
