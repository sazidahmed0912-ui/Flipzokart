"use client";
import React, { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle, Copy, Package, Truck, MapPin,
  Calendar, CreditCard, ChevronRight, Home,
  Download, ShoppingBag, Loader2, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
// removed canvas-confetti to avoid dependency issues
import { fetchOrderById } from '@/app/services/api';
import { useToast } from '@/app/components/toast';
import { getSafeAddress } from '@/app/utils/addressHelper';
import { resolveProductImage } from '@/app/utils/imageHelper';

interface OrderDetails {
  id: string; // Mongo ID
  orderId: string; // The specific #123456 ID if available separately
  createdAt: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discount: number;
  deliveryCharges: number;
  status: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    selectedVariants?: any;
    countInStock?: number;
  }>;
  address: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    country: string;
  };
}

const OrderSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { addToast } = useToast();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }



    const loadOrder = async () => {
      try {
        const { data } = await fetchOrderById(orderId);

        // Normalize Address
        const rawAddress = data.address || data.shippingAddress || {};
        const safeAddress = getSafeAddress(rawAddress);

        setOrder({
          ...data,
          address: safeAddress
        });

        // Confetti effect can be added here if package is installed
      } catch (err: any) {
        console.error("Order load failed", err);
        setError("Failed to load order details. Please check 'My Orders'.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', 'Copied to clipboard!');
  };

  const getStepStatus = (step: string, currentStatus: string) => {
    const steps = ['Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

    // Normalize status
    const current = currentStatus === 'Paid' ? 'Processing' : currentStatus;

    const currentIndex = steps.indexOf(current);
    const stepIndex = steps.indexOf(step);

    if (current === 'Cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#2874F0]" />
          <p className="text-gray-500 font-medium">Fetching your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error || "Order not found"}</h2>
          <p className="text-gray-500 mb-6">We couldn't retrieve the details for this order.</p>
          <button
            onClick={() => router.push('/orders')}
            className="w-full bg-[#2874F0] text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  // Calculate estimated delivery (Current + 5 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 1. Success Message - COMPACT MOBILE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2 sm:py-8"
        >
          <div className="w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-6 shadow-xl shadow-green-200 animate-bounce-slow ring-4 ring-green-50">
            <CheckCircle size={24} className="sm:w-12 sm:h-12 text-white fill-current" />
          </div>
          <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Order Placed!</h1>
          <p className="text-gray-500 text-xs sm:text-lg">Order confirmed. Confirmation email sent.</p>
        </motion.div>

        {/* 2. Order Info & Tracker Card - COMPACT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Top Bar: IDs & Context - SLIM */}
          <div className="p-3 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-row justify-between gap-2 sm:gap-4 items-center">
            <div className="space-y-0.5">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
              <div className="flex items-center gap-1 group cursor-pointer" onClick={() => copyToClipboard(order.id)}>
                <span className="font-mono font-bold text-gray-800 text-sm sm:text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                <Copy size={12} className="text-gray-400 group-hover:text-[#2874F0] transition-colors" />
              </div>
            </div>
            <div className="flex gap-3 text-right">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                <p className="font-semibold text-gray-700 text-xs sm:text-base">{new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total</p>
                <p className="font-bold text-gray-900 text-xs sm:text-base">₹{order.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Stepper Tracker - HORIZONTAL MOBILE */}
          <div className="p-4 sm:p-8">
            <div className="mb-4 sm:mb-6 flex justify-between items-center">
              <h3 className="text-sm sm:text-lg font-bold text-gray-800">Arriving <span className="text-green-600">{formattedDelivery}</span></h3>
            </div>

            <div className="relative mt-2">
              {/* Line */}
              <div className="hidden sm:block absolute top-[14px] sm:top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
              {/* Mobile Line (Thinner, positioned for smaller icons) */}
              <div className="block sm:hidden absolute top-[14px] left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />

              {/* Steps - Always Horizontal on Mobile now */}
              <div className="flex flex-row justify-between relative z-10">

                {[
                  { label: "Confirmed", icon: CheckCircle, step: "Pending" },
                  { label: "Processing", icon: Package, step: "Processing" },
                  { label: "Shipped", icon: Truck, step: "Shipped" },
                  { label: "Out for Delivery", icon: Truck, step: "Out for Delivery" },
                  { label: "Delivered", icon: Home, step: "Delivered" }
                ].map((s, idx) => {
                  const status = getStepStatus(s.step, order.status);
                  const isCompleted = status === 'completed' || s.step === 'Pending';
                  const isCurrent = s.step === order.status || (order.status === 'Paid' && s.step === 'Processing');

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 sm:gap-3 flex-1">
                      <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 sm:border-4 transition-all duration-300 bg-white ${isCompleted || isCurrent
                        ? 'border-green-500 text-green-600'
                        : 'border-gray-200 text-gray-300'
                        } ${isCurrent ? 'ring-2 ring-green-100 scale-110' : ''}`}>
                        <s.icon size={12} className="sm:w-[18px] sm:h-[18px]" fill={isCompleted ? "currentColor" : "none"} />
                      </div>
                      <div className="text-center w-full">
                        <p className={`font-medium text-[8px] sm:text-sm leading-tight ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-300'} ${isCurrent ? 'font-bold' : ''}`}>
                          <span className="block sm:inline">{s.label.split(' ')[0]}</span>
                          <span className="hidden sm:inline"> {s.label.split(' ').slice(1).join(' ')}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>

        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-6">

          {/* 3. Items & Address (Left Col) */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-4 flex items-center gap-2 text-sm sm:text-lg">
                <MapPin size={16} className="text-[#2874F0] sm:w-5 sm:h-5" /> Delivery Address
              </h3>
              <div className="pl-0 sm:pl-7 text-xs sm:text-sm">
                <p className="font-bold text-gray-800 mb-1">{order.address.fullName}</p>
                <p className="text-gray-500 leading-relaxed mb-1 sm:mb-2">
                  {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <p className="font-medium text-gray-700">Phone: <span className="text-gray-500">{order.address.phone}</span></p>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-2 sm:mb-4 flex items-center gap-2 text-sm sm:text-lg">
                <ShoppingBag size={16} className="text-[#2874F0] sm:w-5 sm:h-5" /> Items ({order.items.length})
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 sm:gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-[60px] h-[60px] sm:w-20 sm:h-20 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                      <img
                        src={resolveProductImage(item)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-2 leading-tight">{item.name}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Qty: {item.quantity}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">₹{item.price.toLocaleString()}</span>
                        {item.countInStock !== undefined && item.countInStock > 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">In Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* 4. Payment & Actions (Right Col) */}
          <div className="space-y-3 sm:space-y-6">

            {/* Price Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-lg">
                <CreditCard size={16} className="text-[#2874F0] sm:w-5 sm:h-5" /> Payment Summary
              </h3>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>Delivery</span>
                  <span>{order.deliveryCharges === 0 ? 'FREE' : `₹${order.deliveryCharges}`}</span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between font-bold text-base sm:text-lg text-gray-900">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400 text-right">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/track/${order.id}`)}
                  className="w-full bg-[#FF9800] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-shadow shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Truck size={16} /> Track Order
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-white border-2 border-[#2874F0] text-[#2874F0] py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    Shop More
                  </button>
                  <button
                    onClick={() => router.push(`/invoice/${order.id}`)}
                    className="w-full bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Download size={14} /> Invoice
                  </button>
                </div>
              </div>

            </motion.div>

            {/* Need Help? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#2874F0]/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-100"
            >
              <h4 className="font-bold text-gray-800 mb-1 text-sm">Need help?</h4>
              <button
                onClick={() => router.push('/contact')}
                className="text-xs sm:text-sm font-bold text-[#2874F0] hover:text-blue-700 flex items-center gap-1"
              >
                Contact Support <ChevronRight size={14} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
      );
};

      export default OrderSuccessPage;
