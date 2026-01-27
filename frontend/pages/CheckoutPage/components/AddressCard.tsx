import React from 'react';
import { Address } from '../../../types';

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
    return (
        <div className={`address-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(address.id)}>
            {!hideRadio && (
                <div className="address-card-radio">
                    <input type="radio" name="address" checked={isSelected} readOnly />
                </div>
            )}
            <div className="address-card-details">
                <div className="address-card-header">
                    <h3>{address.fullName}</h3>
                    <span className="address-type">{address.type}</span>
                    <span className="address-phone">{address.phone}</span>
                </div>
                <p>{`${address.street}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`}</p>
                {isSelected && (
                    <div className="mt-3">
                        <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors shadow-sm mb-2"
                            onClick={(e) => { e.stopPropagation(); onDeliverHere(); }}
                        >
                            DELIVER HERE
                        </button>
                        <div className="address-card-actions">
                            <button className="address-btn address-btn-edit" onClick={(e) => { e.stopPropagation(); onEdit(address); }}>Edit</button>
                            <button className="address-btn address-btn-delete" onClick={(e) => { e.stopPropagation(); onDelete(address.id); }}>Delete</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressCard;
