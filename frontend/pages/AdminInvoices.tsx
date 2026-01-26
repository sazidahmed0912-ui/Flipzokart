import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { SmoothReveal } from '../components/SmoothReveal';
import {
    Search, Bell, User, LogOut, ChevronDown,
    FileText, Download, Eye, Printer, Filter,
    CheckCircle, Clock, AlertCircle, XCircle
} from 'lucide-react';
import { useApp } from '../store/Context';
import { fetchAllOrders } from '../services/adminService';
import { useNavigate } from 'react-router-dom';
import { InvoiceTemplate } from '../components/InvoiceTemplate';

export const AdminInvoices: React.FC = () => {
    const { user, logout } = useApp();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null); // For Modal/Print

    useEffect(() => {
        loadInvoices();

        // Auto-refresh every 5 seconds to show new Invoices automatically
        const interval = setInterval(() => {
            loadInvoices();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadInvoices = async () => {
        try {
            const { data } = await fetchAllOrders();
            // console.log("Fetched Orders for Invoices:", data); 

            if (!data || !Array.isArray(data)) {
                // Keep existing invoices if fetch fails to avoid flicker, or just empty if truly empty
                // setInvoices([]); 
                return;
            }

            // Map Orders to Invoices
            const mappedInvoices = data.map((order: any) => ({
                id: `INV-${(order._id || 'UNKNOWN').slice(-6).toUpperCase()}`,
                orderId: order._id,
                originalOrder: order,
                date: new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
                customer: order.userName || order.user?.name || 'Guest User',
                email: order.email || order.user?.email || 'N/A',
                amount: order.total || 0,
                status: order.paymentStatus === 'PAID' ? 'Paid' : (order.status === 'Delivered' ? 'Paid' : 'Pending'),
                items: order.items || []
            }));

            // Only update if length changed or critical data changed to prevent subtle flickers (Optional optimization)
            setInvoices(mappedInvoices);
        } catch (error) {
            console.error("Failed to load invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (invoice: any) => {
        setSelectedInvoice(invoice);
        // Small delay to allow modal to render before printing
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Overdue': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            {/* Print Styles: Robus hiding mechanism */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { visibility: hidden; background: white; }
                    /* Crucial: Must override the Tailwind 'hidden' class (display: none) */
                    #invoice-template { 
                        display: block !important; 
                        visibility: visible; 
                        position: fixed; 
                        left: 0; 
                        top: 0; 
                        width: 100vw; 
                        height: 100vh; 
                        z-index: 9999; 
                        background: white; 
                        padding: 0;
                        margin: 0;
                        overflow: visible;
                    }
                    #invoice-template * { visibility: visible; }
                    .no-print { display: none !important; }
                    /* Hide scrollbars */
                    ::-webkit-scrollbar { display: none; }
                }
            `}</style>

            <div className="no-print lg:w-72 flex-shrink-0">
                <AdminSidebar />
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-print">
                {/* Navbar */}
                <SmoothReveal direction="down" duration="500" className="sticky top-0 z-30">
                    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
                            <Search size={18} className="text-[#2874F0]" />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                    {/* Header */}
                    <SmoothReveal direction="down" delay={100} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Bill & Invoices</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage and print customer invoices.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white rounded-xl text-sm font-semibold hover:bg-[#1a60d6] transition-colors shadow-lg shadow-blue-500/20">
                                <Printer size={16} /> Print Report
                            </button>
                        </div>
                    </SmoothReveal>

                    {/* Invoice Table */}
                    <SmoothReveal direction="up" delay={200}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                            {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th> */}
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr><td colSpan={7} className="text-center py-8">
                                                <div className="flex justify-center items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-[#2874F0] border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-gray-500">Loading Invoices...</span>
                                                </div>
                                            </td></tr>
                                        ) : filteredInvoices.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-8">No invoices found.</td></tr>
                                        ) : (
                                            filteredInvoices.map((invoice, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 leading-none">
                                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                                <FileText size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="block font-semibold text-gray-800 text-sm">{invoice.id}</span>
                                                                <span className="text-[10px] text-gray-400">Order #{invoice.orderId.slice(-6)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-gray-700 block">{invoice.customer}</span>
                                                        <span className="text-xs text-gray-400">{invoice.email}</span>
                                                    </td>
                                                    {/* <td className="px-6 py-4 text-sm text-gray-500">{invoice.orderId}</td> */}
                                                    <td className="px-6 py-4 text-sm text-gray-500">{invoice.date}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">₹{invoice.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(invoice.status)}`}>
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/admin/orders/${invoice.orderId}`)}
                                                                className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                                                title="View Order"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePrint(invoice)}
                                                                className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                                                                title="Print / Download PDF"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </SmoothReveal>
                </div>
            </div>

            {/* Hidden Printable Invoice Template (Exact Match to User Image) */}
            <div id="invoice-template" className="hidden">
                {selectedInvoice && (
                    <InvoiceTemplate order={selectedInvoice.originalOrder} />
                )}
            </div>
        </div>
    );
};
