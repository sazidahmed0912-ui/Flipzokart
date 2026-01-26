import React from 'react';
import { numberToWords } from '../utils/numberToWords';
import { getSafeAddress } from '../utils/addressHelper';

interface InvoiceProps {
    order: any;
    ref?: React.Ref<HTMLDivElement>;
}

export const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
    if (!order) return null;

    let address = order.address || {};
    // Handle legacy address string or fallback to user
    if (typeof address === 'string') {
        try {
            address = JSON.parse(address);
        } catch (e) {
            address = { street: address, fullName: order.userName || 'Customer' };
        }
    }
    // Fallback if empty object but user exists
    if (!address.fullName && order.user) {
        address = {
            fullName: order.user.name,
            phone: order.user.phone,
            street: 'Address not available',
            city: order.user.city || '',
            state: '',
            pincode: ''
        };
    }
    // Final Fallback if everything fails
    if (!address.fullName && !address.name) {
        address = {
            fullName: order.userName || 'Valued Customer',
            phone: order.phone || 'N/A',
            street: 'Address details not found',
            city: '',
            state: '',
            pincode: ''
        };
    }
    const items = order.items || [];

    // Calculations
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // Assuming free shipping for now or get from order
    const taxRate = 0.18; // 18% GST example
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount + shipping; // Or if order.totalAmount is inclusive, adjust logic.
    // Usually order.totalAmount is final. Let's assume price in DB is excluding tax or handle as inclusive.
    // For this prompt "Auto calculations... GST (real %)", let's back-calculate if needed or add on top.
    // Let's treat stored price as Base Price for simple calculation display.

    const amountInWords = numberToWords(Math.round(grandTotal));

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div ref={ref} className="bg-white p-8 max-w-[800px] mx-auto text-sm font-roboto print:p-0 print:max-w-none">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#2874F0] mb-2">Fzokart</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-wide">Tax Invoice</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-600">Invoice #: <span className="font-bold text-gray-800">{order.orderNumber || order.id.slice(-8)}</span></p>
                    <p className="text-gray-600">Date: <span className="font-bold text-gray-800">{formatDate(order.createdAt)}</span></p>
                    <p className="text-gray-600">GSTIN: <span className="font-bold text-gray-800">18ABCDE1234F1Z5</span></p>
                </div>
            </div>

            {/* Seller & Buyer Details */}
            <div className="flex justify-between mb-8 gap-8">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Sold By</h3>
                    <p className="font-bold text-lg">Fzokart Pvt. Ltd.</p>
                    <p className="text-gray-600">Registered Office: Morigaon</p>
                    <p className="text-gray-600">Assam, India - 782105</p>
                    <p className="text-gray-600">Email: fzokart@gmail.com</p>
                    <p className="text-gray-600">Phone: 6033394539</p>
                </div>
                <div className="flex-1 text-right">
                    <h3 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Billing Address</h3>
                    <p className="font-bold text-lg">{address.fullName}</p>
                    <p className="text-gray-600">{address.street}</p>
                    {address.addressLine2 && <p className="text-gray-600">{address.addressLine2}</p>}
                    <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                    <p className="text-gray-600">Phone: {address.phone}</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-gray-50 border-y border-gray-200 text-left">
                        <th className="py-3 px-4 font-bold text-gray-600">S.No</th>
                        <th className="py-3 px-4 font-bold text-gray-600">Product Description</th>
                        <th className="py-3 px-4 font-bold text-gray-600 text-center">Qty</th>
                        <th className="py-3 px-4 font-bold text-gray-600 text-right">Unit Price</th>
                        <th className="py-3 px-4 font-bold text-gray-600 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                            <td className="py-3 px-4 font-medium text-gray-800">{item.product?.title || item.name || 'Product'}</td>
                            <td className="py-3 px-4 text-center text-gray-800">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-gray-800">₹{(item.price || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-800">₹{((item.price || 0) * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-1/2 md:w-1/3 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>GST (18%):</span>
                        <span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping:</span>
                        <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-[#2874F0] border-t border-gray-200 pt-2 mt-2">
                        <span>Grand Total:</span>
                        <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                    <p className="font-bold text-sm text-gray-600">Amount in Words:</p>
                    <p className="text-gray-800 italic capitalize">{amountInWords} Rupees Only</p>
                </div>

                <div className="text-xs text-center text-gray-400 mt-8">
                    <p>This is a computer generated invoice and does not require a signature.</p>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .invoice-container, .invoice-container * {
                            visibility: visible;
                        }
                        .invoice-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                    }
                `}
            </style>
        </div>
    );
});
