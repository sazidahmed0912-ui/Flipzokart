import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/Context';
import { useLanguage } from '../store/LanguageContext';
import {
  User,
  Mail,
  Phone,
  Package,
  Truck,
  CheckCircle,
  Edit2,
  Camera,
  MapPin,
  Clock
} from 'lucide-react';
import authService from '../services/authService';
import { SmoothReveal } from "../components/SmoothReveal";
import ProfileSidebar from '../components/Profile/ProfileSidebar';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, orders, setUser } = useApp();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  // Stats calculation
  const pendingOrders = orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length;
  const shippedOrders = orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  const handleEditSuccess = (updatedUser: any) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-sans text-[#1F2937]">
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* ──────── LEFT SIDEBAR ──────── */}
        <ProfileSidebar />

        {/* ──────── MAIN CONTENT ──────── */}
        <div className="flex-1 space-y-6">

          {/* WELCOME HEADER */}
          <SmoothReveal direction="down">
            <div className="bg-gradient-to-r from-[#2874F0] to-[#1a5fc7] rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 text-2xl font-bold">
                    {user.name?.charAt(0) || <User size={32} />}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white text-[#2874F0] p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={14} />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold">Hello, {user.name}</h1>
                  <p className="text-blue-100 text-sm mt-1">Founding Member • Joined {user.createdAt ? new Date(user.createdAt).getFullYear() : 'Recently'}</p>
                </div>
              </div>
            </div>
          </SmoothReveal>

          {/* ORDER STATS */}
          <SmoothReveal direction="up" delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/orders')}>
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
                  <div className="text-sm text-gray-500 font-medium">To Pay / Ship</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/orders')}>
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{shippedOrders}</div>
                  <div className="text-sm text-gray-500 font-medium">To Receive</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/orders')}>
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{deliveredOrders}</div>
                  <div className="text-sm text-gray-500 font-medium">Delivered</div>
                </div>
              </div>
            </div>
          </SmoothReveal>

          {/* PERSONAL INFORMATION */}
          <SmoothReveal direction="up" delay={200}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <User size={18} className="text-[#2874F0]" />
                  Personal Information
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#2874F0] text-sm font-semibold flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
              </div>

              <div className="p-6">
                {isEditing ? (
                  <EditProfileForm
                    initialData={user}
                    onCancel={() => setIsEditing(false)}
                    onSuccess={handleEditSuccess}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Full Name</label>
                      <div className="font-medium text-gray-900 text-base">{user.name}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
                      <div className="font-medium text-gray-900 text-base flex items-center gap-2">
                        {user.email}
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Verified</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mobile Number</label>
                      <div className="font-medium text-gray-900 text-base">
                        {user.phone ? `+91 ${user.phone}` : <span className="text-gray-400 italic">Not added</span>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Member Since</label>
                      <div className="font-medium text-gray-900 text-base flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SmoothReveal>

        </div>
      </div>
    </div>
  );
};

import { useToast } from '../components/toast';

const EditProfileForm = ({ initialData, onCancel, onSuccess }: any) => {
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming authService.updateProfile aligns with backend API
      const updatedUser = await authService.updateProfile({ name, phone });
      onSuccess(updatedUser);
      // Optional: Toast success
    } catch (error) {
      console.error("Update failed:", error);
      // Optional: Toast error
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-blue-50 text-sm font-medium transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
        <input
          type="email"
          value={initialData.email}
          disabled
          className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm font-medium"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-blue-50 text-sm font-medium transition-all"
        />
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#2874F0] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfilePage;