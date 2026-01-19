
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { 
  User as UserIcon, Package, MapPin, CreditCard, 
  Settings, LogOut, ChevronRight, ShoppingBag,
  Clock, CheckCircle2, ShieldCheck, Phone, Mail
} from 'lucide-react';
import { useApp } from '../store/Context';

export const ProfilePage: React.FC = () => {
  const { user, orders, logout } = useApp();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  const userOrders = orders.filter(o => o.userId === user.id);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">

      <aside className="w-64 bg-white border-r border-[#E5F7EB] p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-semibold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-gray-500">Hello</p>
            <p className="font-semibold text-[#1F2937]">{user.name}</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <div className="px-3 py-2 border-l-4 border-[#2874F0] bg-blue-50 text-[#2874F0] font-medium rounded">
            My Profile
          </div>
          <div className="px-3 py-2 text-gray-600 rounded cursor-pointer hover:bg-gray-50">Orders</div>
          <div className="px-3 py-2 text-gray-600 rounded cursor-pointer hover:bg-gray-50">Wishlist</div>
          <div className="px-3 py-2 text-gray-600 rounded cursor-pointer hover:bg-gray-50">Account Security</div>
          <div className="px-3 py-2 text-gray-600 rounded cursor-pointer hover:bg-gray-50">Address Book</div>
        </nav>

        <button onClick={logout} className="mt-auto text-red-500 text-sm px-3 py-2 hover:bg-red-50 rounded text-left">Logout</button>
      </aside>

      <main className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl font-semibold text-[#1F2937]">My Profile</h1>

        <div className="bg-white border border-[#E5F7EB] rounded-xl p-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F9C74F] flex items-center justify-center text-xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-lg text-[#1F2937]">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.phone || 'Not available'}</p>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                <CheckCircle2 size={14} className="inline mr-1" /> Verified
              </span>
            </div>
          </div>
          <button className="bg-[#F9C74F] px-5 py-2 rounded-md text-sm font-medium text-[#1F2937] hover:bg-yellow-400 transition-colors">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5F7EB] rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="font-semibold text-xl text-[#1F2937]">{userOrders.length}</p>
          </div>
          <div className="bg-white border border-[#E5F7EB] rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold text-xl text-green-600">Verified</p>
          </div>
          <div className="bg-white border border-[#E5F7EB] rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-500">Joined</p>
            <p className="font-semibold text-xl text-[#1F2937]">{new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

      </main>
    </div>
  );
};
