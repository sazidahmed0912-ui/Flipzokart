"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Star, ShoppingBag, Clock } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// --- Types ---
type BeautyTab = 'All' | 'Skincare' | 'Makeup' | 'Hair Care' | 'Fragrance' | 'Bath & Body' | 'Tools';

interface BannerConfig {
    title: string;
    images: string[];
    link: string;
}

// --- Banner Data ---
const BANNERS: Record<BeautyTab, BannerConfig> = {
    All: {
        title: "Beauty Essentials",
        images: [
            "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1522335789203-abd1ac5fd425?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Beauty"
    },
    Skincare: {
        title: "Glow Up — Skincare",
        images: [
            "https://images.unsplash.com/photo-1570172619643-c3912166d494?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Beauty&subcategory=Skincare"
    },
    Makeup: {
        title: "Bold Looks — Makeup",
        images: [
            "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Beauty&subcategory=Makeup"
    },
    "Hair Care": {
        title: "Healthy Hair — Hair Care",
        images: [
            "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519735777090-ec97162dc266?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Beauty&subcategory=Hair Care"
    },
    Fragrance: {
        title: "Signature Scents",
        images: [
            "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Beauty&subcategory=Fragrance"
    },
    "Bath & Body": {
        title: "Luxe Bath & Body",
        images: [
            "https://images.unsplash.com/photo-1542384557-0e1dcbef43f0?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Beauty&subcategory=Bath & Body"
    },
    Tools: {
        title: "Beauty Tools & Devices",
        images: [
            "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1617220370437-33b24efed47a?q=80&w=1600&auto=format&fit=crop"
        ],
        link: "/shop?category=Beauty&subcategory=Tools"
    }
};

// --- Subcategory Grid Data ---
const BEAUTY_SUBCATEGORIES = [
    { name: "Skincare", icon: "https://images.unsplash.com/photo-1570172619643-c3912166d494?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&subcategory=Skincare" },
    { name: "Makeup", icon: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&subcategory=Makeup" },
    { name: "Hair Care", icon: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&subcategory=Hair Care" },
    { name: "Fragrance", icon: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&subcategory=Fragrance" },
    { name: "Bath & Body", icon: "https://images.unsplash.com/photo-1542384557-0e1dcbef43f0?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&subcategory=Bath & Body" },
    { name: "Tools", icon: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=600&auto=format&fit=crop", link: "/shop?category=Beauty&subcategory=Tools" },
];

const TABS: BeautyTab[] = ['All', 'Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Bath & Body', 'Tools'];

export const BeautyPage: React.FC = () => {
    const { products } = useApp();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Read tab from URL on mount (preserves tab on refresh)
    const getInitialTab = (): BeautyTab => {
        const tabParam = searchParams.get('tab');
        if (tabParam && TABS.includes(tabParam as BeautyTab)) {
            return tabParam as BeautyTab;
        }
        return 'All';
    };

    const [activeTab, setActiveTab] = useState<BeautyTab>(getInitialTab);
    const [beautyProducts, setBeautyProducts] = useState<any[]>([]);
    const [trendingByTab, setTrendingByTab] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [trendingDays, setTrendingDays] = useState<7 | 15 | 30>(7);
    const [loading, setLoading] = useState(true);

    // 🧠 Dynamic Rank Movement System (using Refs for stability)
    const previousRanksRef = useRef<Record<string, number>>({});
    const isRankFirstLoadRef = useRef(true);

    // Fetch random Beauty products from backend (with fallback)
    useEffect(() => {
        const fetchRandomBeautyProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/products/random/Beauty?limit=20', {
                    headers: { 'Cache-Control': 'no-store' }
                });
                setBeautyProducts(res.data);
            } catch (error) {
                console.warn('Random API not available yet, using Context fallback:', error);
                const contextBeautyProducts = products.filter(
                    (p: any) => p.category === 'Beauty' || p.category === 'beauty'
                );
                setBeautyProducts(contextBeautyProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchRandomBeautyProducts();
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
                    `${API_URL}/api/products/trending/category/Beauty/${trendingDays}?limit=16${subcategoryParam}`
                );

                let newData: any[] = [];
                if (res.data && res.data.length > 0) {
                    newData = res.data;
                } else {
                    // Fallback: filter from locally fetched beauty products
                    newData = beautyProducts.filter((p: any) => {
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

    }, [activeTab, trendingDays, beautyProducts]);

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

            {/* 2. SWIPER HERO BANNER */}
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
                                {/* Banner Image — smooth zoom on hover */}
                                <img
                                    src={img}
                                    alt={`${currentBanner.title} - Slide ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />

                                {/* Gradient depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                                {/* Banner title */}
                                <div className="absolute bottom-14 md:bottom-20 left-4 md:left-12 text-white pointer-events-none max-w-[500px] lg:max-w-[700px]">
                                    <h2 className="text-xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight drop-shadow-lg">{currentBanner.title}</h2>
                                </div>

                                {/* Premium Clean CTA Pill */}
                                <div className="banner-overlay">
                                    <span className="cta-text">Shop Now</span>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* 3. SUBCATEGORY GRID */}
            <div className="bg-white py-4 md:py-8 px-3 md:px-8 mb-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xs md:text-lg font-bold text-gray-800 mb-3 md:mb-6 uppercase tracking-wider">Shop by Category</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
                        {BEAUTY_SUBCATEGORIES.map((sub, idx) => (
                            <Link key={idx} href={sub.link} className="flex flex-col items-center group">
                                <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:border-pink-400 transition-colors">
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

            {/* 4. PRODUCT SHOWCASE SECTIONS */}
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 pb-8">

                {/* Trending Section */}
                {(trendingProducts.length > 0 || trendingLoading) && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold flex items-center gap-2">
                                    <TrendingUp size={16} className="text-[#2874F0]" />
                                    <span className="flex items-center glow-text">
                                        Trending in {activeTab === 'All' ? 'Beauty' : activeTab}
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
                                                ? 'bg-[#2874F0] text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {d}D
                                        </button>
                                    ))}
                                </div>
                                <Link
                                    href={`/shop?category=Beauty${activeTab !== 'All' ? `&subcategory=${encodeURIComponent(activeTab)}` : ''}&sort=newest`}
                                    className="bg-[#2874F0] text-white rounded-full p-1 md:px-4 md:py-1.5"
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
                                    Best of {activeTab === 'All' ? 'Beauty' : activeTab}
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Top rated by customers</p>
                            </div>
                            <Link
                                href={`/shop?category=Beauty${activeTab !== 'All' ? `&subcategory=${encodeURIComponent(activeTab)}` : ''}&sort=rating`}
                                className="bg-[#2874F0] text-white rounded-full p-1 md:px-4 md:py-1.5"
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
                            We are stocking up {activeTab === 'All' ? 'Beauty' : activeTab}'s collection!
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};
