import React, { useState } from 'react';
import {
    FileText, Download, Calendar, Users, Package,
    ChevronDown, BarChart2
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { SmoothReveal } from '../../components/SmoothReveal';
import { useApp } from '../../store/Context';
import { fetchAllOrders, fetchAllUsers, fetchProducts } from '../../services/adminService';
import { useToast } from '../../components/toast';

export const AdminReports: React.FC = () => {
    const { user } = useApp();
    const { addToast } = useToast();
    const [downloading, setDownloading] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            addToast('warning', 'No data to export');
            return;
        }
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportSales = async () => {
        setDownloading('sales');
        try {
            const { data } = await fetchAllOrders();
            const cleanData = (data.data || data).map((o: any) => ({
                ID: o._id,
                Date: new Date(o.createdAt).toLocaleDateString(),
                Total: o.totalPrice,
                Status: o.status,
                User: o.user?.name || 'Guest'
            }));
            downloadCSV(cleanData, `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
            addToast('success', 'Sales report downloaded');
        } catch (error) {
            addToast('error', 'Failed to export sales');
        } finally {
            setDownloading(null);
        }
    };

    const handleExportUsers = async () => {
        setDownloading('users');
        try {
            const { data } = await fetchAllUsers();
            const cleanData = data.map((u: any) => ({
                ID: u._id,
                Name: u.name,
                Email: u.email,
                Role: u.role,
                Joined: new Date(u.createdAt).toLocaleDateString()
            }));
            downloadCSV(cleanData, `Users_Report_${new Date().toISOString().split('T')[0]}.csv`);
            addToast('success', 'User list downloaded');
        } catch (error) {
            addToast('error', 'Failed to export users');
        } finally {
            setDownloading(null);
        }
    };

    const handleExportInventory = async () => {
        setDownloading('inventory');
        try {
            const { data } = await fetchProducts();
            const list = Array.isArray(data) ? data : (data.products || []);
            const cleanData = list.map((p: any) => ({
                ID: p._id,
                Name: p.name,
                Category: p.category,
                Price: p.price,
                Stock: p.countInStock
            }));
            downloadCSV(cleanData, `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
            addToast('success', 'Inventory report downloaded');
        } catch (error) {
            addToast('error', 'Failed to export inventory');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-[#2874F0]" size={20} /> Data & Reports
                    </h1>
                    <div className="flex items-center gap-6">
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
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Sales Report */}
                        <SmoothReveal direction="up" delay={0}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2874F0] group-hover:text-white transition-colors">
                                    <BarChart2 size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Sales Report</h3>
                                <p className="text-sm text-gray-500 mb-6">Export detailed sales history, revenue data, and order statuses.</p>
                                <button
                                    onClick={handleExportSales}
                                    disabled={!!downloading}
                                    className="w-full py-3 border border-[#2874F0] text-[#2874F0] rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {downloading === 'sales' ? 'Exporting...' : <><Download size={16} /> Download CSV</>}
                                </button>
                            </div>
                        </SmoothReveal>

                        {/* User Report */}
                        <SmoothReveal direction="up" delay={100}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Customer Data</h3>
                                <p className="text-sm text-gray-500 mb-6">List of registered users, join dates, and account roles.</p>
                                <button
                                    onClick={handleExportUsers}
                                    disabled={!!downloading}
                                    className="w-full py-3 border border-purple-600 text-purple-600 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {downloading === 'users' ? 'Exporting...' : <><Download size={16} /> Download CSV</>}
                                </button>
                            </div>
                        </SmoothReveal>

                        {/* Inventory Report */}
                        <SmoothReveal direction="up" delay={200}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <Package size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Inventory Status</h3>
                                <p className="text-sm text-gray-500 mb-6">Current stock levels, category distribution, and pricing.</p>
                                <button
                                    onClick={handleExportInventory}
                                    disabled={!!downloading}
                                    className="w-full py-3 border border-green-600 text-green-600 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {downloading === 'inventory' ? 'Exporting...' : <><Download size={16} /> Download CSV</>}
                                </button>
                            </div>
                        </SmoothReveal>
                    </div>
                </div>
            </div>
        </div>
    );
};
