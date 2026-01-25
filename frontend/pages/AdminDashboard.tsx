import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Users, IndianRupee, TrendingUp,
  Package, Search, Bell, User, LogOut, ChevronDown,
  AlertTriangle, CheckCircle, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../store/Context';
import { AdminSidebar } from '../components/AdminSidebar';
import { getDashboardStats } from '../services/adminService';
import CircularGlassSpinner from '../components/CircularGlassSpinner';
import { SmoothReveal } from '../components/SmoothReveal';

// Define interfaces for the dashboard data
interface SalesOverTimeData {
  _id: string; // Date string 'YYYY-MM-DD'
  dailySales: number;
  dailyOrders: number;
}

interface ProductsByCategoryData {
  _id: string; // Category name
  count: number;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  productsByCategory: ProductsByCategoryData[];
  salesOverTime: SalesOverTimeData[];
}

export const AdminDashboard: React.FC = () => {
  const { products, user, logout } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     REAL-TIME UPDATE LOGIC
     Mode: Polling
     Interval: 5000ms (5s)
     Safety: Clears on unmount
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchStats = async () => {
      try {
        // Silent update (no full page loading spinner after first load)
        const { data } = await getDashboardStats();
        setStats(data);
        setError(null); // Clear transient errors on success
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        // Only show error if we have NO data at all
        if (!stats) {
          setError("Failed to load dashboard statistics. Retrying...");
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Setup polling
    intervalId = setInterval(fetchStats, 5000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !stats) {
    return (
      <CircularGlassSpinner />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = stats?.totalSales || 0;
  const activeOrders = stats?.totalOrders || 0;
  const inventorySKU = stats?.totalProducts || 0;

  // Chart Data
  const chartData = stats?.salesOverTime?.map(item => ({
    name: item._id?.substring(5),
    revenue: item.dailySales,
    orders: item.dailyOrders
  })) || [];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Navbar */}
        <SmoothReveal direction="down" duration="500" className="sticky top-0 z-30">
          <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
              <Search size={18} className="text-[#2874F0]" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-500 hover:text-[#2874F0] transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6161] rounded-full ring-2 ring-white"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{user?.name?.split(' ')[0] || 'Admin'}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        </SmoothReveal>

        <div className="p-8 space-y-8">
          {/* Dashboard Header */}
          <SmoothReveal direction="down" delay={100}>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-xs text-gray-500 font-medium">Live Updates Active (5s)</p>
              </div>
            </div>
          </SmoothReveal>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-[#2874F0]', bg: 'bg-[#2874F0]/10' },
              { label: 'Total Orders', value: activeOrders, icon: ShoppingBag, color: 'text-[#F9C74F]', bg: 'bg-[#F9C74F]/10' },
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
              { label: 'Products', value: inventorySKU, icon: Package, color: 'text-[#FF6161]', bg: 'bg-[#FF6161]/10' },
            ].map((stat, i) => (
              <SmoothReveal key={i} direction="up" delay={200 + (i * 100)}>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={22} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                </div>
              </SmoothReveal>
            ))}
          </div>



          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <SmoothReveal direction="up" delay={600} className="lg:col-span-2">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Revenue Analytics</h3>
                  <select className="text-xs font-bold border-none bg-gray-50 rounded-lg px-3 py-1.5 outline-none text-gray-600 cursor-pointer hover:bg-gray-100">
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <div className="h-64 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2874F0" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#2874F0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dx={-10} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#1F2937' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#2874F0" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SmoothReveal>

            {/* Low Stock Alert */}
            <SmoothReveal direction="up" delay={700} className="flex flex-col h-full">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col h-full">
                <h3 className="font-bold text-gray-800 mb-6">Low Stock Alerts</h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {(products || []).filter(p => p.stock < 15).map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-200" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{product.name}</p>
                        <p className="text-[10px] text-red-500 font-bold mt-0.5">{product.stock} Units Left</p>
                      </div>
                    </div>
                  ))}
                  {(products || []).filter(p => p.stock < 15).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <CheckCircle size={32} className="text-green-500 mb-3 opacity-50" />
                      <p className="text-sm font-medium text-gray-400">Inventory is healthy.</p>
                    </div>
                  )}
                </div>
                <Link to="/admin/products" className="w-full mt-4 py-3 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors block text-center">
                  View Inventory
                </Link>
              </div>
            </SmoothReveal>
          </div>
        </div>
      </div>
    </div>
  );
};
