"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft, Clock, CheckCircle, Truck, XCircle, ShoppingBag,
    CreditCard, Banknote, User, MapPin, Package
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import { fetchOrderById } from '@/app/services/api';
import { Order } from '@/app/types';
import { resolveProductImage } from '@/app/utils/imageHelper';

export const AdminOrderDetails: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    const loadOrder = async () => {
        try {
            const { data } = await fetchOrderById(id);
            setOrder(data);
        } catch (err) {
            console.error("Failed to load order", err);
            setError("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularGlassSpinner />;
    if (error || !order) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-red-500 font-bold mb-4">{error || "Order not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
                            <p className="text-xs text-gray-500">ID: #{order.id}</p>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-wrap gap-6 justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                {order.status === 'Delivered' ? <CheckCircle size={24} /> :
                                    order.status === 'Cancelled' ? <XCircle size={24} /> :
                                        <Clock size={24} />}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Order Status</p>
                                <p className="text-lg font-bold text-gray-800">{order.status}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium text-right">Order Date</p>
                                <p className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Products */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <ShoppingBag size={18} /> Order Items ({order.items.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                {item.image ? (
                                                    <Image
                                                        src={resolveProductImage(item) || "/placeholder.png"}
                                                        alt={item.productName || item.name}
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ShoppingBag size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 line-clamp-2">{item.productName || item.name}</p>

                                                {/* Variant Display: Snapshot > selectedVariants */}
                                                <div className="flex gap-2 mt-1">
                                                    {(item.color || item.selectedVariants?.Color || item.selectedVariants?.Colour) && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                            Color: {item.color || item.selectedVariants?.Color || item.selectedVariants?.Colour}
                                                        </span>
                                                    )}
                                                    {(item.size || item.selectedVariants?.Size) && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                            Size: {item.size || item.selectedVariants?.Size}
                                                        </span>
                                                    )}
                                                    {item.variantId && (
                                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono">
                                                            Var ID: {item.variantId}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Legacy Variant Fallback (if snapshot missing and selectedVariants has other keys) */}
                                                {!item.color && !item.size && item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                                    <div className="flex gap-2 mt-1">
                                                        {Object.entries(item.selectedVariants).map(([key, val]: any) => {
                                                            if (key === 'Color' || key === 'Size' || key === 'Colour') return null;
                                                            return (
                                                                <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                                    {key}: {val}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                                <div className="mt-2 flex justify-between items-end">
                                                    <p className="text-sm text-gray-500">Qty: <span className="font-bold text-gray-800">{item.quantity}</span></p>
                                                    <p className="font-bold text-[#2874F0]">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Customer */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <User size={18} /> Customer Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {order.userName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{order.userName}</p>
                                            <p className="text-xs text-gray-500">{order.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <MapPin size={18} /> Shipping Address
                                </h3>
                                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {typeof order.address === 'string' ? order.address : (
                                        <>
                                            <p className="font-bold text-gray-800 mb-1">{order.address?.fullName}</p>
                                            <p>{order.address?.street}</p>
                                            <p>{order.address?.city}, {order.address?.state}</p>
                                            <p>{order.address?.zipCode}</p>
                                            <p className="mt-2 text-xs font-bold text-gray-500">Phone: {order.address?.mobileNumber}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <CreditCard size={18} /> Payment Summary
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-800">₹{order.itemsPrice?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Shipping</span>
                                        <span className="font-medium text-gray-800">₹{order.deliveryCharges || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Tax</span>
                                        <span className="font-medium text-gray-800">₹{order.tax || 0}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-800">Total</span>
                                        <span className="font-bold text-[#2874F0] text-lg">₹{order.finalAmount?.toLocaleString() || order.total?.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Payment Method</span>
                                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
