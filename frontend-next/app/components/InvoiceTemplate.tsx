import React, { forwardRef } from 'react';

interface InvoiceTemplateProps {
    order: any;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order }, ref) => {
    if (!order) return null;

    return (
        <div ref={ref} className="bg-white p-8 max-w-[800px] mx-auto min-h-[1000px] text-gray-800 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-100 pb-6">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold text-[#2874F0] mb-2 uppercase tracking-wide">Tax Invoice</h1>
                    <div className="text-sm text-gray-500">
                        <p>Invoice No: <span className="font-semibold text-gray-800">{order.id || 'N/A'}</span></p>
                        <p>Date: <span className="font-semibold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                        <p>Order ID: <span className="font-semibold text-gray-800">{order.orderId || order._id}</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 mb-1">Flipzokart</div>
                    <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                        Flipzokart Retails Pvt Ltd.<br />
                        Building 4, Tech Park,<br />
                        Bengaluru, Karnataka - 560103<br />
                        GSTIN: 29ABCDE1234F1Z5
                    </p>
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Billing Address</h3>
                    <p className="font-bold text-gray-800 text-lg mb-1">{order.address?.name || order.userName}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.address?.street}</p>
                        <p>{order.address?.city}, {order.address?.state} - {order.address?.postalCode}</p>
                        <p>Phone: {order.address?.phone || 'N/A'}</p>
                        <p>Email: {order.email || order.user?.email || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                    <p className="font-bold text-gray-800 text-lg mb-1">{order.address?.name || order.userName}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.address?.street}</p>
                        <p>{order.address?.city}, {order.address?.state} - {order.address?.postalCode}</p>
                        <p>Phone: {order.address?.phone || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <table className="w-full mb-4 border-collapse">
                    <thead className="bg-[#F0F5FF]">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase w-12">#</th>
                            <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase">Product Description</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase w-24">HSN</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase w-20">Qty</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase w-32">Rate</th>
                            <th className="py-3 px-4 text-right text-xs font-bold text-gray-600 uppercase w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 border-b border-gray-200">
                        {order.items.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="py-3 px-4 text-sm text-gray-500 text-center">{index + 1}</td>
                                <td className="py-3 px-4">
                                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-400">Variant: {item.color || 'Standard'} {item.size ? `| ${item.size}` : ''}</p>
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-500">8517</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-800 font-medium">{item.quantity}</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-800">₹{item.price?.toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-sm font-bold text-gray-800">₹{(item.quantity * item.price).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total Summary */}
            <div className="flex justify-end mb-12">
                <div className="w-72 bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹{order.totals?.subtotal?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>Shipping Charges:</span>
                        <span>₹{order.totals?.shipping?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>Tax (GST 18%):</span>
                        <span>₹{order.totals?.tax?.toLocaleString() || 0}</span>
                    </div>
                    {/* Discount */}
                    {order.totals?.discount > 0 && (
                        <div className="flex justify-between mb-2 text-sm text-green-600">
                            <span>Discount:</span>
                            <span>-₹{order.totals?.discount?.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="border-t-2 border-dashed border-gray-200 my-3 pt-3 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Grand Total:</span>
                        <span className="text-xl font-bold text-[#2874F0]">₹{order.totals?.total?.toLocaleString() || 0}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-right italic">(Inclusive of all taxes)</p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-8 mt-auto">
                <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-400">
                        <p className="font-semibold text-gray-600 mb-1">Terms & Conditions:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Goods once sold will not be taken back.</li>
                            <li>Subject to Bengaluru jurisdiction only.</li>
                            <li>Interest @ 18% p.a. will be charged if payment is not made within the due date.</li>
                        </ul>
                    </div>
                    <div className="text-center">
                        <div className="h-16 mb-2">
                            {/* Placeholder for Signature Image */}
                            <div className="w-32 h-12 border-b border-gray-300"></div>
                        </div>
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Authorized Signatory</p>
                    </div>
                </div>
                <div className="text-center mt-8 text-[10px] text-gray-400 uppercase tracking-widest">
                    This is a computer generated invoice.
                </div>
            </div>
        </div>
    );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
