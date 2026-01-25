import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Package, Truck, CheckCircle,
    MapPin, User, Calendar, DollarSign,
    AlertTriangle, Save, Loader2
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import CircularGlassSpinner from '../../components/CircularGlassSpinner';
import { fetchOrderById, updateOrderAdminStatus } from '../../services/adminService';
import { useToast } from '../../components/toast';

interface OrderDetail {
    id: string;
    _id: string; // fallback
    userName: string;
    email: string;
    total: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string; // PENDING/PAID
    createdAt: string;
    orderStatus?: string; // Backend inconsistency normalization
    items: Array<{
        name: string;
        image: string;
        price: number;
        quantity: number;
        id: string;
    }>;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    } | string; // Address could be string in legacy data
}

export const AdminOrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        if (id) {
            loadOrder(id);
        }
    }, [id]);

    const loadOrder = async (orderId: string) => {
        try {
            const { data } = await fetchOrderById(orderId);
            // Normalize data
            const normalized = {
                ...data,
                status: data.orderStatus || data.status // Handle backend field name variance
            };
            setOrder(normalized);
            setStatus(normalized.status);
        } catch (error) {
            console.error("Failed to load order details", error);
            addToast('error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!order || !id) return;

        setUpdating(true);
        try {
            await updateOrderAdminStatus(id, status);
            addToast('success', `Order status updated to ${status}`);
            // Refresh local state to confirm update
            setOrder({ ...order, status });
        } catch (error) {
            console.error("Failed to update status", error);
            addToast('error', 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <CircularGlassSpinner />;

    if (!order) {
        return (
            <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
                <AdminSidebar />
                <div className="flex-1 p-8 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
                    <Link to="/admin/orders" className="mt-4 text-[#2874F0] hover:underline">Back to Orders</Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'Delivered': return 'text-green-600 bg-green-50';
            case 'Processing': return 'text-blue-600 bg-blue-50';
            case 'Shipped': return 'text-indigo-600 bg-indigo-50';
            case 'Out for Delivery': return 'text-purple-600 bg-purple-50';
            case 'Cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
    };

    // Helper to safely render address
    const renderAddress = () => {
        if (typeof order.address === 'string') return order.address;
        if (typeof order.address === 'object' && order.address !== null) {
            return (
                <>
                    {order.address.street},<br />
                    {order.address.city}, {order.address.state} - {order.address.zip}<br />
                    {order.address.country}
                </>
            );
        }
        return 'N/A';
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar with Back Button */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center gap-4">
                    <Link to="/admin/orders" className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Order Details</h1>
                        <p className="text-xs text-gray-500">#{order._id}</p>
                    </div>
                    <div className="ml-auto">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </header>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Items & Timeline */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <Package size={18} className="text-[#2874F0]" />
                                <h2 className="font-bold text-gray-800">Order Items</h2>
                                <span className="ml-auto text-xs font-bold text-gray-400">{order.items.length} items</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="p-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-800 truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-800">₹{item.price.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">Total: ₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-600">Total Order Value</span>
                                <span className="text-xl font-bold text-[#2874F0]">₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Timeline (Mock for now, can be real if needed) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-60">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-gray-400" /> Order Timeline
                            </h3>
                            <div className="pl-4 border-l-2 border-gray-100 space-y-6 relative">
                                {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                                    const isCompleted = ['Order Placed', order.status].includes(step) || order.status === 'Delivered';
                                    // Simple logic: if status is Delivered, all are done. If Shipped, first 3. 

                                    return (
                                        <div key={step} className="relative">
                                            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
                                            <p className={`text-sm font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step}</p>
                                            {step === 'Order Placed' && <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Customer & Actions */}
                    <div className="space-y-6">

                        {/* Status Updater */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Update Status</h3>
                            <div className="space-y-4">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#2874F0]/20"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating || status === order.status}
                                    className="w-full py-3 bg-[#2874F0] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Update Order
                                </button>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={18} className="text-gray-400" /> Customer
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                        {order.userName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{order.userName}</p>
                                        <p className="text-xs text-gray-500">{order.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400" /> Delivery Address
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {renderAddress()}
                            </p>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <DollarSign size={18} className="text-gray-400" /> Payment
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Method:</span>
                                    <span className="font-bold text-gray-800">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};
