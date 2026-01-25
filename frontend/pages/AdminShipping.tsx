import React, { useState } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { SmoothReveal } from '../components/SmoothReveal';
import {
    Search, Bell, User, LogOut, ChevronDown,
    Truck, Package, Printer, MapPin,
    CheckCircle, Barcode, Calendar, MoreHorizontal
} from 'lucide-react';
import { useApp } from '../store/Context';

// Mock Shipment Data
const mockShipments = [
    { id: 'SHP-9001', orderId: 'ORD-1024', customer: 'Rahul Sharma', destination: 'Mumbai, MH', weight: '1.2 kg', status: 'Ready to Ship', date: '2024-03-10' },
    { id: 'SHP-9002', orderId: 'ORD-1026', customer: 'Amit Singh', destination: 'Delhi, DL', weight: '0.8 kg', status: 'Shipped', date: '2024-03-09' },
    { id: 'SHP-9003', orderId: 'ORD-1028', customer: 'Vikram Malhotra', destination: 'Bangalore, KA', weight: '2.5 kg', status: 'Ready to Ship', date: '2024-03-08' },
    { id: 'SHP-9004', orderId: 'ORD-1030', customer: 'Rohit Kumar', destination: 'Pune, MH', weight: '0.5 kg', status: 'In Transit', date: '2024-03-07' },
];

export const AdminShipping: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ready to Ship': return 'bg-yellow-100 text-yellow-700';
            case 'Shipped': return 'bg-blue-100 text-blue-700';
            case 'In Transit': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar */}
                <SmoothReveal direction="down" duration="500" className="sticky top-0 z-30">
                    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
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
                </SmoothReveal>

                <div className="p-8 space-y-8">
                    {/* Header */}
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

                    {/* Pending Shipments Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SmoothReveal direction="up" delay={200}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">12</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ready to Ship</p>
                                </div>
                            </div>
                        </SmoothReveal>
                        <SmoothReveal direction="up" delay={300}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">45</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Transit</p>
                                </div>
                            </div>
                        </SmoothReveal>
                    </div>

                    {/* Shipments Table */}
                    <SmoothReveal direction="up" delay={400}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Shipment ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Destination</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {mockShipments.map((shp) => (
                                            <tr key={shp.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-gray-100 text-gray-600 rounded-lg">
                                                            <Barcode size={16} />
                                                        </div>
                                                        <span className="font-semibold text-gray-800 text-sm">{shp.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {shp.orderId}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-700">{shp.customer}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <MapPin size={14} />
                                                        {shp.destination}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(shp.status)}`}>
                                                        {shp.status === 'Ready to Ship' && <Package size={12} className="mr-1" />}
                                                        {shp.status === 'Shipped' && <Truck size={12} className="mr-1" />}
                                                        {shp.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                            title="Generate Label"
                                                        >
                                                            <Printer size={14} /> Label
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
