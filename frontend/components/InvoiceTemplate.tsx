import React from 'react';
import { numberToWords } from '../utils/numberToWords';

interface InvoiceProps {
    order: any;
    ref?: React.Ref<HTMLDivElement>;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
    if (!order) return null;

    // Use standardized address from backend if available, else fallback to legacy checks
    let address = order.shippingAddress || order.address || {};

    // Handle legacy address string parsing (keep for safety)
    if (typeof address === 'string') {
        try {
            address = JSON.parse(address);
        } catch (e) {
            address = { street: address, fullName: order.userName || 'Customer' };
        }
    }

    const items = order.items || [];

    // Calculations: Prefer Backend Values but fallback to robust calculation
    // Note: The new design back-calculates from Total if needed, but we'll try to be precise.
    const grandTotal = order.grandTotal !== undefined ? order.grandTotal : (order.total || 0);

    // If tax/subtotal not explicitly provided, assume inclusive tax for display match (as per new design pattern)
    // or calculate standard way if that was the preference. 
    // The reference design used: subtotal = total / 1.18
    const calculateSubtotal = () => {
        if (order.subtotal) return order.subtotal;
        return grandTotal / 1.18;
    };
    const subtotal = calculateSubtotal();

    const calculateTax = () => {
        if (order.tax) return order.tax;
        return grandTotal - subtotal;
    };
    const taxAmount = calculateTax();

    const shipping = order.shippingFee !== undefined ? order.shippingFee : 0;

    const amountInWords = numberToWords(Math.round(grandTotal));

    const formatDate = (dateString: string) => {
        if (!dateString) return new Date().toLocaleDateString('en-IN');
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const renderAddress = () => {
        if (!address) return null;
        return (
            <>
                <p className="font-bold text-gray-900 text-base">{address.name || address.fullName || order.userName || 'Customer'}</p>
                <div>{address.address || address.street}</div>
                {address.addressLine2 && <div>{address.addressLine2}</div>}
                {address.locality && <div>{address.locality}</div>}
                <div>
                    {address.city}{address.city && address.state ? ', ' : ''}{address.state}
                    {address.pincode || address.zip || address.zipCode ? ` - ${address.pincode || address.zip || address.zipCode}` : ''}
                </div>
                {address.phone && <div className="mt-1">Phone: {address.phone}</div>}
            </>
        );
    };

    return (
        <div ref={ref} className="max-w-[210mm] mx-auto p-12 bg-white text-[#1F2937] font-sans h-full relative" id="invoice-component">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#f97316] rounded-md flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                        </div>
                        <span className="text-3xl font-bold text-[#f97316]">Fzokart</span>
                    </div>

                    <div>
                        <h2 className="font-bold text-lg text-gray-900">Fzokart Pvt. Ltd.</h2>
                        <p className="text-sm text-gray-600">Registered Office: Morigaon, Assam, India</p>
                        <p className="text-sm text-gray-600">GSTIN: <span className="text-gray-900">18ABCDE1234F1Z5</span></p>
                        <p className="text-sm text-gray-600 mt-2">Customer Care: <span className="text-gray-900 font-medium">fzokart@gmail.com</span></p>
                        <p className="text-sm text-gray-600">Phone: <span className="text-gray-900 font-medium">6033394539</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">TAX INVOICE</h1>
                </div>
            </div>

            {/* Invoice & Billing Details */}
            <div className="grid grid-cols-2 gap-12 mb-8">
                <div className="space-y-3">
                    <div className="flex">
                        <span className="w-32 font-bold text-gray-800 text-sm">Invoice No:</span>
                        <span className="text-sm font-medium text-gray-900">INV-{(order.orderNumber || order.id || order._id || 'UNKNOWN').slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-bold text-gray-800 text-sm">Order Date:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-bold text-gray-800 text-sm">Invoice Date:</span>
                        <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-bold text-gray-800 text-sm">Payment Method:</span>
                        <span className="text-sm font-medium text-gray-900 uppercase">{order.paymentMethod || 'Prepaid'}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-1 mb-2">Billing Address</h3>
                    {renderAddress()}
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-0">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#F5F1E8]">
                            <th className="border-y border-gray-300 py-2.5 px-4 text-center text-sm font-bold text-gray-800 w-16">S.No</th>
                            <th className="border-y border-gray-300 py-2.5 px-4 text-left text-sm font-bold text-gray-800">Item Description</th>
                            <th className="border-y border-gray-300 py-2.5 px-4 text-center text-sm font-bold text-gray-800 w-24">Qty</th>
                            <th className="border-y border-gray-300 py-2.5 px-4 text-right text-sm font-bold text-gray-800 w-32">Unit Price</th>
                            <th className="border-y border-gray-300 py-2.5 px-4 text-right text-sm font-bold text-gray-800 w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-center text-sm text-gray-700">{i + 1}</td>
                                <td className="py-3 px-4 text-left text-sm text-gray-700 font-medium">{item.product?.title || item.name || 'Product'}</td>
                                <td className="py-3 px-4 text-center text-sm text-gray-700">{item.quantity}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-700">₹{(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-3 px-4 text-right text-sm font-bold text-gray-800">₹{((item.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Calculations */}
            <div className="flex justify-end mt-4">
                <div className="w-1/2 space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                        <span className="text-sm font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">GST (18%):</span>
                        <span className="text-sm font-bold text-gray-900">
                            ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Shipping Charges:</span>
                        <span className="text-sm font-bold text-gray-900">
                            {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-[#FCECD8] mt-2 rounded-[2px] items-center">
                        <span className="text-sm font-bold text-gray-800">GRAND Total (in words):</span>
                        <span className="text-lg font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t border-gray-300 pt-4 text-center space-y-4">
                <p className="font-bold text-gray-800 text-sm">Thank you for shopping with us! <span className="italic font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{amountInWords} Only</span></p>
                <p className="text-xs text-gray-400 italic mt-8">* This is a computer-generated invoice and does not require a signature.</p>
            </div>

            <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-gray-300">Generated by Fzokart System</div>

            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #invoice-component, #invoice-component * {
                            visibility: visible;
                        }
                        #invoice-component {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            z-index: 9999;
                            background: white;
                            margin: 0;
                            padding: 20px;
                        }
                        /* Ensure background colors print */
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `}
            </style>
        </div>
    );
});
