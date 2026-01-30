"use client";
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import API from '@/app/services/api';
import { useToast } from "./toast";
import { AddressFormFields, AddressFormData } from "./AddressFormFields";
import { validateAddressForm } from '@/app/utils/addressValidation';

const AddNewAddress: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname(); const searchParams = useSearchParams();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Check if we are in Edit Mode
    const addressId = searchParams.get('id');
    const isEditMode = !!addressId;

    const [formData, setFormData] = useState<AddressFormData>({
        name: "",
        phone: "",
        email: "",
        street: "",
        locality: "",
        city: "",
        state: "",
        zip: "",
        type: "Home"
    });

    // Fetch address if in edit mode
    useEffect(() => {
        if (isEditMode && addressId) {
            const fetchAddress = async () => {
                try {
                    setLoading(true);
                    const { data } = await API.get(`/api/user/address/${addressId}`);
                    // Adjust based on actual API response structure for single address
                    // Assuming data is the address object or data.address
                    const addr = data.address || data;
                    if (addr) {
                        setFormData({
                            name: addr.fullName || addr.name || "",
                            phone: addr.phone || "",
                            email: addr.email || "",
                            street: addr.address || addr.street || "",
                            locality: addr.locality || "",
                            city: addr.city || "",
                            state: addr.state || "",
                            zip: addr.pincode || "",
                            type: (addr.type as any) || "Home"
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch address for edit", error);
                    addToast?.('error', "Failed to load address details");
                } finally {
                    setLoading(false);
                }
            };
            fetchAddress();
        }
    }, [isEditMode, addressId]);

    const handleSave = async () => {
        // Validate Form
        const validationErrors = validateAddressForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            addToast?.('error', "Please fix the errors in the form");
            return;
        }
        setErrors({});

        setLoading(true);
        try {
            // Map to backend expected format
            // Backend logic: fullName, phone, street, addressLine2, city, state, pincode, type
            // Note: Schema expects 'street', 'addressLine2', 'pincode'
            const payload = {
                fullName: formData.name,
                phone: formData.phone,
                email: formData.email,
                street: formData.street,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                pincode: formData.zip,
                type: formData.type,
                isDefault: false
            };

            if (isEditMode) {
                // UPDATE Existing Address
                await API.put(`/api/user/address/${addressId}`, payload);
                addToast?.('success', 'Address updated successfully');
            } else {
                // CREATE New Address
                await API.post('/api/user/address', payload);
                addToast?.('success', 'Address added successfully');
            }
            router.push('/address-book');
        } catch (error) {
            console.error("Failed to save address", error);
            addToast?.('error', "Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 space-y-6">

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? "Edit Address" : "Add a New Address"}</h2>

                {/* Info Banner */}
                <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
                    <Info className="text-blue-600 mt-0.5" size={18} />
                    <p>
                        Fzokart ensures contactless delivery. Please pay online for a safer experience.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <AddressFormFields
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                    />

                    <p className="text-xs text-gray-500">
                        Your address will be saved as per chosen category.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button onClick={() => router.back()} className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`flex-1 py-3 rounded-lg font-semibold transition disabled:opacity-50 ${Object.keys(errors).length > 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 text-black hover:bg-yellow-500'
                                }`}
                        >
                            {loading ? "Saving..." : (isEditMode ? "Update Address" : "Save Address")}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddNewAddress;
