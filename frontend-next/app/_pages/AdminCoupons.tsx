"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus, TicketPercent, Trash2, Tag,
  Clock, Zap, Percent, Activity
} from 'lucide-react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { fetchAllCoupons, fetchCouponStats, createCoupon, deleteCoupon, updateCouponStatus } from '@/app/services/adminService';
import toast from 'react-hot-toast';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, totalUsages: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'PERCENTAGE',
    discountValue: '',
    minCartValue: '',
    maxDiscount: '',
    usageLimit: '',
    usageLimitPerUser: '1',
    expiryDate: '',
    allowedCategories: '', // Comma separated for now
    allowedProducts: '', // Comma separated for now
    paymentRestriction: '' // e.g. PREPAID, COD
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [couponsRes, statsRes] = await Promise.all([
        fetchAllCoupons(),
        fetchCouponStats()
      ]);
      setCoupons(couponsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load coupons data');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: any = {
        code: newCoupon.code,
        type: newCoupon.type,
        discountValue: Number(newCoupon.discountValue),
        expiryDate: newCoupon.expiryDate,
        minCartValue: newCoupon.minCartValue ? Number(newCoupon.minCartValue) : undefined,
        maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : undefined,
        usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : undefined,
        usageLimitPerUser: newCoupon.usageLimitPerUser ? Number(newCoupon.usageLimitPerUser) : undefined,
      };

      // Handle custom JSON conditions
      const conditions: any = {};
      if (newCoupon.allowedCategories) conditions.allowedCategories = newCoupon.allowedCategories.split(',').map(s => s.trim());
      if (newCoupon.allowedProducts) conditions.allowedProducts = newCoupon.allowedProducts.split(',').map(s => s.trim());
      if (newCoupon.paymentRestriction) conditions.paymentRestriction = newCoupon.paymentRestriction;

      if (Object.keys(conditions).length > 0) {
        payload.conditions = conditions;
      }

      await createCoupon(payload);
      toast.success('Campaign Deployed Successfully');
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewCoupon({
      code: '', type: 'PERCENTAGE', discountValue: '', minCartValue: '', maxDiscount: '', usageLimit: '', usageLimitPerUser: '1', expiryDate: '', allowedCategories: '', allowedProducts: '', paymentRestriction: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast.success('Coupon deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateCouponStatus(id, newStatus);
      toast.success('Status updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      <AdminSidebar />

      <div className="flex-1 p-6 lg:p-12 space-y-10 max-h-screen overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-dark">Promotions Engine</h1>
            <p className="text-gray-500 text-lg mt-1">Design and track high-converting real-time discount campaigns.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-2xl hover:-translate-y-1 transition-all shadow-xl shadow-primary/30"
          >
            <Plus size={20} /> Create Campaign
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Tag size={24} /></div>
            <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Coupons</p><h3 className="text-3xl font-black text-dark">{stats.totalCoupons}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Zap size={24} /></div>
            <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Promo</p><h3 className="text-3xl font-black text-dark">{stats.activeCoupons}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0"><Activity size={24} /></div>
            <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Redemptions</p><h3 className="text-3xl font-black text-dark">{stats.totalUsages}</h3></div>
          </div>
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-8">
          {coupons.map((coupon, i) => (
            <div key={coupon.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative group hover:shadow-2xl transition-all duration-500 flex flex-col justify-between">
              <div>
                <div className="absolute top-6 right-6 text-primary opacity-10 group-hover:opacity-100 transition-opacity">
                  <TicketPercent size={48} strokeWidth={1} />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-dark text-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <Percent size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-dark">{coupon.code}</h3>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{coupon.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 relative z-10">
                  <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400 font-medium flex items-center gap-2"><Tag size={14} /> Value</span>
                    <span className="font-bold text-dark">{coupon.type === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400 font-medium flex items-center gap-2"><Activity size={14} /> Usage Redemptions</span>
                    <span className="font-bold text-dark">{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-2">
                    <span className="text-gray-400 font-medium flex items-center gap-2"><Clock size={14} /> Expiry</span>
                    <span className="font-bold text-red-500">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 relative z-10 mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleStatus(coupon.id, coupon.status)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${coupon.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {coupon.status}
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-medium text-lg border-2 border-dashed border-gray-200 rounded-3xl">No campaigns running currently. Create one to get started!</div>}
        </div>

        {/* Create Modal - Expanded for Full Engine */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-dark/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 my-8 flex flex-col max-h-full">
              <div className="p-8 border-b border-gray-100 shrink-0">
                <h2 className="text-3xl font-black text-dark">Engine Rules Configurator</h2>
                <p className="text-gray-500 mt-1">Configure advanced conditional triggers and discount properties.</p>
              </div>

              <div className="p-8 overflow-y-auto">
                <form id="couponForm" onSubmit={handleCreateCoupon} className="space-y-8">

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Campaign Code *</label>
                      <input required placeholder="e.g. GET50" className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 transition-all uppercase" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Logic Type *</label>
                      <select required className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 transition-all" value={newCoupon.type} onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}>
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat Discount (₹)</option>
                        <option value="BOGO">Buy 1 Get 1 Free</option>
                        <option value="FREE_SHIPPING">Free Shipping</option>
                        <option value="BUY_X_GET_Y">Buy X Get Y (Flat)</option>
                        <option value="MIN_CART_VALUE">Min Cart Value Trigger</option>
                        <option value="CATEGORY_SPECIFIC">Category Specific</option>
                      </select>
                    </div>
                  </div>

                  {/* Values */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Discount Value *</label>
                      <input required type="number" placeholder="e.g. 50" className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.discountValue} onChange={e => setNewCoupon({ ...newCoupon, discountValue: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Min Cart Trigger (₹)</label>
                      <input type="number" placeholder="Optional" className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.minCartValue} onChange={e => setNewCoupon({ ...newCoupon, minCartValue: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Max Cap (₹)</label>
                      <input type="number" placeholder="Optional" className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.maxDiscount} onChange={e => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })} />
                    </div>
                  </div>

                  {/* Limits & Expiry */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Total Usage Limit</label>
                      <input type="number" placeholder="Optional (e.g. 100)" className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.usageLimit} onChange={e => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Limit Per User</label>
                      <input type="number" placeholder="1" className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.usageLimitPerUser} onChange={e => setNewCoupon({ ...newCoupon, usageLimitPerUser: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Expiry Date *</label>
                      <input required type="date" className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.expiryDate} onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} />
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-100 my-6"></div>

                  {/* Advanced Conditions block */}
                  <div>
                    <h3 className="text-lg font-bold text-dark mb-4 border-l-4 border-primary pl-3">Advanced Isolation Rules (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Allowed Category IDs</label>
                        <input placeholder="Comma separated ObjectIds" className="w-full bg-lightGray px-5 py-4 rounded-xl font-medium outline-none focus:ring-2 focus:ring-primary/20 text-sm" value={newCoupon.allowedCategories} onChange={e => setNewCoupon({ ...newCoupon, allowedCategories: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Allowed Product IDs</label>
                        <input placeholder="Comma separated ObjectIds" className="w-full bg-lightGray px-5 py-4 rounded-xl font-medium outline-none focus:ring-2 focus:ring-primary/20 text-sm" value={newCoupon.allowedProducts} onChange={e => setNewCoupon({ ...newCoupon, allowedProducts: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Method Restriction</label>
                        <select className="w-full bg-lightGray px-5 py-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newCoupon.paymentRestriction} onChange={e => setNewCoupon({ ...newCoupon, paymentRestriction: e.target.value })}>
                          <option value="">No Restriction</option>
                          <option value="PREPAID">Prepaid Only</option>
                          <option value="COD">Cash on Delivery Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-8 border-t border-gray-100 shrink-0 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border-2 border-gray-200 text-gray-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" form="couponForm" disabled={isLoading} className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                  {isLoading ? 'Deploying...' : 'Deploy Campaign'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div >
  );
};
