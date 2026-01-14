
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Search, Filter, 
  Clock, CheckCircle, Truck, XCircle, CreditCard, Banknote,
  ExternalLink, Eye, ChevronDown
} from 'lucide-react';
import { useApp } from '../store/Context';
import { Order } from '../types';
import { AdminSidebar } from '../components/AdminSidebar';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'All'>('All');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Paid': return 'bg-purple-100 text-purple-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Paid': return <CreditCard size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-dark">Order Manager</h1>
            <p className="text-gray-500 text-sm">Track and manage customer orders and shipments.</p>
          </div>
          <button className="bg-white border border-gray-200 text-dark px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <ExternalLink size={20} /> Export Batch
          </button>
        </div>

        {/* Status Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'All Orders', count: orders.length, status: 'All', color: 'primary' },
            { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, status: 'Pending', color: 'orange' },
            { label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length, status: 'Shipped', color: 'blue' },
            { label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, status: 'Delivered', color: 'green' },
          ].map((s, i) => (
            <button 
              key={i}
              onClick={() => setStatusFilter(s.status as any)}
              className={`p-6 rounded-3xl border transition-all text-left ${statusFilter === s.status ? `border-${s.color}-500 bg-${s.color}-50` : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'}`}
            >
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${statusFilter === s.status ? `text-${s.color}-600` : 'text-dark'}`}>{s.count}</p>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Order ID or Customer Name..." 
              className="w-full pl-12 pr-4 py-3 bg-lightGray rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-lightGray/30 border-b border-gray-100">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Value</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-dark">#{order.id.split('-')[1]}</td>
                    <td className="px-8 py-5 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-dark">{order.userName}</p>
                    </td>
                    <td className="px-8 py-5 font-bold text-dark">₹{order.total.toLocaleString('en-IN')}</td>
                    <td className="px-8 py-5">
                      <div className="relative group/status inline-block">
                        <button className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status}
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden hidden group-hover/status:block z-50">
                          {(['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'] as Order['status'][]).map(s => (
                            <button 
                              key={s}
                              onClick={() => updateOrderStatus(order.id, s)}
                              className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-lightGray transition-colors ${order.status === s ? 'text-primary' : 'text-gray-500'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 text-gray-300 hover:text-primary transition-colors"><Eye size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
