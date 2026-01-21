import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Eye, Edit2, Ban, CheckCircle, ChevronDown, Bell, User, LogOut
} from 'lucide-react';
import { useApp } from '../store/Context';
import { AdminSidebar } from '../components/AdminSidebar';

interface Seller {
    id: string;
    name: string;
    email: string;
    products: number;
    status: 'Active' | 'Pending' | 'Suspended';
    avatar?: string;
}

export const AdminSellers: React.FC = () => {
    const { user, logout } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | Seller['status']>('All');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const sellersPerPage = 10;

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const loadSellers = async () => {
            try {
                const mockSellers: Seller[] = [
                    { id: '1', name: 'Tech Traders', email: 'tech.traders@mail.com', products: 120, status: 'Active' },
                    { id: '2', name: 'Fashion Hub', email: 'fashion.hub@mail.com', products: 95, status: 'Pending' },
                    { id: '3', name: 'Gadget Galaxy', email: 'gadget.galaxy@mail.com', products: 80, status: 'Active' },
                    { id: '4', name: 'Trendy Styles', email: 'trendy.styles@email.com', products: 75, status: 'Active' },
                    { id: '5', name: 'Home Essentials', email: 'home.essentials@mail.com', products: 60, status: 'Active' },
                    { id: '6', name: 'EasyElectro', email: 'easyelectro@email.com', products: 45, status: 'Suspended' },
                    { id: '7', name: 'Urban Apparel', email: 'urban.apparel@email.com', products: 40, status: 'Active' },
                    { id: '8', name: 'FreshMart', email: 'freshmart@email.com', products: 33, status: 'Active' },
                    { id: '9', name: 'EcoLife Store', email: 'ecolife.store@email.com', products: 28, status: 'Active' },
                    { id: '10', name: 'Jewel Boutique', email: 'jewel.boutique@email.com', products: 25, status: 'Suspended' },
                ];
                setSellers(mockSellers);
            } catch (error) {
                console.error("Failed to fetch sellers", error);
            } finally {
                setLoading(false);
            }
        };

        loadSellers();
        interval = setInterval(loadSellers, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: Seller['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Suspended': return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    const filteredSellers = sellers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredSellers.length / sellersPerPage);
    const indexOfLastSeller = currentPage * sellersPerPage;
    const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
    const currentSellers = filteredSellers.slice(indexOfFirstSeller, indexOfLastSeller);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <nav className="text-sm text-gray-500">
                            <Link to="/admin" className="hover:text-[#2874F0]">Admin Dashboard</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-700 font-semibold">Sellers</span>
                        </nav>
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

                        <button className="bg-[#F9C74F] text-gray-800 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#f0b52e] transition-all flex items-center gap-2 shadow-sm">
                            + Add Seller
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Seller Management Panel</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and oversee all sellers on FlipZokart.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-md relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search sellers..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874F0]/20 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874F0]/20 text-sm font-medium bg-white"
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Suspended">Suspended</option>
                        </select>

                        <button className="bg-[#F9C74F] text-gray-800 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#f0b52e] transition-all shadow-sm">
                            Filter
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F5F7FA] border-b border-gray-200">
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Seller Name</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Email</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Products</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">Status</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentSellers.map((seller, idx) => (
                                        <tr key={seller.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2874F0] to-[#5a9bff] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                        {seller.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-gray-800 text-sm">{seller.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{seller.email}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{seller.products}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(seller.status)}`}>
                                                    {seller.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative inline-block group">
                                                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                                        <Eye size={16} /> View
                                                        <ChevronDown size={14} />
                                                    </button>

                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden hidden group-hover:block z-50">
                                                        <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                            <Ban size={14} /> Suspend
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {indexOfFirstSeller + 1} to {Math.min(indexOfLastSeller, filteredSellers.length)} of {filteredSellers.length} sellers
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(8, totalPages) }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${currentPage === page
                                            ? 'bg-[#2874F0] text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
