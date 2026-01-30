"use client";
import React, { useState, useEffect } from 'react';
import { Info } from "lucide-react";
import { Address } from '@/app/types';
import { AddressFormFields, AddressFormData } from '@/app/components/AddressFormFields';
import API from '@/app/services/api';
import { validateAddressForm } from '@/app/utils/addressValidation';

interface AddressFormProps {
    addressToEdit?: Address | null;
    onSave: (address: Address) => void;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ addressToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState<AddressFormData>({
        name: addressToEdit?.fullName || '',
        phone: addressToEdit?.phone || '',
        street: addressToEdit?.street || '',
        addressLine2: addressToEdit?.addressLine2 || '',
        locality: addressToEdit?.addressLine2 || '', // mapping back for form compat
        city: addressToEdit?.city || '',
        state: addressToEdit?.state || '',
        zip: addressToEdit?.pincode || '',
        type: (addressToEdit?.type as any) || 'Home'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const hydrateForm = async () => {
            if (addressToEdit?.id || addressToEdit?._id) {
                const addId = addressToEdit._id || addressToEdit.id;
                console.log("[AddressForm] Hydrating ID:", addId);

                try {
                    // FETCH FULL OBJECT - RULE 3
                    const { data } = await API.get(`/api/user/address/${addId}`);

                    if (data?.status === 'success' && data?.data?.address) {
                        const fullAddr = data.data.address;
                        console.log("[AddressForm] Fetched Full Address:", fullAddr);
                        setFormData({
                            name: fullAddr.fullName,
                            phone: fullAddr.phone,
                            street: fullAddr.street,
                            addressLine2: fullAddr.addressLine2 || '',
                            locality: fullAddr.addressLine2 || '',
                            city: fullAddr.city,
                            state: fullAddr.state,
                            zip: fullAddr.pincode,
                            type: fullAddr.type || 'Home'
                        });
                        return;
                    }
                } catch (err) {
                    console.error("Failed to hydrate address:", err);
                    // Optional: Add toast here if we had access to addToast
                }
            }

            // Fallback (only if new or fetch failed, though fetch failure should ideally block edit)
            if (addressToEdit) {
                console.warn("[AddressForm] Using partial props for hydration - warning: might be incomplete");
                setFormData({
                    name: addressToEdit.fullName || (addressToEdit as any).name || '',
                    phone: addressToEdit.phone || (addressToEdit as any).mobile || '',
                    street: addressToEdit.street || (addressToEdit as any).address || (addressToEdit as any).addressLine1 || '',
                    addressLine2: addressToEdit.addressLine2 || (addressToEdit as any).locality || '',
                    locality: addressToEdit.addressLine2 || (addressToEdit as any).locality || '',
                    city: addressToEdit.city || (addressToEdit as any).district || '',
                    state: addressToEdit.state || '',
                    zip: addressToEdit.pincode || (addressToEdit as any).zip || (addressToEdit as any).postalCode || '',
                    type: (addressToEdit.type as any) || 'Home'
                });
            }
        };

        hydrateForm();
    }, [addressToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate Form
        const validationErrors = validateAddressForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        const finalAddress: Address = {
            id: addressToEdit?.id ?? Date.now(),
            _id: addressToEdit?._id, // Preserve Mongo ID if exists
            fullName: formData.name,
            phone: formData.phone,
            street: formData.street,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.zip,
            type: formData.type,
            country: 'India',
            isDefault: addressToEdit?.isDefault || false,
            // Legacy/Backend Compatibility Fields (to ensure persistence works even if backend expects these)
            name: formData.name,
            mobile: formData.phone,
            address: formData.street,
            zip: formData.zip,
            postalCode: formData.zip
        } as Address;



        console.log("[AddressForm] Submitting:", finalAddress);
        onSave(finalAddress);
    };

    return (
        <div className="w-full space-y-4 md:space-y-6">
            {/* Header - Compact on mobile */}
            <div className="px-4 pt-4 md:px-8 md:pt-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{addressToEdit ? "Edit Address" : "Add New Address"}</h2>
                <p className="text-gray-500 text-xs md:text-sm mt-1">Please enter your delivery details below.</p>
            </div>

            {/* Scrollable Content Area */}
            <div className="px-4 md:px-8 pb-4 space-y-4 md:space-y-6">
                {/* Info Banner */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4 text-xs md:text-sm text-blue-800">
                    <Info className="flex-shrink-0 mt-0.5" size={16} />
                    <p>
                        Fzokart ensures contactless delivery. Please consider paying online for a safer experience.
                    </p>
                </div>

                {/* PRICE FREEZE WARNING - Critical UX Requirement */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-lg p-3 md:p-4 text-xs md:text-sm text-amber-800">
                    <Info className="flex-shrink-0 mt-0.5" size={16} />
                    <p className="font-medium">
                        Price will update only after address is saved.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

                    <div className="border-0 md:border md:border-gray-100 rounded-xl p-0 md:p-4 md:bg-gray-50/50">
                        <AddressFormFields
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                        />
                    </div>

                    <div className="pt-2 md:pt-4 flex gap-3 md:gap-4 sticky bottom-0 bg-white pb-2 md:pb-0 z-10">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 md:px-6 md:py-3.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-semibold transition-colors duration-200 text-sm md:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-3 md:px-6 md:py-3.5 rounded-xl font-bold shadow-sm transition-all duration-200 text-sm md:text-base ${Object.keys(errors).length > 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-md active:transform active:scale-[0.98]"
                                } ${(Object.keys(errors).length > 0 || !formData.name || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.zip) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            disabled={Object.keys(errors).length > 0 || !formData.name || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.zip}
                        >
                            Save Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressForm;
