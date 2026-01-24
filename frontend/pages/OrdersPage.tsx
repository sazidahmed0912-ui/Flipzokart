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
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Tag,
    HelpCircle
} from "lucide-react";
import { SmoothReveal } from "../components/SmoothReveal";
import { useApp } from "../store/Context";
import API from "../services/api";

const OrdersPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useApp();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = async () => {
        await logout(); // Using context logout for consistency
        navigate("/login");
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                // Fetch orders for the current user
                // Based on orderController.js: router.get('/user/:userId', getUserOrders)
                // Assuming route is /api/order/user/:id or /api/orders/user/:id
                // Checking previous code context: ProfilePage uses /api/order/user/${uid}
                const { data } = await API.get(`/api/order/user/${user.id}`);
                // API returns { success: true, count: N, data: [...] } or just array based on controller
                // orderController says: res.status(200).json({ success: true, count: orders.length, data: formattedOrders });
                const orderList = data.data || [];
                setOrders(orderList);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Paid': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={14} />;
            case 'Shipped': return <Truck size={14} />;
            case 'Paid': return <ShoppingBag size={14} />;
            case 'Cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
            <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* ──────── LEFT SIDEBAR (Consistent with ProfilePage) ──────── */}
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
                                const isActive = item.name === "Orders"; // Active state for Orders
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

                {/* ──────── MAIN CONTENT (Orders List) ──────── */}
                <div className="flex-1 space-y-6">
                    <SmoothReveal direction="down" delay={100}>
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-[#1F2937]">My Orders ({orders.length})</h1>
                        </div>
                    </SmoothReveal>

                    <SmoothReveal direction="up" delay={200}>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-12">Loading orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-8 text-center flex flex-col items-center justify-center">
                                    <ShoppingBag size={48} className="text-gray-200 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-800">No orders yet</h3>
                                    <p className="text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
                                    <button onClick={() => navigate('/shop')} className="bg-[#2874F0] text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-600 transition-colors">
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                orders.map((order: any, idx) => (
                                    <div key={order.id} className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                                        {/* Order Header */}
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex gap-4 md:gap-8">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Order Placed</p>
                                                    <p className="text-sm font-semibold text-gray-700">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total</p>
                                                    <p className="text-sm font-semibold text-gray-700">₹{order.total?.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Ship To</p>
                                                    <p className="text-sm font-semibold text-gray-700 group relative cursor-help">
                                                        {user?.name?.split(' ')[0]}
                                                        {/* Tooltip for address could go here */}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Order # {order.id.slice(-6)}</p>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)} {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-6">
                                            <div className="space-y-6">
                                                {order.items?.map((item: any, i: number) => (
                                                    <div key={i} className="flex gap-4 md:gap-6 items-center">
                                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><ShoppingBag size={20} /></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">{item.name}</h4>
                                                            <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                                            <p className="text-sm font-bold text-[#2874F0] mt-1">₹{(item.price || 0).toLocaleString()}</p>
                                                        </div>
                                                        {/* Single Action Button per Item (Use Cases: Review, Return) */}
                                                        {order.status === 'Delivered' && (
                                                            <button
                                                                onClick={() => navigate(`/product/${item.productId || item.id}`)}
                                                                className="text-[#2874F0] text-sm font-semibold hover:underline"
                                                            >
                                                                Write a Review
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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

export default OrdersPage;
