
import React, { useState } from 'react';
import { 
  Search, Filter, MoreVertical, 
  UserX, ShieldCheck, Mail, Phone,
  ChevronDown, MapPin, Calendar, Clock
} from 'lucide-react';
import { AdminSidebar } from '../components/AdminSidebar';

const MOCK_USERS = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul.s@gmail.com', status: 'Active', orders: 12, totalSpent: 45000, joined: '2024-01-15', location: 'Mumbai' },
  { id: '2', name: 'Priya Patel', email: 'priya.p@outlook.com', status: 'Active', orders: 8, totalSpent: 28000, joined: '2024-02-10', location: 'Delhi' },
  { id: '3', name: 'Anish Gupta', email: 'anish.g@gmail.com', status: 'Suspended', orders: 2, totalSpent: 5000, joined: '2024-03-05', location: 'Bangalore' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha.r@gmail.com', status: 'New', orders: 1, totalSpent: 1200, joined: '2024-05-12', location: 'Hyderabad' },
];

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-12 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-dark">Customer Base</h1>
            <p className="text-gray-500 text-lg mt-1">Manage and moderate your global marketplace users.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Find customers by name, email or city..." 
              className="w-full pl-12 pr-4 py-4 bg-lightGray rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm border border-transparent focus:border-primary/30 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-lightGray rounded-2xl text-xs font-bold uppercase tracking-widest">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-lightGray/30 border-b border-gray-100">
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-10 py-7">Profile Identity</th>
                <th className="px-8 py-7">Market Status</th>
                <th className="px-8 py-7">Order Volume</th>
                <th className="px-8 py-7">LTV Revenue</th>
                <th className="px-10 py-7 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_USERS.map(user => (
                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-dark truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' :
                      user.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-dark">
                    {user.orders} Orders
                  </td>
                  <td className="px-8 py-6 font-bold text-dark text-lg">
                    ₹{user.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all" title="Verify User">
                        <ShieldCheck size={20} />
                      </button>
                      <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Suspend User">
                        <UserX size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
