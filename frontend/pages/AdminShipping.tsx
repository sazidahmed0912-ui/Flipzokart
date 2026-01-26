import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { SmoothReveal } from '../components/SmoothReveal';
import {
    Search, Bell, User, LogOut, ChevronDown,
    Truck, Package, Printer, MapPin,
    CheckCircle, Barcode, Calendar, MoreHorizontal
} from 'lucide-react';
import { useApp } from '../store/Context';
import { fetchAllOrders } from '../services/api';
import { Order } from '../types';
import { ShippingLabel } from '../components/ShippingLabel';

export const AdminShipping: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Pending'); // Filter by order status for now

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const { data } = await fetchAllOrders();
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PACKED': return 'bg-yellow-100 text-yellow-700'; // Was Processing
            case 'SHIPPED': return 'bg-blue-100 text-blue-700';
            case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-700';
            case 'DELIVERED': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = orders.filter(order => {
        // Filter logic
        const s = order.status.toUpperCase();
        if (activeTab === 'Pending' && s !== 'PENDING' && s !== 'PACKED' && s !== 'PROCESSING') return false;
        if (activeTab === 'Shipped' && s !== 'SHIPPED' && s !== 'OUT_FOR_DELIVERY' && s !== 'OUT FOR DELIVERY') return false;
        if (activeTab === 'Delivered' && s !== 'DELIVERED') return false;

        const term = searchTerm.toLowerCase();
        return (order.id.toLowerCase().includes(term) ||
            (order.orderNumber && order.orderNumber.toLowerCase().includes(term)) ||
            (order.trackingId && order.trackingId.toLowerCase().includes(term)) ||
            order.userName.toLowerCase().includes(term));
    });

    const handlePrint = () => {
        // Simple window print for now, ideally we'd target the modal content
        window.print();
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between print:hidden">
                    <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
                        <Search size={18} className="text-[#2874F0]" />
                        <input
                            type="text"
                            placeholder="Search shipments, tracking number..."
                            className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-500 hover:text-[#2874F0] transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6161] rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{user?.name?.split(' ')[0] || 'Admin'}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-8 print:hidden">
                    <SmoothReveal direction="down" delay={100} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Shipping & Labels</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage shipments and generate shipping labels.</p>
                        </div>
                        <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                            {['Pending', 'Shipped', 'Delivered'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#2874F0] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </SmoothReveal>

                    <SmoothReveal direction="up" delay={400}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-800 text-sm">
                                                        {order.orderNumber || order.id.slice(-6)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {order.trackingId || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-700">{order.userName}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {order.shippingSnapshot ? (
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => window.open(`/invoice/${order.id}`, '_blank')}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                                            >
                                                                <Printer size={14} /> Invoice
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedLabelOrder(order)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                            >
                                                                <Barcode size={14} /> Label
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No Data</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </SmoothReveal>
                </div>

                {/* Modal for Label */}
                {selectedLabelOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:absolute print:inset-0">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:h-full print:max-h-none print:rounded-none">
                            <div className="flex justify-between items-center mb-6 print:hidden">
                                <h2 className="text-lg font-bold">Shipping Label</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                                    >
                                        <Printer size={16} /> Print
                                    </button>
                                    <button
                                        onClick={() => setSelectedLabelOrder(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <LogOut size={16} className="rotate-180" />
                                    </button>
                                </div>
                            </div>

                            {/* Render Label Component */}
                            <div className="print:w-full print:flex print:justify-center">
                                <ShippingLabel
                                    orderNumber={selectedLabelOrder.orderNumber || selectedLabelOrder.id || 'N/A'}
                                    trackingId={selectedLabelOrder.trackingId || selectedLabelOrder.id || 'N/A'}
                                    shippingTo={{
                                        name: selectedLabelOrder.userName,
                                        address: (selectedLabelOrder.address && typeof selectedLabelOrder.address === 'object' ? (selectedLabelOrder.address as any).street || (selectedLabelOrder.address as any).address : selectedLabelOrder.address as string) || 'N/A',
                                        city: (selectedLabelOrder.address && typeof selectedLabelOrder.address === 'object' ? (selectedLabelOrder.address as any).city : '') || '',
                                        state: (selectedLabelOrder.address && typeof selectedLabelOrder.address === 'object' ? (selectedLabelOrder.address as any).state : '') || '',
                                        zip: (selectedLabelOrder.address && typeof selectedLabelOrder.address === 'object' ? ((selectedLabelOrder.address as any).zip || (selectedLabelOrder.address as any).pincode) : '') || '',
                                        phone: (selectedLabelOrder.address && typeof selectedLabelOrder.address === 'object' ? (selectedLabelOrder.address as any).phone : '') || selectedLabelOrder.user?.phone || 'N/A'
                                    }}
                                    shippingFrom={{
                                        company: 'Fzokart Pvt. Ltd.',
                                        address: 'Morigaon, Assam, India',
                                        phone: '6033394539'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
