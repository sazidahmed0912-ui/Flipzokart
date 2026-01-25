import React, { useState, useEffect } from 'react';
import { Info } from "lucide-react";
import { Address } from '../../../types';
import { AddressFormFields, AddressFormData } from '../../../components/AddressFormFields';

interface AddressFormProps {
    addressToEdit?: Address | null;
    onSave: (address: Address) => void;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ addressToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState<AddressFormData>({
        name: addressToEdit?.name ?? '',
        phone: addressToEdit?.phone ?? '',
        email: '',
        street: addressToEdit?.address ?? '',
        locality: '',
        city: addressToEdit?.city ?? '',
        state: addressToEdit?.state ?? '',
        zip: addressToEdit?.pincode ?? '',
        type: (addressToEdit?.type as any) ?? 'Home'
    });

    useEffect(() => {
        if (addressToEdit) {
            setFormData({
                name: addressToEdit.name,
                phone: addressToEdit.phone,
                email: '',
                street: addressToEdit.address,
                locality: '',
                city: addressToEdit.city,
                state: addressToEdit.state,
                zip: addressToEdit.pincode,
                type: (addressToEdit.type as any) || 'Home'
            });
        }
    }, [addressToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Combine street and locality for the final address string
        const finalAddressString = formData.locality
            ? `${formData.street}, ${formData.locality}`
            : formData.street;

        const finalAddress: Address = {
            id: addressToEdit?.id ?? Date.now(),
            name: formData.name,
            phone: formData.phone,
            address: finalAddressString,
            city: formData.city,
            state: formData.state,
            pincode: formData.zip,
            type: formData.type
        };

        onSave(finalAddress);
    };

    return (
        <div className="w-full bg-white rounded-xl p-4 md:p-6 lg:p-8 space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{addressToEdit ? "Edit Address" : "Add New Address"}</h2>
                <p className="text-gray-500 text-sm mt-1">Please enter your delivery details below.</p>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <Info className="flex-shrink-0 mt-0.5" size={18} />
                <p>
                    Fzokart ensures contactless delivery. Please consider paying online for a safer experience.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                    <AddressFormFields
                        formData={formData}
                        setFormData={setFormData}
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-semibold transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold shadow-sm transition-all duration-200 hover:shadow-md active:transform active:scale-[0.98]"
                    >
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;
