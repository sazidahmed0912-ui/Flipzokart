import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { InvoiceTemplate } from '../components/InvoiceTemplate';
import { normalizeOrder } from '../utils/orderHelper';
import { Printer } from 'lucide-react';

export const InvoicePage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || orderId === 'undefined') {
                console.error("InvoicePage: Invalid orderId", orderId);
                setLoading(false);
                return;
            }
            try {
                // FIXED: Use the single source of truth API
                const { data } = await API.get(`/api/tracking/${orderId}`);

                if (data) {
                    console.log("INVOICE DEBUG: Data received", data);
                    // The backend now returns exactly what we need, including 'items'
                    // Handle potential nested structure (like in TrackOrderPage)
                    setOrder(data.trackingData || data);
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
        fetchOrder();
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-[850px] mx-auto bg-white shadow-lg rounded-xl p-8 animate-pulse">
                    <div className="flex justify-between border-b pb-6 mb-8">
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 w-32 rounded"></div>
                            <div className="h-4 bg-gray-200 w-24 rounded"></div>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="h-4 bg-gray-200 w-48 ml-auto rounded"></div>
                            <div className="h-4 bg-gray-200 w-32 ml-auto rounded"></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 w-full rounded"></div>
                        <div className="h-4 bg-gray-200 w-full rounded"></div>
                        <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }
    // Explicit guard: Do not render "Invoice not found" if we are just starting up or data is partial
    // Only show error if loading is done AND order is null
    if (!loading && !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-red-600">!</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't retrieve the invoice details. This might be because the order ID is invalid or the data isn't available yet.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-[#2874F0] text-white py-2 rounded font-medium hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 font-mono">
                        Error ID: {orderId}
                    </div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            <div className="max-w-[850px] mx-auto print:hidden mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Tax Invoice</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#2874F0] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <Printer size={18} />
                    Print Invoice
                </button>
            </div>

            <div className="shadow-lg rounded-xl overflow-hidden print:shadow-none bg-white">
                <div className="invoice-container">
                    <InvoiceTemplate order={order} ref={componentRef} />
                </div>
            </div>
        </div>
    );
};
