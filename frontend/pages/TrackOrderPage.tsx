import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, CheckCircle2, Circle, FileText, HelpCircle,
  MapPin, Phone, User, CreditCard, ChevronDown, Download,
  XCircle, Truck, Package, Clock, ShieldCheck, AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { useApp } from '../store/Context';
import { Order } from '../types';
import { fetchOrderById } from '../services/api';
import { useSocket } from '../hooks/useSocket';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();
  const socket = useSocket(localStorage.getItem('token'));
  const queryId = searchParams.get('id') || '';
  const initialOrder = location.state?.order;

  const [orderId, setOrderId] = useState(queryId || initialOrder?._id || initialOrder?.id || '');
  const [foundOrder, setFoundOrder] = useState<any | null>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState('');

  useEffect(() => {
    if (queryId && !initialOrder) {
      handleTrack(queryId);
    } else if (initialOrder) {
      setOrderId(initialOrder._id || initialOrder.id);
    }
  }, [queryId, initialOrder]);

  const handleTrack = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchOrderById(id);
      setFoundOrder(data);
    } catch (err: any) {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!foundOrder) return;

    // Real-time listener
    if (socket) {
      socket.on('notification', (data: any) => {
        if (data.type === 'orderStatusUpdate' && (data.orderId === foundOrder._id || data.orderId === foundOrder.id)) {
          console.log("⚡ Live update for this order");
          handleTrack(foundOrder._id || foundOrder.id);
        }
      });
    }

    const interval = setInterval(async () => {
      try {
        const { data } = await fetchOrderById(foundOrder._id || foundOrder.id);
        setFoundOrder(data);
      } catch (e) { }
    }, 10000); // Relax polling
    return () => {
      clearInterval(interval);
      if (socket) socket.off('notification');
    };
  }, [foundOrder?._id, socket]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!foundOrder && !loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Track Order</h2>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
          />
          <button
            onClick={() => handleTrack(orderId)}
            className="w-full bg-[#F9C74F] hover:bg-yellow-400 text-black font-bold py-3 rounded-lg"
          >
            Track
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const statuses = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStatusIndex = statuses.indexOf(foundOrder.status) === -1 ? 0 : statuses.indexOf(foundOrder.status);
  const isCancelled = foundOrder.status === 'Cancelled';

  return (
    <div className="bg-[#F1F3F6] min-h-screen py-8 font-sans text-gray-800">
      <div className="max-w-[1200px] mx-auto px-4">

        {/* Top Breadcrumb / Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 cursor-pointer" onClick={() => navigate('/orders')}>
          <span className="hover:text-[#2874F0]">My Orders</span>
          <span>{'>'}</span>
          <span className="text-gray-700 font-medium">{foundOrder._id || foundOrder.id}</span>
        </div>

        {/* Top Header: ID & PLACED ON */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Order ID: {foundOrder._id || foundOrder.id}</h1>
          </div>
          <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
            Placed on {new Date(foundOrder.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>


        <div className="bg-white rounded-[4px] shadow-sm p-6 md:p-8 space-y-8 relative">
          {/* Download Invoice Top Right */}
          <button className="absolute top-6 right-6 flex items-center gap-2 text-[#2874F0] border border-gray-200 px-3 py-1.5 rounded-[2px] text-xs font-bold hover:shadow-sm transition-shadow">
            <Download size={14} /> Download Invoice
          </button>

          {/* 1. Header & Stepper */}
          <div className="flex flex-col gap-8 border-b border-gray-100 pb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Stepper */}
              {/* Stepper */}
              {!isCancelled && (
                <div className="relative flex w-full max-w-4xl items-start">
                  {/* Connector Line Wrapper */}
                  <div className="absolute top-[12px] left-[12.5%] right-[12.5%] h-1 -z-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-full"></div>
                    <div
                      className="absolute top-0 left-0 h-full bg-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  {statuses.map((status, idx) => {
                    const completed = idx <= currentStatusIndex;
                    return (
                      <div key={status} className="flex-1 flex flex-col items-center gap-2 relative z-10 bg-white/0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${completed ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-transparent'}`}>
                          <CheckCircle2 size={16} className={`${completed ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <span className={`text-sm font-semibold text-center ${completed ? 'text-gray-900' : 'text-gray-400'}`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Track Order Button with Dropdown */}
              <div className="relative group self-end lg:self-auto ml-auto lg:ml-0">
                <button className="bg-[#F9C74F] hover:bg-yellow-400 text-gray-900 font-bold py-2.5 px-6 rounded-[4px] text-sm shadow-sm transition-colors flex items-center gap-2">
                  Track Order
                </button>
                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[8px] shadow-xl z-20 hidden group-hover:block overflow-hidden">
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-3 text-sm text-[#2874F0] font-semibold hover:bg-gray-50 flex items-center gap-3">
                      <HelpCircle size={16} /> Need Help?
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <FileText size={16} /> Get Invoice
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <XCircle size={16} /> Cancel & Return
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <ShieldCheck size={16} /> Need Assistance
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <MapPin size={16} /> Change Address
                    </button>
                  </div>
                  {/* Pointy Tip */}
                  <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                </div>
              </div>
            </div>

            {isCancelled && <div className="p-4 bg-red-50 text-red-600 font-bold border border-red-200 rounded-[2px] text-center">This order has been cancelled</div>}

            {/* Green Arrival Banner */}
            {!isCancelled && foundOrder.status !== 'Delivered' && (
              <div className="bg-[#EBFFEF] px-6 py-4 rounded-[4px] flex flex-col md:flex-row justify-between items-center gap-2 border border-green-100 mt-2">
                <div className="text-base text-gray-800">
                  Arriving by <span className="font-bold text-gray-900">Tomorrow, 9 PM</span>
                  <span className="text-xs text-gray-500 ml-2">(Estimated)</span>
                </div>
                {foundOrder.total && <div className="font-bold text-lg text-gray-900">₹{foundOrder.total.toLocaleString()}</div>}
              </div>
            )}
            {foundOrder.status === 'Delivered' && (
              <div className="bg-[#EBFFEF] px-6 py-4 rounded-[4px] flex items-center gap-2 border border-green-100 mt-2">
                <CheckCircle2 size={20} className="text-green-600" />
                <span className="font-bold text-gray-900">Delivered on {new Date(foundOrder.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* 2. Product Information & Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-lg font-bold text-gray-800">Product Information</h3>
              <span className="text-[#2874F0] text-sm font-semibold cursor-pointer hover:underline flex items-center gap-1">
                <HelpCircle size={16} /> Need Help?
              </span>
            </div>

            {/* Product Card Styled */}
            {(foundOrder.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 border border-gray-200 rounded-[4px] bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-32 h-32 flex-shrink-0 p-2 border border-gray-100 rounded-[4px] flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg hover:text-[#2874F0] cursor-pointer line-clamp-2 md:line-clamp-1">{item.name}</h4>
                    <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Seller:</span>
                        <span className="font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Alpha Mobiles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">₹{(item.price || 0).toLocaleString()}</span>
                        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">2 Offers Applied</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 px-3 py-1.5 rounded-[2px] bg-gray-50">
                      Qty: {item.quantity}
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 text-[#2874F0] font-semibold text-sm border border-gray-200 hover:border-[#2874F0] px-4 py-1.5 rounded-[2px] transition-colors shadow-sm">
                        <HelpCircle size={15} /> Need help?
                      </button>

                      {!isCancelled && foundOrder.status === 'Pending' && (
                        <button className="flex items-center gap-2 text-red-600 font-semibold text-sm border border-gray-200 hover:border-red-600 hover:bg-red-50 px-4 py-1.5 rounded-[2px] transition-colors shadow-sm">
                          <XCircle size={15} /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Info Footer Grid (Address | Payment | Progress) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-100 items-start">

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase text-opacity-80 flex items-center justify-between h-5">
                Delivery Address
              </h3>
              <div className="text-sm text-gray-800 leading-relaxed border border-gray-200 rounded-[4px] p-4 bg-gray-50/50">
                <div className="font-bold text-base mb-2">{foundOrder.user?.name || user?.name || 'Mark Sebastian'}</div>
                <p className="text-justify mb-3 text-gray-600">
                  {foundOrder.shippingAddress || 'undefined, Barthal Doloigaon, Moirabari, Morigaon, New Delhi, Maharashtra - 782126'}
                </p>
                <div className="font-medium flex flex-col gap-1">
                  <span className="text-gray-500 text-xs uppercase font-bold">Phone Number</span>
                  <span className="text-gray-900 font-semibold tracking-wide">{foundOrder.user?.phone || '+91 99965 12345'}</span>
                </div>
              </div>
              <button className="w-full bg-[#F9C74F] text-black py-2.5 rounded-[2px] font-bold text-sm hover:shadow-md transition-shadow">
                Update Address
              </button>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase text-opacity-80 flex items-center justify-between h-5">
                Payment
              </h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Total Amount</span>
                  <span className="font-bold text-gray-900">₹{foundOrder.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Payment Mode</span>
                  <span className="font-medium text-gray-900">{foundOrder.paymentMethod || 'Credit/Debit Card'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                  <CreditCard size={14} /> <span>XXXX 7643</span>
                </div>
              </div>
              {/* Track Button (Blue style) */}
              <button className="w-full bg-[#2874F0] text-white py-2.5 rounded-[2px] font-bold text-sm hover:shadow-md transition-shadow mt-2">
                Track Order
              </button>
            </div>

            {/* Shipping Progress */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase text-opacity-80 flex items-center justify-between h-5 whitespace-nowrap">
                Shipping Progress
                <span className="text-[#2874F0] normal-case text-xs cursor-pointer hover:underline">More v</span>
              </h3>
              <div className="relative border-l-2 border-gray-100 ml-1.5 space-y-6">
                {/* Events */}
                {['Out for Delivery', 'Shipped', 'Ordered'].map((s, i) => {
                  const isDone = statuses.indexOf(s) <= currentStatusIndex;
                  // In a real app, map actual events from foundOrder.history or similar
                  return (
                    <div key={s} className="relative pl-6">
                      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${isDone ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <p className="text-sm font-bold text-gray-900">{s} {s === 'Out for Delivery' ? '/ Arriving by Tomorrow' : ''}</p>
                      <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                    </div>
                  )
                })}
              </div>

              <button className="w-full bg-[#F9C74F] text-black py-2.5 rounded-[2px] font-bold text-sm hover:shadow-md transition-shadow">
                Need Help?
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
