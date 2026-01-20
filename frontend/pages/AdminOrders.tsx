import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Search, Filter,
  Clock, CheckCircle, Truck, XCircle, CreditCard, Banknote,
  ExternalLink, Eye, ChevronDown, Bell, User, LogOut, ShoppingBag
} from 'lucide-react';
import { useApp } from '../store/Context';
import { Order } from '../types';
import { AdminSidebar } from '../components/AdminSidebar';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, user, logout } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'All'>('All');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Paid': return 'bg-purple-100 text-purple-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Paid': return <CreditCard size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

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
              placeholder="Search orders..."
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Track and manage customer orders.</p>
            </div>
            <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <ExternalLink size={16} /> Export CSV
            </button>
          </div>

          {/* Status Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'All Orders', count: orders.length, status: 'All', color: '#2874F0', bg: 'bg-blue-50' },
              { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, status: 'Pending', color: '#f97316', bg: 'bg-orange-50' },
              { label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length, status: 'Shipped', color: '#3b82f6', bg: 'bg-blue-50' },
              { label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, status: 'Delivered', color: '#22c55e', bg: 'bg-green-50' },
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => setStatusFilter(s.status as any)}
                className={`p-4 rounded-xl border transition-all text-left group ${statusFilter === s.status
                    ? `border-[${s.color}] ring-1 ring-[${s.color}]/50 bg-white shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                style={{ borderColor: statusFilter === s.status ? s.color : '' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-gray-800 group-hover:text-[#2874F0] transition-colors">{s.count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <ShoppingBag size={16} style={{ color: s.color }} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F7FA] border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, idx) => (
                    <tr key={order.id} className={`group transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-[#2874F0]">#{order.id.split('-')[1]}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] font-bold">
                            {order.userName.charAt(0)}
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">{order.userName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm">₹{order.total.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div className="relative group/status inline-block">
                          <button className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)} border border-current/20`}>
                            {getStatusIcon(order.status)} {order.status}
                          </button>

                          {/* Status Dropdown */}
                          <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden hidden group-hover/status:block z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                            {(['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'] as Order['status'][]).map(s => (
                              <button
                                key={s}
                                onClick={() => updateOrderStatus(order.id, s)}
                                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors flex items-center gap-2 ${order.status === s ? 'text-[#2874F0] bg-blue-50' : 'text-gray-500'}`}
                              >
                                {order.status === s && <CheckCircle size={10} />}
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 font-medium">No orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
