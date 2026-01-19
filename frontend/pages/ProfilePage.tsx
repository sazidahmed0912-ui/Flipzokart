
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
      <aside className="w-64 bg-white shadow-sm p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#2874F0] text-white flex items-center justify-center text-lg font-semibold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-gray-500">Hello,</p>
            <p className="font-semibold text-gray-800">{user.name}</p>
          </div>
        </div>

        <nav className="space-y-2 text-sm">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-[#2874F0] font-bold cursor-pointer">
            <UserIcon size={18} /> My Profile
          </div>
          <Link to="/orders" className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg cursor-pointer">
            <Package size={18} /> Orders
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg cursor-pointer">
            <Settings size={18} /> Account Security
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg cursor-pointer">
            <MapPin size={18} /> Address Book
          </div>
        </nav>

        <button onClick={logout} className="mt-auto flex items-center gap-3 text-red-500 font-medium text-sm px-3 py-2 hover:bg-red-50 rounded-lg">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F9C74F] flex items-center justify-center text-xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-lg text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.phone || 'No mobile provided'}</p>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                <ShieldCheck size={14} /> Verified
              </span>
            </div>
          </div>
          <button className="bg-[#F9C74F] px-4 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-yellow-400 transition-colors">
            Edit
          </button>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Orders</p>
            <p className="font-bold text-2xl text-gray-800">{userOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="font-bold text-xl text-green-600">Verified</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Joined Date</p>
            <p className="font-bold text-xl text-gray-800">{new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Personal Info & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="font-semibold text-gray-800">Personal Information</h2>
              <button className="bg-[#F9C74F] px-3 py-1 rounded text-sm font-medium text-gray-900 hover:bg-yellow-400 transition-colors">
                Edit
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium text-gray-900">{user.phone || 'Not available'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3 border-b pb-3">Account Settings</h2>
            <div className="text-sm font-medium text-gray-600 space-y-1">
              <div className="p-2 hover:bg-gray-50 rounded-md cursor-pointer">Change Password</div>
              <div className="p-2 hover:bg-gray-50 rounded-md cursor-pointer">Account Security</div>
              <div onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-md cursor-pointer">Logout</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {userOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4 border-b pb-3">Recent Activity</h2>
            <ul className="text-sm text-gray-600 space-y-3">
              {userOrders.slice(0, 2).map(order => (
                <li key={order.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                    <Package size={16} className="text-gray-500" />
                  </div>
                  <span>Placed new order <strong>#{order.id.substring(0,8)}...</strong> for <strong>₹{order.total.toLocaleString('en-IN')}</strong></span>
                  <span className="ml-auto text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};
