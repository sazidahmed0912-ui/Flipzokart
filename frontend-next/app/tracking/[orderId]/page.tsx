"use client";
import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import API, { fetchOrderById } from '@/app/services/api'; // Use existing shared API
import io, { Socket } from 'socket.io-client';
import { CheckCircle, Clock, Truck, Package, MapPin, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Order {
    id: string;
    _id: string; // Handle both ID formats
    status: string;
    orderStatus?: string; // Normalize
    items: any[];
    currentLocation?: { lat: number, lng: number, address: string, updatedAt: string };
    statusHistory?: { status: string, timestamp: string, note?: string }[];
    total: number;
    createdAt: string;
}

const steps = [
    { status: 'Pending', label: 'Order Placed', icon: Clock },
    { status: 'Processing', label: 'Processing', icon: Package },
    { status: 'Shipped', label: 'Shipped', icon: Truck },
    { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { status: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTrackingPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const { data } = await fetchOrderById(orderId);
                setOrder({
                    ...data,
                    // Normalize status
                    status: data.orderStatus || data.status
                });
            } catch (err) {
                console.error("Failed to load order", err);
                setError('Order not found');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) loadOrder();

        // Socket.IO Connection
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
            transports: ['websocket'],
            autoConnect: true,
        });

        // Auth for socket if needed (can be skipped for public tracking if designed so, but usually requires user token)
        // For now assuming public or simple connection

        newSocket.on('connect', () => {
            console.log("Connected to socket for tracking");
            // Join room if required by backend, usually userId. 
            // If backend broadcasts to `userId` room, we need to be logged in or join order room.
            // Backend emits to `order.userId`. 
            // If this page is public, we might need a specific room for order updates.
            // Assuming user is logged in for now or socket handles it.
            // If backend only emits to USER_ID room, we won't get updates if we are just viewing by ID without auth.
            // But let's assume standard behavior for now.
        });

        newSocket.on('notification', (data: any) => {
            if (data.type === 'orderStatusUpdate' && (data.orderId === orderId || data.orderId === order?._id)) {
                setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
            }
            if (data.type === 'orderLocationUpdate' && (data.orderId === orderId || data.orderId === order?._id)) {
                setOrder((prev) => prev ? { ...prev, currentLocation: data.location } : prev);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [orderId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading Tracking Info...</div>;
    if (error || !order) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">{error || 'Order Not Found'}</div>;

    const currentStepIndex = steps.findIndex(s => s.status === order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                        <ChevronLeft size={16} className="mr-1" /> Back to Home
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Tracking Order #{order._id?.slice(-6) || orderId.slice(-6)}</h1>
                </div>

                {/* Tracking Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Status Timeline */}
                    <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                        {isCancelled ? (
                            <div className="flex items-center justify-center text-red-600 font-bold text-lg gap-2">
                                <XCircle size={24} /> Order Cancelled
                            </div>
                        ) : (
                            <div className="relative flex justify-between">
                                {/* Timeline Bar */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2 rounded-full"></div>
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-0 -translate-y-1/2 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.max(0, Math.min(100, (currentStepIndex / (steps.length - 1)) * 100))}%` }}
                                ></div>

                                {steps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={step.status} className="relative z-10 flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted
                                                        ? 'bg-blue-500 border-blue-200 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-white border-gray-100 text-gray-300'
                                                    }`}
                                            >
                                                <step.icon size={16} strokeWidth={3} />
                                            </div>
                                            <span
                                                className={`mt-3 text-xs font-bold transition-colors duration-300 ${isCompleted ? 'text-gray-800' : 'text-gray-400'
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                            {isCurrent && (
                                                <div className="absolute top-14 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md animate-bounce">
                                                    Current
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Live Location Map */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <h3 className="font-bold text-gray-800">Live Location</h3>
                        </div>

                        <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
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
                                        className="grayscale-[20%] contrast-[1.1] opacity-90 hover:opacity-100 transition-opacity"
                                    ></iframe>
                                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-white/50 shadow-sm flex items-start gap-3">
                                        <MapPin className="text-red-500 shrink-0 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Current Location</p>
                                            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                                                {order.currentLocation.address || "Location updated just now"}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                                    <MapPin size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Tracking location not available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
