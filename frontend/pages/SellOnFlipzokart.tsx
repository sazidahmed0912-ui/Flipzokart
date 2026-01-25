import React, { useState } from 'react';
import { useApp } from '../store/Context';
import { useNavigate } from 'react-router-dom';
import {
    Store,
    UploadCloud,
    IndianRupee,
    CheckCircle,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Truck,
    Headphones,
    FileText,
    ArrowLeft,
    Building2,
    CreditCard
} from 'lucide-react';
import API from '../services/api';

const SellOnFlipzokart: React.FC = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(0); // 0: Landing, 1: Register, 2: Upload/Business, 3: Success

    // Form State
    const [formData, setFormData] = useState({
        gstin: '',
        pan: '',
        storeName: '',
        category: '',
        address: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApply = async () => {
        setLoading(true);
        setError('');
        try {
            // Here we would typically send all the formData to the backend
            // For now, we stick to the existing update logic but imagine we send the extra data
            console.log("Submitting Seller Application:", formData);

            await API.put(`/api/user/profile`, {
                role: 'pending_seller',
                // sellerDetails: formData // Future: send this data
            });
            setStep(3); // Move to Success
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Wizard Screens
    const renderWizard = () => {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Wizard Header */}
                    <div className="bg-[#2874F0] p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setStep(s => Math.max(0, s - 1))} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-xl font-bold">
                                {step === 1 ? 'Step 1: Account Details' : 'Step 2: Business Info'}
                            </h2>
                        </div>
                        <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                            Step {step} of 2
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-gray-100 w-full">
                        <div
                            className="h-full bg-yellow-400 transition-all duration-300 ease-out"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        ></div>
                    </div>

                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Legal Registration</h3>
                                    <p className="text-gray-500 text-sm">Enter your government registered details.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN Number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="gstin"
                                                value={formData.gstin}
                                                onChange={handleChange}
                                                placeholder="22AAAAA0000A1Z5"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            />
                                            <ShieldCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="pan"
                                                value={formData.pan}
                                                onChange={handleChange}
                                                placeholder="ABCDE1234F"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            />
                                            <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.gstin || !formData.pan}
                                    className="w-full bg-[#2874F0] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a60d6] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-500/30"
                                >
                                    Continue to Step 2
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Store size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Shop Details</h3>
                                    <p className="text-gray-500 text-sm">Tell us about your business.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="storeName"
                                                value={formData.storeName}
                                                onChange={handleChange}
                                                placeholder="My Awesome Shop"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            />
                                            <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                        >
                                            <option value="">Select a category</option>
                                            <option value="electronics">Electronics</option>
                                            <option value="fashion">Fashion</option>
                                            <option value="home">Home & Kitchen</option>
                                            <option value="beauty">Beauty & Personal Care</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

                                <button
                                    onClick={handleApply}
                                    disabled={loading || !formData.storeName || !formData.category}
                                    className="w-full bg-[#2874F0] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a60d6] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Submitting...' : 'Complete Registration'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-green-100 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome Aboard!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Badhai Ho! Your details have been submitted. You can now start listing your products and earning.
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl w-full">
                        Go to Seller Dashboard
                    </button>
                    <button onClick={() => navigate('/')} className="mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium">
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    if (step > 0) {
        return renderWizard();
    }

    // Landing Page (Step 0)
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section */}
            <div className="relative bg-[#2874F0] overflow-hidden">
                {/* Decorative Pattern Background */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1a60d6] to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-white space-y-6">
                            <div className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-bold text-sm tracking-wide shadow-md">
                                <TrendingUp size={16} />
                                <span>#1 Seller Platform in India</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                Sell Online to <br />
                                <span className="text-yellow-400">50 Crore+ Indians</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 font-medium">
                                Growth ki nayi shuruwat karo with Flipzokart.
                            </p>
                            <p className="text-blue-200 max-w-lg">
                                Join 14 Lakh+ sellers who trust Flipzokart to grow their business across India. 0% Commission for first 30 days!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-yellow-400/30 flex items-center justify-center gap-2"
                                >
                                    Start Selling <ArrowRight size={20} />
                                </button>
                                <button className="px-8 py-4 rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* Hero Image Concept - Abstract Illustration of Growth */}
                        <div className="hidden md:flex justify-center relative">
                            <div className="relative w-full max-w-md aspect-square">
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-full animate-pulse-slow"></div>
                                <div className="absolute inset-4 bg-white/20 backdrop-blur-md rounded-full"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                        <div className="bg-white p-6 rounded-2xl shadow-xl transform rotate-[-6deg] hover:rotate-0 transition-all duration-500">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-green-100 rounded-lg text-green-600"><TrendingUp size={24} /></div>
                                                <div className="text-sm font-bold text-gray-500">Review</div>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800">4.8/5</div>
                                            <div className="text-xs text-green-600 font-semibold">+12% this week</div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-xl transform rotate-[6deg] hover:rotate-0 transition-all duration-500 mt-8">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><IndianRupee size={24} /></div>
                                                <div className="text-sm font-bold text-gray-500">Revenue</div>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800">₹1.2L</div>
                                            <div className="text-xs text-green-600 font-semibold">Today's earning</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curved Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="fill-white w-full h-auto block">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* 3 Steps Process Section */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Selling in 3 Simple Steps</h2>
                    <p className="text-xl text-gray-600">Bus 3 steps aur aapka business online!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 -z-10"></div>

                    {/* Step 1 */}
                    <div
                        className="flex flex-col items-center text-center group cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-all"
                        onClick={() => setStep(1)}
                    >
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FileText size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">1. Register Account</h3>
                        <p className="text-gray-600 px-6">Enter your GST & PAN details. Verified in minutes.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">2. Upload Products</h3>
                        <p className="text-gray-600 px-6">Upload your catalogue and set your prices.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <IndianRupee size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">3. Start Earning</h3>
                        <p className="text-gray-600 px-6">Get orders and receive payments every 7 days.</p>
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => setStep(1)}
                        className="bg-[#2874F0] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#1a60d6] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        Start Your Seller Journey
                    </button>
                </div>
            </div>

            {/* Why Sell With Us? (Benefits) */}
            <div className="bg-blue-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Why Sellers Choose Flipzokart?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <IndianRupee size={28} />, title: "Lowest Cost", desc: "Sell with minimal commission fees." },
                            { icon: <Truck size={28} />, title: "Pan-India Reach", desc: "Deliver to 19,000+ pincodes." },
                            { icon: <ShieldCheck size={28} />, title: "Secure Payments", desc: "Regular settlements directly to bank." },
                            { icon: <Headphones size={28} />, title: "Seller Support", desc: "24/7 dedicated support for you." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                                <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonial / Trust */}
            <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Trusted by Indians Like You</h2>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-600 rounded-full mb-6 border-4 border-gray-700 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')" }}></div>
                        <blockquote className="text-xl md:text-2xl font-medium italic mb-6">
                            "Flipzokart helped me take my small handicraft business from Jaipur to customers in Kerala. The payments are always on time!"
                        </blockquote>
                        <cite className="not-italic font-bold text-lg text-yellow-400">- Rajesh Kumar, Jaipur Attributes</cite>
                    </div>
                </div>
            </div>

            {/* Sticky CTA for Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
                <button
                    onClick={() => setStep(1)}
                    className="w-full bg-[#2874F0] text-white font-bold py-3 rounded-lg shadow-lg"
                >
                    Start Selling Now
                </button>
            </div>
        </div>
    );
};

export default SellOnFlipzokart;
