import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Eye, Edit2, Ban, CheckCircle, ChevronDown, Bell, User, LogOut, UserPlus, Trash2, XCircle
} from 'lucide-react';
import API from '../services/api';
import { createSeller } from '../services/adminService';
import { useApp } from '../store/Context';
import { AdminSidebar } from '../components/AdminSidebar';

interface Seller {
    id: string;
    name: string;
    email: string;
    products: number;
    status: 'Active' | 'Pending' | 'Suspended';
    avatar?: string;
    role?: string;
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

    // Toggle for Seller Requests
    const [showRequests, setShowRequests] = useState(false);

    // Actions State
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // New State

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchSellers = async () => {
        try {
            const { data } = await API.get('/api/admin/users');
            const usersList = data.users || data;

            const mappedSellers: Seller[] = usersList.map((u: any) => ({
                id: u._id,
                name: u.name,
                email: u.email,
                products: u.products?.length || 0,
                status: u.status || 'Active',
                avatar: u.avatar,
                role: u.role
            }));

            setSellers(mappedSellers);
        } catch (error) {
            console.error("Failed to fetch sellers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
        const interval = setInterval(fetchSellers, 5000); // 5s Polling
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: Seller['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Suspended': return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this seller? This action cannot be undone.")) {
            try {
                await API.delete(`/api/admin/users/${id}`);
                setSellers(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete seller");
            }
        }
    };

    const handleView = (seller: Seller) => {
        setSelectedSeller(seller);
        setIsViewModalOpen(true);
    }

    const filteredSellers = sellers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

        // Filter Logic:
        // If showRequests is TRUE, show only 'pending_seller' or 'Pending' status
        // If showRequests is FALSE, show 'seller' role or everyone else (for now showing all non-pending if flexible)
        // User asked for "Seller Requests" button to show requests.
        if (showRequests) {
            return matchesSearch && (s.role === 'pending_seller' || s.status === 'Pending');
        }

        // Default View: Show Active Sellers (role 'seller' or 'admin' or just everything except pending)
        // For demo, if role system isn't strict, we might show all. But let's approximate:
        // If backend roles are working: return s.role === 'seller';
        // If not: return matchesSearch && matchesStatus && s.role !== 'pending_seller';
        return matchesSearch && matchesStatus && s.role !== 'pending_seller';
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
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Seller Management Panel</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and oversee all sellers on Fzokart.</p>
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
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Suspended">Suspended</option>
                        </select>

                        {/* NEW: Seller Requests Button (Toggle) */}
                        <button
                            onClick={() => setShowRequests(!showRequests)}
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${showRequests ? 'bg-blue-600 text-white' : 'bg-[#F9C74F] text-gray-800 hover:bg-[#f0b52e]'}`}
                        >
                            <Bell size={16} /> {showRequests ? 'Show All Sellers' : 'Seller Requests'}
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#F9C74F] text-gray-800 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#f0b52e] transition-all flex items-center gap-2 shadow-sm"
                        >
                            <UserPlus size={16} /> Add Seller
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
                                    {currentSellers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-500">
                                                {showRequests ? "No pending seller requests." : "No sellers found."}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentSellers.map((seller, idx) => (
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
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdownId(openDropdownId === seller.id ? null : seller.id);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                                        >
                                                            Actions <ChevronDown size={14} />
                                                        </button>

                                                        {openDropdownId === seller.id && (
                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                                                <button
                                                                    onClick={() => handleView(seller)}
                                                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <Eye size={14} /> View Details
                                                                </button>

                                                                {showRequests ? (
                                                                    <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-green-600 hover:bg-green-50 flex items-center gap-2">
                                                                        <CheckCircle size={14} /> Approve Request
                                                                    </button>
                                                                ) : (
                                                                    <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                                        <Edit2 size={14} /> Edit Profile
                                                                    </button>
                                                                )}

                                                                <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                                                                    <Ban size={14} /> Suspend
                                                                </button>

                                                                <button
                                                                    onClick={() => handleDelete(seller.id)}
                                                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                                                                >
                                                                    <Trash2 size={14} /> Delete Seller
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {Math.min(indexOfFirstSeller + 1, filteredSellers.length)} to {Math.min(indexOfLastSeller, filteredSellers.length)} of {filteredSellers.length} sellers
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {/* Simple Page Numbers */}
                            <span className="text-sm font-bold text-gray-800 px-2">Page {currentPage} of {Math.max(1, totalPages)}</span>

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

            {/* View Modal */}
            {isViewModalOpen && selectedSeller && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Seller Details</h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <XCircle size={24} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-[#2874F0] flex items-center justify-center text-white text-3xl font-bold mb-4">
                                    {selectedSeller.name.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedSeller.name}</h3>
                                <p className="text-gray-500">{selectedSeller.email}</p>
                                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedSeller.status)}`}>
                                    {selectedSeller.status}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Seller ID</span>
                                    <span className="text-gray-900 font-mono text-xs">{selectedSeller.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Total Products</span>
                                    <span className="text-gray-900 font-bold">{selectedSeller.products}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Role</span>
                                    <span className="text-gray-900 font-bold capitalize">{selectedSeller.role || 'User'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">
                                Close
                            </button>
                            <button onClick={() => { setIsViewModalOpen(false); handleDelete(selectedSeller.id); }} className="px-6 py-2.5 bg-red-100 text-red-600 font-bold hover:bg-red-200 rounded-lg transition-colors">
                                Delete Seller
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Seller Modal */}
            {isAddModalOpen && (
                <AddSellerModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchSellers();
                    }}
                />
            )}
        </div>
    );
};

// Add Seller Modal Component
const AddSellerModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createSeller(formData);
            alert('Seller created successfully!');
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create seller');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Add New Seller</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <XCircle size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Store/Seller Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2874F0]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2874F0]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2874F0]"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-[#2874F0] text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Seller'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
