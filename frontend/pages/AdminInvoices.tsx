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

// Helper to convert number to words (Indian Currency format approximation)
const numberToWords = (num: number): string => {
    const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const formatTens = (n: number) => {
        if (n < 10) return single[n];
        if (n < 20) return double[n % 10];
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + single[n % 10] : "");
    };
    if (num === 0) return "Zero";
    let str = "";
    if (num >= 10000000) { str += formatTens(Math.floor(num / 10000000)) + " Crore "; num %= 10000000; }
    if (num >= 100000) { str += formatTens(Math.floor(num / 100000)) + " Lakh "; num %= 100000; }
    if (num >= 1000) { str += formatTens(Math.floor(num / 1000)) + " Thousand "; num %= 1000; }
    if (num >= 100) { str += formatTens(Math.floor(num / 100)) + " Hundred "; num %= 100; }
    if (num > 0) { str += "and " + formatTens(num); }
    return str + " Only";
};

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
    }, []);

    const loadInvoices = async () => {
        try {
            const { data } = await fetchAllOrders();
            // Map Orders to Invoices
            const mappedInvoices = data.map((order: any) => ({
                id: `INV-${order._id.slice(-6).toUpperCase()}`,
                orderId: order._id, // Real Order ID
                originalOrder: order, // Keep full object
                date: new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
                customer: order.userName || order.user?.name || 'Unknown',
                email: order.email || order.user?.email, // Ensure email is available
                amount: order.total,
                status: order.paymentStatus === 'PAID' ? 'Paid' : (order.status === 'Delivered' ? 'Paid' : 'Pending'), // Assume COD delivered is Paid
                items: order.items
            }));
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
            {/* Print Styles: Hide everything except invoice-template when printing */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-template, #invoice-template * { visibility: visible; }
                    #invoice-template { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; background: white; z-index: 9999; }
                    .no-print { display: none !important; }
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
                                            <tr><td colSpan={7} className="text-center py-8">Loading Invoices...</td></tr>
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
                    <div className="max-w-[210mm] mx-auto p-12 bg-white text-[#1F2937] font-sans h-full relative">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-[#f97316] rounded-md flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                    </div>
                                    <span className="text-3xl font-bold text-[#f97316]">Fzokart</span>
                                </div>

                                <div>
                                    <h2 className="font-bold text-lg text-gray-900">Fzokart Pvt. Ltd.</h2>
                                    <p className="text-sm text-gray-600">Registered Office: Morigaon, Assam, India</p>
                                    <p className="text-sm text-gray-600">GSTIN: <span className="text-gray-900">18ABCDE1234F1Z5</span></p> {/* Mock GSTIN or from Settings */}
                                    <p className="text-sm text-gray-600 mt-2">Customer Care: <span className="text-gray-900 font-medium">fzokart@gmail.com</span></p>
                                    <p className="text-sm text-gray-600">Phone: <span className="text-gray-900 font-medium">6003394539</span></p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">TAX INVOICE</h1>
                            </div>
                        </div>

                        {/* Invoice & Billing Details */}
                        <div className="grid grid-cols-2 gap-12 mb-8">
                            <div className="space-y-3">
                                <div className="flex">
                                    <span className="w-32 font-bold text-gray-800 text-sm">Invoice No:</span>
                                    <span className="text-sm font-medium text-gray-900">{selectedInvoice.id}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold text-gray-800 text-sm">Order Date:</span>
                                    <span className="text-sm font-medium text-gray-900">{selectedInvoice.date}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold text-gray-800 text-sm">Invoice Date:</span>
                                    <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold text-gray-800 text-sm">Payment Method:</span>
                                    <span className="text-sm font-medium text-gray-900 uppercase">{selectedInvoice.originalOrder?.paymentMethod}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-1 mb-2">Billing Address</h3>
                                <p className="font-bold text-gray-900 text-base">{selectedInvoice.customer}</p>
                                <p className="text-sm text-gray-600 leading-snug max-w-xs">{selectedInvoice.originalOrder?.address?.street}</p>
                                <p className="text-sm text-gray-600 leading-snug">{selectedInvoice.originalOrder?.address?.city}, {selectedInvoice.originalOrder?.address?.state} - {selectedInvoice.originalOrder?.address?.zip}</p>
                                <p className="text-sm text-gray-600 mt-1">Phone: <span className="font-medium text-gray-900">{selectedInvoice.originalOrder?.user?.phone || 'N/A'}</span></p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-0">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#F5F1E8]"> {/* Beige Header */}
                                        <th className="border-y border-gray-300 py-2.5 px-4 text-center text-sm font-bold text-gray-800 w-16">S.No</th>
                                        <th className="border-y border-gray-300 py-2.5 px-4 text-left text-sm font-bold text-gray-800">Item Description</th>
                                        <th className="border-y border-gray-300 py-2.5 px-4 text-center text-sm font-bold text-gray-800 w-24">Qty</th>
                                        <th className="border-y border-gray-300 py-2.5 px-4 text-right text-sm font-bold text-gray-800 w-32">Unit Price</th>
                                        <th className="border-y border-gray-300 py-2.5 px-4 text-right text-sm font-bold text-gray-800 w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items?.map((item: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-200">
                                            <td className="py-3 px-4 text-center text-sm text-gray-700">{i + 1}</td>
                                            <td className="py-3 px-4 text-left text-sm text-gray-700 font-medium">
                                                {item.name}
                                                {/* <span className="block text-xs text-gray-500 mt-0.5">HSN: 8517</span> */}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-700">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right text-sm text-gray-700">₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                            <td className="py-3 px-4 text-right text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {/* Minimum rows to fill space if needed, or dynamic */}
                                </tbody>
                            </table>
                        </div>

                        {/* Calculations */}
                        <div className="flex justify-end mt-4">
                            <div className="w-1/2 space-y-2">
                                <div className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                                    <span className="text-sm font-bold text-gray-900">₹{selectedInvoice.originalOrder?.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">GST (Included/Extra):</span>
                                    <span className="text-sm font-bold text-gray-900">₹0.00</span> {/* Tax Logic placeholder */}
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Shipping Charges:</span>
                                    <span className="text-sm font-bold text-gray-900">₹{selectedInvoice.originalOrder?.deliveryCharges?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between py-2 px-4 bg-[#FCECD8] mt-2 rounded-[2px] items-center">
                                    <span className="text-sm font-bold text-gray-800">GRAND Total (in words):</span>
                                    <span className="text-lg font-bold text-gray-900">₹{selectedInvoice.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Amount in Words (Below or inside grand total strip? Image says 'GRAND Total (in words): [Amount]' but usually words are separate. Image actually shows Grand Total numeric, and BELOW it "One Hundred Only". Let's match image.)
                           Wait, user image: "GRAND Total (in words): ₹ 21,104.00" -> This label is confusing. Usually it says "Grand Total". 
                           Line below: "Thank you... ! Twenty One Thousand..." -> Ah, the words are in the footer!
                           Actually, looking closely at image prompt: "GRAND Total (in words): ₹ 21,104.00". The label says "in words" but shows number? That's weird design in the sample image, but I will follow the visual which clearly shows the NUMBER there. 
                           The words "Twenty One Thousand..." are in the footer line.
                        */}

                        <div className="mt-8 border-t border-gray-300 pt-4 text-center space-y-4">
                            <p className="font-bold text-gray-800 text-sm">Thank you for shopping with us! <span className="italic font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{numberToWords(selectedInvoice.amount)}</span></p>

                            <p className="text-xs text-gray-400 italic mt-8">* This is a computer-generated invoice and does not require a signature.</p>
                        </div>

                        {/* Print Only Footer for branding if needed */}
                        <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-gray-300">
                            Generated by Fzokart System
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
