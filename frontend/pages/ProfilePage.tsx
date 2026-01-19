
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
    <div className="min-h-screen bg-[#F5F7FA] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#2874F0] text-white flex items-center justify-center text-lg font-semibold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-gray-500">Hello</p>
            <p className="font-semibold text-gray-800">{user.name}</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <div className="px-3 py-2 border-l-4 border-[#2874F0] bg-blue-50 text-[#2874F0] font-medium rounded-r-md">
            My Profile
          </div>
          <Link to="/orders" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md">Orders</Link>
          <div className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">Wishlist</div>
          <div className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">Account Security</div>
          <div className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">Address Book</div>
        </nav>

        <button onClick={logout} className="mt-auto text-red-500 font-medium text-sm text-left px-3 py-2 hover:bg-red-50 rounded-md">
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>

        {/* Profile Header */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F9C74F] flex items-center justify-center text-xl font-bold text-white shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-lg text-[#1F2937]">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.phone || 'No mobile provided'}</p>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                <ShieldCheck size={14} /> Verified
              </span>
            </div>
          </div>
          <button className="bg-[#F9C74F] px-5 py-2 rounded-md text-sm font-medium text-[#1F2937] hover:bg-yellow-400 transition-colors shrink-0">
            Edit
          </button>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="font-semibold text-2xl text-[#1F2937]">{userOrders.length}</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold text-xl text-green-600">Verified</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Joined</p>
            <p className="font-semibold text-xl text-[#1F2937]">{new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Info + Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Personal Information</h2>
              <button className="bg-[#F9C74F] px-3 py-1 rounded text-sm font-medium text-[#1F2937] hover:bg-yellow-400 transition-colors">Edit</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Full Name</p>
                <p className="font-medium text-[#1F2937]">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email Address</p>
                <p className="font-medium text-[#1F2937]">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Mobile Number</p>
                <p className="font-medium text-[#1F2937]">{user.phone || 'Not available'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Account Settings</h2>
            <div className="space-y-3 text-sm text-gray-700 font-medium">
              <div className="p-2 hover:bg-gray-50 rounded-md cursor-pointer">Change Password</div>
              <div className="p-2 hover:bg-gray-50 rounded-md cursor-pointer">Account Security</div>
              <div onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-md cursor-pointer">Logout</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {userOrders.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              {userOrders.slice(0, 1).map(order => (
                <li key={order.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                    <Package size={16} />
                  </div>
                  <p>Placed new order <strong>#{order.id.substring(0,8)}...</strong></p>
                  <p className="ml-auto text-xs text-gray-400 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                  <UserIcon size={16} />
                </div>
                <p>Profile was successfully updated</p>
                <p className="ml-auto text-xs text-gray-400 whitespace-nowrap">2 days ago</p>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};
