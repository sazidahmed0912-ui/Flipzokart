"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Package, User, RefreshCw, CreditCard, FileText, Shield, ArrowRight, Phone, Mail, MessageSquare, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';

const HelpCenterPage: React.FC = () => {
    const router = useRouter();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic mock search functionality - could redirect or filter
        if (searchQuery.trim()) {
            // For now, if query matches an FAQ, open it, else show alert/toast (simplified for UI demo)
            const foundIdx = faqs.findIndex(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()));
            if (foundIdx !== -1) {
                setOpenFaqIndex(foundIdx);
                // scroll to faq section
                document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const quickActions = [
        { icon: <Package size={20} className="md:w-6 md:h-6 text-[#8D6E63]" />, title: 'Track Order', color: 'bg-[#FFF3E0]', borderColor: 'border-[#FFE0B2]', link: '/orders' },
        { icon: <User size={20} className="md:w-6 md:h-6 text-[#1565C0]" />, title: 'Account', color: 'bg-[#E3F2FD]', borderColor: 'border-[#BBDEFB]', link: '/profile' },
        { icon: <RefreshCw size={20} className="md:w-6 md:h-6 text-[#2E7D32]" />, title: 'Returns', color: 'bg-[#E8F5E9]', borderColor: 'border-[#C8E6C9]', link: '/orders' },
        { icon: <CreditCard size={20} className="md:w-6 md:h-6 text-[#C62828]" />, title: 'Payments', color: 'bg-[#FFEBEE]', borderColor: 'border-[#FFCDD2]', link: '/profile' },
        { icon: <FileText size={20} className="md:w-6 md:h-6 text-[#F9A825]" />, title: 'Order Help', color: 'bg-[#FFFDE7]', borderColor: 'border-[#FFF9C4]', link: '/orders' },
        { icon: <Shield size={20} className="md:w-6 md:h-6 text-[#6A1B9A]" />, title: 'Safety', color: 'bg-[#F3E5F5]', borderColor: 'border-[#E1BEE7]', link: '/terms-of-service' },
    ];

    const faqs = [
        { question: "How do I cancel my order?", answer: "You can cancel your order from the 'My Orders' section before it is shipped." },
        { question: "Where can I track my delivery?", answer: "Go to 'Track My Order' and enter your order ID to see real-time updates." },
        { question: "When will I receive my refund?", answer: "Refunds are processed within 5-7 business days after the returned item reaches our warehouse." },
        { question: "How can I return or replace my product?", answer: "Visit 'My Orders', select the item, and choose 'Return' or 'Exchange' within the return window." },
        { question: "How do I know my transaction is secure?", answer: "We use 256-bit SSL encryption to ensure all your transactions are completely secure." }
    ];

    return (
        <div className="bg-white min-h-screen py-3 md:py-8 font-sans text-gray-800">
            <div className="max-w-[1200px] mx-auto px-3 md:px-4">
                {/* Header */}
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Help Center</h1>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative mb-6 md:mb-8">
                    <Search className="absolute top-1/2 left-3 md:left-4 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="What issue are you facing?"
                        className="w-full border border-gray-300 rounded-[4px] pl-10 md:pl-12 pr-10 py-2.5 md:py-3 bg-gray-50 text-sm focus:outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]"
                    />
                    <button type="submit" className="absolute top-1/2 right-0 pr-3 h-full flex items-center">
                        <ArrowRight className="text-gray-400 cursor-pointer hover:text-[#2874F0]" size={18} />
                    </button>
                </form>

                {/* Quick Actions Grid (Revised for small screens) */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                    {quickActions.map((action, idx) => (
                        <div
                            key={idx}
                            onClick={() => router.push(action.link)}
                            className={`${action.color} border ${action.borderColor} rounded-[8px] p-2.5 md:p-4 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 cursor-pointer hover:shadow-sm transition-shadow active:scale-[0.98] transition-transform`}
                        >
                            <div className="p-1.5 md:p-2 bg-white/50 rounded-full shrink-0">{action.icon}</div>
                            <span className="font-semibold text-gray-800 text-xs md:text-sm leading-tight">{action.title}</span>
                        </div>
                    ))}
                </div>

                {/* FAQs (Accordion) */}
                <div id="faq-section" className="mb-6 md:mb-8">
                    <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Frequently Asked Questions</h2>
                    <div className="flex flex-col gap-2 md:gap-3">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                onClick={() => toggleFaq(idx)}
                                className={`
                                    border border-gray-200 rounded-[4px] px-3 py-3 md:px-4 md:py-3 bg-white cursor-pointer transition-all
                                    ${openFaqIndex === idx ? 'shadow-md border-[#2874F0]/30' : 'hover:bg-gray-50 shadow-sm'}
                                `}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className={`text-sm font-medium ${openFaqIndex === idx ? 'text-[#2874F0]' : 'text-gray-700'}`}>
                                        {faq.question}
                                    </span>
                                    <span className={`text-gray-400 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-90' : ''}`}>
                                        {'>'}
                                    </span>
                                </div>
                                {/* Answer Expansion */}
                                {openFaqIndex === idx && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs md:text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Functionality Wired */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">

                    {/* Still Need Help */}
                    <div className="lg:col-span-2 bg-[#F1F3F6] rounded-[8px] p-4 md:p-6 lg:p-8 flex flex-col relative overflow-hidden">
                        <div className="relative z-10 space-y-3 md:space-y-4 w-full text-center md:text-left">
                            <div>
                                <h3 className="text-base md:text-xl font-bold text-gray-900">Still need help?</h3>
                                <p className="text-gray-600 text-xs md:text-sm mt-1">
                                    Our support team is available 24/7 to assist you.
                                </p>
                            </div>

                            <div className="flex gap-2 md:gap-4 justify-center md:justify-start pt-1">
                                <button
                                    onClick={() => router.push('/contact')}
                                    className="flex-1 md:flex-none bg-[#F9C74F] hover:bg-yellow-400 text-black font-bold py-2.5 px-4 md:px-6 rounded-[4px] text-xs md:text-sm shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <MessageSquare size={16} /> Chat
                                </button>
                                <button
                                    onClick={() => router.push('/contact')}
                                    className="flex-1 md:flex-none bg-white border border-[#F9C74F] text-black font-bold py-2.5 px-4 md:px-6 rounded-[4px] text-xs md:text-sm shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-yellow-50"
                                >
                                    <Ticket size={16} /> Ticket
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contact Us */}
                    <div className="bg-white border border-gray-200 rounded-[8px] p-4 md:p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-base md:text-lg font-bold text-gray-900">Contact Us</h3>
                            <Link href="/contact" className="text-[#2874F0] text-xs font-bold hover:underline">View All</Link>
                        </div>

                        <div className="space-y-3">
                            <a href="tel:+916033394539" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                <Phone size={18} className="text-[#2874F0]" />
                                <span className="text-sm font-medium text-gray-700">+91 6033394539</span>
                            </a>
                            <a href="mailto:fzokartshop@gmail.com" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                <Mail size={18} className="text-[#2874F0]" />
                                <span className="text-sm font-medium text-gray-700">fzokartshop@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpCenterPage;
