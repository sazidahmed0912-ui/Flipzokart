import React from 'react';
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import { ShoppingBag } from 'lucide-react';

interface Address {
    name?: string;
    company?: string;
    street?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    pincode?: string;
    phone?: string;
}

interface ShippingLabelProps {
    orderNumber: string;
    trackingId: string;
    shippingTo: Address;
    shippingFrom: Address;
}

export const ShippingLabel: React.FC<ShippingLabelProps> = ({
    orderNumber,
    trackingId,
    shippingTo,
    shippingFrom
}) => {
    // Construct Tracking URL for QR Code
    // Construct Tracking URL for QR Code
    const trackingUrl = `${window.location.protocol}//${window.location.host}/track/${trackingId}?view=shipping_label`;

    return (
        <div className="w-[100mm] h-[150mm] bg-white border border-gray-300 p-6 font-sans text-gray-900 mx-auto flex flex-col justify-between" id="shipping-label">

            {/* Header: Logo */}
            <div className="flex items-center gap-2 mb-4">
                <div className="text-[#E85D04]">
                    <ShoppingBag size={28} fill="currentColor" />
                </div>
                <span className="text-2xl font-bold text-[#E85D04] tracking-tight">Fzokart</span>
            </div>

            <div className="border-t-2 border-gray-800 my-2"></div>

            {/* Order & Tracking IDs */}
            <div className="flex justify-between mb-2">
                <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">ORDER NUMBER:</p>
                    <p className="text-lg font-bold">{orderNumber}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-gray-500">TRACKING ID:</p>
                    <p className="text-lg font-bold">{trackingId}</p>
                </div>
            </div>

            <div className="border-t border-gray-300 my-2"></div>

            {/* Shipping Addresses Grid */}
            <div className="grid grid-cols-2 gap-4 h-full">
                {/* Shipping To */}
                <div className="border-r border-gray-300 pr-2">
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">SHIPPING TO:</p>
                    <p className="font-bold text-sm mb-1">{shippingTo.name || 'Customer'}</p>
                    <p className="text-sm leading-tight">{shippingTo.address || shippingTo.street}</p>
                    <p className="text-sm leading-tight">
                        {shippingTo.city}{shippingTo.city && shippingTo.state ? ', ' : ''}
                        {shippingTo.state}
                        {(shippingTo.zip || shippingTo.pincode) ? `, ${shippingTo.zip || shippingTo.pincode}` : ''}
                    </p>
                    <p className="text-sm mt-1">Phone: {shippingTo.phone}</p>
                </div>

                {/* Shipping From */}
                <div className="pl-2">
                    <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">SHIPPING FROM:</p>
                    <p className="font-bold text-sm mb-1">{shippingFrom.company || 'Fzokart Pvt. Ltd.'}</p>
                    <p className="text-sm leading-tight">{shippingFrom.address || 'Morigaon, Assam, India'}</p>
                    <p className="text-sm mt-1">Phone: {shippingFrom.phone || '6033394539'}</p>
                </div>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            {/* QR Code Section */}
            <div className="flex items-center gap-6 justify-center">
                <div style={{ height: "auto", maxWidth: "80px", width: "100%" }}>
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={trackingUrl}
                        viewBox={`0 0 256 256`}
                    />
                </div>
                <div className="uppercase font-bold text-sm text-center leading-tight">
                    SCAN QR CODE<br />FOR ORDER STATUS
                </div>
            </div>

            {/* Barcode Section */}
            <div className="mt-8 flex flex-col items-center">
                <Barcode
                    value={trackingId}
                    width={2}
                    height={50}
                    fontSize={14}
                    displayValue={false}
                />
                <p className="text-lg font-bold mt-1 tracking-widest">{trackingId}</p>
            </div>

            <div className="border-b border-gray-200 mt-auto"></div>
        </div>
    );
};
