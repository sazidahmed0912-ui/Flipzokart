"use client";

import React, { useState } from 'react';
import { 
  Plus, TicketPercent, Trash2, Search,
  Tag, Clock, Zap, Percent, 
  ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { MOCK_COUPONS } from '@/app/constants';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expiry: '' });

  const addCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCoupons([{ 
      code: newCoupon.code.toUpperCase(), 
      discount: parseInt(newCoupon.discount), 
      expiry: newCoupon.expiry 
    }, ...coupons]);
    setIsModalOpen(false);
    setNewCoupon({ code: '', discount: '', expiry: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-12 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-dark">Promotions Engine</h1>
            <p className="text-gray-500 text-lg mt-1">Design and track high-converting discount campaigns.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-2xl hover:-translate-y-1 transition-all shadow-xl shadow-primary/30"
          >
            <Plus size={20} /> Create Campaign
          </button>
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coupons.map((coupon, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-8 right-8 text-primary opacity-20 group-hover:opacity-100 transition-opacity">
                <TicketPercent size={48} strokeWidth={1} />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-dark text-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Percent size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-dark">{coupon.code}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{coupon.discount}% Global Discount</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium flex items-center gap-2"><Clock size={14} /> Validity</span>
                  <span className="font-bold text-dark">Until {new Date(coupon.expiry).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium flex items-center gap-2"><Zap size={14} /> Usage Status</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Active Now</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-lightGray rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Analytics</button>
                <button 
                  onClick={() => setCoupons(coupons.filter(c => c.code !== coupon.code))}
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-dark/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
              <h2 className="text-3xl font-bold mb-8">Draft New Promo</h2>
              <form onSubmit={addCoupon} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Campaign Code</label>
                  <input required placeholder="e.g. FESTIVE50" className="w-full bg-lightGray px-6 py-4 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 transition-all uppercase" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Discount %</label>
                    <input required type="number" placeholder="25" className="w-full bg-lightGray px-6 py-4 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
                    <input required type="date" className="w-full bg-lightGray px-6 py-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.expiry} onChange={e => setNewCoupon({...newCoupon, expiry: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all mt-6">
                  Deploy Campaign
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
