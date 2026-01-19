
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
    <div className="bg-gray-100 min-h-screen py-4 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Section: Profile & Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex items-center space-x-4 p-4 border-b">
                <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm">Hello,</p>
                  <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
                </div>
              </div>
              <nav className="p-2">
                <Link to="/orders" className="flex items-center justify-between p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                  <div className="flex items-center gap-3">
                    <Package size={20} />
                    <span className="font-semibold text-sm uppercase">My Orders</span>
                  </div>
                  <ChevronRight size={16} />
                </Link>
                <div className="flex items-center justify-between p-3 text-gray-600 cursor-pointer hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
                  <div className="flex items-center gap-3">
                    <UserIcon size={20} />
                    <span className="font-semibold text-sm">ACCOUNT SETTINGS</span>
                  </div>
                </div>
                <ul className="pl-10 text-sm">
                  <li className="py-2 px-3 text-blue-600 font-semibold cursor-pointer">Profile Information</li>
                  <li className="py-2 px-3 hover:text-blue-600 cursor-pointer">Manage Addresses</li>
                </ul>

                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-3 mt-4 text-gray-600 font-semibold text-sm hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                >
                  <LogOut size={20} /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Right Section: Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                <button className="text-blue-600 font-semibold text-sm hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email Address</p>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mobile Number</p>
                  <p className="font-semibold text-gray-800">{user.phone || 'Not available'}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Account Status</h3>
                <div className="flex items-center gap-3 text-green-600">
                  <ShieldCheck size={24} />
                  <p className="font-semibold">Verified Account</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
               <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Recent Orders</h2>
               {userOrders.length > 0 ? (
                 <div className="space-y-4 pt-4">
                   {userOrders.slice(0, 2).map(order => (
                     <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                           <Package size={24} className="text-gray-600" />
                         </div>
                         <div>
                           <p className="font-bold text-gray-800">Order #{order.id.substring(0, 8)}...</p>
                           <p className="text-xs text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-gray-800">₹{order.total.toLocaleString('en-IN')}</p>
                         <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {order.status}
                         </span>
                       </div>
                     </div>
                   ))}
                   {userOrders.length > 2 && (
                     <Link to="/orders" className="text-blue-600 font-semibold text-sm hover:underline pt-2 inline-block">View All Orders →</Link>
                   )}
                 </div>
               ) : (
                 <div className="text-center py-10 text-gray-500">
                   <p>You have no recent orders.</p>
                   <Link to="/shop" className="text-blue-600 font-semibold hover:underline">Start Shopping</Link>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
