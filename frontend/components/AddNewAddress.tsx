import React, { useState, useEffect } from "react";
import { Home, Briefcase, MapPin, Info } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { useToast } from "./toast";

const AddNewAddress: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Check if we are in Edit Mode
    const addressToEdit = location.state?.addressToEdit;
    const isEditMode = !!addressToEdit;

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        type: "Home"
    });

    useEffect(() => {
        if (isEditMode && addressToEdit) {
            setFormData({
                fullName: addressToEdit.fullName || addressToEdit.name || "",
                phone: addressToEdit.phone || "",
                email: addressToEdit.email || "",
                address: addressToEdit.address || "",
                city: addressToEdit.city || "",
                state: addressToEdit.state || "",
                pincode: addressToEdit.pincode || "",
                type: addressToEdit.type || "Home"
            });
        }
    }, [isEditMode, addressToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name || 'type']: e.target.value });
    };

    const handleSave = async () => {
        // Basic Validation
        if (!formData.fullName || !formData.phone || !formData.address || !formData.pincode) {
            alert("Please fill required fields");
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                // UPDATE Existing Address
                // backend route: PUT /api/user/address/:id
                await API.put(`/api/user/address/${addressToEdit._id || addressToEdit.id}`, formData);
                addToast?.('success', 'Address updated successfully');
            } else {
                // CREATE New Address
                await API.post('/api/user/address', formData);
                addToast?.('success', 'Address added successfully');
            }
            navigate('/address-book');
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
                        Flipzokart ensures contactless delivery. Please pay online for a safer experience.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-4">

                    {/* Name */}
                    <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
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
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            type="tel"
                            placeholder="10-digit mobile number"
                            className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="Email (optional)"
                        className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Address */}
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="House No, Building, Street, Area"
                        className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* City & State (Simplified for now, can be auto-filled via PIN in future) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            type="text"
                            placeholder="City / District"
                            className="border rounded-lg px-4 py-3"
                        />
                        <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            type="text"
                            placeholder="State"
                            className="border rounded-lg px-4 py-3"
                        />
                    </div>

                    {/* Locality & Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Locality (Optional)"
                            className="border rounded-lg px-4 py-3"
                        />
                        <input
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
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
                                type="button"
                                key={item.name}
                                onClick={() => setFormData({ ...formData, type: item.name })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${formData.type === item.name
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
                        <button onClick={() => navigate(-1)} className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200 transition">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
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
