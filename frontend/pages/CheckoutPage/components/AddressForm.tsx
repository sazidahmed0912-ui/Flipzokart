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

    const [locality, setLocality] = useState(''); // Local state for new UI field, appended to address on save if needed

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
        // Append locality to address if provided, just for saving purposes in a simple way
        // Ideally we would have a separate field in backend, but keeping it simple as requested "Logic add koro"
        const finalAddress = {
            ...formState,
            address: locality ? `${formState.address}, ${locality}` : formState.address
        };
        onSave(finalAddress);
    };

    return (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-none p-0 space-y-6"> {/* Removed shadow/padding wrapper to fit modal */}

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800">Add a New Address</h2>

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
                <Info className="text-blue-600 mt-0.5" size={18} />
                <p>
                    Flipzokart ensures contactless delivery. Please pay online for a safer experience.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />

                {/* Phone */}
                <div className="flex gap-3">
                    <select className="border rounded-lg px-3 py-3 bg-white w-20">
                        <option>+91</option>
                    </select>
                    <input
                        type="tel"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Email (Optional - UI Only not saved to Address type yet) */}
                <input
                    type="email"
                    placeholder="Email (optional)"
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Address */}
                <textarea
                    name="address"
                    rows={3}
                    value={formState.address}
                    onChange={handleChange}
                    placeholder="House No, Building, Street, Area"
                    className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    required
                />

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                        name="city"
                        value={formState.city}
                        onChange={handleChange}
                        className="border rounded-lg px-4 py-3 bg-white"
                        required
                    >
                        <option value="">City / District</option>
                        <option value="New Delhi">New Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Kolkata">Kolkata</option>
                        {/* Add more as needed or make generic input if prefer */}
                    </select>
                    <select
                        name="state"
                        value={formState.state}
                        onChange={handleChange}
                        className="border rounded-lg px-4 py-3 bg-white"
                        required
                    >
                        <option value="">State</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="West Bengal">West Bengal</option>
                    </select>
                </div>

                {/* Locality & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="Locality"
                        className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="pincode"
                        value={formState.pincode}
                        onChange={handleChange}
                        placeholder="6-digit pincode"
                        className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Address Type */}
                <div className="flex gap-3 pt-2">
                    {[
                        { name: "Home", icon: <Home size={16} />, value: 'Home' },
                        { name: "Work", icon: <Briefcase size={16} />, value: 'Work' },
                        { name: "Other", icon: <MapPin size={16} />, value: 'Other' },
                    ].map((item) => (
                        <button
                            key={item.name}
                            type="button"
                            onClick={() => handleAddressTypeChange(item.value as 'Home' | 'Work' | 'Other')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${formState.type === item.value
                                    ? "bg-blue-50 border-blue-500 text-blue-700"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-500">
                    Your address will be saved as per chosen category.
                </p>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition shadow-sm"
                    >
                        Save
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddressForm;
