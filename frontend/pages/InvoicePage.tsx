import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { InvoiceTemplate } from '../components/InvoiceTemplate';
import { Printer } from 'lucide-react';

export const InvoicePage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await API.get(`/api/orders/${orderId}`);
                // Handle different response structures (standard vs some admin endpoints)
                const orderData = response.data.data?.order || response.data.order || response.data;
                console.log("INVOICE DEBUG: Received Order Data", orderData);
                setOrder(orderData);
            } catch (error) {
                console.error("Failed to fetch order", error);
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
    if (!loading && !order) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

    // Extra safety: If order is still null here (shouldn't happen due to loading check), return null
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
