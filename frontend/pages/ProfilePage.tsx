import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { 
  User, Package, MapPin, CreditCard, 
  Settings, LogOut, ChevronRight, ShoppingBag,
  Clock, CheckCircle2, ShieldCheck, Phone, Mail,
  Heart, Lock
} from 'lucide-react';
import { useApp } from '../store/Context';

export const ProfilePage: React.FC = () => {
  const { user, orders, logout } = useApp();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  const userOrders = orders.filter(o => o.userId === user.id);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex font-sans text-[#1F2937]">
      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-white m-6 mr-0 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden border border-gray-100/50">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2874F0] text-white flex items-center justify-center text-xl font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hello,</p>
              <p className="font-bold text-[#1F2937] truncate">{user.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 text-[#2874F0] font-bold rounded-xl border border-blue-100/50 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <User size={18} />
              <span className="text-sm">My Profile</span>
            </div>
            <ChevronRight size={14} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
            <Package size={18} className="group-hover:text-[#2874F0] transition-colors" />
            <span className="text-sm">Orders</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
            <Heart size={18} className="group-hover:text-[#2874F0] transition-colors" />
            <span className="text-sm">Wishlist</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
            <Lock size={18} className="group-hover:text-[#2874F0] transition-colors" />
            <span className="text-sm">Account Security</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
            <MapPin size={18} className="group-hover:text-[#2874F0] transition-colors" />
            <span className="text-sm">Address Book</span>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-50">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 p-10 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-[#1F2937] tracking-tight">My Profile</h1>
        </div>

        {/* 2️⃣ Profile Header Card */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-8 flex justify-between items-center border border-gray-100/50">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-[#F9C74F] flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-yellow-200/50 border-4 border-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#1F2937]">{user.name}</h2>
                <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 border border-green-100 tracking-widest uppercase">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                  <Mail size={14} className="text-gray-400" /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                  <Phone size={14} className="text-gray-400" /> {user.phone || '+91 98765 43210'}
                </div>
              </div>
            </div>
          </div>
          <button className="bg-[#F9C74F] hover:bg-[#f8bc2d] text-[#1F2937] font-black px-10 py-3.5 rounded-xl transition-all shadow-md shadow-yellow-100 active:scale-95 uppercase text-xs tracking-widest">
            Edit
          </button>
        </div>

        {/* 3️⃣ Quick Info Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center justify-center text-center space-y-2 border border-gray-100/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2874F0]"></div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Orders</p>
            <p className="text-4xl font-black text-[#1F2937] group-hover:scale-110 transition-transform">{userOrders.length}</p>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center justify-center text-center space-y-2 border border-gray-100/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Status</p>
            <p className="text-4xl font-black text-green-600 group-hover:scale-110 transition-transform">Verified</p>
          </div>
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center justify-center text-center space-y-2 border border-gray-100/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#F9C74F]"></div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Joined</p>
            <p className="text-4xl font-black text-[#1F2937] group-hover:scale-110 transition-transform">
              {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
            </p>
          </div>
        </div>

        {/* 4️⃣ Personal Information – READ VIEW */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100/50">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-xl font-black text-[#1F2937] tracking-tight">Personal Information</h3>
            <button className="text-[#F9C74F] font-black text-xs uppercase tracking-widest hover:text-[#f8bc2d] transition-colors">Edit</button>
          </div>
          <div className="p-10 grid grid-cols-2 gap-y-10 gap-x-16">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Full Name</p>
              <p className="font-bold text-lg text-[#1F2937]">{user.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Email Address</p>
              <p className="font-bold text-lg text-[#1F2937]">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Mobile Number</p>
              <p className="font-bold text-lg text-[#1F2937]">{user.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* 6️⃣ Recent Activity */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100/50">
          <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-xl font-black text-[#1F2937] tracking-tight">Recent Activity</h3>
          </div>
          <div className="p-8 space-y-6">
            {userOrders.length > 0 ? (
              userOrders.slice(0, 2).map((order, idx) => (
                <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2874F0] flex items-center justify-center shrink-0 shadow-sm">
                    <ShoppingBag size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1F2937]">Placed a new order <span className="text-[#2874F0]">#{order.id}</span></p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                      {new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Clock size={32} />
                </div>
                <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">No recent activity found</p>
              </div>
            )}
          </div>
        </div>

        {/* 7️⃣ Account Settings */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100/50">
          <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-xl font-black text-[#1F2937] tracking-tight">Account Settings</h3>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-white group-hover:text-[#2874F0] transition-all shadow-sm group-hover:shadow-md">
                  <Lock size={22} />
                </div>
                <span className="font-bold text-[#1F2937]">Change Password</span>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-[#2874F0] group-hover:translate-x-1 transition-all" />
            </div>
            <div className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-white group-hover:text-[#2874F0] transition-all shadow-sm group-hover:shadow-md">
                  <ShieldCheck size={22} />
                </div>
                <span className="font-bold text-[#1F2937]">Account Security</span>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-[#2874F0] group-hover:translate-x-1 transition-all" />
            </div>
            <div 
              onClick={logout}
              className="px-8 py-6 flex justify-between items-center hover:bg-red-50 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-400 flex items-center justify-center group-hover:bg-white transition-all shadow-sm group-hover:shadow-md">
                  <LogOut size={22} />
                </div>
                <span className="font-bold text-red-500">Logout from all devices</span>
              </div>
              <ChevronRight size={20} className="text-red-300 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
