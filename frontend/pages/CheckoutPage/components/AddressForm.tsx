import React, { useState, useEffect } from 'react';
import { Home, Briefcase, MapPin, Info } from "lucide-react";
import { Address } from '../../../types';

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

    const [locality, setLocality] = useState('');

    useEffect(() => {
        if (addressToEdit) {
            setFormState(addressToEdit);
        }
    }, [addressToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState((prevState: Address) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddressTypeChange = (type: 'Home' | 'Work' | 'Other') => {
        setFormState((prevState: Address) => ({
            ...prevState,
            type
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAddress = {
            ...formState,
            address: locality ? `${formState.address}, ${locality}` : formState.address
        };
        onSave(finalAddress);
    };

    // Helper for input classes to ensure consistency
    const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1";
    const labelClass = "block text-sm font-semibold text-gray-700";

    return (
        <div className="w-full bg-white rounded-xl p-4 md:p-6 lg:p-8 space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Add New Address</h2>
                <p className="text-gray-500 text-sm mt-1">Please enter your delivery details below.</p>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <Info className="flex-shrink-0 mt-0.5" size={18} />
                <p>
                    Flipzokart ensures contactless delivery. Please consider paying online for a safer experience.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Grid Layout for Landscape / Larger Screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Name */}
                    <div className="col-span-1">
                        <label className={labelClass}>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formState.name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            className={inputClass}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="col-span-1">
                        <label className={labelClass}>Phone Number</label>
                        <div className="flex gap-2 mt-1">
                            <div className="border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-600 font-medium">
                                +91
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formState.phone}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                required
                            />
                        </div>
                    </div>

                    {/* Email (Optional) */}
                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Email (Optional)</label>
                        <input
                            type="email"
                            placeholder="Enter email address"
                            className={inputClass}
                        />
                    </div>

                    {/* Address Field (Full Width) */}
                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Address Area</label>
                        <textarea
                            name="address"
                            rows={3}
                            value={formState.address}
                            onChange={handleChange}
                            placeholder="House No, Building, Street, Area"
                            className={`${inputClass} resize-none`}
                            required
                        />
                    </div>

                    {/* City */}
                    <div className="col-span-1">
                        <label className={labelClass}>City / District</label>
                        <select
                            name="city"
                            value={formState.city}
                            onChange={handleChange}
                            className={`${inputClass} bg-white`}
                            required
                        >
                            <option value="">Select City</option>
                            <option value="New Delhi">New Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Kolkata">Kolkata</option>
                        </select>
                    </div>

                    {/* State */}
                    <div className="col-span-1">
                        <label className={labelClass}>State</label>
                        <select
                            name="state"
                            value={formState.state}
                            onChange={handleChange}
                            className={`${inputClass} bg-white`}
                            required
                        >
                            <option value="">Select State</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="West Bengal">West Bengal</option>
                        </select>
                    </div>

                    {/* Locality */}
                    <div className="col-span-1">
                        <label className={labelClass}>Locality / Town</label>
                        <input
                            type="text"
                            value={locality}
                            onChange={(e) => setLocality(e.target.value)}
                            placeholder="Enter locality"
                            className={inputClass}
                        />
                    </div>

                    {/* Pincode */}
                    <div className="col-span-1">
                        <label className={labelClass}>Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            value={formState.pincode}
                            onChange={handleChange}
                            placeholder="6-digit pincode"
                            className={inputClass}
                            required
                        />
                    </div>
                </div>

                {/* Address Type */}
                <div>
                    <label className={`${labelClass} mb-2`}>Address Type</label>
                    <div className="flex gap-4">
                        {[
                            { name: "Home", icon: <Home size={18} />, value: 'Home' },
                            { name: "Work", icon: <Briefcase size={18} />, value: 'Work' },
                            { name: "Other", icon: <MapPin size={18} />, value: 'Other' },
                        ].map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleAddressTypeChange(item.value as 'Home' | 'Work' | 'Other')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all duration-200 ${formState.type === item.value
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </button>
                        ))}
                    </div>
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
