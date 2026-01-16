import React, { useState, useEffect } from 'react';
import { Address } from '../../types';

interface AddressFormProps {
    addressToEdit?: Address | null;
    onSave: (address: Address) => void;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ addressToEdit, onSave, onCancel }) => {
    const [formState, setFormState] = useState<Address>({
        id: addressToEdit?.id ?? Date.now(),
        name: addressToEdit?.name ?? '',
        phone: addressToEdit?.phone ?? '',
        address: addressToEdit?.address ?? '',
        city: addressToEdit?.city ?? '',
        state: addressToEdit?.state ?? '',
        pincode: addressToEdit?.pincode ?? '',
        type: addressToEdit?.type ?? 'Home'
    });

    useEffect(() => {
        if (addressToEdit) {
            setFormState(addressToEdit);
        }
    }, [addressToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddressTypeChange = (type: 'Home' | 'Work') => {
        setFormState(prevState => ({
            ...prevState,
            type
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    return (
        <div className="address-form">
            <h3>{addressToEdit ? 'Edit address' : 'Add a new address'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <input type="text" name="name" placeholder="Full Name" value={formState.name} onChange={handleChange} required />
                    <input type="text" name="phone" placeholder="Mobile Number" value={formState.phone} onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <input type="text" name="pincode" placeholder="Pincode" value={formState.pincode} onChange={handleChange} required />
                    <input type="text" name="state" placeholder="State" value={formState.state} onChange={handleChange} required />
                </div>
                <div className="form-row">
                    <input type="text" name="city" placeholder="City" value={formState.city} onChange={handleChange} required />
                    <input type="text" name="address" placeholder="House No / Building" value={formState.address} onChange={handleChange} required />
                </div>
                <div className="address-type-selection">
                    <label>Address Type</label>
                    <button type="button" className={`btn-address-type ${formState.type === 'Home' ? 'active' : ''}`} onClick={() => handleAddressTypeChange('Home')}>Home</button>
                    <button type="button" className={`btn-address-type ${formState.type === 'Work' ? 'active' : ''}`} onClick={() => handleAddressTypeChange('Work')}>Work</button>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">Save Address</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;
