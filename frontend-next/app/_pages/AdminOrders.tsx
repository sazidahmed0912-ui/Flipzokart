"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Clock, CheckCircle, Truck, XCircle, Banknote,
  ExternalLink, Eye, ChevronDown, Bell, LogOut, ShoppingBag, Trash2, FileText,
  AlertCircle, CloudLightning, MapPin, Package, Calendar, User
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { Order } from '@/app/types';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { fetchAllOrders, deleteOrder, updateOrderStatus } from '@/app/services/api';
import { useSocket } from '@/app/hooks/useSocket';
import { useToast } from '@/app/components/toast';

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
    'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    'Processing': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
    'Ready to Ship': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CheckCircle },
    'Shipped': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
    'Out for Delivery': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Truck },
    'Delivered': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    'Refunded': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Banknote },
  };

  const conf = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
  const Icon = conf.icon;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${conf.color} uppercase tracking-wide`}>
      <Icon size={12} strokeWidth={2.5} />
      {status}
    </span>
  );
};

const StatusStepper = ({ currentStatus }: { currentStatus: string }) => {
  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  // Determine active index. "Cancelled" is a special fail state.
  let activeIndex = steps.indexOf(currentStatus);
  if (currentStatus === 'Ready to Ship' || currentStatus === 'Out for Delivery') {
    // Map intermediate statuses to the closest main step for visualization
    if (currentStatus === 'Ready to Ship') activeIndex = 1;
    if (currentStatus === 'Out for Delivery') activeIndex = 2;
  }
  const isCancelled = currentStatus === 'Cancelled';

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-8 relative">
      {/* Connector Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />
      <div
        className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 transition-all duration-500 ease-out ${isCancelled ? 'bg-red-200' : 'bg-green-500'}`}
        style={{ width: isCancelled ? '100%' : `${(activeIndex / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <div key={step} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white
                ${isCompleted && !isCancelled ? 'border-green-500 text-green-500 scale-110' : 'border-gray-200 text-gray-300'}
                ${isCurrent && !isCancelled ? 'ring-4 ring-green-100' : ''}
                ${isCancelled ? 'border-red-500 text-red-500' : ''}
              `}
            >
              {isCancelled ? <XCircle size={16} fill="currentColor" className="text-white" /> :
                isCompleted ? <CheckCircle size={16} fill="currentColor" className="text-white" /> :
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
              }
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};


export const AdminOrders: React.FC = () => {
  const { user } = useApp();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // orders | refunds | history

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Dropdown Logic (Fixed Positioning)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Socket
  const socket = useSocket(typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const [isConnected, setIsConnected] = useState(false);

  // Initial Load
  const loadOrders = async () => {
    try {
      const { data } = await fetchAllOrders();
      setOrders(data);
      setLoading(false);

      // Update selected order if open (for real-time sync inside modal)
      if (selectedOrder) {
        const updated = data.find((o: Order) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Polling backup
    return () => clearInterval(interval);
  }, []);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const handleNotification = (data: any) => {
      if (['adminNewOrder', 'orderStatusUpdate'].includes(data.type)) {
        loadOrders();
        if (data.type === 'adminNewOrder') addToast('info', 'New Order Received!');
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', handleNotification);

    // Initial state
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', handleNotification);
    };
  }, [socket, selectedOrder]); // React to changes

  // Global Click Listener to close dropdowns
  useEffect(() => {
    const handleClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Handler for Positioned Dropdown
  const handleDropdownClick = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (activeDropdownId === orderId) {
      setActiveDropdownId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      setDropdownPos({
        top: rect.bottom + scrollTop + 5,
        left: rect.left + scrollLeft
      });
      setActiveDropdownId(orderId);
    }
  };


  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const oldOrders = [...orders];

    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
    // Also update selected order if it's the one being modified
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
    }
    setActiveDropdownId(null);

    try {
      await updateOrderStatus(id, newStatus);
      addToast('success', `Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Update failed", error);
      setOrders(oldOrders);
      if (selectedOrder && selectedOrder.id === id) {
        // Revert modal state
        const original = oldOrders.find(o => o.id === id);
        if (original) setSelectedOrder(original);
      }
      addToast('error', 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      if (selectedOrder?.id === id) setIsDetailsOpen(false);
      addToast('success', 'Order deleted');
    } catch (err) {
      addToast('error', 'Failed to delete');
    }
  };

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

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

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
            {/* Read Connection Indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isConnected ? 'Real-time On' : 'Connecting...'}
            </div>

            <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-xs">{user?.name?.[0] || 'A'}</div>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                  {finalOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => openDetails(order)}>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{order.userName}</p>
                        <p className="text-xs text-gray-400">{order.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {/* Dropdown Trigger */}
                        <button
                          onClick={(e) => handleDropdownClick(e, order.id)}
                          className="hover:scale-105 transition-transform"
                        >
                          <StatusBadge status={order.status} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openDetails(order); }} className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 shadow-sm rounded-lg hover:border-blue-200 transition-colors"><Eye size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 shadow-sm rounded-lg hover:border-red-200 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {finalOrders.length === 0 && <div className="p-12 text-center text-gray-400 font-medium">No orders found.</div>}
            </div>
          </div>
        </div>

        {/* Floating Dropdown (FIXED POSITION to escape clipping) */}
        {activeDropdownId && (
          <div
            className="fixed bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-left"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {['Pending', 'Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(activeDropdownId, status)}
                className="w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-gray-50 flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                {status === 'Ready to Ship' ? <CheckCircle size={14} /> : <Clock size={14} />} {status}
              </button>
            ))}
          </div>
        )}

        {/* --- DETAILS MODAL --- */}
        {isDetailsOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id.slice(-6)}</h2>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                    <Calendar size={12} /> {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleDelete(selectedOrder.id)} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">
                    Delete Order
                  </button>
                  <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <XCircle className="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8">

                {/* Status Stepper */}
                {!['Cancelled', 'Refunded'].includes(selectedOrder.status) && (
                  <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <StatusStepper currentStatus={selectedOrder.status} />

                    {/* Quick Actions */}
                    <div className="flex justify-center gap-2 mt-6">
                      {['Processing', 'Ready to Ship', 'Shipped', 'Delivered'].map(step => (
                        <button
                          key={step}
                          onClick={() => handleStatusUpdate(selectedOrder.id, step)}
                          disabled={selectedOrder.status === step}
                          className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all
                                              ${selectedOrder.status === step
                              ? 'bg-blue-600 text-white border-blue-600 opacity-50 cursor-not-allowed'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
                            }`}
                        >
                          Mark as {step}
                        </button>
                      ))}
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')}
                        className="px-4 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'Cancelled' && (
                  <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span className="font-bold text-sm">This order has been cancelled.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* Left: Items (2/3 width) */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ShoppingBag size={14} /> Order Items
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 relative">
                              {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Eye size={20} /></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm text-gray-900 line-clamp-2">{item.name}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.color && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                    Color: {item.color}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                    Size: {item.size}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-gray-900">₹{item.price.toLocaleString()}</p>
                              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                              <p className="font-bold text-xs text-blue-600 mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-gray-900">₹{selectedOrder.total.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Customer & Shipping (1/3 width) */}
                  <div className="space-y-6">

                    {/* Customer */}
                    <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User size={14} /> Customer
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {selectedOrder.userName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{selectedOrder.userName}</p>
                          <p className="text-xs text-gray-500">{selectedOrder.email}</p>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center justify-center gap-2">
                        <ExternalLink size={12} /> View Profile
                      </button>
                    </div>

                    {/* Shipping Address */}
                    <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin size={14} /> Shipping Address
                      </h3>
                      {typeof selectedOrder.address === 'string' ? (
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedOrder.address}</p>
                      ) : (
                        <div className="text-sm text-gray-700 leading-relaxed space-y-1">
                          <p className="font-bold">{selectedOrder.address?.fullName}</p>
                          <p>{selectedOrder.address?.street}</p>
                          <p>{selectedOrder.address?.city}, {selectedOrder.address?.state}</p>
                          <p className="font-mono text-xs bg-gray-200 inline-block px-1 rounded">{selectedOrder.address?.zipCode}</p>
                          <p className="text-gray-500 text-xs mt-2">{selectedOrder.address?.country}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Banknote size={14} /> Payment
                      </h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Method</span>
                        <span className="text-sm font-bold text-gray-800">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Status</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
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
