"use client";
import React, { useState, useEffect } from 'react';
import {
    Search, Filter, MoreVertical,
    UserX, ShieldCheck, Mail, Phone,
    ChevronDown, MapPin, Calendar, Clock,
    Bell, User, LogOut, CheckCircle, XCircle,
    Eye, Home, AlertTriangle
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { useApp } from '@/app/store/Context';
import { fetchAllUsers, updateUserStatus, sendUserNotice } from '@/app/services/adminService';
import { useToast } from '@/app/components/toast';

export const AdminUsers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]); // Real users state
    const [loading, setLoading] = useState(true);

    // Modal States
    const [addressModalUser, setAddressModalUser] = useState<any | null>(null);
    const [actionModal, setActionModal] = useState<{ type: 'suspend' | 'ban' | 'notice' | 'unban' | 'warning', user: any } | null>(null);

    // Advanced Suspension State
    const [suspendDuration, setSuspendDuration] = useState(3);
    const [suspendUnit, setSuspendUnit] = useState<'minutes' | 'hours' | 'days' | 'years'>('days');

    const [banReason, setBanReason] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');

    // Dropdown States
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const { addToast } = useToast();
    const { user: adminUser, logout } = useApp();

    // 🔄 Real-time 5s Polling
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await fetchAllUsers();
                const data = response.data;
                // Robust data extraction
                const usersList = Array.isArray(data)
                    ? data
                    : (data.users || data.data || []);
                setUsers(usersList);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
        const interval = setInterval(loadUsers, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (type: 'suspend' | 'ban' | 'unban') => {
        if (!actionModal?.user) return;
        try {
            let status = 'Active';
            let suspensionEnd = undefined;

            if (type === 'suspend') {
                status = 'Suspended';
                const now = new Date();
                if (suspendUnit === 'minutes') now.setMinutes(now.getMinutes() + suspendDuration);
                else if (suspendUnit === 'hours') now.setHours(now.getHours() + suspendDuration);
                else if (suspendUnit === 'days') now.setDate(now.getDate() + suspendDuration);
                else if (suspendUnit === 'years') now.setFullYear(now.getFullYear() + suspendDuration);
                suspensionEnd = now.toISOString();
            } else if (type === 'ban') {
                status = 'Banned';
            } else if (type === 'unban') {
                status = 'Active';
            }

            await updateUserStatus(
                actionModal.user.id || actionModal.user._id,
                status,
                undefined,
                type === 'ban' ? banReason : undefined,
                suspensionEnd
            );

            addToast('success', `User ${status} successfully`);
            setActionModal(null);

            // Optimistic Update
            setUsers(users.map(u => u._id === actionModal.user._id ? { ...u, status, suspensionEnd } : u));
        } catch (error) {
            addToast('error', 'Failed to update status');
        }
    };

    const handleSendNotice = async () => {
        if (!actionModal?.user || !noticeMessage) return;
        const isWarning = actionModal.type === 'warning';

        try {
            await sendUserNotice(
                actionModal.user.id || actionModal.user._id,
                noticeMessage,
                isWarning ? 'warning' : 'adminNotice'
            );

            addToast('success', isWarning ? 'Warning sent successfully' : 'Notice sent successfully');
            setActionModal(null);
            setNoticeMessage('');
        } catch (error) {
            addToast('error', 'Failed to send message');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#2874F0]/20">
                        <Search size={18} className="text-[#2874F0]" />
                        <input
                            id="user-search"
                            type="text"
                            placeholder="Search users..."
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
                                    {adminUser?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{adminUser?.name?.split(' ')[0] || 'Admin'}</span>
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

                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">Manage user accounts and activity.</p>
                        </div>
                        <button onClick={() => document.getElementById('user-search')?.focus()} className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                            <Filter size={16} /> Filter List
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm pb-40 relative">
                        {/* Use overflow-visible on parent wrapper if possible, or handle dropdown with fixed portal. 
                 Because table needs scroll, we keep overflow-x-auto. 
                 We will use 'fixed' position for dropdown logic if current relative fails, 
                 but standard relative usually works if z-index is high enough and container allows visible overflow vertically. 
                 Here we depend on the ample pb-40 space. */}
                        <div className="overflow-visible">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F5F7FA] border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Joined Date</th>
                                        <th className="px-6 py-4">Orders</th>
                                        <th className="px-6 py-4">Total Spent</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
                                    ) : filteredUsers.map((user, idx) => (
                                        <tr key={user._id || user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center font-bold text-sm border border-blue-100">
                                                        {user.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                                            <Mail size={12} /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${uStatusColor(user.status)}`}>
                                                    <StatusIcon status={user.status} />
                                                    {user.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{user.location || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-800 text-sm font-bold">{user.orders}</td>
                                            <td className="px-6 py-4 text-gray-800 text-sm font-bold">₹{(user.totalSpent || 0).toLocaleString('en-IN')}</td>

                                            <td className="px-6 py-4 text-right space-x-2 relative">
                                                <button onClick={() => setAddressModalUser(user)} className="p-2 text-gray-400 hover:text-blue-600"><Home size={16} /></button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownId(openDropdownId === user._id ? null : user._id);
                                                }} className="p-2 text-gray-400 hover:text-blue-600"><MoreVertical size={16} /></button>

                                                {openDropdownId === user._id && (
                                                    <div className="absolute right-10 top-8 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 text-left animate-fade-in-up">
                                                        {/* Backdrop */}
                                                        <div className="fixed inset-0 z-[-1]" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}></div>

                                                        <button onClick={() => { setActionModal({ type: 'unban', user }); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 flex items-center gap-2">
                                                            <CheckCircle size={14} /> Unban / Reactivate
                                                        </button>
                                                        <hr className="border-gray-100 my-1" />
                                                        {/* WARNING BUTTON (Inserted above Suspend) */}
                                                        <button onClick={() => { setActionModal({ type: 'warning', user }); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-yellow-600 hover:bg-yellow-50 flex items-center gap-2">
                                                            <AlertTriangle size={14} /> Warning
                                                        </button>
                                                        <button onClick={() => { setActionModal({ type: 'suspend', user }); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                                                            <Clock size={14} /> Suspend
                                                        </button>
                                                        <button onClick={() => { setActionModal({ type: 'ban', user }); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                            <UserX size={14} /> Ban User
                                                        </button>
                                                        <hr className="border-gray-100 my-1" />
                                                        <button onClick={() => { setActionModal({ type: 'notice', user }); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                                                            <Bell size={14} /> Send Notice
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ... Address Modal ... */}
                {addressModalUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddressModalUser(null)}></div>
                        <div className="bg-white rounded-xl p-6 relative z-10 w-full max-w-md">
                            <h2 className="text-lg font-bold mb-4">Address</h2>
                            <p>{addressModalUser.fullAddress || "No Address"}</p>
                            <button onClick={() => setAddressModalUser(null)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">Close</button>
                        </div>
                    </div>
                )}

                {/* Action Modal */}
                {actionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActionModal(null)}></div>
                        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in-up">
                            <button onClick={() => setActionModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>

                            <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                                {actionModal.type === 'unban' ? 'Result' : `${actionModal.type} User`}
                            </h2>
                            {actionModal.type === 'unban' && <h2 className="text-lg font-bold text-green-600 mb-4">Reactivate User</h2>}

                            {actionModal.type === 'suspend' && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">Duration</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={suspendDuration}
                                            onChange={(e) => setSuspendDuration(Number(e.target.value))}
                                            className="flex-1 p-2 border rounded-lg bg-gray-50"
                                            min="1"
                                        />
                                        <select
                                            value={suspendUnit}
                                            onChange={(e) => setSuspendUnit(e.target.value as any)}
                                            className="p-2 border rounded-lg bg-gray-50 font-bold"
                                        >
                                            <option value="minutes">Minutes</option>
                                            <option value="hours">Hours</option>
                                            <option value="days">Days</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                    <button onClick={() => handleStatusUpdate('suspend')} className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700">Confirm Suspension</button>
                                </div>
                            )}

                            {actionModal.type === 'unban' && (
                                <div className="space-y-4">
                                    <p>Are you sure you want to unban and reactivate <b>{actionModal.user.name}</b>?</p>
                                    <button onClick={() => handleStatusUpdate('unban')} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">Confirm Unban</button>
                                </div>
                            )}

                            {actionModal.type === 'ban' && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">Reason</label>
                                    <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 min-h-[80px]" placeholder="Reason for ban..." />
                                    <button onClick={() => handleStatusUpdate('ban')} className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700">Confirm Ban</button>
                                </div>
                            )}

                            {/* Notice OR Warning */}
                            {(actionModal.type === 'notice' || actionModal.type === 'warning') && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        {actionModal.type === 'warning' ? 'Warning Message' : 'Notice Message'}
                                    </label>
                                    <textarea
                                        value={noticeMessage}
                                        onChange={(e) => setNoticeMessage(e.target.value)}
                                        className={`w-full p-2 border rounded-lg h-32 bg-gray-50 ${actionModal.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}`}
                                        placeholder={actionModal.type === 'warning' ? "Enter warning details..." : "Write your notice here..."}
                                    />
                                    <button
                                        onClick={handleSendNotice}
                                        className={`w-full py-2 rounded-lg font-bold text-white ${actionModal.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {actionModal.type === 'warning' ? 'Send Warning' : 'Send Notice'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helpers
const uStatusColor = (status: string) => {
    if (status === 'Active' || !status) return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'Suspended') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
};

const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Active' || !status) return <ShieldCheck size={12} />;
    if (status === 'Suspended') return <Clock size={12} />;
    return <UserX size={12} />;
};
