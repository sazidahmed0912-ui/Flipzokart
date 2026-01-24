import React from 'react';
import { Search, Package, User, RefreshCw, CreditCard, FileText, Shield, ArrowRight, Phone, Mail, MessageSquare, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpCenterPage: React.FC = () => {
    const navigate = useNavigate();

    const quickActions = [
        { icon: <Package size={24} className="text-[#8D6E63]" />, title: 'Track My Order', color: 'bg-[#FFF3E0]', borderColor: 'border-[#FFE0B2]', link: '/orders' },
        { icon: <User size={24} className="text-[#1565C0]" />, title: 'Manage Your Account', color: 'bg-[#E3F2FD]', borderColor: 'border-[#BBDEFB]', link: '/profile' },
        { icon: <RefreshCw size={24} className="text-[#2E7D32]" />, title: 'Returns & Refunds', color: 'bg-[#E8F5E9]', borderColor: 'border-[#C8E6C9]', link: '/orders' },
        { icon: <CreditCard size={24} className="text-[#C62828]" />, title: 'Payments', color: 'bg-[#FFEBEE]', borderColor: 'border-[#FFCDD2]', link: '/profile' },
        { icon: <FileText size={24} className="text-[#F9A825]" />, title: 'Help with an Existing Order', color: 'bg-[#FFFDE7]', borderColor: 'border-[#FFF9C4]', link: '/orders' },
        { icon: <Shield size={24} className="text-[#6A1B9A]" />, title: 'Safety & Security', color: 'bg-[#F3E5F5]', borderColor: 'border-[#E1BEE7]', link: '/terms-of-service' },
    ];

    const faqs = [
        "How do I cancel my order?",
        "Where can I track my delivery?",
        "When will I receive my refund?",
        "How can I return or replace my product?",
        "How do I know my transaction is secure?"
    ];

    return (
        <div className="bg-white min-h-screen py-8 font-sans text-gray-800">
            <div className="max-w-[1200px] mx-auto px-4">
                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Help Center</h1>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="How can we help you?"
                        className="w-full border border-gray-300 rounded-[4px] pl-12 pr-4 py-3 bg-gray-50 text-sm focus:outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]"
                    />
                    <ArrowRight className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 cursor-pointer" size={20} />
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {quickActions.map((action, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(action.link)}
                            className={`${action.color} border ${action.borderColor} rounded-[8px] p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-shadow`}
                        >
                            <div className="p-2 bg-white/50 rounded-full">{action.icon}</div>
                            <span className="font-semibold text-gray-800 text-sm">{action.title}</span>
                        </div>
                    ))}
                </div>

                {/* FAQs */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <div className="flex flex-wrap gap-3">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-[4px] px-4 py-3 text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-4 shadow-sm">
                                {faq}
                                <span className="text-gray-400">{'>'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Still Need Help & Contact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Still Need Help - Left Col (Span 2) */}
                    <div className="lg:col-span-2 bg-[#F1F3F6] rounded-[8px] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        {/* Background decoration (mock) */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -z-0"></div>

                        <div className="relative z-10 flex-1 space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">Still need help?</h3>
                            <p className="text-gray-600 text-sm">
                                Chat with our 24/7 support team or raise a ticket. We'll get back to you shortly.
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <button className="bg-[#F9C74F] hover:bg-yellow-400 text-black font-bold py-2.5 px-6 rounded-[4px] text-sm shadow-sm transition-colors flex items-center gap-2">
                                    <MessageSquare size={16} /> Chat with us
                                </button>
                                <button className="bg-[#F9C74F] hover:bg-yellow-400 text-black font-bold py-2.5 px-6 rounded-[4px] text-sm shadow-sm transition-colors flex items-center gap-2">
                                    <Ticket size={16} /> Raise a Ticket
                                </button>
                            </div>
                        </div>
                        {/* Image Mockup on Right */}
                        <div className="hidden md:block w-40 h-32 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center p-4 z-10">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs font-bold text-gray-800">Contact Us</span>
                                <div className="text-[10px] text-gray-500 text-center">
                                    Call us:<br />+91 6033394539
                                </div>
                                <div className="text-[10px] text-gray-500 text-center">
                                    Email us:<br />fzokartshop@gmail.com
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Us - Right Col */}
                    <div className="bg-white border border-gray-200 rounded-[8px] p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Us</h3>
                        <p className="text-gray-500 text-xs mb-6">Have queries? We're here to help you!</p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-[#2874F0]" />
                                <span className="text-sm font-medium text-gray-700">+91 6033394539</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-[#2874F0]" />
                                <span className="text-sm font-medium text-gray-700">fzokartshop@gmail.com</span>
                            </div>
                            {/* Callback Mock */}
                            <div className="flex items-center gap-3 cursor-pointer hover:underline">
                                <div className="w-4 h-4 bg-[#2874F0] rounded-[2px] flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">?</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Get a Callback</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpCenterPage;
