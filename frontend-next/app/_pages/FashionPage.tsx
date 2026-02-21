"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Star, ShoppingBag, Clock } from 'lucide-react';
import { useApp } from '@/app/store/Context';
import { ProductCard } from '@/app/components/ProductCard';


// --- Swiper Versions ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// --- Types ---
type Tab = 'Men' | 'Women' | 'Kids';

interface BannerConfig {
    title: string;
    images: string[];
    link: string;
}

// --- Mock Data (Strict Real Images) ---
const BANNERS: Record<Tab, BannerConfig> = {
    Men: {
        title: "Men's Summer Collections",
        images: [
            "https://res.cloudinary.com/drfyr8hlb/image/upload/f_auto,q_auto,w_1600/v1771138164/Men_s_Summer_Collection_ygcqln.jpg",
            "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771169316/WhatsApp_Image_2026-02-15_at_8.55.41_PM_utjlhk.jpg"
        ],
        link: "/shop?category=Fashion&subcategory=Men"
    },
    Women: {
        title: "Women's Ethnic Wear",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600"
        ],
        link: "/shop?category=Fashion&subcategory=Women"
    },
    Kids: {
        title: "Kids Party Wear",
        images: [
            "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=1600",
            "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771169942/WhatsApp_Image_2026-02-15_at_9.07.12_PM_usbnjn.jpg"
        ],
        link: "/shop?category=Fashion&subcategory=Kids"
    }
};

const INITIAL_SUBCATEGORIES: Record<Tab, { name: string; icon: string; link: string }[]> = {
    Men: [
        { name: "Shirts", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771162918/expert-023d4b3e-5b64-4061-b018-f52223faa9de_ulp28f.jpg", link: "/shop?category=Fashion&subcategory=Men&submenu=Shirts" },
        { name: "T-Shirts", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771163570/expert-926e4b5d-a4b2-4a74-8c1b-0550ae534081_jde77w.jpg", link: "/shop?category=Fashion&subcategory=Men&submenu=T-Shirts" },
        { name: "Jeans", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771164135/WhatsApp_Image_2026-02-15_at_7.31.40_PM_t5afmz.jpg", link: "/shop?category=Fashion&subcategory=Men&submenu=Jeans" },
        { name: "Shoes", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771163760/expert-d3f96149-9062-469a-880c-81f29df29022_leyoct.jpg", link: "/shop?category=Fashion&subcategory=Men&submenu=Shoes" },
        { name: "Watches", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1770388041/samples/ecommerce/analog-classic.jpg", link: "/shop?category=Fashion&subcategory=Men&submenu=Watches" },
        { name: "Activewear", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771164274/WhatsApp_Image_2026-02-15_at_7.34.13_PM_kdf4gi.jpg", link: "/shop?category=Fashion&subcategory=Men&submenu=Activewear" },
    ],
    Women: [
        { name: "Kurti", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771165309/WhatsApp_Image_2026-02-15_at_7.50.26_PM_fsfcla.jpg", link: "/shop?category=Fashion&subcategory=Women&submenu=Kurti" },
        { name: "Saree", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771165271/WhatsApp_Image_2026-02-15_at_7.50.44_PM_vpsgfj.jpg", link: "/shop?category=Fashion&subcategory=Women&submenu=Saree" },
        { name: "Dresses", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771167063/WhatsApp_Image_2026-02-15_at_8.18.49_PM_oa0rrp.jpg", link: "/shop?category=Fashion&subcategory=Women&submenu=Dresses" },
        { name: "Handbags", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771167019/WhatsApp_Image_2026-02-15_at_8.19.40_PM_fjfx5a.jpg", link: "/shop?category=Fashion&subcategory=Women&submenu=Handbags" },
        { name: "Heels", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771167139/WhatsApp_Image_2026-02-15_at_8.22.00_PM_rkd8of.jpg", link: "/shop?category=Fashion&subcategory=Women&submenu=Heels" },
        { name: "Jewellery", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771167235/WhatsApp_Image_2026-02-15_at_8.23.36_PM_gvxim0.jpg", link: "/shop?category=Fashion&subcategory=Women&submenu=Jewellery" },
    ],
    Kids: [
        { name: "Boys Wear", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771168867/WhatsApp_Image_2026-02-15_at_8.50.13_PM_ghtqpc.jpg", link: "/shop?category=Fashion&subcategory=Kids&submenu=Boys Wear" },
        { name: "Girls Wear", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771168867/WhatsApp_Image_2026-02-15_at_8.50.14_PM_livxev.jpg", link: "/shop?category=Fashion&subcategory=Kids&submenu=Girls Wear" },
        { name: "Kids Shoes", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771168867/WhatsApp_Image_2026-02-15_at_8.50.14_PM_1_gyko9v.jpg", link: "/shop?category=Fashion&subcategory=Kids&submenu=Kids Shoes" },
        { name: "Toys", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771169130/WhatsApp_Image_2026-02-15_at_8.54.45_PM_ro7nbb.jpg", link: "/shop?category=Fashion&subcategory=Kids&submenu=Toys" },
        { name: "School Bags", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771169132/WhatsApp_Image_2026-02-15_at_8.54.44_PM_1_rtf3vg.jpg", link: "/shop?category=Fashion&subcategory=Kids&submenu=School Bags" },
        { name: "Accessories", icon: "https://res.cloudinary.com/drfyr8hlb/image/upload/v1771169130/WhatsApp_Image_2026-02-15_at_8.54.44_PM_otyzko.jpg", link: "/shop?category=Fashion&subcategory=Kids&submenu=Accessories" },
    ]
};

export const FashionPage: React.FC = () => {
    const { products } = useApp();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Read tab from URL on mount (preserves tab on refresh)
    const getInitialTab = (): Tab => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['Men', 'Women', 'Kids'].includes(tabParam)) {
            return tabParam as Tab;
        }
        return 'Men';
    };

    const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);
    const [subcategories, setSubcategories] = useState(INITIAL_SUBCATEGORIES);
    const [fashionProducts, setFashionProducts] = useState<any[]>([]);
    const [trendingByGender, setTrendingByGender] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [trendingDays, setTrendingDays] = useState<7 | 15 | 30>(7);
    const [loading, setLoading] = useState(true);

    // 🧠 Dynamic Rank Movement System (using Refs for stability)
    const previousRanksRef = useRef<Record<string, number>>({});
    const isRankFirstLoadRef = useRef(true);

    // Fetch random Fashion products from backend (with fallback)
    useEffect(() => {
        const fetchRandomFashionProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/products/random/Fashion?limit=20', {
                    headers: { 'Cache-Control': 'no-store' }
                });
                setFashionProducts(res.data);

                // Build submenu map from fetched products
                if (res.data && res.data.length > 0) {
                    buildSubmenuMap(res.data);
                }
            } catch (error) {
                console.warn('Random API not available yet, using Context fallback:', error);
                // FALLBACK: Use Context products if random API fails (during deployment)
                const contextFashionProducts = products.filter(p => p.category === 'Fashion');
                setFashionProducts(contextFashionProducts);
                if (contextFashionProducts.length > 0) {
                    buildSubmenuMap(contextFashionProducts);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRandomFashionProducts();
    }, [products]);

    // Reset tracking when context changes (e.g. switching Men -> Women)
    useEffect(() => {
        isRankFirstLoadRef.current = true;
        previousRanksRef.current = {};
        setTrendingByGender([]); // Clear old list to prevent hydration mismatch/flash
    }, [activeTab, trendingDays]);

    // Fetch & Process Trending Data
    useEffect(() => {
        const fetchTrending = async (silent = false) => {
            try {
                if (!silent) setTrendingLoading(true);

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/products/trending/${activeTab}/${trendingDays}?limit=16`);

                let newData = [];
                if (res.data && res.data.length > 0) {
                    newData = res.data;
                } else {
                    // Fallback logic
                    newData = fashionProducts.filter((p: any) => {
                        if (p.genderCategory === activeTab) return true;
                        if (p.subcategory?.includes('>')) {
                            return p.subcategory.split('>')[0].trim() === activeTab;
                        }
                        return false;
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
                setTrendingByGender(processedData);

            } catch (error) {
                console.error("Error fetching trending:", error);
                // Fallback handling if API fails
            } finally {
                if (!silent) setTrendingLoading(false);
            }
        };

        fetchTrending(); // Initial fetch

        // 🔄 Auto-Poll for updates every 10 seconds (silent refresh)
        const interval = setInterval(() => fetchTrending(true), 10000);
        return () => clearInterval(interval);

    }, [activeTab, trendingDays, fashionProducts]);

    // 🧠 Auto-Hide Movement Animation after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setTrendingByGender(prev => prev.map(p => ({ ...p, movement: 'same' })));
        }, 2000);
        return () => clearTimeout(timer);
    }, [trendingByGender]); // Re-run when products update (so usage of 'same' resets animation)

    // Build Dynamic Submenu Map from Products
    const buildSubmenuMap = (products: any[]) => {
        const newSubcategories: Record<Tab, { name: string; icon: string; link: string }[]> = {
            Men: [],
            Women: [],
            Kids: []
        };

        products.forEach(product => {
            // Parse subcategory format: "Men > Shirts" or extract from submenu field
            let gender: Tab | null = null;
            let submenu = '';

            if (product.subcategory && product.subcategory.includes('>')) {
                const parts = product.subcategory.split('>').map((s: string) => s.trim());
                gender = parts[0] as Tab;
                submenu = parts[1];
            } else if (product.submenu) {
                // Direct submenu field (new schema)
                submenu = product.submenu;
                // Try to infer gender from subcategory or product name
                if (product.subcategory) {
                    if (['Men', 'Women', 'Kids'].includes(product.subcategory)) {
                        gender = product.subcategory as Tab;
                    }
                }
            }

            if (gender && submenu && ['Men', 'Women', 'Kids'].includes(gender)) {
                // Check if this submenu already exists
                const existing = newSubcategories[gender].find(s => s.name === submenu);
                if (!existing) {
                    // Use product image as icon, create link
                    const icon = product.mainImage || product.image || product.images?.[0] || INITIAL_SUBCATEGORIES[gender]?.[0]?.icon || '';
                    const link = `/shop?category=Fashion&subcategory=${gender}&submenu=${encodeURIComponent(submenu)}`;

                    newSubcategories[gender].push({
                        name: submenu,
                        icon: icon,
                        link: link
                    });
                }
            }
        });

        // MERGE hardcoded submenus WITH dynamic product-based submenus
        setSubcategories(prev => {
            const merged: Record<Tab, { name: string; icon: string; link: string }[]> = {
                Men: [...INITIAL_SUBCATEGORIES.Men],
                Women: [...INITIAL_SUBCATEGORIES.Women],
                Kids: [...INITIAL_SUBCATEGORIES.Kids]
            };

            // Add dynamic submenus from products (avoid duplicates)
            (['Men', 'Women', 'Kids'] as Tab[]).forEach(tab => {
                newSubcategories[tab].forEach(newSub => {
                    const exists = merged[tab].find(s => s.name === newSub.name);
                    if (!exists) {
                        merged[tab].push(newSub);
                    }
                });
            });

            return merged;
        });
    };

    // Products for display: use trending API data
    const trendingProducts = trendingByGender.slice(0, 8);
    const bestOfProducts = trendingByGender.slice(8, 16);

    const currentBanner = BANNERS[activeTab];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">

            {/* 1. STICKY NAV STRIP */}
            <div className="sticky top-[56px] md:top-[72px] z-20 bg-white shadow-sm border-b border-gray-100">
                <div className="w-full max-w-7xl mx-auto px-0 md:px-8">
                    <div className="flex w-full">
                        {(['Men', 'Women', 'Kids'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    // Update URL so refresh preserves the tab
                                    router.replace(`/fashion?tab=${tab}`, { scroll: false });
                                }}
                                className={`
                                    relative flex-1 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wide text-center transition-all duration-200 outline-none select-none
                                    ${activeTab === tab
                                        ? 'text-black bg-gradient-to-b from-white to-yellow-50'
                                        : 'text-gray-600 hover:text-black hover:bg-yellow-50'
                                    }
                                `}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#FACC15] shadow-[0_-2px_6px_rgba(250,204,21,0.4)]"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. SWIPER HERO BANNER (ULTRA LOCK FIX) */}
            <div className="w-full h-[220px] md:h-[420px] lg:h-[420px] xl:h-[520px] 2xl:h-[580px] bg-gray-100 overflow-hidden lg:max-w-[1400px] xl:max-w-[1500px] mx-auto rounded-none lg:rounded-2xl lg:mt-4 lg:shadow-xl relative">
                <Swiper
                    key={activeTab} // Force re-render on activeTab change
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true} // Infinite loop
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false
                    }}
                    pagination={{ clickable: true }}
                    observer={true}
                    observeParents={true}
                    className="w-full h-full"
                >
                    {currentBanner.images.map((img, index) => (
                        <SwiperSlide key={`${activeTab}-${index}`}>
                            <div className="relative w-full h-full">
                                {/* PURE IMG TAG to avoid Next.js Image lifestyle conflicts in Swiper */}
                                <img
                                    src={img}
                                    alt={`${currentBanner.title} - Slide ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:p-12 pointer-events-none">
                                    <div className="text-white pointer-events-auto max-w-[600px] lg:max-w-[800px]">
                                        <h2 className="text-xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-1 md:mb-3 lg:mb-4">{currentBanner.title}</h2>
                                        <Link
                                            href={currentBanner.link}
                                            className="text-xs md:text-base lg:text-lg font-semibold bg-white text-black px-3 py-1.5 md:px-6 md:py-2.5 lg:px-8 lg:py-3 rounded-full inline-flex items-center gap-1 hover:bg-opacity-90 transition-transform hover:scale-105 shadow-lg"
                                        >
                                            Shop Now <ChevronRight size={16} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* 3. RESPONSIVE SUBCATEGORY GRID (Flipkart Style) */}
            <div className="bg-white py-4 md:py-8 px-3 md:px-8 mb-4 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xs md:text-lg font-bold text-gray-800 mb-3 md:mb-6 uppercase tracking-wider">Explore {activeTab}</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
                        {subcategories[activeTab].map((sub, idx) => (
                            <Link key={idx} href={sub.link} className="flex flex-col items-center group">
                                <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 group-hover:border-blue-400 transition-colors">
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
            <div className="max-w-7xl mx-auto spaee-y-4 md:space-y-8 pb-8">

                {/* Trending Section */}
                {(trendingProducts.length > 0 || trendingLoading) && (
                    <section className="bg-white py-4 md:py-6 px-3 md:px-8 mt-2 shadow-sm">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div>
                                <h3 className="text-sm md:text-xl font-bold flex items-center gap-2">
                                    <TrendingUp size={16} className="text-[#2874F0]" />
                                    <span className="flex items-center glow-text">
                                        Trending in {activeTab}
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
                                <Link href={`/shop?category=Fashion&subcategory=${activeTab}&sort=newest`} className="bg-[#2874F0] text-white rounded-full p-1 md:px-4 md:py-1.5">
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
                                    Best of {activeTab}
                                </h3>
                                <p className="text-[10px] md:text-sm text-gray-400">Top rated by customers</p>
                            </div>
                            <Link href={`/shop?category=Fashion&subcategory=${activeTab}&sort=rating`} className="bg-[#2874F0] text-white rounded-full p-1 md:px-4 md:py-1.5 ">
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
                {trendingByGender.length === 0 && !trendingLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white m-3 rounded-xl border border-dashed text-center">
                        <ShoppingBag size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-gray-500 font-bold">Coming Soon</h3>
                        <p className="text-xs text-gray-400 mt-1">We are stocking up {activeTab}'s collection!</p>
                    </div>
                )}

            </div>
        </div>
    );
};