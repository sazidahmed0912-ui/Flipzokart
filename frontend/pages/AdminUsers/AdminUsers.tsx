import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Filter, Shield, Ban, CheckCircle,
    MoreVertical, ChevronDown, Mail, AlertTriangle, User,
    Loader2
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { SmoothReveal } from '../../components/SmoothReveal';
import CircularGlassSpinner from '../../components/CircularGlassSpinner';
import { fetchAllUsers, updateUserStatus, sendUserNotice } from '../../services/adminService';
import { useToast } from '../../components/toast';
import { useApp } from '../../store/Context';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string; // 'active', 'Suspended', 'Banned'
    createdAt: string;
    orders?: number;
    totalSpent?: number;
}

export const AdminUsers: React.FC = () => {
    const { user: currentUser } = useApp();
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const { addToast } = useToast();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const { data } = await fetchAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
            addToast('error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let results = users;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            results = results.filter(u =>
                u.name.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower)
            );
        }

        if (statusFilter !== 'All') {
            results = results.filter(u => u.status === statusFilter);
        }

        if (roleFilter !== 'All') {
            results = results.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(results);
    }, [searchTerm, statusFilter, roleFilter, users]);

    const handleStatusChange = async (userId: string, newStatus: string) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setActionLoading(userId);
        try {
            await updateUserStatus(userId, newStatus);
            addToast('success', `User status updated to ${newStatus}`);
            setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            addToast('error', 'Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendNotice = async (userId: string) => {
        const message = prompt("Enter notice message:");
        if (!message) return;

        try {
            await sendUserNotice(userId, message, 'adminNotice');
            addToast('success', 'Notice sent successfully');
        } catch (error) {
            addToast('error', 'Failed to send notice');
        }
    };

    if (loading) return <CircularGlassSpinner />;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
                        <Search size={18} className="text-[#2874F0]" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                    {currentUser?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{currentUser?.name?.split(' ')[0] || 'Admin'}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    <SmoothReveal direction="down">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Users</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage customers and permissions</p>
                            </div>
                        </div>
                    </SmoothReveal>

                    {/* Filters */}
                    <SmoothReveal direction="up" delay={100}>
                        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <Filter size={16} className="text-gray-500" />
                                <span className="text-xs font-bold text-gray-700">Filter By:</span>
                            </div>

                            <select
                                className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Banned">Banned</option>
                            </select>

                            <select
                                className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="All">All Roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>
                    </SmoothReveal>

                    {/* Users Table */}
                    <SmoothReveal direction="up" delay={200}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Orders</th>
                                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</th>
                                            <th className="py-4 px-6 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{u.name}</p>
                                                            <p className="text-xs text-gray-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                                ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                                            u.role === 'seller' ? 'bg-orange-50 text-orange-600' :
                                                                'bg-blue-50 text-blue-600'}
                            `}>
                                                        {u.role === 'admin' && <Shield size={12} />}
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {u.status === 'Banned' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-red-50 text-red-600">
                                                            <Ban size={12} /> Banned
                                                        </span>
                                                    ) : u.status === 'Suspended' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-yellow-50 text-yellow-600">
                                                            <AlertTriangle size={12} /> Suspended
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-green-50 text-green-600">
                                                            <CheckCircle size={12} /> Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold text-gray-600">
                                                    {u.orders || 0}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold text-gray-800">
                                                    ₹{(u.totalSpent || 0).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {actionLoading === u._id ? (
                                                        <Loader2 size={16} className="animate-spin text-gray-400 ml-auto" />
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleSendNotice(u._id)}
                                                                title="Send Notice"
                                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                <Mail size={16} />
                                                            </button>

                                                            {u.role !== 'admin' && ( // Prevent banning admins
                                                                <>
                                                                    {u.status === 'active' ? (
                                                                        <button
                                                                            onClick={() => handleStatusChange(u._id, 'Banned')}
                                                                            title="Ban User"
                                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        >
                                                                            <Ban size={16} />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleStatusChange(u._id, 'active')}
                                                                            title="Reactivate User"
                                                                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center">
                                                    <User size={48} className="mx-auto text-gray-200 mb-3" />
                                                    <p className="text-gray-400 font-medium">No users found.</p>
                                                </td>
                                            </tr>
                                        )}
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
