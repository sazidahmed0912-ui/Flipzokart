import React, { forwardRef } from 'react';
import QRCode from "react-qr-code";

interface InvoiceTemplateProps {
    order: any;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ order }, ref) => {
    if (!order) return null;

    // QR Code Value: Tracking URL
    const qrValue = `https://flipzokart.com/track/${order.orderId || order._id}`;

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
                <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800 mb-1">Fzokart</div>
                        <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                            Fzokart Retails Pvt Ltd.<br />
                            Barthal Doloigaon, Moirabari<br />
                            Morigaon, Assam - 782126<br />
                            GSTIN: 29ABCDE1234F1Z5
                        </p>
                    </div>
                    {/* QR Code */}
                    <div className="mt-2 p-1 bg-white border border-gray-200 rounded">
                        <QRCode value={qrValue} size={64} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`} />
                    </div>
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Billing Address</h3>

                    {/* Name */}
                    <p className="font-bold text-gray-800 text-lg mb-1">
                        {order.billingName}
                    </p>

                    {/* Email */}
                    {(order.billingEmail && order.billingEmail !== 'N/A') && (
                        <p className="text-sm text-gray-600 mb-2 break-all">
                            {order.billingEmail}
                        </p>
                    )}

                    {/* Address */}
                    <div className="text-sm text-gray-600 space-y-1">
                        <p className="break-words">{order.address?.street}{order.address?.addressLine2 ? `, ${order.address.addressLine2}` : ''}</p>
                        <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode || order.address?.postalCode || ''}</p>
                        <p>Phone: {order.billingPhone || order.address?.phone || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                    <p className="font-bold text-gray-800 text-lg mb-1">{order.address?.name || order.userName}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.address?.street}{order.address?.addressLine2 ? `, ${order.address.addressLine2}` : ''}</p>
                        <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode || order.address?.postalCode || ''}</p>
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
                            <th className="py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase w-20">Image</th>
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
                                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="block w-full h-full bg-gray-100"></span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-400">Variant: {item.color || 'Standard'} {item.size ? `| ${item.size}` : ''}</p>
                                    {/* GST badge — only if item has a non-zero gstRate */}
                                    {item.gstRate > 0 && (
                                        <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                                            GST {item.gstRate}% (CGST {item.gstRate / 2}% + SGST {item.gstRate / 2}%)
                                        </p>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-right text-sm text-gray-500">8517</td>
                                <td className="py-3 px-4 text-right text-sm text-gray-800 font-medium">{item.quantity}</td>
                                {/* Rate: show baseAmount per unit (pre-GST) */}
                                <td className="py-3 px-4 text-right text-sm text-gray-800">
                                    ₹{(item.unitPrice ?? item.price ?? 0).toLocaleString()}
                                </td>
                                {/* Total: frozen finalAmount from DB — no recalculation */}
                                <td className="py-3 px-4 text-right text-sm font-bold text-gray-800">
                                    ₹{(item.finalAmount ?? (item.price * item.quantity)).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total Summary */}
            <div className="flex justify-end mb-12">
                <div className="w-72 bg-gray-50 rounded-lg p-6 border border-gray-100">
                    {/* Subtotal (pre-GST base) */}
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>Subtotal (before GST):</span>
                        <span>₹{(order.subtotal ?? 0).toLocaleString()}</span>
                    </div>
                    {/* GST breakdown — use frozen values from DB */}
                    {(order.cgst > 0 || order.sgst > 0) && (
                        <>
                            <div className="flex justify-between mb-1 text-sm text-amber-600">
                                <span>CGST:</span>
                                <span>₹{(order.cgst ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-2 text-sm text-amber-600">
                                <span>SGST:</span>
                                <span>₹{(order.sgst ?? 0).toLocaleString()}</span>
                            </div>
                        </>
                    )}
                    {/* Delivery */}
                    <div className="flex justify-between mb-2 text-sm text-gray-600">
                        <span>Shipping Charges:</span>
                        <span>{(order.deliveryCharges ?? order.shipping ?? 0) === 0 ? 'FREE' : `₹${(order.deliveryCharges ?? order.shipping ?? 0).toLocaleString()}`}</span>
                    </div>
                    {/* Coupon Discount */}
                    {(order.discount ?? 0) > 0 && (
                        <div className="flex justify-between mb-2 text-sm text-green-600">
                            <span>Discount:</span>
                            <span>-₹{(order.discount ?? 0).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="border-t-2 border-dashed border-gray-200 my-3 pt-3 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Grand Total:</span>
                        {/* Use grandTotal from DB — frozen, never recalculated */}
                        <span className="text-xl font-bold text-[#2874F0]">₹{(order.grandTotal ?? order.total ?? order.finalAmount ?? 0).toLocaleString()}</span>
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
