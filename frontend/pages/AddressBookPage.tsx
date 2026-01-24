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
    Briefcase
} from "lucide-react";
import { SmoothReveal } from "../components/SmoothReveal";
import { useApp } from "../store/Context";
import API from "../services/api";

const AddressBookPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useApp();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const sidebarItems = [
        { name: "My Profile", path: "/profile", icon: User },
        { name: "Orders", path: "/orders", icon: Package },
        { name: "Wishlist", path: "/wishlist", icon: Heart },
        { name: "Sell on Flipzokart", path: "/sell", icon: Store },
        { name: "Account Security", path: "/account-security", icon: ShieldCheck },
        { name: "Address Book", path: "/address-book", icon: MapPin },
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
            setAddresses(data.addresses || []);
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
        // Real-time sync: Fetch intermittently
        const interval = setInterval(fetchAddresses, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this address?")) {
            try {
                await API.delete(`/api/user/address/${id}`);
                setAddresses(addresses.filter(a => a._id !== id));
            } catch (error) {
                console.error("Delete failed");
            }
        }
    }

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
                        <h1 className="text-2xl font-bold text-[#1F2937]">Manage Addresses</h1>
                    </SmoothReveal>

                    <SmoothReveal direction="up" delay={200}>
                        <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] mb-6 cursor-pointer hover:bg-blue-50 transition-colors border border-dashed border-[#2874F0] flex items-center gap-3 text-[#2874F0] font-bold"
                            onClick={() => navigate('/add-address')}
                        >
                            <Plus size={20} />
                            ADD A NEW ADDRESS
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No addresses saved. Add one now!</div>
                            ) : (
                                addresses.map((addr) => (
                                    <div key={addr._id} className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                                    {addr.type === 'Work' ? <Briefcase size={10} /> : <Home size={10} />}
                                                    {addr.type}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 flex items-center gap-4">
                                                {addr.fullName} <span className="text-sm font-semibold text-gray-500">{addr.phone}</span>
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed max-w-lg">
                                                {addr.address}, {addr.city}, {addr.state} - <span className="font-bold text-gray-800">{addr.pincode}</span>
                                            </p>
                                        </div>
                                        <button onClick={() => handleDelete(addr._id)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};

export default AddressBookPage;
