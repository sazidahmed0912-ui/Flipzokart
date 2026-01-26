import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, TicketPercent, Settings,
  ChevronRight, Activity, LogOut, CreditCard,
  FileText, Truck, Globe, Bell, Star, BarChart
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Inventory', path: '/admin/inventory', icon: Package },
  { name: 'Orders Management', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Users Management', path: '/admin/users', icon: Users },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Sellers Management', path: '/admin/sellers', icon: Users },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  { name: 'Monitor', path: '/admin/monitor', icon: Activity },
  { name: 'Invoices', path: '/admin/invoices', icon: FileText },
  { name: 'Reports', path: '/admin/reports', icon: BarChart },
  { name: 'Shipping & Labels', path: '/admin/shipping', icon: Truck },
  { name: 'Live Map', path: '/admin/map', icon: Globe },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-full lg:w-72 bg-white border-r border-gray-100 h-full flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#2874F0] rounded-lg flex items-center justify-center text-white shadow-md">
          <span className="font-bold italic text-lg">F</span>
        </div>
        <div>
          <h1 className="font-bold text-[#2874F0] text-lg tracking-tight italic">Fzokart</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                ? 'bg-[#2874F0]/10 text-[#2874F0]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#2874F0]'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={isActive ? 'text-[#2874F0]' : 'text-gray-400 group-hover:text-[#2874F0]'} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2874F0]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <div className="bg-[#F5F7FA] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">A</div>
            <div>
              <p className="text-xs font-bold text-gray-700">Admin User</p>
              <p className="text-[10px] text-gray-400">admin@fzokart.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
