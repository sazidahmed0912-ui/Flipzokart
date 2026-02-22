"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { ChevronRight, TrendingUp, Star, ShoppingBag, Clock } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// --- Types ---
type AgriTab = 'All' | 'Seeds & Plants' | 'Fertilizers' | 'Tools & Equipment' | 'Pesticides' | 'Irrigation' | 'Livestock';

interface BannerConfig {
    title: string;
    images: string[];
    link: string;
}

// --- Banner Data ---
const BANNERS: Record<AgriTab, BannerConfig> = {
    All: {
        title: "Agriculture Essentials",
        images: [
            "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Agriculture"
    },
    "Seeds & Plants": {
        title: "Seeds & Plants",
        images: [
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Agriculture&subcategory=Seeds & Plants"
    },
    Fertilizers: {
        title: "Fertilizers & Nutrients",
        images: [
            "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Agriculture&subcategory=Fertilizers"
    },
    "Tools & Equipment": {
        title: "Farming Tools & Equipment",
        images: [
            "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Agriculture&subcategory=Tools & Equipment"
    },
    Pesticides: {
        title: "Crop Protection",
        images: [
            "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Agriculture&subcategory=Pesticides"
    },
    Irrigation: {
        title: "Irrigation Systems",
        images: [
            "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Agriculture&subcategory=Irrigation"
    },
    Livestock: {
        title: "Livestock & Poultry",
        images: [
            "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Agriculture&subcategory=Livestock"
    }
};

// --- Subcategory Grid Data ---
const AGRI_SUBCATEGORIES = [
    { name: "Seeds & Plants", icon: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Agriculture&subcategory=Seeds & Plants" },
    { name: "Fertilizers", icon: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Agriculture&subcategory=Fertilizers" },
    { name: "Tools & Equipment", icon: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Agriculture&subcategory=Tools & Equipment" },
    { name: "Pesticides", icon: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Agriculture&subcategory=Pesticides" },
    { name: "Irrigation", icon: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Agriculture&subcategory=Irrigation" },
    { name: "Livestock", icon: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Agriculture&subcategory=Livestock" },
];

const TABS: AgriTab[] = ['All', 'Seeds & Plants', 'Fertilizers', 'Tools & Equipment', 'Pesticides', 'Irrigation', 'Livestock'];

export const AgriculturePage: React.FC = () => {
    const { products } = useApp();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Read tab from URL on mount (preserves tab on refresh)
    const getInitialTab = (): AgriTab => {
        const tabParam = searchParams.get('tab');
        if (tabParam && TABS.includes(tabParam as AgriTab)) {
            return tabParam as AgriTab;
        }
        return 'All';
    };

    const [activeTab, setActiveTab] = useState<AgriTab>(getInitialTab);
    const [agriProducts, setAgriProducts] = useState<any[]>([]);
    const [trendingByTab, setTrendingByTab] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [trendingDays, setTrendingDays] = useState<7 | 15 | 30>(7);
    const [loading, setLoading] = useState(true);

    // 🧠 Dynamic Rank Movement System (using Refs for stability)
    const previousRanksRef = useRef<Record<string, number>>({});
    const isRankFirstLoadRef = useRef(true);

    // Fetch random Agriculture products from backend (with fallback)
    useEffect(() => {
        const fetchRandomAgriProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/products/random/Agriculture?limit=20', {
                    headers: { 'Cache-Control': 'no-store' }
                });
                setAgriProducts(res.data);
            } catch (error) {
                console.warn('Random API not available yet, using Context fallback:', error);
                const contextAgriProducts = products.filter(
                    (p: any) => p.category === 'Agriculture' || p.category === 'agriculture'
                );
                setAgriProducts(contextAgriProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchRandomAgriProducts();
    }, [products]);

    // Reset tracking when tab or period changes
    useEffect(() => {
        isRankFirstLoadRef.current = true;
        previousRanksRef.current = {};
        setTrendingByTab([]); // Clear old list to prevent flash
    }, [activeTab, trendingDays]);

    // Fetch & Process Trending Data
    useEffect(() => {
        const fetchTrending = async (silent = false) => {
            try {
                if (!silent) setTrendingLoading(true);

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const subcategoryParam = activeTab !== 'All' ? `&subcategory=${encodeURIComponent(activeTab)}` : '';
                const res = await axios.get(
                    `${API_URL}/api/products/trending/category/Agriculture/${trendingDays}?limit=16${subcategoryParam}`
                );

                let newData: any[] = [];
                if (res.data && res.data.length > 0) {
                    newData = res.data;
                } else {
                    // Fallback: filter from locally fetched agriculture products
                    newData = agriProducts.filter((p: any) => {
                        if (activeTab === 'All') return true;
                        return (
                            p.subcategory?.toLowerCase().includes(activeTab.toLowerCase()) ||
                            p.submenu?.toLowerCase().includes(activeTab.toLowerCase())
                        );
                    });
                }

                // 🧠 Process Rank Movement Logic
                const processRankMovement = (data: any[]) => {
                    if (isRankFirstLoadRef.current) {
                        isRankFirstLoadRef.current = false;
                        const initialMap: Record<string, number> = {};
                        data.forEach(p => initialMap[p._id || p.id] = p.rank);
                        previousRanksRef.current = initialMap;
                        return data.map(p => ({ ...p, movement: 'same' }));
                    }

                    const updated = data.map(p => {
                        const pid = p._id || p.id;
                        const prevRank = previousRanksRef.current[pid];
                        let movement = 'same';

                        if (prevRank !== undefined) {
                            if (p.rank < prevRank) movement = 'up';
                            else if (p.rank > prevRank) movement = 'down';
                        }
                        return { ...p, movement };
                    });

                    // Update ref map for next compare
                    const newMap: Record<string, number> = {};
                    updated.forEach(p => newMap[p._id || p.id] = p.rank);
                    previousRanksRef.current = newMap;

                    return updated;
                };

                const processedData = processRankMovement(newData);
                setTrendingByTab(processedData);

            } catch (error) {
                console.error("Error fetching trending:", error);
            } finally {
                if (!silent) setTrendingLoading(false);
            }
        };

        fetchTrending(); // Initial fetch

        // 🔄 Auto-Poll for updates every 10 seconds (silent refresh)
        const interval = setInterval(() => fetchTrending(true), 10000);
        return () => clearInterval(interval);

    }, [activeTab, trendingDays, agriProducts]);

    // 🧠 Auto-Hide Movement Animation after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setTrendingByTab(prev => prev.map(p => ({ ...p, movement: 'same' })));
        }, 2000);
        return () => clearTimeout(timer);
    }, [trendingByTab]);

    // Products for display: trending split into two sections
    const trendingProducts = trendingByTab.slice(0, 8);
    const bestOfProducts = trendingByTab.slice(8, 16);

    const currentBanner = BANNERS[activeTab];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">

            {/* TABS */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-3 md:px-8">
                    <div className="flex overflow-x-auto no-scrollbar gap-1 py-2">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    router.replace(`/agriculture?tab=${encodeURIComponent(tab)}`, { scroll: false });
                                }}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-green-600 text-white shadow-md shadow-green-200'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SWIPER HERO BANNER */}
            <div className="hero-banner-quad w-full h-[220px] md:h-[420px] lg:h-[420px] xl:h-[520px] 2xl:h-[580px] bg-gray-100 overflow-hidden lg:max-w-[1400px] xl:max-w-[1500px] mx-auto lg:mt-4 relative">
                <Swiper
                    key={activeTab}
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    observer={true}
                    observeParents={true}
                    className="w-full h-full"
                >
                    {currentBanner.images.map((img, index) => (
                        <SwiperSlide key={`${activeTab}-${index}`}>
                            <div
                                className="relative w-full h-full cursor-pointer group"
                                onClick={() => router.push(currentBanner.link)}
                            >
                                {/* Banner Image */}
                                <img
                                    src={img}
                                    alt={`${currentBanner.title} - Slide ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />

                                {/* Gradient depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                                {/* Premium Clean CTA Pill — only element on banner */}
                                <div className="banner-overlay">
                                    <span className="cta-text">Shop Now</span>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* SUBCATEGORY GRID */}
            <div className="bg-white py-4 md:py-8 px-3 md:px-8 mb-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xs md:text-lg font-bold text-gray-800 mb-3 md:mb-6 uppercase tracking-wider">Shop by Category</h3>
                    <div className="grid grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-1 md:gap-6">
                        {AGRI_SUBCATEGORIES.map((sub, idx) => (
                            <Link key={idx} href={sub.link} className="flex flex-col items-center group">
                                <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:border-green-400 transition-colors">
                                    <img
                                        src={sub.icon}
                                        alt={sub.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <span className="text-[11px] md:text-sm font-medium text-gray-700 text-center">{sub.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* PRODUCT SHOWCASE SECTIONS */}
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 pb-8">

                {/* Trending Section */}
                {(trendingProducts.length > 0 || trendingLoading) && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold flex items-center gap-2">
                                    <TrendingUp size={16} className="text-green-600" />
                                    <span className="flex items-center glow-text">
                                        Trending in {activeTab === 'All' ? 'Agriculture' : activeTab}
                                        <span className="live-dot"></span>
                                    </span>
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Based on real orders</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {/* Time Filter Pills */}
                                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
                                    <Clock size={11} className="text-gray-400 ml-1.5" />
                                    {([7, 15, 30] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setTrendingDays(d)}
                                            className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full transition-all ${trendingDays === d
                                                ? 'bg-green-600 text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {d}D
                                        </button>
                                    ))}
                                </div>
                                <Link
                                    href={`/shop?category=Agriculture${activeTab !== 'All' ? `&subcategory=${encodeURIComponent(activeTab)}` : ''}&sort=newest`}
                                    className="bg-green-600 text-white rounded-full p-1 md:px-4 md:py-1.5"
                                >
                                    <ChevronRight size={16} className="md:hidden" />
                                    <span className="hidden md:inline text-sm font-bold">View All</span>
                                </Link>
                            </div>
                        </div>

                        {trendingLoading ? (
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="min-w-[140px] md:min-w-0 md:flex-1 h-52 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 md:gap-6 no-scrollbar snap-x">
                                {trendingProducts.map((product) => (
                                    <div key={product.id} className="flex flex-col min-w-[140px] md:min-w-0 snap-start">
                                        <ProductCard product={product} />
                                        {/* 🏆 RANK BADGE — below image, top 5 only */}
                                        {product.showRankBadge && (
                                            <div
                                                className="flex items-center justify-center gap-1.5 mx-1 -mt-1 mb-1 py-1 px-3 rounded-b-xl text-white text-[11px] md:text-xs font-black select-none"
                                                style={{
                                                    background: [
                                                        'linear-gradient(90deg,#FFD700,#FFA500)', // #1 Gold
                                                        'linear-gradient(90deg,#C0C0C0,#A9A9A9)', // #2 Silver
                                                        'linear-gradient(90deg,#CD7F32,#8B4513)', // #3 Bronze
                                                        'linear-gradient(90deg,#ff416c,#ff4b2b)', // #4 Red
                                                        'linear-gradient(90deg,#36d1dc,#5b86e5)', // #5 Blue
                                                    ][product.rank - 1],
                                                    animation: 'rankPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
                                                    animationDelay: `${(product.rank - 1) * 60}ms`,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
                                                }}
                                            >
                                                <span className="flex items-center">
                                                    #{product.rank} Trending
                                                    {product.movement === 'up' && <span className="rank-move up ml-1">⬆</span>}
                                                    {product.movement === 'down' && <span className="rank-move down ml-1">⬇</span>}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Best Of Section */}
                {bestOfProducts.length > 0 && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-end mb-3 md:mb-6">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Star size={16} className="text-yellow-500" />
                                    Best of {activeTab === 'All' ? 'Agriculture' : activeTab}
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Top rated by customers</p>
                            </div>
                            <Link
                                href={`/shop?category=Agriculture${activeTab !== 'All' ? `&subcategory=${encodeURIComponent(activeTab)}` : ''}&sort=rating`}
                                className="bg-green-600 text-white rounded-full p-1 md:px-4 md:py-1.5"
                            >
                                <ChevronRight size={16} className="md:hidden" />
                                <span className="hidden md:inline text-sm font-bold">View All</span>
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto gap-3 pb-2 md:grid md:grid-cols-4 md:gap-6 no-scrollbar snap-x">
                            {bestOfProducts.map((product) => (
                                <div key={product.id} className="min-w-[140px] md:min-w-0 snap-start">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Fallback if no products */}
                {trendingByTab.length === 0 && !trendingLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white m-3 rounded-xl border border-dashed text-center">
                        <ShoppingBag size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-gray-500 font-bold">Coming Soon</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            We are stocking up {activeTab === 'All' ? 'Agriculture' : activeTab}'s collection!
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};
