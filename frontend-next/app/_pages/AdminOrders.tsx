"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Clock, CheckCircle, Truck, XCircle, Banknote,
  ExternalLink, Eye, ChevronDown, Bell, LogOut, ShoppingBag, Trash2, FileText,
  AlertCircle, CloudLightning, MapPin, Package, Calendar, User, RefreshCw
} from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { Order, Address } from '@/app/types'; // Import Address type for strict checking
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { fetchAllOrders, deleteOrder, updateOrderStatus } from '@/app/services/api';
import { useSocket } from '@/app/hooks/useSocket';
import { useToast } from '@/app/components/toast';

// --- DATA TYPES & HELPERS ---

// Helper to safely parse address which might be a JSON string or an Object or a simple String
const parseAddress = (addr: string | object | undefined): Address | null => {
  if (!addr) return null;
  if (typeof addr === 'string') {
    try {
      // Try parsing as JSON first
      if (addr.trim().startsWith('{')) {
        return JSON.parse(addr) as Address;
      }
      // If simple string, return a dummy Address object wrapper
      return {
        id: 'legacy',
        fullName: 'N/A',
        phone: 'N/A',
        street: addr,
        city: '',
        state: '',
        pincode: '',
        country: '',
        type: 'Home'
      };
    } catch (e) {
      // Fallback for non-JSON string
      return {
        id: 'legacy',
        fullName: 'N/A',
        phone: 'N/A',
        street: addr,
        city: '',
        state: '',
        pincode: '',
        country: '',
        type: 'Home'
      };
    }
  }
  return addr as Address;
};


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
  // Mapping logic
  let activeIndex = steps.indexOf(currentStatus);
  if (currentStatus === 'Ready to Ship') activeIndex = 1;
  if (currentStatus === 'Out for Delivery') activeIndex = 2;

  const isCancelled = currentStatus === 'Cancelled';

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-8 relative">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />

      {/* Active Line */}
      {!isCancelled && (
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 transition-all duration-500 ease-out bg-green-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />
      )}
      {isCancelled && (
        <div className="absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 bg-red-200 w-full" />
      )}

      {steps.map((step, index) => {
        const isCompleted = !isCancelled && index <= activeIndex;
        const isCurrent = !isCancelled && index === activeIndex;

        return (
          <div key={step} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white
                ${isCompleted ? 'border-green-500 text-green-500 scale-110' : 'border-gray-200 text-gray-300'}
                ${isCurrent ? 'ring-4 ring-green-100' : ''}
                ${isCancelled ? 'border-red-500 text-red-500' : ''}
              `}
            >
              {isCancelled ? <XCircle size={16} className="text-red-500" /> :
                isCompleted ? <CheckCircle size={16} className="text-green-500" /> :
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
              }
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-gray-800' : 'text-gray-400'} ${isCancelled ? 'text-red-400' : ''}`}>
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

  // Fetch Logic
  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await fetchAllOrders(); // Ensure this returns array directly or inside data key
      // Handle different response structures for robustness
      const orderList = Array.isArray(data) ? data : (data.orders || data.data || []);

      setOrders(orderList);

      // Update selected order if open (Real-time Sync)
      // We use a REF check or just basic ID check
      if (selectedOrder) {
        const updated = orderList.find((o: Order) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      addToast('error', 'Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Safety Polling every 15s in case socket fails
    const interval = setInterval(() => loadOrders(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const handleNotification = (data: any) => {
      // Listen for ANY admin order event
      if (['adminNewOrder', 'orderStatusUpdate', 'paymentUpdate'].includes(data.type)) {
        console.log("Socket Event Received:", data);
        loadOrders(true); // Silent reload
        if (data.type === 'adminNewOrder') addToast('info', 'New Order Received!');
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', handleNotification);

    // Initial state check
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', handleNotification);
    };
  }, [socket, selectedOrder]); // React to selectedOrder specifically to ensure we sync it

  // Global Click Listener to close popups
  useEffect(() => {
    const handleClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Handler for Positioned Dropdown
  const handleDropdownClick = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeDropdownId === orderId) {
      setActiveDropdownId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate position: Just below the button
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
      setActiveDropdownId(orderId);
    }
  };


  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const oldOrders = [...orders];

    // Optimistic Update
    const optimisticUpdatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o);
    setOrders(optimisticUpdatedOrders);

    // Also update selected order if it's open
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
    }

    setActiveDropdownId(null);

    try {
      await updateOrderStatus(id, newStatus);
      addToast('success', `Status updated to ${newStatus}`);
      // No need to reload, socket will trigger it, but for safety:
      // loadOrders(true); 
    } catch (error) {
      console.error("Update failed", error);
      // Revert
      setOrders(oldOrders);
      if (selectedOrder && selectedOrder.id === id) {
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
      const t = searchTerm.toLowerCase();
      const matchesSearch = o.id.toLowerCase().includes(t) ||
        o.userName.toLowerCase().includes(t) ||
        (o.email && o.email.toLowerCase().includes(t));

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

  // Safe Address Accessor
  const currentOrderAddress = selectedOrder ? parseAddress(selectedOrder.address) : null;

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
              placeholder="Search Order ID, Name, Email..."
              className="w-full outline-none text-sm font-medium text-gray-700 bg-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Manual Refresh Button */}
            <button onClick={() => loadOrders(false)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Refresh Orders">
              <RefreshCw size={18} />
            </button>

            {/* Connection Indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 transition-colors duration-500
                 ${isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isConnected ? 'Real-time On' : 'Connecting...'}
            </div>

            <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 font-display">Order Management</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
            {['orders', 'refunds', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-bold text-sm capitalize transition-all relative
                            ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
                        `}
              >
                {tab === 'orders' ? 'Active Orders' : tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              {loading && orders.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                  <RefreshCw className="animate-spin mb-2" size={24} />
                  <p>Loading orders...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {finalOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            #{order.id.slice(-6)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{order.userName}</p>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          {/* Dropdown Trigger */}
                          <button
                            onClick={(e) => handleDropdownClick(e, order.id)}
                            className="hover:scale-105 transition-transform focus:outline-none"
                          >
                            <StatusBadge status={order.status} />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); openDetails(order); }}
                              className="p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 shadow-sm rounded-lg hover:border-blue-300 transition-all hover:shadow-md"
                              title="View Details"
                            >
                              <Eye size={16} strokeWidth={2} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                              className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 shadow-sm rounded-lg hover:border-red-300 transition-all hover:shadow-md"
                              title="Delete Order"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && finalOrders.length === 0 && (
                <div className="p-12 text-center text-gray-400 font-medium flex flex-col items-center">
                  <ShoppingBag size={48} className="text-gray-200 mb-4" />
                  <p>No orders found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Dropdown (FIXED POSITION) */}
        {activeDropdownId && (
          <div
            className="fixed bg-white rounded-xl shadow-xl border border-gray-100 z-[9999] w-52 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left ring-1 ring-black/5"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
              Update Status
            </div>
            {['Pending', 'Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(activeDropdownId, status)}
                className="w-full text-left px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-blue-500"
              >
                {status === 'Ready to Ship' ? <CheckCircle size={14} /> :
                  status === 'Cancelled' ? <XCircle size={14} /> :
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                {status}
              </button>
            ))}
          </div>
        )}

        {/* --- DETAILS MODAL --- */}
        {isDetailsOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 duration-300">

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order #{selectedOrder.id.slice(-6)}</h2>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" /> {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Optional print button space */}
                  <button onClick={() => handleDelete(selectedOrder.id)} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-2">
                    <Trash2 size={14} /> Delete
                  </button>
                  <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-white">

                {/* Status Stepper - Only if not cancelled/refunded */}
                {!['Cancelled', 'Refunded'].includes(selectedOrder.status) && (
                  <div className="mb-10 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <StatusStepper currentStatus={selectedOrder.status} />

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">Update Order Status</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {['Processing', 'Ready to Ship', 'Shipped', 'Delivered'].map(step => (
                          <button
                            key={step}
                            onClick={() => handleStatusUpdate(selectedOrder.id, step)}
                            disabled={selectedOrder.status === step}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm
                                                ${selectedOrder.status === step
                                ? 'bg-blue-600 text-white border-blue-600 opacity-50 cursor-not-allowed contrast-more:opacity-100'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-md hover:-translate-y-0.5'
                              }`}
                          >
                            Mark as {step}
                          </button>
                        ))}
                        <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all hover:shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'Cancelled' && (
                  <div className="mb-8 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center justify-center gap-3 shadow-inner">
                    <AlertCircle size={24} />
                    <span className="font-bold text-base">This order has been cancelled.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Column: Items */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-blue-600" /> Ordered Items
                      </h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="flex gap-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 relative">
                              {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Eye size={24} /></div>
                              )}
                            </div>
                            <div className="flex-1 py-1">
                              <p className="font-bold text-base text-gray-900 line-clamp-2 leading-tight">{item.name}</p>

                              {/* Variant Badges */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                {item.color && (
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wide border border-gray-200">
                                    Color: {item.color}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wide border border-gray-200">
                                    Size: {item.size}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right py-1">
                              <p className="font-bold text-base text-gray-900">₹{item.price.toLocaleString()}</p>
                              <p className="text-xs text-gray-500 mt-1 font-medium">Qty: {item.quantity}</p>
                              <p className="font-bold text-sm text-blue-600 mt-3">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary Block */}
                      <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium">₹{selectedOrder.total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="font-medium text-green-600">Free</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span className="font-medium">Included</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Paid</span>
                          <span className="text-xl font-bold text-blue-600">₹{selectedOrder.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="space-y-6">

                    {/* Customer Card */}
                    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                        <User size={14} /> Customer
                      </h3>
                      <div className="flex items-center gap-4 mb-5 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                          {selectedOrder.userName?.[0]}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900 leading-tight">{selectedOrder.userName}</p>
                          <p className="text-xs text-gray-500 font-medium">{selectedOrder.email}</p>
                        </div>
                      </div>
                      <button className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center justify-center gap-2 shadow-sm relative z-10">
                        <ExternalLink size={14} className="text-gray-400" /> View Customer Profile
                      </button>
                    </div>

                    {/* Shipping Address Card */}
                    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin size={14} /> Shipping Destination
                      </h3>
                      {currentOrderAddress && typeof currentOrderAddress !== 'string' ? (
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-bold text-gray-900 mb-2">{currentOrderAddress.fullName}</p>
                          <p className="leading-relaxed text-gray-600">{currentOrderAddress.street}</p>
                          <p className="leading-relaxed text-gray-600">
                            {currentOrderAddress.city}{currentOrderAddress.state ? `, ${currentOrderAddress.state}` : ''}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono font-bold text-gray-600">
                              {currentOrderAddress.pincode || currentOrderAddress.zipCode}
                            </span>
                            {currentOrderAddress.country && (
                              <span className="bg-blue-50 px-2 py-1 rounded text-xs font-bold text-blue-600">
                                {currentOrderAddress.country}
                              </span>
                            )}
                          </div>
                          {currentOrderAddress.phone && (
                            <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">Phone: {currentOrderAddress.phone}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Address details unavailable.</p>
                      )}
                    </div>

                    {/* Payment Card */}
                    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Banknote size={14} /> Payment Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <span className="text-xs text-gray-500 font-bold uppercase">Method</span>
                          <span className="text-sm font-bold text-gray-900">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <span className="text-xs text-gray-500 font-bold uppercase">Status</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
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
