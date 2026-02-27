"use client";
import React, { useState, useEffect } from 'react';
import {
    Plus,
    MapPin
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { useToast } from '@/app/components/toast';
import API, { calculateShipping } from '@/app/services/api';
import AddressCard from '@/app/_pages/CheckoutPage/components/AddressCard';
import AddressForm from '@/app/_pages/CheckoutPage/components/AddressForm';
import Modal from '@/app/_pages/CheckoutPage/components/Modal';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import { getSafeAddress } from '@/app/utils/addressHelper';
import { Address } from '@/app/types';
import ProfileSidebar from '@/app/components/Profile/ProfileSidebar';

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
                        id: a._id || a.id || Date.now(),
                        _id: a._id, // Critical for backend operations
                        name: safe.fullName,
                        country: 'India'
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
                    id: a._id || a.id || Date.now(),
                    _id: a._id, // Critical for backend operations
                    name: safe.fullName,
                    country: 'India'
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
            <div className="max-w-[1200px] mx-auto px-0 md:px-4 py-4 md:py-8 flex flex-col lg:flex-row gap-4 md:gap-6">

                {/* ──────── LEFT SIDEBAR ──────── */}
                <div className="hidden lg:block">
                    <ProfileSidebar />
                </div>

                {/* ──────── MAIN CONTENT ──────── */}
                <div className="flex-1 space-y-4 px-3 md:px-0">

                    {/* Header */}
                    <SmoothReveal direction="down" delay={100}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-[#1F2937]">Manage Addresses</h1>
                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                    {addresses.length > 0 ? `${addresses.length} saved address${addresses.length > 1 ? 'es' : ''}` : 'No addresses saved yet'}
                                </p>
                            </div>
                        </div>
                    </SmoothReveal>

                    <SmoothReveal direction="up" delay={150}>
                        {/* Add New Address Button */}
                        <button
                            onClick={handleAddNewAddressClick}
                            className="w-full bg-white border-2 border-dashed border-[#2874F0]/40 hover:border-[#2874F0] hover:bg-blue-50/40 text-[#2874F0] font-bold rounded-xl p-4 md:p-5 flex items-center justify-center gap-2.5 transition-all duration-200 group mb-4"
                        >
                            <span className="w-7 h-7 rounded-full bg-[#2874F0]/10 group-hover:bg-[#2874F0]/20 flex items-center justify-center transition-colors">
                                <Plus size={16} className="text-[#2874F0]" />
                            </span>
                            <span className="text-sm md:text-base tracking-wide">ADD A NEW ADDRESS</span>
                        </button>

                        {/* Address Cards Grid */}
                        {loading && addresses.length === 0 ? (
                            // Skeleton Loading
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-5 animate-pulse">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-24 h-4 bg-gray-200 rounded" />
                                            <div className="w-12 h-4 bg-gray-100 rounded-full" />
                                        </div>
                                        <div className="w-full h-3 bg-gray-100 rounded mb-2" />
                                        <div className="w-3/4 h-3 bg-gray-100 rounded mb-3" />
                                        <div className="w-24 h-3 bg-gray-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : addresses.length === 0 ? (
                            // Empty State
                            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-1">
                                    <MapPin size={28} className="text-[#2874F0]" />
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">No addresses saved</h3>
                                <p className="text-sm text-gray-500">Add your home or work address for faster checkout.</p>
                                <button
                                    onClick={handleAddNewAddressClick}
                                    className="mt-2 bg-[#2874F0] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Add Address
                                </button>
                            </div>
                        ) : (
                            // Address Grid
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <AddressCard
                                        key={addr.id}
                                        address={addr}
                                        isSelected={true}
                                        onSelect={handleSelectDummy}
                                        onDelete={handleDeleteAddress}
                                        onEdit={handleEditAddress}
                                        onDeliverHere={handleDeliverHereDummy}
                                        isLoading={false}
                                        hideRadio={true}
                                    />
                                ))}
                            </div>
                        )}
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

