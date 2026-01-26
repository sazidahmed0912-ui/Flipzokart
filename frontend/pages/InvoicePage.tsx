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

    if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

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
