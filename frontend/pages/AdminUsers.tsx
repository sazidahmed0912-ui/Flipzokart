import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MoreVertical,
  UserX, ShieldCheck, Mail, Phone,
  ChevronDown, MapPin, Calendar, Clock,
  Bell, User, LogOut, CheckCircle, XCircle,
  Eye, Home
} from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { useApp } from '../store/Context';
import { fetchAllUsers, updateUserStatus, sendUserNotice } from '../services/adminService';
import { useToast } from '../components/toast';

// Removed MOCK_USERS - Now using Real Data

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // Real users state
  const [loading, setLoading] = useState(true);

  // Modal States
  const [addressModalUser, setAddressModalUser] = useState<any | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'suspend' | 'ban' | 'notice', user: any } | null>(null);
  const [suspensionDays, setSuspensionDays] = useState(3);
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
        const { data } = await fetchAllUsers();
        // Only update if data changed (simple length check or deep compare if needed)
        // For now, simple set to keep UI fresh
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers(); // Initial fetch
    const interval = setInterval(loadUsers, 5000); // 5s poll
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (type: 'suspend' | 'ban') => {
    if (!actionModal?.user) return;
    try {
      const status = type === 'suspend' ? 'Suspended' : 'Banned';
      await updateUserStatus(actionModal.user.id || actionModal.user._id, status, type === 'suspend' ? suspensionDays : undefined, type === 'ban' ? banReason : undefined);
      addToast('success', `User ${status} successfully`);
      setActionModal(null);
      // Optimistic Update
      setUsers(users.map(u => u._id === actionModal.user._id ? { ...u, status } : u));
    } catch (error) {
      addToast('error', 'Failed to update status');
    }
  };

  const handleSendNotice = async () => {
    if (!actionModal?.user || !noticeMessage) return;
    try {
      await sendUserNotice(actionModal.user.id || actionModal.user._id, noticeMessage);
      addToast('success', 'Notice sent successfully');
      setActionModal(null);
      setNoticeMessage('');
    } catch (error) {
      addToast('error', 'Failed to send notice');
    }
  };

  const handleReactivate = async (user: any) => {
    if (window.confirm(`Reactivate ${user.name}?`)) {
      try {
        await updateUserStatus(user.id || user._id, 'Active');
        addToast('success', 'User reactivated');
        setUsers(users.map(u => u._id === user._id ? { ...u, status: 'Active' } : u));
      } catch (err) { addToast('error', 'Failed to reactivate'); }
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
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#2874F0]/20">
            <Search size={18} className="text-[#2874F0]" />
            <input
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
            <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Filter size={16} /> Filter List
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
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
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">No users found.</td>
                    </tr>
                  ) : filteredUsers.map((user, idx) => (
                    <tr key={user._id || user.id} className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-200`}>
                          <ShieldCheck size={12} />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" /> {user.location || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm">{user.orders}</td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm">₹{(user.totalSpent || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setAddressModalUser(user)}
                          className="p-2 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-all inline-block"
                          title="View Address"
                        >
                          <Home size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-all inline-block">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* View Address Modal */}
        {addressModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddressModalUser(null)}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in-up">
              <button
                onClick={() => setAddressModalUser(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-[#2874F0]" size={20} />
                User Address
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-bold text-gray-900 mb-1">{addressModalUser.name}</p>
                  <p className="text-sm text-gray-500 mb-2">{addressModalUser.email}</p>
                  <hr className="border-gray-200 my-2" />
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {addressModalUser.fullAddress && addressModalUser.fullAddress !== 'N/A'
                      ? addressModalUser.fullAddress
                      : "No address found for this user (No orders yet)."}
                  </p>
                </div>

                <button
                  onClick={() => setAddressModalUser(null)}
                  className="w-full bg-[#2874F0] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
