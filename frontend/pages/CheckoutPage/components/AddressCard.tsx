import React from 'react';
import { Address } from '../../types';

interface AddressCardProps {
    address: Address;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (address: Address) => void;
    onDeliverHere: () => void;
    isLoading: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
    address,
    isSelected,
    onSelect,
    onDelete,
    onEdit,
    onDeliverHere,
    isLoading
}) => {
    return (
        <div className={`address-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(address.id)}>
            <div className="address-card-radio">
                <input type="radio" name="address" checked={isSelected} readOnly />
            </div>
            <div className="address-card-details">
                <div className="address-card-header">
                    <h3>{address.name}</h3>
                    <span className="address-type">{address.type}</span>
                    <span className="address-phone">{address.phone}</span>
                </div>
                <p>{`${address.address}, ${address.city}, ${address.state} - ${address.pincode}`}</p>
                {isSelected && (
                    <div className="address-card-actions">

                        <button className="address-btn address-btn-edit" onClick={() => onEdit(address)}>Edit</button>
                        <button className="address-btn address-btn-delete" onClick={() => onDelete(address.id)}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressCard;
