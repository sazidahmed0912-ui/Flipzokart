import React, { useState, useEffect } from 'react';
import {
    Plus
} from 'lucide-react';
import { useApp } from '../store/Context';
import { useToast } from '../components/toast';
import API, { calculateShipping } from '../services/api';
import AddressCard from '../pages/CheckoutPage/components/AddressCard';
import AddressForm from '../pages/CheckoutPage/components/AddressForm';
import Modal from '../pages/CheckoutPage/components/Modal';
import { SmoothReveal } from "../components/SmoothReveal";
import { getSafeAddress } from '../utils/addressHelper';
import { Address } from '../types';
import ProfileSidebar from '../components/Profile/ProfileSidebar';

const AddressBookPage: React.FC = () => {
    const { user } = useApp();
    const { addToast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const { data } = await API.get('/api/user/address');
                const userAddresses = data.addresses || [];
                // Map backend addresses to frontend Address type
                const formatted: Address[] = userAddresses.map((a: any) => {
                    const safe = getSafeAddress(a);
                    return {
                        ...safe,
                        id: a._id || a.id || Date.now(), // Preserve ID
                        name: safe.fullName, // Legacy compatibility
                        country: 'India' // Required by Address type
                    } as Address;
                });
                setAddresses(formatted);
            } catch (error) {
                console.error("Failed to fetch addresses", error);
                addToast('error', "Failed to load addresses");
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [user, addToast]);


    const handleAddNewAddressClick = () => {
        setAddressToEdit(null);
        setIsAddressFormOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setAddressToEdit(address);
        setIsAddressFormOpen(true);
    };

    const handleDeleteAddress = async (id: string | number) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await API.delete(`/api/user/address/${id}`);
                setAddresses(prev => prev.filter(addr => addr.id !== id));
                addToast('success', "Address deleted");
            } catch (e) {
                addToast('error', "Failed to delete address");
            }
        }
    };

    const handleSaveAddress = async (address: Partial<Address>) => {
        try {
            if (addressToEdit) {
                // UPDATE existing address
                await API.put(`/api/user/address/${addressToEdit.id}`, address);
            } else {
                // CREATE new address
                await API.post('/api/user/address', address);
            }

            // Refresh list
            const { data } = await API.get('/api/user/address');
            const updatedRaw = data.addresses || [];
            const formatted: Address[] = updatedRaw.map((a: any) => {
                const safe = getSafeAddress(a);
                return {
                    ...safe,
                    id: a._id || a.id || Date.now(), // Preserve ID
                    name: safe.fullName, // Legacy compatibility
                    country: 'India' // Required by Address type
                } as Address;
            });

            setAddresses(formatted);
            addToast('success', addressToEdit ? "Address updated" : "Address added");
            setIsAddressFormOpen(false);
            setAddressToEdit(null);

        } catch (e) {
            console.error(e);
            addToast('error', "Failed to save address");
        }
    };

    const handleCancel = () => {
        setIsAddressFormOpen(false);
        setAddressToEdit(null);
    };

    const handleSelectDummy = () => {
        // No-op for address book
    };

    const handleDeliverHereDummy = () => {
        // No-op
    };

    return (
        <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
            <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* ──────── LEFT SIDEBAR ──────── */}
                <ProfileSidebar />

                {/* ──────── MAIN CONTENT ──────── */}
                <div className="flex-1 space-y-6">
                    <SmoothReveal direction="down" delay={100}>
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-[#1F2937]">Manage Addresses</h1>
                        </div>
                    </SmoothReveal>

                    <SmoothReveal direction="up" delay={200}>
                        {/* Add New Address Button (Trigger Modal) */}
                        <div className="bg-white p-6 rounded-[2px] shadow-sm mb-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 flex items-center gap-3 text-[#2874F0] font-bold"
                            onClick={handleAddNewAddressClick}
                        >
                            <Plus size={20} />
                            ADD A NEW ADDRESS
                        </div>

                        {/* List utilizing Checkout's AddressCard */}
                        <div className="space-y-4">
                            {loading && addresses.length === 0 ? (
                                <div className="text-center py-8">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No addresses saved. Add one now!</div>
                            ) : (
                                addresses.map((addr) => (
                                    <AddressCard
                                        key={addr.id}
                                        address={addr}
                                        isSelected={true} // Always show actions
                                        onSelect={handleSelectDummy} // No-op for selection in manager
                                        onDelete={handleDeleteAddress}
                                        onEdit={handleEditAddress}
                                        onDeliverHere={handleDeliverHereDummy}
                                        isLoading={false}
                                        hideRadio={true} // Hide Radio for Address Book
                                    />
                                ))
                            )}
                        </div>
                    </SmoothReveal>

                    {/* Modal with Checkout's AddressForm */}
                    <Modal isOpen={isAddressFormOpen} onClose={handleCancel}>
                        <AddressForm
                            addressToEdit={addressToEdit}
                            onSave={handleSaveAddress}
                            onCancel={handleCancel}
                        />
                    </Modal>

                </div>
            </div>
        </div>
    );
};

export default AddressBookPage;
