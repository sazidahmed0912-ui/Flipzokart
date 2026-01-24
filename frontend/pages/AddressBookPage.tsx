import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Store,
    User,
    Package,
    Heart,
    ShieldCheck,
    MapPin,
    ChevronRight,
    LogOut,
    Plus,
    Trash2,
    Home,
    Briefcase,
    Tag,
    HelpCircle
} from "lucide-react";
import { SmoothReveal } from "../components/SmoothReveal";
import { useApp } from "../store/Context";
import API from "../services/api";
import { Address } from '../types';

// Importing Checkout Components for EXACT MATCH
import AddressCard from './CheckoutPage/components/AddressCard';
import AddressForm from './CheckoutPage/components/AddressForm';
import Modal from './CheckoutPage/components/Modal';
import './CheckoutPage/components/Modal.css';
import './CheckoutPage/CheckoutPage.css'; // Import Checkout Styles for AddressCard

const AddressBookPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useApp();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State for Modal
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

    const sidebarItems = [
        { name: "My Profile", path: "/profile", icon: User },
        { name: "Orders", path: "/orders", icon: Package },
        { name: "Wishlist", path: "/wishlist", icon: Heart },
        { name: "Coupons", path: "/coupons", icon: Tag },
        { name: "Sell on Fzokart", path: "/sell", icon: Store },
        { name: "Account Security", path: "/account-security", icon: ShieldCheck },
        { name: "Address Book", path: "/address-book", icon: MapPin },
        { name: "Help Center", path: "/help-center", icon: HelpCircle },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const fetchAddresses = async () => {
        try {
            const { data } = await API.get('/api/user/address');
            const list = data.addresses || [];
            // Ensure ID compatibility
            setAddresses(list.map((a: any) => ({ ...a, id: a._id, name: a.fullName || a.name })));
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
        // Polling if needed, but manual updates (save/delete) should suffice for responsiveness
        // Keeping it for sync across tabs
        const interval = setInterval(fetchAddresses, 5000);
        return () => clearInterval(interval);
    }, [user]);

    // Handle Actions (Matching Checkout interactions)

    const handleAddNewAddressClick = () => {
        setAddressToEdit(null); // Clear for new
        setIsAddressFormOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setAddressToEdit(address);
        setIsAddressFormOpen(true);
    };

    const handleDeleteAddress = async (id: number | string) => {
        if (window.confirm("Delete this address?")) {
            try {
                await API.delete(`/api/user/address/${id}`);
                setAddresses(prev => prev.filter(a => a.id !== id));
            } catch (error) {
                console.error("Delete failed");
            }
        }
    }

    const handleSaveAddress = async (address: Address) => {
        setLoading(true);
        try {
            if (addressToEdit) {
                // UPDATE
                await API.put(`/api/user/address/${address.id}`, address);
            } else {
                // CREATE
                // Ensure we don't send a temp ID if backend generates it, but Form generates ID.
                // Backend ignores ID usually on create.
                await API.post('/api/user/address', address);
            }
            await fetchAddresses(); // Refresh list to get clean IDs etc
            setIsAddressFormOpen(false);
            setAddressToEdit(null);
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        setIsAddressFormOpen(false);
        setAddressToEdit(null);
    };

    // Dummy prop for AddressCard since we are not selecting for delivery here
    const handleSelectDummy = () => { };
    const handleDeliverHereDummy = () => { };

    return (
        <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
            <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* ──────── LEFT SIDEBAR ──────── */}
                <div className="w-full lg:w-[280px] flex-shrink-0 space-y-4">
                    {/* User Hello Card */}
                    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#f0f5ff] flex items-center justify-center border border-[#e0e0e0] overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar.startsWith('http') ? user.avatar : `/${user.avatar}`} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <img
                                    src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"
                                    alt="User"
                                    className="w-8 h-8 opacity-80"
                                />
                            )}
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-medium">Hello,</div>
                            <div className="text-base font-bold text-[#1F2937]">{user?.name || "User"}</div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide py-2 lg:py-0">
                            {sidebarItems.map((item, i) => {
                                const isActive = item.name === "Address Book";
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`flex items-center gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 cursor-pointer transition-colors border-r lg:border-r-0 lg:border-b last:border-0 border-gray-50 flex-shrink-0 whitespace-nowrap
                                            ${isActive ? "bg-[#F5FAFF] text-[#2874F0]" : "text-gray-600 hover:bg-gray-50"}
                                        `}
                                    >
                                        <Icon size={18} className={`lg:w-5 lg:h-5 ${isActive ? "text-[#2874F0]" : "text-gray-400"}`} />
                                        <span className={`text-sm lg:text-base font-medium ${isActive ? "font-bold" : ""}`}>{item.name}</span>
                                        {isActive && <ChevronRight size={16} className="ml-auto text-[#2874F0] hidden lg:block" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div
                            onClick={handleLogout}
                            className="hidden lg:flex items-center gap-4 px-6 py-4 cursor-pointer text-gray-600 hover:bg-red-50 hover:text-red-600 border-t border-gray-100 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </div>
                    </div>
                </div>

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
