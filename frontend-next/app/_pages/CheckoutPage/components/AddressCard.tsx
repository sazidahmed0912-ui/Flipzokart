import React from 'react';
import { Address } from '@/app/types';
import { MapPin, Phone, Pencil, Trash2, Home, Briefcase, CheckCircle2 } from 'lucide-react';

interface AddressCardProps {
    address: Address;
    isSelected: boolean;
    onSelect: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onEdit: (address: Address) => void;
    onDeliverHere: () => void;
    isLoading: boolean;
    hideRadio?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
    address,
    isSelected,
    onSelect,
    onDelete,
    onEdit,
    onDeliverHere,
    isLoading,
    hideRadio = false
}) => {
    const typeLabel = (address.type || 'Home').toLowerCase();
    const TypeIcon = typeLabel === 'work' ? Briefcase : Home;

    return (
        <div
            onClick={() => onSelect(address.id)}
            className={`relative group bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
                ${isSelected
                    ? 'border-[#2874F0] shadow-[0_2px_16px_rgba(40,116,240,0.13)]'
                    : 'border-gray-100 hover:border-[#2874F0]/40 hover:shadow-md'
                }`}
        >
            {/* Selected glow strip */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2874F0] rounded-l-xl" />
            )}

            <div className="p-4 md:p-5 pl-5 md:pl-6">

                {/* Top Row: Name + Type Badge + Radio */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {!hideRadio && (
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                                ${isSelected ? 'border-[#2874F0]' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#2874F0]" />}
                            </div>
                        )}
                        {isSelected && hideRadio && (
                            <CheckCircle2 size={16} className="text-[#2874F0] flex-shrink-0" />
                        )}
                        <span className="font-bold text-gray-900 text-sm md:text-base leading-tight">
                            {address.fullName}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                            ${typeLabel === 'work'
                                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}>
                            <TypeIcon size={9} />
                            {address.type || 'Home'}
                        </span>
                    </div>

                    {/* Action buttons — always visible on address book, hover on checkout */}
                    <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity
                        ${hideRadio ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button
                            title="Edit"
                            onClick={(e) => { e.stopPropagation(); onEdit(address); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 transition-colors"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(address.id); }}
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

                {/* Deliver Here (Checkout only) */}
                {isSelected && !hideRadio && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeliverHere(); }}
                        disabled={isLoading}
                        className="mt-3 w-full md:w-auto bg-[#2874F0] hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isLoading ? 'Processing...' : 'Deliver Here'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AddressCard;
