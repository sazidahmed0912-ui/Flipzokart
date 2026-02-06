"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import API from '@/app/services/api';
import { InvoiceTemplate } from '../components/InvoiceTemplate';
import { normalizeOrder } from '@/app/utils/orderHelper';
import { Printer, MapPin, Phone, Mail, Package } from 'lucide-react';
import { useSocket } from '@/app/hooks/useSocket';

// --- MOBILE ONLY INVOICE COMPONENT ---
// Strictly defined for < 768px devices
const MobileInvoiceLayout = ({ order }: { order: any }) => {
    return (
        <div className="bg-white p-4 space-y-6 text-sm text-gray-800">
            <style jsx global>{`
                @media (max-width: 768px) {
                    body { overflow-x: hidden; width: 100vw; }
                }
            `}</style>

            {/* Header: Logo & Title */}
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
                <div className="bg-[#2874F0] w-10 h-10 rounded flex items-center justify-center text-white font-bold text-xl">
                    F
                </div>
                <div>
                    <h1 className="text-xl font-bold uppercase text-gray-900">Tax Invoice</h1>
                    <p className="text-xs text-gray-500">Original for Recipient</p>
                </div>
            </div>

            {/* Invoice Details Card */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Invoice No:</span>
                    <span className="font-mono font-bold break-all">{order.id ? (order.id.length > 10 ? `INV-${order.id.slice(-6)}` : order.id) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Date:</span>
                    <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Order ID:</span>
                    <span className="font-mono text-xs break-all">{order.orderId || order._id}</span>
                </div>
            </div>

            {/* Addresses Stack */}
            <div className="flex flex-col gap-4">
                {/* Sold By */}
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Sold By</h3>
                    <p className="font-bold text-gray-800">Fzokart Retails Pvt Ltd.</p>
                    <p className="text-xs text-gray-600 mt-1">
                        Barthal Doloigaon, Moirabari<br />
                        Morigaon, Assam - 782126
                    </p>
                    {/* <p className="text-xs mt-1"><span className="font-semibold">GSTIN:</span> 29ABCDE1234F1Z5</p> */}
                </div>

                {/* Billing Address */}
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Billing Address</h3>
                    {/* Name: Bold & Block */}
                    <p className="font-bold text-gray-800 text-sm">
                        {order.billingName || order.userName || order.address?.name || 'Guest'}
                    </p>
                    {/* Email: Normal & Break-all */}
                    <p className="text-xs text-gray-600 break-all mb-1">
                        {order.billingEmail || order.email || order.user?.email || 'N/A'}
                    </p>

                    {/* Address: Multi-line & Break-words */}
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                        <p className="break-words leading-tight">{order.address?.street}</p>
                        <p>{order.address?.city}, {order.address?.state} - {order.address?.postalCode}</p>
                    </div>

                    {/* Phone */}
                    <p className="text-xs mt-2 flex items-center gap-1 text-gray-500">
                        <Phone size={12} /> {order.billingPhone || order.address?.phone || 'N/A'}
                    </p>
                </div>
            </div>

            {/* Items List (Card Style) */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase border-b pb-1">Items</h3>
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2 border-b border-gray-50 pb-3 last:border-0">
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 leading-tight">{item.name}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">HSN: 8517 • 18% GST</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{item.quantity} x ₹{item.price?.toLocaleString()}</span>
                            <span className="font-bold">₹{(item.quantity * item.price).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{order.totals?.subtotal?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Shipping Charges</span>
                    <span>₹{order.totals?.shipping?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Tax</span>
                    <span>₹{order.totals?.tax?.toLocaleString() || 0}</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                    <span className="font-bold text-base text-gray-900">Total Amount</span>
                    <span className="font-bold text-base text-[#2874F0]">₹{order.totals?.total?.toLocaleString() || 0}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 italic text-center">
                    Inclusive of all taxes
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-gray-400 pt-4">
                <p>This is a system generated invoice.</p>
                <p>Flipzokart.com</p>
            </div>
        </div>
    );
};


export const InvoicePage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef<HTMLDivElement>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const socket = useSocket(token);

    const fetchOrder = async () => {
        if (!orderId || orderId === 'undefined') {
            setLoading(false);
            return;
        }
        try {
            const { data } = await API.get(`/api/tracking/${orderId}`);
            if (data) {
                const rawData = data.data || data.order || data;
                const normalized = normalizeOrder(rawData);
                setOrder(normalized);
            } else {
                throw new Error("Empty data recieved");
            }
        } catch (error) {
            console.error("Failed to fetch order for invoice", error);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    // Real-time updates
    useEffect(() => {
        if (socket && orderId) {
            socket.on('notification', (data: any) => {
                if (data.type === 'orderStatusUpdate') fetchOrder();
            });
            return () => { socket.off('notification'); };
        }
    }, [socket, orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
            </div>
        );
    }

    if (!loading && !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p>Order not found</p>
                    <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 font-bold">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 md:p-8 p-0 print:p-0 print:bg-white">
            <style jsx global>{`
                @media print { 
                    @page { margin: 0; size: auto; }
                    /* Force Desktop Template on Print */
                    .mobile-invoice-view { display: none !important; }
                    .desktop-invoice-view { display: block !important; }
                }
            `}</style>

            <div className="max-w-[850px] mx-auto print:hidden mb-6 flex justify-between items-center md:px-0 px-4 pt-4 md:pt-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Tax Invoice</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#2874F0] text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-sm text-sm md:text-base"
                >
                    <Printer size={18} />
                    <span className="hidden md:inline">Print Invoice</span>
                    <span className="md:hidden">Print</span>
                </button>
            </div>

            {/* DESKTOP VIEW: Hidden on Mobile, Block on Desktop and Print */}
            <div className="desktop-invoice-view hidden md:block print:block bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none">
                <div className="invoice-container">
                    <InvoiceTemplate order={order} ref={componentRef} />
                </div>
            </div>

            {/* MOBILE VIEW: Block on Mobile, Hidden on Desktop and Print */}
            <div className="mobile-invoice-view block md:hidden print:hidden shadow-sm">
                <MobileInvoiceLayout order={order} />
            </div>
        </div>
    );
};
