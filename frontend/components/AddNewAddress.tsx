import React, { useState } from "react";
import { Home, Briefcase, MapPin, Info } from "lucide-react";

const AddNewAddress: React.FC = () => {
    const [label, setLabel] = useState("Home");

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 space-y-6">

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
                <div className="space-y-4">

                    {/* Name */}
                    <input
                        type="text"
                        placeholder="Enter full name"
                        className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Phone */}
                    <div className="flex gap-3">
                        <select className="border rounded-lg px-3 py-3 bg-white">
                            <option>+91</option>
                        </select>
                        <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Email (optional)"
                        className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Address */}
                    <textarea
                        rows={3}
                        placeholder="House No, Building, Street, Area"
                        className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* City & State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select className="border rounded-lg px-4 py-3 bg-white">
                            <option>City / District</option>
                        </select>
                        <select className="border rounded-lg px-4 py-3 bg-white">
                            <option>State</option>
                        </select>
                    </div>

                    {/* Locality & Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Locality"
                            className="border rounded-lg px-4 py-3"
                        />
                        <input
                            type="number"
                            placeholder="6-digit pincode"
                            className="border rounded-lg px-4 py-3"
                        />
                    </div>

                    {/* Address Type */}
                    <div className="flex gap-3 pt-2">
                        {[
                            { name: "Home", icon: <Home size={16} /> },
                            { name: "Work", icon: <Briefcase size={16} /> },
                            { name: "Other", icon: <MapPin size={16} /> },
                        ].map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setLabel(item.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${label === item.name
                                        ? "bg-blue-50 border-blue-500 text-blue-700"
                                        : "border-gray-300 text-gray-600"
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
                        <button className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition">
                            Cancel
                        </button>
                        <button className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition">
                            Save
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddNewAddress;
