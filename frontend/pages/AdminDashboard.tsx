
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Users, IndianRupee, TrendingUp, 
  Package, Clock, CheckCircle, XCircle,
  ArrowUpRight, Plus, ExternalLink,
  Zap, Globe, MousePointer2, AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../store/Context';
import { AdminSidebar } from '../components/AdminSidebar';

const data = [
  { name: 'Mon', revenue: 45000, orders: 124 },
  { name: 'Tue', revenue: 38000, orders: 113 },
  { name: 'Wed', revenue: 52000, orders: 158 },
  { name: 'Thu', revenue: 47000, orders: 139 },
  { name: 'Fri', revenue: 61000, orders: 188 },
  { name: 'Sat', revenue: 78000, orders: 238 },
  { name: 'Sun', revenue: 92000, orders: 283 },
];

export const AdminDashboard: React.FC = () => {
  const { orders, products } = useApp();
  
  const totalRevenue = orders.reduce((acc, o) => o.status !== 'Cancelled' ? acc + o.total : acc, 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-12 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-dark">Enterprise Overview</h1>
            <p className="text-gray-500 text-lg mt-1">Real-time performance metrics for Flipzokart Global.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/products" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-2xl hover:-translate-y-1 transition-all shadow-xl shadow-primary/30">
              <Plus size={20} /> Launch Product
            </Link>
            <button className="bg-white border border-gray-100 text-dark px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all">
              <ExternalLink size={20} /> Reports
            </button>
          </div>
        </div>

        {/* Vital Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Market Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'blue', trend: '+12.5%' },
            { label: 'Active Orders', value: orders.length, icon: ShoppingBag, color: 'orange', trend: '+8.2%' },
            { label: 'Global Traffic', value: '42.8k', icon: Globe, color: 'green', trend: '+24.1%' },
            { label: 'Inventory SKU', value: products.length, icon: Package, color: 'purple', trend: '-2.4%' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all duration-500">
              <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-dark">{stat.value}</p>
                <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Revenue Analytics</h3>
                <p className="text-sm text-gray-400 font-medium">Weekly comparative revenue data</p>
              </div>
              <div className="flex gap-2">
                <button className="px-5 py-2 rounded-xl text-xs font-bold bg-lightGray text-dark">Weekly</button>
                <button className="px-5 py-2 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-50">Monthly</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ff7a00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#9ca3af'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#9ca3af'}} dx={-10} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: 700, color: '#111111'}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ff7a00" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Module: Low Stock Alerts */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold tracking-tight mb-8">Inventory Alerts</h3>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              {products.filter(p => p.stock < 15).map(product => (
                <div key={product.id} className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-orange-200 transition-all">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm">
                    <img src={product.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-dark truncate">{product.name}</p>
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{product.stock} left in pantry</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <AlertTriangle size={14} />
                  </div>
                </div>
              ))}
              {products.filter(p => p.stock < 15).length === 0 && (
                <div className="text-center py-20">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-20" />
                  <p className="text-gray-400 font-medium italic">Stock levels are healthy.</p>
                </div>
              )}
            </div>
            <button className="w-full mt-8 py-4 bg-dark text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all">
              Full Stock Audit
            </button>
          </div>
        </div>

        {/* Live Marketplace Activity */}
        <div className="bg-dark rounded-[3.5rem] p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Live Simulation Active</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">System Performance <br/><span className="text-primary italic">is Optimal</span></h2>
              <p className="text-gray-400 text-lg max-w-xl">Flipzokart core engine is currently processing 1,420 requests per second with 0.4ms latency.</p>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full lg:w-auto">
               <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
                  <Zap className="text-primary mx-auto mb-4" size={32} />
                  <p className="text-3xl font-bold">99.9%</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Uptime</p>
               </div>
               <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
                  <MousePointer2 className="text-primary mx-auto mb-4" size={32} />
                  <p className="text-3xl font-bold">3.2%</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Conv. Rate</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
