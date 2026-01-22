import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Search, Filter,
  Clock, CheckCircle, Truck, XCircle, CreditCard, Banknote,
  ExternalLink, Eye, ChevronDown, Bell, User, LogOut, ShoppingBag, Trash2
} from 'lucide-react';
import { useApp } from '../store/Context';
import { Order } from '../types';
import { AdminSidebar } from '../components/AdminSidebar';

import { fetchAllOrders, deleteOrder } from '../services/api';

import { useSocket } from '../hooks/useSocket';

export const AdminOrders: React.FC = () => {
  const { updateOrderStatus, user, logout } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'All'>('All');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Real-time Order State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Actions
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Socket Connection
  const token = localStorage.getItem('token');
  const socket = useSocket(token);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     REAL-TIME ORDERS LOGIC
     Mode: Socket + Polling Fallback
     Interval: 10000ms
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const loadOrders = async () => {
      try {
        const { data } = await fetchAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders(); // Initial load
    interval = setInterval(loadOrders, 10000); // Poll every 10s as fallback

    // Socket Listener
    if (socket) {
      socket.on('notification', (data: any) => {
        // Refresh orders on new order or status change
        if (data.type === 'adminNewOrder' || data.type === 'orderStatusUpdate') {
          console.log('⚡ Live Update: New Order/Status Change Detected');
          loadOrders();
        }
      });
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket]); // Re-run if socket connects/reconnects

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        await deleteOrder(id);
        setOrders(prev => prev.filter(o => o.id !== id));
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete order");
      }
    }
  };

  const handlePreview = (order: Order) => {
    setSelectedOrder(order);
    setIsPreviewOpen(true);
  };

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

  const filteredOrders = orders.filter(o => {
    const displayId = o.id.length > 10 ? o.id.slice(-6) : o.id;

    const matchesSearch = displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Live (5s)</span>
            </div>

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
                        <span className="font-mono text-xs font-bold text-[#2874F0]">#{order.id.slice(-6)}</span>
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
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdownId === order.id) {
                                setOpenDropdownId(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDropdownPosition({
                                  top: rect.bottom + window.scrollY + 8,
                                  left: rect.left + window.scrollX
                                });
                                setOpenDropdownId(order.id);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)} border border-current/20`}
                          >
                            {getStatusIcon(order.status)} {order.status} <ChevronDown size={10} className={`transform transition-transform ${openDropdownId === order.id ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Portal Status Dropdown */}
                          {openDropdownId === order.id && createPortal(
                            <div
                              className="fixed z-[9999] bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden min-w-[150px] animate-in fade-in zoom-in-95 duration-200"
                              style={{ top: dropdownPosition.top - window.scrollY, left: dropdownPosition.left - window.scrollX }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'] as Order['status'][]).map(s => (
                                <button
                                  key={s}
                                  onClick={() => {
                                    updateOrderStatus(order.id, s);
                                    setOpenDropdownId(null);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors flex items-center gap-2 ${order.status === s ? 'text-[#2874F0] bg-blue-50' : 'text-gray-500'}`}
                                >
                                  {order.status === s && <CheckCircle size={10} />}
                                  {s}
                                </button>
                              ))}
                            </div>,
                            document.body
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreview(order)}
                            className="p-2 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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

      {/* Preview Modal */}
      {isPreviewOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order #{selectedOrder.id.slice(-6)}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Product List */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Items ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><ShoppingBag size={20} /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} × <span className="font-bold text-gray-700">₹{item.price.toLocaleString()}</span></p>
                      </div>
                      <div className="ml-auto font-bold text-gray-800 text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                {/* Shipping */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping Details</h3>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                    <p className="font-semibold mb-1">{selectedOrder.userName}</p>
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-600">
                      {typeof selectedOrder.address === 'string'
                        ? selectedOrder.address
                        : `${selectedOrder.address?.fullName || ''}, ${selectedOrder.address?.street}, ${selectedOrder.address?.city} - ${selectedOrder.address?.zipCode}`}
                    </p>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Info</h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method</span>
                      <span className="font-bold text-gray-800">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-bold ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedOrder.paymentStatus || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="font-bold text-gray-800">Total Amount</span>
                      <span className="font-bold text-[#2874F0] text-lg">₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
