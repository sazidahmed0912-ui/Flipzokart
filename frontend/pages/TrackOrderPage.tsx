
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Package, Truck, CheckCircle2, Clock,
  MapPin, ArrowRight, AlertCircle, ShoppingBag,
  Box, ShieldCheck, MapPinned
} from 'lucide-react';
import { useApp } from '../store/Context';
import { Order } from '../types';

import { fetchOrderById } from '../services/api';

export const TrackOrderPage: React.FC = () => {
  // const { orders } = useApp(); // Removed mock/context orders
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [orderId, setOrderId] = useState(queryId);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // Real-time tracking poll
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (foundOrder && !error) {
      interval = setInterval(async () => {
        try {
          const { data } = await fetchOrderById(foundOrder.id);
          setFoundOrder(data);
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 10000); // Poll status every 10s
    }

    return () => clearInterval(interval);
  }, [foundOrder, error]);


  useEffect(() => {
    if (queryId) {
      handleTrack(queryId);
    }
  }, [queryId]);

  const handleTrack = async (id: string) => {
    setError('');
    setIsSearching(true);
    setFoundOrder(null);

    try {
      const { data } = await fetchOrderById(id);
      setFoundOrder(data);
    } catch (err: any) {
      console.error("Track failed", err);
      setError(err.response?.data?.message || 'We couldn\'t find an order with that ID. Please check and try again.');
      setFoundOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Paid': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  const steps = [
    { label: 'Confirmed', desc: 'Order received', icon: Box },
    { label: 'Processing', desc: 'Quality check', icon: ShieldCheck },
    { label: 'Shipped', desc: 'Out for delivery', icon: Truck },
    { label: 'Delivered', desc: 'Package received', icon: CheckCircle2 },
  ];

  const currentStep = foundOrder ? getStatusStep(foundOrder.status) : 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <section className="bg-dark py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tighter mb-6">
            Track your <span className="text-primary">Order</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg mb-10">
            Enter your Order ID to get real-time updates on your shipment status and estimated delivery time.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-orange-400/50 rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleTrack(orderId); }}
              className="relative flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-[2rem] shadow-2xl"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g. ORD-123456)"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-lightGray/50 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-dark transition-all"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-primary text-white px-10 py-5 rounded-[1.8rem] font-bold text-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Track Package'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-20">
        {foundOrder ? (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Status Card */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="bg-lightGray/30 p-8 lg:p-12 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Currently Tracking</p>
                  <h2 className="text-3xl font-bold tracking-tight text-dark">Order #{foundOrder.id.length > 10 ? foundOrder.id.slice(-6) : foundOrder.id}</h2>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Estimated Arrival</p>
                  <p className="text-xl font-bold text-primary">In 3-5 Business Days</p>
                </div>
              </div>

              <div className="p-8 lg:p-12 space-y-16">
                {/* Stepper */}
                <div className="relative">
                  <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full hidden lg:block">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,122,0,0.4)]"
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                    {steps.map((step, idx) => {
                      const isCompleted = idx + 1 < currentStep;
                      const isActive = idx + 1 === currentStep;
                      const isFuture = idx + 1 > currentStep;

                      return (
                        <div key={idx} className="flex lg:flex-col items-center gap-6 lg:text-center group">
                          <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg shrink-0
                            ${isCompleted ? 'bg-primary text-white shadow-primary/30' :
                              isActive ? 'bg-dark text-white shadow-dark/20 scale-110' :
                                'bg-white text-gray-300 border border-gray-100'}
                          `}>
                            <step.icon size={24} />
                          </div>
                          <div className="space-y-1">
                            <h4 className={`font-bold text-sm uppercase tracking-wider transition-colors ${isFuture ? 'text-gray-300' : 'text-dark'}`}>
                              {step.label}
                            </h4>
                            <p className="text-xs text-gray-400 font-medium">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
                        <MapPinned size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                        <p className="font-bold text-dark leading-tight">
                          {foundOrder.address.fullName}<br />
                          {foundOrder.address.street}, {foundOrder.address.city}<br />
                          {foundOrder.address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
                        <ShoppingBag size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Package Contents</p>
                        <p className="font-bold text-dark">{foundOrder.items.length} Premium Item(s)</p>
                        <p className="text-xs text-gray-500 mt-1">Total Weight: ~1.2kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Prompt */}
            <div className="bg-lightGray/50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary">
                  <Clock size={24} />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  Something doesn't look right? Our support team is available 24/7.
                </p>
              </div>
              <Link to="/contact" className="text-primary font-bold hover:underline flex items-center gap-2 text-sm uppercase tracking-widest">
                Contact Support <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500 py-10">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-dark">Tracking Failed</h2>
              <p className="text-gray-500 text-lg leading-relaxed">{error}</p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setOrderId('')}
                className="text-primary font-bold hover:underline"
              >
                Clear search and try again
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Box size={24} />
              </div>
              <h4 className="text-lg font-bold">Real-time Updates</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Get instant notifications as your package moves through our logistics network.</p>
            </div>
            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-bold">Secure Delivery</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Every order is insured and requires a secure handover confirmation.</p>
            </div>
            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h4 className="text-lg font-bold">Hassle-free Returns</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Not satisfied? Track your return shipment just as easily as your delivery.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
