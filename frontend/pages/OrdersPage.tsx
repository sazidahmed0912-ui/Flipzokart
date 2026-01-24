import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Store, User, Package, Heart, ShieldCheck, MapPin,
    ChevronRight, LogOut, ShoppingBag, Clock, CheckCircle,
    XCircle, Truck, Search, Filter, RefreshCw,
    Tag, HelpCircle
} from "lucide-react";
import { SmoothReveal } from "../components/SmoothReveal";
import { useApp } from "../store/Context";
import API from "../services/api";

const OrdersPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useApp();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const sidebarItems = [
        { name: "My Profile", path: "/profile", icon: User },
        { name: "Orders", path: "/orders", icon: Package },
        { name: "Wishlist", path: "/wishlist", icon: Heart },
        { name: "Coupons", path: "/coupons", icon: Tag },
        { name: "Sell on Flipzokart", path: "/sell", icon: Store },
        { name: "Account Security", path: "/account-security", icon: ShieldCheck },
        { name: "Address Book", path: "/address-book", icon: MapPin },
        { name: "Help Center", path: "/help-center", icon: HelpCircle },
    ];

    const handleNavigation = (path: string) => { navigate(path); };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const { data } = await API.get(`/api/order/user/${user.id}`);
            const orderList = Array.isArray(data.data) ? data.data : (data.orders || []);
            setOrders(orderList);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Real-time Sync (5s)
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [user]);

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchTab = activeTab === 'All' ||
            (activeTab === 'In Progress' && ['Pending', 'Shipped', 'Processing'].includes(order.status || 'Pending')) ||
            (activeTab === 'Delivered' && order.status === 'Delivered') ||
            (activeTab === 'Cancelled' && order.status === 'Cancelled');

        const matchSearch = order.products?.some((p: any) => p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            order._id?.includes(searchTerm);

        return matchTab && matchSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'text-green-600';
            case 'Cancelled': return 'text-red-600';
            case 'Shipped': return 'text-blue-600';
            default: return 'text-orange-600';
        }
    };

    // Helper for Progress Bar
    const getProgressWidth = (status: string) => {
        if (status === 'Delivered') return '100%';
        if (status === 'Out for Delivery') return '80%';
        if (status === 'Shipped') return '50%';
        if (status === 'Cancelled') return '0%'; // Special handling usually
        return '20%'; // Ordered/Pending
    };

    return (
        <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
            <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* ──────── LEFT SIDEBAR ──────── */}
                <div className="w-full lg:w-[280px] flex-shrink-0 space-y-4">
                    {/* User Hello Card */}
                    <div className="bg-white rounded-[2px] shadow-sm p-4 flex items-center gap-4">
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
                    <div className="bg-white rounded-[2px] shadow-sm overflow-hidden">
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide py-2 lg:py-0">
                            {sidebarItems.map((item, i) => {
                                const isActive = item.name === "Orders";
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
                <div className="flex-1 space-y-4">

                    {/* Filter Tabs & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                        <div className="flex bg-white rounded-[2px] shadow-sm p-1 gap-1 w-full md:w-auto overflow-x-auto">
                            {['All', 'In Progress', 'Delivered', 'Cancelled'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-[2px] text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                        ? 'bg-[#2874F0] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64 bg-white rounded-[2px] shadow-sm">
                            <input
                                type="text"
                                placeholder="Search your orders here"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-[2px] focus:outline-none focus:border-[#2874F0]"
                            />
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    {/* Orders List */}
                    {loading && orders.length === 0 ? (
                        <div className="text-center py-12">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-[2px] shadow-sm p-12 text-center flex flex-col items-center justify-center">
                            <ShoppingBag size={48} className="text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-800">No orders found</h3>
                            <p className="text-gray-500 mb-6">Change filters or go shopping!</p>
                            <button onClick={() => navigate('/shop')} className="bg-[#2874F0] text-white px-8 py-2.5 rounded-[2px] font-bold shadow-sm hover:bg-blue-600 transition-colors">
                                Shop Now
                            </button>
                        </div>
                    ) : (
                        filteredOrders.map((order: any) => (
                            <div key={order._id || order.id} className="bg-white rounded-[4px] shadow-sm hover:shadow-md transition-shadow border border-gray-100 mb-4 overflow-hidden">
                                {/* Card Header: Ordered On */}
                                <div className="bg-white px-6 py-3 border-b border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800">
                                            Ordered on <span className="font-bold">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </span>
                                    </div>
                                    {order.paymentMethod === 'UPI' && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">Paid via UPI</span>}
                                </div>

                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className={`p-6 flex flex-col md:flex-row gap-6 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                                        {/* Image */}
                                        <div className="w-24 h-24 flex-shrink-0 relative">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        {/* Details & Status */}
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900 text-base hover:text-[#2874F0] cursor-pointer line-clamp-2" onClick={() => navigate(`/product/${item.productId}`)}>
                                                    {item.name}
                                                </h3>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {item.selectedVariants?.Color && <span>Color: {item.selectedVariants.Color}</span>}
                                                </div>
                                            </div>

                                            <div className="text-right md:text-left">
                                                <span className="font-bold text-gray-900 text-lg">₹{(item.price || 0).toLocaleString()}</span>
                                            </div>

                                            {/* Status Bar */}
                                            <div className="col-span-1 md:col-span-2 mt-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-green-600'}`}></div>
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        {order.status} {order.status === 'Delivered' ? `on ${new Date(order.updatedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}` : ''}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {order.status === 'Shipped' ? 'Your item is out for delivery' : order.status === 'Cancelled' ? 'As per your request' : 'Your order has been placed'}
                                                </p>

                                                {order.status !== 'Cancelled' && (
                                                    <div className="h-1 bg-gray-100 rounded-full w-full max-w-sm relative mt-2">
                                                        <div className="absolute h-full bg-green-500 rounded-full" style={{ width: getProgressWidth(order.status) }}></div>
                                                        {/* Dots for status */}
                                                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 w-2 h-2 rounded-full ${['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                                        <div className={`absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 justify-start min-w-[150px]">
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <button
                                                    onClick={() => navigate('/track-order', { state: { order } })}
                                                    className="bg-[#F9C74F] hover:bg-yellow-400 text-black font-medium py-2 px-6 rounded-[2px] text-sm shadow-sm transition-colors text-center"
                                                >
                                                    Track
                                                </button>
                                            )}

                                            <button onClick={() => { }} className="border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-[2px] text-sm transition-colors">
                                                View Details
                                            </button>

                                            {order.status === 'Delivered' ? (
                                                <button className="bg-[#2874F0] text-white hover:bg-blue-600 font-medium py-2 px-4 rounded-[2px] text-sm transition-colors shadow-sm">
                                                    Buy Again
                                                </button>
                                            ) : order.status === 'Pending' ? (
                                                <button className="text-red-500 hover:text-red-600 font-semibold text-sm flex items-center gap-1 justify-center mt-1">
                                                    <XCircle size={16} /> Cancel
                                                </button>
                                            ) : null}

                                            {order.status === 'Delivered' && (
                                                <button className="text-[#2874F0] text-sm font-medium hover:underline flex items-center gap-1 justify-center">
                                                    <span className="text-yellow-500">★</span> Rate & Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </SmoothReveal>
            </div>
        </div>
        </div >
    );
};

export default OrdersPage;
