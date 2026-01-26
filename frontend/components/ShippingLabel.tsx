import React from 'react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';

interface ShippingLabelProps {
    orderNumber: string;
    trackingId: string;
    shippingTo: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
    };
    shippingFrom: {
        company: string;
        address: string;
        phone: string;
    };
}

export const ShippingLabel: React.FC<ShippingLabelProps> = ({
    orderNumber,
    trackingId,
    shippingTo,
    shippingFrom
}) => {
    return (
        <div className="bg-white p-6 w-[400px] border border-gray-300 font-sans mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#E76C34] p-1.5 rounded-md">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="white"
                        className="w-5 h-5"
                    >
                        <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#E76C34]">Fzokart</h1>
            </div>

            <hr className="border-gray-800 mb-4" />

            {/* Order Info */}
            <div className="flex justify-between mb-4">
                <div>
                    <p className="text-[10px] font-bold text-gray-800 uppercase">ORDER NUMBER:</p>
                    <p className="font-semibold text-lg">{orderNumber}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-800 uppercase">TRACKING ID:</p>
                    <p className="font-semibold text-lg">{trackingId}</p>
                </div>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-4 mb-6 relative">
                <div className="pr-2">
                    <p className="text-[10px] font-bold text-gray-800 uppercase mb-2">SHIPPING TO:</p>
                    <p className="text-sm font-semibold mb-1">{shippingTo.name}</p>
                    <p className="text-xs text-gray-700 leading-tight">
                        {shippingTo.address}<br />
                        {shippingTo.city}, {shippingTo.zip}
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                        Phone: <span className="font-medium">{shippingTo.phone}</span>
                    </p>
                </div>

                {/* Vertical Divider */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>

                <div className="pl-4">
                    <p className="text-[10px] font-bold text-gray-800 uppercase mb-2">SHIPPING FROM:</p>
                    <p className="text-sm font-semibold mb-1">{shippingFrom.company}</p>
                    <p className="text-xs text-gray-700 leading-tight">
                        {shippingFrom.address}
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                        Phone: <span className="font-medium">{shippingFrom.phone}</span>
                    </p>
                </div>
            </div>

            <hr className="border-gray-200 mb-6" />

            {/* QR Code Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="w-24 h-24">
                    <QRCode
                        value={`https://fzokart.com/track/${trackingId}`}
                        size={96}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>
                <div className="text-right">
                    <p className="text-lg font-medium text-gray-900 leading-tight">SCAN QR CODE</p>
                    <p className="text-lg font-medium text-gray-900 leading-tight">FOR ORDER STATUS</p>
                </div>
            </div>

            {/* Barcode */}
            <div className="flex flex-col items-center">
                <Barcode value={trackingId} width={1.5} height={50} fontSize={14} />
            </div>
        </div>
    );
};
