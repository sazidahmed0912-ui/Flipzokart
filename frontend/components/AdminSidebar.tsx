
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Users, TicketPercent, Settings, 
  ChevronRight, Activity
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Inventory', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/admin/users', icon: Users },
  { name: 'Marketing', path: '/admin/coupons', icon: TicketPercent },
  { name: 'System', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-full lg:w-72 bg-white border-r border-gray-100 h-full flex flex-col shrink-0">
      <div className="p-8 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center text-primary shadow-lg">
            <Activity size={22} />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Admin<span className="text-primary">Ops</span></h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enterprise v4.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-dark'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'} />
                <span className="font-bold text-sm">{item.name}</span>
              </div>
              <ChevronRight size={14} className={isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-dark rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Support Status</p>
          <p className="text-xs font-medium text-gray-400 leading-relaxed mb-4">Enterprise support active for 24h.</p>
          <button className="w-full py-2.5 bg-white text-dark text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
};
