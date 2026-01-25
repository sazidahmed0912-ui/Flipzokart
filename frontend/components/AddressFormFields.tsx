import React, { useState, useEffect } from 'react';
import { indiaAddressData } from '../data/IndiaAddressData';
import { Home, Briefcase, MapPin } from 'lucide-react';

export interface AddressFormData {
    name: string;
    phone: string;
    email?: string;
    street: string;     // Flat/House/Building
    locality?: string;  // Colony/Street/Area
    city: string;
    state: string;
    zip: string;
    type: 'Home' | 'Work' | 'Other';
}

interface AddressFormFieldsProps {
    formData: AddressFormData;
    setFormData: (data: AddressFormData) => void;
    errors?: Record<string, string>;
}

export const AddressFormFields: React.FC<AddressFormFieldsProps> = ({
    formData,
    setFormData,
    errors = {}
}) => {
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    useEffect(() => {
        if (formData.state && indiaAddressData[formData.state]) {
            setAvailableCities(indiaAddressData[formData.state]);
        } else {
            setAvailableCities([]);
        }
    }, [formData.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'state') {
            setFormData({
                ...formData,
                state: value,
                city: '' // Reset city when state changes
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleTypeChange = (type: 'Home' | 'Work' | 'Other') => {
        setFormData({ ...formData, type });
    };

    const inputClasses = "w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium py-2.5";
    const containerClasses = "flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 focus-within:border-[#2874F0] focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 group";
    const labelClasses = "text-sm text-gray-500 font-medium whitespace-nowrap mr-3 min-w-[80px]";

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <div className={`${containerClasses} ${errors.name ? 'border-red-300 bg-red-50' : ''}`}>
                    <label className={labelClasses}>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className={inputClasses}
                    />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
                <div className={`${containerClasses} ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}>
                    <label className={labelClasses}>Phone</label>
                    <div className="flex items-center w-full">
                        <span className="text-gray-500 mr-2">+91</span>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleChange({ ...e, target: { ...e.target, name: 'phone', value: val } } as any);
                            }}
                            placeholder="Mobile Number"
                            className={inputClasses}
                        />
                    </div>
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
            </div>

            {/* Email (Optional) */}
            <div>
                <div className={containerClasses}>
                    <label className={labelClasses}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        placeholder="Email Address (Optional)"
                        className={inputClasses}
                    />
                </div>
            </div>

            {/* Address (Street) */}
            <div>
                <div className={`${containerClasses} ${errors.street ? 'border-red-300 bg-red-50' : ''}`}>
                    <label className={labelClasses}>Address</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Flat, House no., Building, Apartment"
                        className={inputClasses}
                    />
                </div>
                {errors.street && <p className="text-red-500 text-xs mt-1 ml-1">{errors.street}</p>}
            </div>

            {/* Locality */}
            <div>
                <div className={containerClasses}>
                    <label className={labelClasses}>Locality</label>
                    <input
                        type="text"
                        name="locality"
                        value={formData.locality || ''}
                        onChange={handleChange}
                        placeholder="Area, Colony, Street, Sector (Optional)"
                        className={inputClasses}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State */}
                <div>
                    <div className={`${containerClasses} ${errors.state ? 'border-red-300 bg-red-50' : ''}`}>
                        <label className={labelClasses}>State</label>
                        <div className="flex-1 relative">
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={`${inputClasses} appearance-none cursor-pointer bg-transparent`}
                            >
                                <option value="">Select State</option>
                                {Object.keys(indiaAddressData).map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {errors.state && <p className="text-red-500 text-xs mt-1 ml-1">{errors.state}</p>}
                </div>

                {/* City */}
                <div>
                    <div className={`${containerClasses} ${errors.city ? 'border-red-300 bg-red-50' : ''}`}>
                        <label className={labelClasses}>City</label>
                        <div className="flex-1 relative">
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={!formData.state}
                                className={`${inputClasses} appearance-none cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <option value="">{formData.state ? "Select City" : "Select State First"}</option>
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {errors.city && <p className="text-red-500 text-xs mt-1 ml-1">{errors.city}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pincode */}
                <div>
                    <div className={`${containerClasses} ${errors.zip ? 'border-red-300 bg-red-50' : ''}`}>
                        <label className={labelClasses}>Pincode</label>
                        <input
                            type="text"
                            name="zip"
                            value={formData.zip}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                handleChange({ ...e, target: { ...e.target, name: 'zip', value: val } } as any);
                            }}
                            placeholder="6-digit Pincode"
                            className={inputClasses}
                        />
                    </div>
                    {errors.zip && <p className="text-red-500 text-xs mt-1 ml-1">{errors.zip}</p>}
                </div>

                {/* Country (Fixed) */}
                <div>
                    <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl px-4 cursor-not-allowed">
                        <label className={labelClasses}>Country</label>
                        <input
                            type="text"
                            value="India"
                            disabled
                            className="w-full bg-transparent outline-none text-gray-500 font-medium py-2.5 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Address Type */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Address Type</label>
                <div className="flex gap-3">
                    {[
                        { name: "Home", icon: <Home size={16} />, value: 'Home' },
                        { name: "Work", icon: <Briefcase size={16} />, value: 'Work' },
                        { name: "Other", icon: <MapPin size={16} />, value: 'Other' },
                    ].map((item) => (
                        <button
                            type="button"
                            key={item.name}
                            onClick={() => handleTypeChange(item.value as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${formData.type === item.value
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
        </div>
    );
};
