import React from 'react';
import { Address } from '@/app/types';
import { MapPin, Phone, Pencil, Trash2, Home, Briefcase, CheckCircle2 } from 'lucide-react';

interface PremiumAddressCardProps {
    address: Address;
    onDelete: (id: string | number) => void;
    onEdit: (address: Address) => void;
}

const PremiumAddressCard: React.FC<PremiumAddressCardProps> = ({
    address,
    onDelete,
    onEdit,
}) => {
    const typeLabel = (address.type || 'Home').toLowerCase();
    const TypeIcon = typeLabel === 'work' ? Briefcase : Home;

    return (
        <div className="relative group bg-white rounded-xl border-2 border-[#2874F0] shadow-[0_2px_16px_rgba(40,116,240,0.13)] overflow-hidden transition-all duration-200 hover:shadow-[0_4px_24px_rgba(40,116,240,0.18)]">
            {/* Blue left accent strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2874F0] rounded-l-xl" />

            <div className="p-4 md:p-5 pl-5 md:pl-6">

                {/* Top Row: Name + Type Badge + Action Buttons */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle2 size={16} className="text-[#2874F0] flex-shrink-0" />
                        <span className="font-bold text-gray-900 text-sm md:text-base leading-tight">
                            {address.fullName}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                            ${typeLabel === 'work'
                                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                : 'bg-blue-50 text-[#2874F0] border border-blue-200'
                            }`}>
                            <TypeIcon size={9} />
                            {address.type || 'Home'}
                        </span>
                    </div>

                    {/* Icon action buttons — always visible */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            title="Edit"
                            onClick={() => onEdit(address)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 transition-colors"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            title="Delete"
                            onClick={() => onDelete(address.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Address Line */}
                <div className="flex items-start gap-1.5 mb-1.5 ml-0.5">
                    <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                        {address.street}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                        {', '}
                        <span className="font-medium text-gray-700">{address.city}</span>
                        {', '}
                        {address.state}
                        {address.pincode ? ` - ${address.pincode}` : ''}
                        {address.country ? `, ${address.country}` : ''}
                    </p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1.5 ml-0.5">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500 font-medium">{address.phone}</span>
                </div>
            </div>
        </div>
    );
};

export default PremiumAddressCard;
