import React, { useMemo } from 'react';
import { numberToWords } from '../utils/numberToWords';
import { ShoppingBag } from 'lucide-react';

interface InvoiceProps {
    invoice: any;
}

export const InvoiceTemplate: React.FC<InvoiceProps> = ({ invoice }) => {
    if (!invoice || !invoice.originalOrder) return null;

    const order = invoice.originalOrder;

    // Memoize calculations with strict error handling defaults
    const calculations = useMemo(() => {
        const subtotal = order.subtotal || (order.total / 1.18) || 0;
        // If tax isn't explicit, assume 18% included in total if logic permits, or calculate from items.
        // For accurate display matching the image "GST (18%):", we calculate 18% of subtotal if needed.
        // Or if total is given, we reverse engineer: Subtotal = Total / 1.18.

        // Strict adherence to real-time calculation rule:
        // Use order data if available, else derive.
        const shipping = order.deliveryCharges || 0;
        const total = order.total || 0;

        // If subtotal is missing in DB, derive it: (Total - Shipping) / 1.18
        const calculatedSubtotal = order.subtotal ? order.subtotal : (total - shipping) / 1.18;
        const gst = total - shipping - calculatedSubtotal;

        return {
            subtotal: calculatedSubtotal,
            gst: gst,
            shipping: shipping,
            total: total
        };
    }, [order]);

    return (
        <div id="invoice-content" className="max-w-[210mm] mx-auto p-12 bg-white text-[#1F2937] font-sans h-full relative border border-gray-100 shadow-sm print:border-none print:shadow-none bg-white print:bg-white [print-color-adjust:exact]">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-8">
                <div className="space-y-4">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#f97316] rounded-lg flex items-center justify-center text-white shadow-sm">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-3xl font-bold text-[#f97316] tracking-tight">Fzokart</span>
                    </div>

                    <div className="pt-2">
                        <h2 className="font-bold text-lg text-gray-900 leading-tight">Fzokart Pvt. Ltd.</h2>
                        <p className="text-sm text-gray-600 mt-1">Registered Office: Morigaon, Assam, India</p>
                        <p className="text-sm text-gray-600 mt-0.5">GSTIN: <span className="text-gray-900 font-medium">18ABCDE1234F1Z5</span></p>
                        <p className="text-sm text-gray-600 mt-2">Customer Care: <span className="text-gray-900 font-medium">fzokart@gmail.com</span></p>
                        <p className="text-sm text-gray-600 mt-0.5">Phone: <span className="text-gray-900 font-medium">6033394539</span></p>
                    </div>
                </div>
                <div className="text-right pt-2">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">TAX INVOICE</h1>
                </div>
            </div>

            {/* Invoice & Billing Details */}
            <div className="grid grid-cols-2 gap-12 mb-8 border-b border-gray-200 pb-8">
                <div className="space-y-3">
                    <div className="flex">
                        <span className="w-32 font-bold text-gray-800 text-sm">Invoice No:</span>
                        <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-bold text-gray-800 text-sm">Order Date:</span>
                        <span className="text-sm font-medium text-gray-900">{invoice.date}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-bold text-gray-800 text-sm">Invoice Date:</span>
                        <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-1 mb-3">Billing Address</h3>
                    {/* Prioritize Shipping Name, fall back to Account Name */}
                    <p className="font-bold text-gray-900 text-base">
                        {order.shippingAddress?.fullName || order.shippingAddress?.name || invoice.customer}
                    </p>
                    <div className="text-sm text-gray-600 leading-snug mt-1">
                        {typeof order.shippingAddress === 'string' ? (
                            <p>{order.shippingAddress}</p>
                        ) : (
                            <>
                                <p>{order.shippingAddress?.street || order.shippingAddress?.address || order.address?.street || ''}</p>
                                <p>
                                    {order.shippingAddress?.locality || order.address?.locality || ''}
                                </p>
                                <p>
                                    {order.shippingAddress?.city || order.address?.city || ''}, {' '}
                                    {order.shippingAddress?.state || order.address?.state || ''} - {' '}
                                    {order.shippingAddress?.pincode || order.shippingAddress?.zip || order.shippingAddress?.zipCode || order.address?.zip || ''}
                                </p>
                            </>
                        )}
                        <p className="mt-1 font-medium text-gray-900">Phone: {order.shippingAddress?.phone || order.address?.phone || order.user?.phone || order.phone || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-0">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#F5F1E8]">
                            <th className="border-y border-gray-300 py-3 px-4 text-center text-sm font-bold text-gray-800 w-16">S.No</th>
                            <th className="border-y border-gray-300 py-3 px-4 text-left text-sm font-bold text-gray-800">Item Description</th>
                            <th className="border-y border-gray-300 py-3 px-4 text-center text-sm font-bold text-gray-800 w-24">Qty</th>
                            <th className="border-y border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-800 w-32">Unit Price</th>
                            <th className="border-y border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-800 w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {invoice.items?.map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="py-3 px-4 text-center text-sm text-gray-700">{i + 1}</td>
                                <td className="py-3 px-4 text-left text-sm text-gray-700 font-medium">
                                    {item.name || item.productId?.name}
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-gray-700">{item.quantity}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-700">₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-3 px-4 text-right text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Calculations */}
            <div className="flex justify-end mt-6">
                <div className="w-[45%] space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                        <span className="text-sm font-bold text-gray-900">₹{calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">GST (18%):</span>
                        <span className="text-sm font-bold text-gray-900">₹{calculations.gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Shipping Charges:</span>
                        <span className="text-sm font-bold text-gray-900">₹{calculations.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex flex-col mt-4">
                        <div className="flex justify-between py-2.5 px-4 bg-[#FCECD8] rounded-t-[2px] items-center border border-[#F5D0A9]">
                            <span className="text-sm font-bold text-gray-800">GRAND Total:</span>
                            <span className="text-lg font-bold text-gray-900">₹{calculations.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="py-2 px-4 bg-[#FCECD8]/50 border-x border-b border-[#F5D0A9] rounded-b-[2px] text-right">
                            <span className="text-xs font-semibold text-gray-600 italic">
                                ({numberToWords(Math.round(calculations.total))})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300 flex flex-col items-center justify-center space-y-6">
                <p className="font-bold text-gray-800 text-sm text-center">
                    Thank you for shopping with us!
                </p>

                <p className="text-[10px] text-gray-400 italic mt-8 bg-gray-50 inline-block px-4 py-1 rounded-full">
                    * This is a computer-generated invoice and does not require a signature.
                </p>
            </div>
        </div>
    );
};
