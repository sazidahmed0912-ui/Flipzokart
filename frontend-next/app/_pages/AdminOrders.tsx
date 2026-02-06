"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Search, Filter,
  Clock, CheckCircle, Truck, XCircle, CreditCard, Banknote,
  ExternalLink, Eye, ChevronDown, Bell, User, LogOut, ShoppingBag, Trash2, FileText
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { Order } from '@/app/types';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { fetchAllOrders, deleteOrder, updateOrderStatus } from '@/app/services/api';
import { useSocket } from '@/app/hooks/useSocket';
import { useToast } from '@/app/components/toast';

export const AdminOrders: React.FC = () => {
  const { user, logout } = useApp();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // orders | refunds | history
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Status Dropdown State - Simple ID tracking
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Socket
  const socket = useSocket(typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  // Initial Load
  const loadOrders = async () => {
    try {
      const { data } = await fetchAllOrders();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    loadOrders();

    // Polling Backup (10s)
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      if (data.type === 'adminNewOrder' || data.type === 'orderStatusUpdate') {
        // Immediate refresh on signal
        loadOrders();
      }
    };

    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  // Close dropdowns on global click
  useEffect(() => {
    const closeDropdown = () => setActiveDropdownId(null);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);


  const handleStatusUpdate = async (id: string, newStatus: string) => {
    // Optimistic Update
    const oldOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
    setActiveDropdownId(null); // Close immediately

    try {
      await updateOrderStatus(id, newStatus);
      addToast('success', `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Update failed", error);
      setOrders(oldOrders); // Revert
      addToast('error', 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      addToast('success', 'Order deleted');
    } catch (err) {
      addToast('error', 'Failed to delete');
    }
  };

  // Status Helpers
  const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
    'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    'Processing': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    'Ready to Ship': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: PackageIcon },
    'Shipped': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    'Out for Delivery': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Truck },
    'Delivered': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  };

  // Helper Icon Component
  function PackageIcon({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4L7.5 4.21"></path><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>; }


  // Filter Logic
  const getTabOrders = () => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.userName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === 'refunds') return ['Cancelled', 'Refunded'].includes(o.status);
      if (activeTab === 'history') return o.status === 'Delivered';
      // Default "Active Orders"
      return !['Delivered', 'Cancelled', 'Refunded'].includes(o.status);
    });
  };

  const finalOrders = getTabOrders();


  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />
      <div className="flex-1 max-h-screen overflow-y-auto">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4 w-1/3">
            <Search size={18} className="text-gray-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Order ID, Customer..."
              className="w-full outline-none text-sm font-medium text-gray-700 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-xs">{user?.name?.[0]}</div>
          </div>
        </header>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
            {['orders', 'refunds', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-bold text-sm capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'orders' ? 'Active Orders' : tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
            {/* Overflow-visible is CRITICAL for dropdowns to pop out if using relative positioning, 
                but standard table overflow-x-auto clips it. 
                Fix: We will use a fixed 'actions' column or reliable relative dropdown. 
            */}
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {finalOrders.map(order => {
                    const conf = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">#{order.id.slice(-6)}</td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{order.userName}</p>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle
                                setActiveDropdownId(activeDropdownId === order.id ? null : order.id);
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${conf.color} transition-all active:scale-95`}
                            >
                              <conf.icon size={14} />
                              <span className="uppercase">{order.status}</span>
                              <ChevronDown size={12} className="opacity-50" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeDropdownId === order.id && (
                              <div
                                className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {['Pending', 'Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(order.id, status)}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-gray-50 flex items-center gap-2 ${order.status === status ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                                  >
                                    {order.status === status && <CheckCircle size={12} className="text-blue-500" />}
                                    {status}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedOrder(order); setIsPreviewOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 shadow-sm rounded-lg hover:border-blue-200 transition-colors"><Eye size={16} /></button>
                            <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 shadow-sm rounded-lg hover:border-red-200 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {finalOrders.length === 0 && <div className="p-12 text-center text-gray-400 font-medium">No orders found in this category.</div>}
            </div>
          </div>
        </div>

        {/* Modal Preview */}
        {isPreviewOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Order Details #{selectedOrder.id.slice(-6)}</h2>
                <button onClick={() => setIsPreviewOpen(false)}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.price}</p>
                        </div>
                        <div className="ml-auto font-bold text-sm">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping</h3>
                    <p className="text-sm font-medium">{selectedOrder.userName}</p>
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                      {typeof selectedOrder.address === 'string' ? selectedOrder.address : `${selectedOrder.address?.fullName}\n${selectedOrder.address?.street}\n${selectedOrder.address?.city} - ${selectedOrder.address?.zipCode}`}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Method</span>
                      <span className="font-bold">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-bold ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>{selectedOrder.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
