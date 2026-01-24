import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import {
  Search, CheckCircle2, Circle, FileText, HelpCircle,
  MapPin, Phone, User, CreditCard, ChevronDown, Download,
  XCircle, Truck, Package, Clock, ShieldCheck, AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { useApp } from '../store/Context';
import { Order } from '../types'; // Ensure types are correct
import { fetchOrderById } from '../services/api';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useApp(); // Fix: Get user from context
  const queryId = searchParams.get('id') || '';
  // Allow passing order via state from OrdersPage to avoid re-fetch delay
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

  // Poll for updates if viewing an order
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

  // Search Mode if no order found/provided
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

  // --- RENDER ORDER DETAILS ---

  // Status Logic
  const statuses = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered']; // Simplified for UI
  const currentStatusIndex = statuses.indexOf(foundOrder.status) === -1 ? 0 : statuses.indexOf(foundOrder.status);
  const isCancelled = foundOrder.status === 'Cancelled';

  return (
    <div className="bg-[#F1F3F6] min-h-screen py-8 font-sans text-gray-800">
      <div className="max-w-[1200px] mx-auto px-4">

        {/* 1. Top Header: Breadcrumb-like Info */}
        <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
          <div className="font-medium text-gray-700">Order ID: {foundOrder._id || foundOrder.id}</div>
          <div>Placed on {new Date(foundOrder.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>

        <div className="bg-white rounded-[2px] shadow-sm p-6 md:p-8 space-y-8">

          {/* 2. Order Details Title & Status Bar */}
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>

            {!isCancelled && (
              <div className="relative flex items-center justify-between max-w-3xl py-4 mx-4">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
                <div
                  className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
                ></div>

                {statuses.map((status, idx) => {
                  const completed = idx <= currentStatusIndex;
                  return (
                    <div key={status} className="flex flex-col items-center gap-2 bg-white px-2">
                      {completed ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <CheckCircle2 size={14} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        </div>
                      )}
                      <span className={`text-xs font-semibold ${completed ? 'text-gray-900' : 'text-gray-400'}`}>{status}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {isCancelled && <div className="p-3 bg-red-50 text-red-600 font-bold border border-red-200 rounded-[2px]">This order has been cancelled.</div>}

            {/* Arriving Estimate Bar */}
            <div className="bg-[#F0F5FF] px-4 py-3 rounded-[2px] flex flex-col md:flex-row justify-between items-center gap-2">
              <div className="text-sm">
                <span className="text-gray-500">Arriving by </span>
                <span className="font-bold text-gray-800">
                  {foundOrder.status === 'Delivered' ? 'Delivered' : 'Tomorrow, 9 PM'}
                </span>
              </div>
              <div className="font-bold text-lg">₹{foundOrder.total?.toLocaleString()}</div>
            </div>
          </div>


          {/* 3. Product Information */}
          <div className="border border-gray-100 rounded-[2px] p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-2">
              <h3 className="font-bold text-gray-800">Product Information</h3>
              <button className="text-[#2874F0] text-sm font-semibold flex items-center gap-1 hover:underline">
                <HelpCircle size={14} /> Need Help?
              </button>
            </div>

            {/* Items Loop */}
            {(foundOrder.items || []).map((item: any, idx: number) => {
              const variants = item.selectedVariants || {};
              const itemColor = variants.Color || '';
              const itemSize = variants.Size || variants.Storage || '';

              return (
                <div key={idx} className="flex flex-col md:flex-row gap-6">
                  <div className="w-24 h-24 flex-shrink-0 border border-gray-200 p-1 rounded-[2px]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                        <div className="text-xs text-gray-500 mt-1">
                          {itemColor && <>Color: {itemColor} &bull; </>}
                          {itemSize && <>Size: {itemSize}</>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Seller: <span className="text-[#2874F0] font-medium">Flipzokart Retails</span></div>
                        <div className="mt-2 font-bold text-lg">₹{(item.price || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500 ml-1">Qty: {item.quantity}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-2 justify-end mt-2">
              {!isCancelled && foundOrder.status === 'Pending' && (
                <button className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-[2px]">
                  Cancel Order
                </button>
              )}
              <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><MoreHorizontal size={20} /></button>
            </div>
          </div>


          {/* 4. Three Column Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

            {/* Delivery Address */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm">Delivery Address</h3>
              <div className="text-sm text-gray-600">
                <div className="font-bold text-gray-900 mb-1">{foundOrder.user?.name || user?.name || 'User'}</div>
                <p>{foundOrder.shippingAddress || 'No Address Provided'}</p>
                <div className="mt-2 font-medium flex items-center gap-1.5">
                  <Phone size={12} /> +91 {foundOrder.user?.phone || '99999 99999'}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm">Payment</h3>
              <div className="bg-white border border-gray-100 rounded-[2px] p-0">
                <button className="flex items-center gap-1.5 text-[#2874F0] text-xs font-bold mb-3 hover:underline">
                  <Download size={12} /> Download Invoice
                </button>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-bold text-gray-900">₹{foundOrder.total?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-medium text-gray-900">{foundOrder.paymentMethod || 'Credit/Debit Card'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-gray-400">
                    <CreditCard size={14} /> XXXX 7643
                  </div>
                </div>

                <button
                  onClick={() => handleTrack(foundOrder._id)}
                  className="mt-4 w-full bg-[#2874F0] text-white py-2 rounded-[2px] font-bold text-sm hover:bg-blue-600 shadow-sm transition-colors"
                >
                  Track Order
                </button>
              </div>
            </div>

            {/* Shipping Progress Log (Vertical) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">Shipping Progress</h3>
                <button className="text-[#2874F0] text-xs font-medium hover:underline">More <ChevronDown size={10} className="inline" /></button>
              </div>

              <div className="relative border-l-2 border-gray-100 ml-1.5 space-y-6 pt-1 pb-1">
                {foundOrder.status === 'Delivered' && (
                  <div className="relative pl-6">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-white"></div>
                    <p className="text-sm font-bold text-gray-900">Delivered</p>
                    <p className="text-xs text-gray-500">{new Date(foundOrder.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}

                {['Out for Delivery', 'Shipped', 'Pending'].includes(foundOrder.status) && (
                  <div className="relative pl-6">
                    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${foundOrder.status === 'Out for Delivery' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <p className="text-sm font-bold text-gray-900">Out for Delivery / <span className="font-normal text-gray-500">Arriving by Tomorrow</span></p>
                    <p className="text-xs text-gray-500">24 Apr, 2:42 PM</p>
                  </div>
                )}

                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-white"></div>
                  <p className="text-sm font-bold text-gray-900">Shipped</p>
                  <p className="text-xs text-gray-500">23 Apr, 5:00 PM</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-white"></div>
                  <p className="text-sm font-bold text-gray-900">Ordered</p>
                  <p className="text-xs text-gray-500">{new Date(foundOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <button className="bg-[#F9C74F] text-black w-full py-2 rounded-[2px] font-bold text-sm shadow-sm hover:bg-yellow-400 transition-colors">
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
