import React, { useState } from 'react';
import {
  Search, Filter, MoreVertical,
  UserX, ShieldCheck, Mail, Phone,
  ChevronDown, MapPin, Calendar, Clock,
  Bell, User, LogOut, CheckCircle, XCircle
} from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';
import { useApp } from '../store/Context';

const MOCK_USERS = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul.s@gmail.com', status: 'Active', orders: 12, totalSpent: 45000, joined: '2024-01-15', location: 'Mumbai' },
  { id: '2', name: 'Priya Patel', email: 'priya.p@outlook.com', status: 'Active', orders: 8, totalSpent: 28000, joined: '2024-02-10', location: 'Delhi' },
  { id: '3', name: 'Anish Gupta', email: 'anish.g@gmail.com', status: 'Suspended', orders: 2, totalSpent: 5000, joined: '2024-03-05', location: 'Bangalore' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha.r@gmail.com', status: 'New', orders: 1, totalSpent: 1200, joined: '2024-05-12', location: 'Hyderabad' },
];

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useApp();

  const filteredUsers = MOCK_USERS.filter(u =>
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
                  {filteredUsers.map((user, idx) => (
                    <tr key={user.id} className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2874F0] flex items-center justify-center font-bold text-sm border border-blue-100">
                            {user.name.charAt(0)}
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                            user.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                          {user.status === 'Active' ? <ShieldCheck size={12} /> : user.status === 'Suspended' ? <UserX size={12} /> : <Clock size={12} />}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" /> {user.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" /> {new Date(user.joined).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm">{user.orders}</td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm">₹{user.totalSpent.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 font-medium">No users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
