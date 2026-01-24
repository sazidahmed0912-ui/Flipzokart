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

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();
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
    const interval = setInterval(async () => {
      try {
        const { data } = await fetchOrderById(foundOrder._id || foundOrder.id);
        setFoundOrder(data);
      } catch (e) { }
    }, 5000);
    return () => clearInterval(interval);
  }, [foundOrder?._id]);

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
          <div className="text-sm font-medium text-gray-600">
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
            </div>

            {/* Stepper */}
            {!isCancelled && (
              <div className="relative flex items-center justify-between max-w-4xl mx-auto w-full px-4">
                {/* Connector Line */}
                <div className="absolute top-[18px] left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                <div
                  className="absolute top-[18px] left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                ></div>

                {statuses.map((status, idx) => {
                  const completed = idx <= currentStatusIndex;
                  return (
                    <div key={status} className="flex flex-col items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 ${completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-transparent'}`}>
                        <CheckCircle2 size={18} className={`${completed ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <span className={`text-xs font-semibold ${completed ? 'text-green-600' : 'text-gray-400'}`}>{status}</span>
                    </div>
                  );
                })}
              </div>
            )}

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

          {/* 2. Product Information */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-gray-800">Product Information</span>
              <span className="text-[#2874F0] text-xs font-bold cursor-pointer hover:underline">Need Help?</span>
            </div>

            {(foundOrder.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-24 h-24 flex-shrink-0 border border-gray-200 p-2 rounded-[2px] bg-white">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg hover:text-[#2874F0] cursor-pointer line-clamp-1">{item.name}</h4>
                      <div className="text-xs text-gray-500 flex gap-3 mt-1">
                        {item.selectedVariants?.Color && <span>Color: {item.selectedVariants.Color}</span>}
                        {item.selectedVariants?.Size && <span>Size: {item.selectedVariants.Size}</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Seller: <span className="text-gray-900 font-medium">Alpha Mobiles</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹{(item.price || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex gap-4 pt-2">
                    <button className="text-[#2874F0] text-sm font-semibold hover:underline flex items-center gap-1">
                      <HelpCircle size={14} /> Need help?
                    </button>
                    {!isCancelled && foundOrder.status === 'Pending' && (
                      <button className="text-gray-600 text-sm font-semibold hover:text-red-600 hover:underline">Cancel Order</button>
                    )}
                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Info Footer Grid (Address | Payment | Progress) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-100">

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase text-opacity-80">Delivery Address</h3>
              <div className="text-sm text-gray-800 leading-relaxed">
                <div className="font-bold text-base mb-1">{foundOrder.user?.name || user?.name || 'Mark Sebastian'}</div>
                <p>{foundOrder.shippingAddress || '(2011) Venture Heights, JP Nagar, Bangalore, Karnataka - 560078'}</p>
                <div className="mt-2 font-medium">
                  <span className="text-gray-600">Phone: </span>
                  <span>{foundOrder.user?.phone || '+91 99965 12345'}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase text-opacity-80">Payment</h3>
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
              <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase text-opacity-80 flex justify-between">
                Shipping Progress
                <span className="text-[#2874F0] normal-case text-xs cursor-pointer hover:underline">More v</span>
              </h3>
              <div className="relative border-l-2 border-gray-100 ml-1.5 space-y-6 pt-1">
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
